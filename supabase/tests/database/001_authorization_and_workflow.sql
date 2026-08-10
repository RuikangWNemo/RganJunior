begin;

create or replace function pg_temp.assert_true(test_condition boolean, test_label text)
returns void
language plpgsql
as $$
begin
  if not coalesce(test_condition, false) then
    raise exception 'TEST_FAILED: %', test_label;
  end if;
end;
$$;

create or replace function pg_temp.expect_error(test_sql text, test_label text)
returns void
language plpgsql
as $$
begin
  begin
    execute test_sql;
  exception when others then
    return;
  end;
  raise exception 'TEST_FAILED: expected error: %', test_label;
end;
$$;

create or replace function pg_temp.expect_zero_rows(test_sql text, test_label text)
returns void
language plpgsql
as $$
declare
  affected_rows bigint;
begin
  execute test_sql;
  get diagnostics affected_rows = row_count;
  if affected_rows <> 0 then
    raise exception 'TEST_FAILED: expected zero affected rows: %', test_label;
  end if;
end;
$$;

create or replace function pg_temp.authenticate_as(test_user_id uuid, test_email text)
returns void
language plpgsql
as $$
begin
  perform set_config('request.jwt.claim.sub', test_user_id::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config(
    'request.jwt.claims',
    jsonb_build_object(
      'sub', test_user_id,
      'role', 'authenticated',
      'email', test_email
    )::text,
    true
  );
end;
$$;

create or replace function pg_temp.authenticate_anon()
returns void
language plpgsql
as $$
begin
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claim.role', 'anon', true);
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
end;
$$;

-- Stable UUIDs make the test readable and keep every run inside one rollback.
insert into auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  ('10000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'member@test.rgan', '', now(), '{"provider":"email"}', '{"display_name":"Member","age_band":"adult_18_plus"}', now(), now()),
  ('10000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'contributor@test.rgan', '', now(), '{"provider":"email"}', '{"display_name":"Contributor","age_band":"adult_18_plus"}', now(), now()),
  ('10000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'editor@test.rgan', '', now(), '{"provider":"email"}', '{"display_name":"Editor","age_band":"adult_18_plus"}', now(), now()),
  ('10000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'admin@test.rgan', '', now(), '{"provider":"email"}', '{"display_name":"Admin","age_band":"adult_18_plus"}', now(), now()),
  ('10000000-0000-0000-0000-000000000005', 'authenticated', 'authenticated', 'super@test.rgan', '', now(), '{"provider":"email"}', '{"display_name":"Super","age_band":"adult_18_plus"}', now(), now()),
  ('10000000-0000-0000-0000-000000000006', 'authenticated', 'authenticated', 'custom@test.rgan', '', now(), '{"provider":"email"}', '{"display_name":"Custom Editor","age_band":"adult_18_plus"}', now(), now());

select pg_temp.assert_true(
  (select count(*) from public.profiles where user_id::text like '10000000-%') = 6,
  'registration creates a profile for every account'
);

select pg_temp.assert_true(
  (
    select count(*)
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id::text like '10000000-%' and r.slug = 'registered_user'
  ) = 6,
  'registration grants the registered-user role'
);

insert into public.user_roles (user_id, role_id, assigned_by)
select '10000000-0000-0000-0000-000000000002', id, null
from public.roles where slug = 'community_member';

insert into public.user_roles (user_id, role_id, assigned_by)
select '10000000-0000-0000-0000-000000000003', id, null
from public.roles where slug = 'editor';

insert into public.user_roles (user_id, role_id, assigned_by)
select '10000000-0000-0000-0000-000000000004', id, null
from public.roles where slug = 'admin';

select private.bootstrap_super_admin('10000000-0000-0000-0000-000000000005');

insert into public.community_memberships (
  user_id, status, approved_by, approved_at, member_since
)
values (
  '10000000-0000-0000-0000-000000000002',
  'active',
  '10000000-0000-0000-0000-000000000004',
  now(),
  current_date
);

insert into public.people (
  slug, display_name, user_id, is_public, profile_visibility, status
)
values
  (
    'public-person-test', 'Public Person',
    '10000000-0000-0000-0000-000000000002',
    true, 'public', 'active'
  ),
  ('private-person-test', 'Private Person', null, false, 'public', 'active');

insert into public.field_notes (
  slug, title, content, status, visibility, created_by, published_at
)
values
  (
    'public-note-test', 'Public Note', 'Public body', 'published', 'public',
    '10000000-0000-0000-0000-000000000004', now()
  ),
  (
    'private-note-test', 'Private Note', 'Private body', 'draft', 'private',
    '10000000-0000-0000-0000-000000000002', null
  );

insert into public.media_assets (
  owner_user_id, uploaded_by, storage_bucket, storage_path,
  media_type, mime_type, file_size, visibility, status
)
values (
  '10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000002',
  'member-media',
  '10000000-0000-0000-0000-000000000002/private-test.webp',
  'image', 'image/webp', 100, 'private', 'active'
);

insert into storage.objects (bucket_id, name, owner, owner_id, metadata)
values (
  'member-media',
  '10000000-0000-0000-0000-000000000002/private-test.webp',
  '10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000002',
  '{"mimetype":"image/webp","size":100}'
);

-- Anonymous users see only public content and cannot inspect profiles.
set local role anon;
select pg_temp.authenticate_anon();

select pg_temp.assert_true(
  (select count(*) from public.field_notes where slug = 'public-note-test') = 1,
  'anonymous can read published public Field Notes'
);
select pg_temp.assert_true(
  (select count(*) from public.field_notes where slug = 'private-note-test') = 0,
  'anonymous cannot read drafts by guessing a slug'
);
select pg_temp.assert_true(
  (select count(*) from public.get_community_person_by_slug('public-person-test')) = 1
  and (select count(*) from public.get_community_person_by_slug('private-person-test')) = 0,
  'anonymous sees only the safe projection of public people'
);
select pg_temp.expect_error(
  'select count(*) from public.profiles',
  'anonymous cannot inspect private account profiles'
);
select pg_temp.assert_true(
  (
    select count(*) from storage.objects
    where name = '10000000-0000-0000-0000-000000000002/private-test.webp'
  ) = 0,
  'anonymous cannot read private Storage objects'
);

select public.request_subscription(
  'anonymous-subscription@test.rgan',
  'zh',
  array['field_notes', 'newsletter']
);
select pg_temp.expect_error(
  'select count(*) from public.subscribers',
  'anonymous subscription request does not reveal subscriber data'
);

reset role;
select pg_temp.assert_true(
  (
    select count(*) from public.subscribers
    where email = 'anonymous-subscription@test.rgan' and status = 'pending'
  ) = 1,
  'anonymous subscription is stored as pending'
);

-- A normal member cannot self-assign roles or mutate identity labels.
set local role authenticated;
select pg_temp.authenticate_as(
  '10000000-0000-0000-0000-000000000001',
  'member@test.rgan'
);
select pg_temp.expect_error(
  $$insert into public.user_roles (user_id, role_id)
    select '10000000-0000-0000-0000-000000000001', id
    from public.roles where slug = 'admin'$$,
  'member cannot self-assign admin'
);
select pg_temp.expect_zero_rows(
  $$update public.identity_labels
    set name_zh = '篡改'
    where slug = 'founder'$$,
  'member cannot mutate identity labels'
);
select pg_temp.expect_zero_rows(
  $$update public.profiles
    set display_name = 'Hacked'
    where user_id = '10000000-0000-0000-0000-000000000002'$$,
  'member cannot modify another profile'
);
select pg_temp.assert_true(
  (
    select count(*) from storage.objects
    where name = '10000000-0000-0000-0000-000000000002/private-test.webp'
  ) = 0,
  'member cannot read another user private Storage object'
);

reset role;
select pg_temp.assert_true(
  (
    select display_name from public.profiles
    where user_id = '10000000-0000-0000-0000-000000000002'
  ) = 'Contributor',
  'another profile remains unchanged'
);

-- Contributor creates content; ownership is forced to auth.uid().
set local role authenticated;
select pg_temp.authenticate_as(
  '10000000-0000-0000-0000-000000000002',
  'contributor@test.rgan'
);

insert into public.field_notes (slug, title, content)
values ('workflow-note-test', 'Workflow Draft', 'Version one');

insert into public.field_notes (slug, title, content, created_by)
values (
  'spoof-owner-test', 'Spoof Attempt', 'Owned by caller',
  '10000000-0000-0000-0000-000000000003'
);

select pg_temp.assert_true(
  (
    select created_by from public.field_notes where slug = 'spoof-owner-test'
  ) = '10000000-0000-0000-0000-000000000002',
  'created_by spoofing is overwritten with auth.uid()'
);

select pg_temp.expect_error(
  $$update public.field_notes
    set status = 'published'
    where slug = 'workflow-note-test'$$,
  'contributor cannot publish directly'
);

update public.field_notes
set title = 'Workflow Draft Updated'
where slug = 'workflow-note-test';

update public.field_notes
set status = 'submitted'
where slug = 'workflow-note-test';

select pg_temp.assert_true(
  (
    select count(*) from storage.objects
    where name = '10000000-0000-0000-0000-000000000002/private-test.webp'
  ) = 1,
  'owner can read own private Storage object'
);

-- Editor reviews and requests changes.
reset role;
set local role authenticated;
select pg_temp.authenticate_as(
  '10000000-0000-0000-0000-000000000003',
  'editor@test.rgan'
);

update public.field_notes
set status = 'in_review'
where slug = 'workflow-note-test';

update public.field_notes
set status = 'changes_requested'
where slug = 'workflow-note-test';

-- Contributor revises and resubmits.
reset role;
set local role authenticated;
select pg_temp.authenticate_as(
  '10000000-0000-0000-0000-000000000002',
  'contributor@test.rgan'
);

update public.field_notes
set content = 'Version two after review'
where slug = 'workflow-note-test';

update public.field_notes
set status = 'submitted'
where slug = 'workflow-note-test';

-- Editor approves after the second review.
reset role;
set local role authenticated;
select pg_temp.authenticate_as(
  '10000000-0000-0000-0000-000000000003',
  'editor@test.rgan'
);

update public.field_notes
set status = 'in_review'
where slug = 'workflow-note-test';

update public.field_notes
set status = 'approved'
where slug = 'workflow-note-test';

-- Admin cannot grant super_admin, but can create a scoped custom role.
reset role;
set local role authenticated;
select pg_temp.authenticate_as(
  '10000000-0000-0000-0000-000000000004',
  'admin@test.rgan'
);

select pg_temp.expect_error(
  $$select public.assign_user_role(
    '10000000-0000-0000-0000-000000000001',
    (select id from public.roles where slug = 'super_admin'),
    null
  )$$,
  'ordinary admin cannot grant super_admin'
);

select public.create_role(
  'field_notes_chief',
  'Field Notes 主编',
  'Scoped publishing role created by an admin'
);

select public.set_role_permissions(
  (select id from public.roles where slug = 'field_notes_chief'),
  array[
    'field_notes.edit_any', 'field_notes.review',
    'field_notes.approve', 'field_notes.publish', 'topics.manage'
  ]
);

select pg_temp.expect_error(
  $$select public.set_role_permissions(
    (select id from public.roles where slug = 'field_notes_chief'),
    array['users.manage']
  )$$,
  'ordinary admin cannot add a sensitive permission to a custom role'
);

select public.assign_user_role(
  '10000000-0000-0000-0000-000000000006',
  (select id from public.roles where slug = 'field_notes_chief'),
  null
);

update public.field_notes
set status = 'published', visibility = 'public'
where slug = 'workflow-note-test';

select pg_temp.assert_true(
  (select count(*) from public.get_audit_logs(200, null)) > 0,
  'authorized admin can read audit logs through the RPC'
);
select pg_temp.expect_error(
  'select count(*) from private.audit_logs',
  'authenticated users cannot read private audit table directly'
);

-- The custom role receives exactly the configured capabilities.
reset role;
set local role authenticated;
select pg_temp.authenticate_as(
  '10000000-0000-0000-0000-000000000006',
  'custom@test.rgan'
);
select pg_temp.assert_true(
  public.has_permission('field_notes.publish'),
  'custom role grants configured publish permission'
);
select pg_temp.assert_true(
  not public.has_permission('users.manage'),
  'custom role does not gain rejected sensitive permission'
);

-- The last super admin cannot remove itself.
reset role;
set local role authenticated;
select pg_temp.authenticate_as(
  '10000000-0000-0000-0000-000000000005',
  'super@test.rgan'
);
select pg_temp.expect_error(
  $$select public.revoke_user_role(
    '10000000-0000-0000-0000-000000000005',
    (select id from public.roles where slug = 'super_admin')
  )$$,
  'last super admin cannot be revoked'
);

reset role;
select pg_temp.assert_true(
  (
    select status from public.field_notes where slug = 'workflow-note-test'
  ) = 'published',
  'full Draft to Published workflow completes'
);
select pg_temp.assert_true(
  (
    select count(*)
    from public.field_note_revisions r
    join public.field_notes fn on fn.id = r.field_note_id
    where fn.slug = 'workflow-note-test'
  ) = 1,
  'ordinary content updates keep only the initial revision until an explicit checkpoint'
);
select pg_temp.assert_true(
  (
    select count(*)
    from private.audit_logs
    where entity_type in ('field_note', 'role', 'user_role')
  ) > 0,
  'workflow and RBAC mutations create audit records'
);
select pg_temp.assert_true(
  (
    select count(*)
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where r.slug = 'super_admin'
      and (ur.expires_at is null or ur.expires_at > now())
  ) = 1,
  'at least one active super admin remains'
);

-- Published result is visible anonymously after all workflow checks.
set local role anon;
select pg_temp.authenticate_anon();
select pg_temp.assert_true(
  (select count(*) from public.field_notes where slug = 'workflow-note-test') = 1,
  'published public workflow result is anonymously visible'
);

reset role;
rollback;
