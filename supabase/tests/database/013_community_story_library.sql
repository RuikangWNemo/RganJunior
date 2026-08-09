begin;

create or replace function pg_temp.assert_true(test_condition boolean, test_label text)
returns void language plpgsql as $$
begin
  if not coalesce(test_condition, false) then
    raise exception 'TEST_FAILED: %', test_label;
  end if;
end;
$$;

create or replace function pg_temp.expect_error(test_sql text, test_label text)
returns void language plpgsql as $$
begin
  begin
    execute test_sql;
  exception when others then
    return;
  end;
  raise exception 'TEST_FAILED: expected error: %', test_label;
end;
$$;

create or replace function pg_temp.authenticate_as(test_user_id uuid, test_email text)
returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', test_user_id::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config(
    'request.jwt.claims',
    jsonb_build_object('sub', test_user_id, 'role', 'authenticated', 'email', test_email)::text,
    true
  );
end;
$$;

create or replace function pg_temp.authenticate_service()
returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claim.role', 'service_role', true);
  perform set_config('request.jwt.claims', '{"role":"service_role"}', true);
end;
$$;

insert into auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  ('d1000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'story-owner@test.rgan', '', now(), '{"provider":"email"}', '{"display_name":"Story Owner","age_band":"adult_18_plus"}', now(), now()),
  ('d1000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'story-other@test.rgan', '', now(), '{"provider":"email"}', '{"display_name":"Story Other","age_band":"adult_18_plus"}', now(), now()),
  ('d1000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'story-admin@test.rgan', '', now(), '{"provider":"email"}', '{"display_name":"Story Admin","age_band":"adult_18_plus"}', now(), now());

insert into public.user_roles (user_id, role_id, assigned_by)
select target.user_id, r.id, null
from (
  values
    ('d1000000-0000-0000-0000-000000000001'::uuid),
    ('d1000000-0000-0000-0000-000000000002'::uuid)
) as target(user_id)
cross join public.roles r
where r.slug = 'community_member';

insert into public.user_roles (user_id, role_id, assigned_by)
select 'd1000000-0000-0000-0000-000000000003', r.id, null
from public.roles r
where r.slug = 'admin';

insert into public.community_memberships (
  user_id, status, approved_by, approved_at, member_since
)
values
  ('d1000000-0000-0000-0000-000000000001', 'active', 'd1000000-0000-0000-0000-000000000003', now(), current_date),
  ('d1000000-0000-0000-0000-000000000002', 'active', 'd1000000-0000-0000-0000-000000000003', now(), current_date);

set local role authenticated;
select pg_temp.authenticate_as('d1000000-0000-0000-0000-000000000001', 'story-owner@test.rgan');

select pg_temp.assert_true(
  (select count(*) = 5 from public.article_categories where is_active),
  'the five approved initial categories are available'
);

select pg_temp.expect_error(
  $$insert into public.article_categories (slug, name_zh) values ('member-category', '成员分类')$$,
  'ordinary members cannot manage primary categories'
);

select set_config(
  'test.story_category_id',
  (select id::text from public.article_categories where slug = 'people-stories'),
  true
);

select set_config(
  'test.story_tag_id',
  (select (public.find_or_create_field_note_tag('乡村教育')).id::text),
  true
);

insert into public.field_notes (slug, title, excerpt, content)
values ('story-library-submit-test', '需要分类的草稿', '摘要', '正文');

select set_config(
  'test.story_submit_note_id',
  (select id::text from public.field_notes where slug = 'story-library-submit-test'),
  true
);

select pg_temp.expect_error(
  format(
    'update public.field_notes set status = %L where id = %s',
    'submitted',
    current_setting('test.story_submit_note_id')
  ),
  'submission requires an active primary category'
);

select public.save_field_note_metadata(
  current_setting('test.story_submit_note_id')::bigint,
  current_setting('test.story_category_id')::bigint,
  array[current_setting('test.story_tag_id')::bigint],
  'public'
);

update public.field_notes
set status = 'submitted'
where id = current_setting('test.story_submit_note_id')::bigint;

select pg_temp.assert_true(
  (
    select status = 'submitted'
      and category_id = current_setting('test.story_category_id')::bigint
      and visibility = 'public'
    from public.field_notes
    where id = current_setting('test.story_submit_note_id')::bigint
  )
  and exists (
    select 1 from public.field_note_topics
    where field_note_id = current_setting('test.story_submit_note_id')::bigint
      and topic_id = current_setting('test.story_tag_id')::bigint
  ),
  'metadata is saved atomically before a categorized submission'
);

insert into public.field_notes (slug, title, content)
values ('story-library-trash-test', '回收站草稿', '正文');

select set_config(
  'test.story_trash_note_id',
  (select id::text from public.field_notes where slug = 'story-library-trash-test'),
  true
);

select public.save_field_note_metadata(
  current_setting('test.story_trash_note_id')::bigint,
  current_setting('test.story_category_id')::bigint,
  array[current_setting('test.story_tag_id')::bigint],
  'private'
);

update public.field_notes
set status = 'archived'
where id = current_setting('test.story_trash_note_id')::bigint;

select pg_temp.assert_true(
  (
    select status = 'archived' and archived_at is not null
    from public.field_notes
    where id = current_setting('test.story_trash_note_id')::bigint
  ),
  'an owner can move an owned draft to Trash'
);

update public.field_notes
set status = 'draft'
where id = current_setting('test.story_trash_note_id')::bigint;

select pg_temp.assert_true(
  (
    select status = 'draft' and archived_at is null
    from public.field_notes
    where id = current_setting('test.story_trash_note_id')::bigint
  ),
  'restoring from Trash returns the note to draft and clears archived_at'
);

update public.field_notes
set status = 'archived'
where id = current_setting('test.story_trash_note_id')::bigint;

reset role;
set local role authenticated;
select pg_temp.authenticate_as('d1000000-0000-0000-0000-000000000002', 'story-other@test.rgan');

delete from public.field_notes
where id = current_setting('test.story_trash_note_id')::bigint;

reset role;
select pg_temp.assert_true(
  exists (
    select 1 from public.field_notes
    where id = current_setting('test.story_trash_note_id')::bigint
  ),
  'another member cannot permanently delete an owned trashed note'
);

set local role authenticated;
select pg_temp.authenticate_as('d1000000-0000-0000-0000-000000000001', 'story-owner@test.rgan');

delete from public.field_notes
where id = current_setting('test.story_trash_note_id')::bigint;

reset role;
select pg_temp.assert_true(
  not exists (
    select 1 from public.field_notes
    where id = current_setting('test.story_trash_note_id')::bigint
  )
  and not exists (
    select 1 from public.field_note_topics
    where field_note_id = current_setting('test.story_trash_note_id')::bigint
  ),
  'the owner can permanently delete a trashed note and its tag relations cascade'
);

set local role authenticated;
select pg_temp.authenticate_as('d1000000-0000-0000-0000-000000000003', 'story-admin@test.rgan');

insert into public.article_categories (slug, name_zh, name_en, sort_order)
values ('community-history', '社群历史', 'Community History', 60);

select pg_temp.assert_true(
  exists (select 1 from public.article_categories where slug = 'community-history'),
  'an administrator can create a primary category'
);

reset role;

set local role service_role;
select pg_temp.authenticate_service();

insert into public.field_notes (
  slug, title, content, created_by, category_id, status, visibility, published_at
)
values
  ('story-square-public-test', '公开广场文章', '正文', 'd1000000-0000-0000-0000-000000000001', current_setting('test.story_category_id')::bigint, 'published', 'public', now()),
  ('story-square-private-test', '私密已发布文章', '正文', 'd1000000-0000-0000-0000-000000000001', current_setting('test.story_category_id')::bigint, 'published', 'private', now());

set local role anon;
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claim.role', 'anon', true);
select set_config('request.jwt.claims', '{"role":"anon"}', true);

select pg_temp.assert_true(
  (
    select count(*) = 1
    from public.field_notes
    where slug in ('story-square-public-test', 'story-square-private-test')
      and status = 'published'
      and visibility = 'public'
  ),
  'the public square query can read only published public stories'
);

rollback;
