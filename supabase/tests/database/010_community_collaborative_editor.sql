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

create or replace function pg_temp.authenticate_service()
returns void
language plpgsql
as $$
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
  ('70000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'collab-owner@test.rgan', '', now(), '{"provider":"email"}', '{"display_name":"Collab Owner","age_band":"adult_18_plus"}', now(), now()),
  ('70000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'collab-invited@test.rgan', '', now(), '{"provider":"email"}', '{"display_name":"Invited Member","age_band":"adult_18_plus"}', now(), now()),
  ('70000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'collab-link@test.rgan', '', now(), '{"provider":"email"}', '{"display_name":"Link Member","age_band":"adult_18_plus"}', now(), now()),
  ('70000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'collab-outsider@test.rgan', '', now(), '{"provider":"email"}', '{"display_name":"Registered Outsider","age_band":"adult_18_plus"}', now(), now()),
  ('70000000-0000-0000-0000-000000000005', 'authenticated', 'authenticated', 'collab-suspended@test.rgan', '', now(), '{"provider":"email"}', '{"display_name":"Suspended Member","age_band":"adult_18_plus"}', now(), now()),
  ('70000000-0000-0000-0000-000000000006', 'authenticated', 'authenticated', 'collab-editor@test.rgan', '', now(), '{"provider":"email"}', '{"display_name":"Staff Editor","age_band":"adult_18_plus"}', now(), now());

insert into public.user_roles (user_id, role_id, assigned_by)
select target.user_id, r.id, null
from (
  values
    ('70000000-0000-0000-0000-000000000001'::uuid),
    ('70000000-0000-0000-0000-000000000002'::uuid),
    ('70000000-0000-0000-0000-000000000003'::uuid),
    ('70000000-0000-0000-0000-000000000005'::uuid)
) as target(user_id)
cross join public.roles r
where r.slug = 'community_member';

insert into public.user_roles (user_id, role_id, assigned_by)
select '70000000-0000-0000-0000-000000000006', r.id, null
from public.roles r
where r.slug = 'editor';

insert into public.community_memberships (
  user_id, status, approved_by, approved_at, member_since,
  suspended_by, suspended_at, suspension_reason, suspension_source
)
values
  ('70000000-0000-0000-0000-000000000001', 'active', '70000000-0000-0000-0000-000000000006', now(), current_date, null, null, null, null),
  ('70000000-0000-0000-0000-000000000002', 'active', '70000000-0000-0000-0000-000000000006', now(), current_date, null, null, null, null),
  ('70000000-0000-0000-0000-000000000003', 'active', '70000000-0000-0000-0000-000000000006', now(), current_date, null, null, null, null),
  ('70000000-0000-0000-0000-000000000005', 'suspended', '70000000-0000-0000-0000-000000000006', now(), current_date, '70000000-0000-0000-0000-000000000006', now(), 'Test suspension', 'administrator');

set local role authenticated;
select pg_temp.authenticate_as(
  '70000000-0000-0000-0000-000000000001',
  'collab-owner@test.rgan'
);

insert into public.field_notes (slug, title, excerpt, content)
values (
  'collaborative-editor-test',
  'Collaborative draft',
  'A shared draft',
  'Legacy paragraph'
)
returning id;

select set_config(
  'test.collab_note_id',
  (select id::text from public.field_notes where slug = 'collaborative-editor-test'),
  true
);

select pg_temp.expect_error(
  format(
    'select * from public.authorize_field_note_collaboration_server(%L, %s, null)',
    '70000000-0000-0000-0000-000000000001',
    current_setting('test.collab_note_id')
  ),
  'authenticated browsers cannot execute server-only collaboration authorization'
);

reset role;
set local role service_role;
select pg_temp.authenticate_service();

select public.invite_field_note_collaborator_server(
  '70000000-0000-0000-0000-000000000001',
  current_setting('test.collab_note_id')::bigint,
  '70000000-0000-0000-0000-000000000002',
  'editor'
);

select pg_temp.assert_true(
  (
    select can_read and can_write and can_comment and collaborator_role = 'editor'
    from public.authorize_field_note_collaboration_server(
      '70000000-0000-0000-0000-000000000002',
      current_setting('test.collab_note_id')::bigint,
      null
    )
  ),
  'an invited active member can read, edit, and comment on a draft'
);

select set_config(
  'test.collab_link_hash',
  repeat('a', 64),
  true
);

select public.create_field_note_share_link_server(
  '70000000-0000-0000-0000-000000000001',
  current_setting('test.collab_note_id')::bigint,
  current_setting('test.collab_link_hash'),
  now() + interval '1 day'
);

select pg_temp.assert_true(
  (
    select can_read and can_write and can_comment and share_link_used
    from public.authorize_field_note_collaboration_server(
      '70000000-0000-0000-0000-000000000003',
      current_setting('test.collab_note_id')::bigint,
      current_setting('test.collab_link_hash')
    )
  ),
  'an active member with the current link can edit'
);

select pg_temp.assert_true(
  not coalesce((
    select can_write
    from public.authorize_field_note_collaboration_server(
      '70000000-0000-0000-0000-000000000004',
      current_setting('test.collab_note_id')::bigint,
      current_setting('test.collab_link_hash')
    )
  ), false),
  'a registered non-member cannot edit even with the link'
);

select pg_temp.assert_true(
  not coalesce((
    select can_write
    from public.authorize_field_note_collaboration_server(
      '70000000-0000-0000-0000-000000000005',
      current_setting('test.collab_note_id')::bigint,
      current_setting('test.collab_link_hash')
    )
  ), false),
  'a suspended member cannot edit with the link'
);

select pg_temp.assert_true(
  (
    select legacy_content = 'Legacy paragraph'
      and content_json is null
      and schema_version = 1
    from public.load_field_note_collab_seed_server(
      current_setting('test.collab_note_id')::bigint
    )
  ),
  'the server can load the legacy seed before the first Yjs document exists'
);

select public.initialize_field_note_collab_document_server(
  current_setting('test.collab_note_id')::bigint,
  decode('01020304', 'hex'),
  1::smallint
);

select public.initialize_field_note_collab_document_server(
  current_setting('test.collab_note_id')::bigint,
  decode('ffffffff', 'hex'),
  1::smallint
);

select pg_temp.assert_true(
  (
    select encode(yjs_state, 'hex') = '01020304' and schema_version = 1
    from public.load_field_note_collab_document_server(
      current_setting('test.collab_note_id')::bigint
    )
  ),
  'concurrent initialization keeps the first canonical Yjs binary state'
);

select public.store_field_note_collab_document_server(
  current_setting('test.collab_note_id')::bigint,
  decode('0a0b0c0d', 'hex'),
  1::smallint
);

select pg_temp.assert_true(
  (
    select encode(yjs_state, 'hex') = '0a0b0c0d'
    from public.load_field_note_collab_document_server(
      current_setting('test.collab_note_id')::bigint
    )
  ),
  'ordinary persistence replaces the canonical state after initialization'
);

select public.checkpoint_field_note_server(
  target_user_id => '70000000-0000-0000-0000-000000000002',
  target_field_note_id => current_setting('test.collab_note_id')::bigint,
  target_title => 'Collaborative checkpoint',
  target_excerpt => 'Saved together',
  target_content => 'Collaborative paragraph',
  target_content_json => '[{"id":"paragraph-1","type":"paragraph","content":[{"type":"text","text":"Collaborative paragraph","styles":{}}]}]'::jsonb,
  target_content_html => '<!doctype html><html><body><p>Collaborative paragraph</p></body></html>',
  target_schema_version => 1::smallint,
  target_source => 'manual',
  target_change_note => 'First shared version',
  candidate_share_token_hash => null,
  create_revision => true
);

select pg_temp.assert_true(
  (
    select count(*) = 2
    from public.field_note_revisions
    where field_note_id = current_setting('test.collab_note_id')::bigint
  ),
  'a manual checkpoint adds exactly one version after the initial revision'
);

select pg_temp.assert_true(public.materialize_field_note_server(
  target_field_note_id => current_setting('test.collab_note_id')::bigint,
  target_content => 'Automatic materialization',
  target_content_json => '[{"id":"paragraph-2","type":"paragraph","content":[{"type":"text","text":"Automatic materialization","styles":{}}]}]'::jsonb,
  target_content_html => '<!doctype html><html><body><p>Automatic materialization</p></body></html>',
  target_schema_version => 1::smallint
), 'automatic materialization updates an editable snapshot');

select pg_temp.assert_true(
  (
    select count(*) = 2
    from public.field_note_revisions
    where field_note_id = current_setting('test.collab_note_id')::bigint
  ),
  'automatic materialization does not inflate revision history'
);

select pg_temp.expect_error(
  format(
    $$select public.checkpoint_field_note_server(
      %L, %s, 'Unsafe', '', 'Unsafe', '[]'::jsonb,
      '<script>alert(1)</script>', 1, 'manual', null, null, true
    )$$,
    '70000000-0000-0000-0000-000000000002',
    current_setting('test.collab_note_id')
  ),
  'checkpoints reject active-content HTML even when the caller can edit'
);

reset role;
set local role authenticated;
select pg_temp.authenticate_as(
  '70000000-0000-0000-0000-000000000001',
  'collab-owner@test.rgan'
);
update public.field_notes
set status = 'submitted'
where id = current_setting('test.collab_note_id')::bigint;

reset role;
set local role service_role;
select pg_temp.authenticate_service();
select pg_temp.assert_true(
  (
    select can_read and not can_write and can_comment
    from public.authorize_field_note_collaboration_server(
      '70000000-0000-0000-0000-000000000002',
      current_setting('test.collab_note_id')::bigint,
      null
    )
  ),
  'submitted documents become read-only to collaborators while comments remain available'
);

select public.record_field_note_comment_server(
  actor_user_id => '70000000-0000-0000-0000-000000000002',
  target_field_note_id => current_setting('test.collab_note_id')::bigint,
  target_thread_id => 'thread-1',
  target_thread_snapshot => '{"comments":[{"id":"comment-1","body":"Please clarify this moment."}]}'::jsonb,
  target_event_type => 'created',
  target_resolved => false
);

select pg_temp.assert_true(
  (
    select count(*) = 1
    from public.field_note_comments
    where field_note_id = current_setting('test.collab_note_id')::bigint
      and id = 'thread-1'
  )
  and (
    select count(*) = 1
    from public.field_note_comment_events
    where field_note_id = current_setting('test.collab_note_id')::bigint
      and thread_id = 'thread-1'
  ),
  'authorized comment writes update the read model and immutable event log'
);

select public.revoke_field_note_collaborator_server(
  '70000000-0000-0000-0000-000000000001',
  current_setting('test.collab_note_id')::bigint,
  '70000000-0000-0000-0000-000000000002'
);

select pg_temp.assert_true(
  not coalesce((
    select can_read or can_write or can_comment
    from public.authorize_field_note_collaboration_server(
      '70000000-0000-0000-0000-000000000002',
      current_setting('test.collab_note_id')::bigint,
      null
    )
  ), false),
  'revoking an invited member removes all draft/review access'
);

select public.revoke_field_note_share_link_server(
  '70000000-0000-0000-0000-000000000001',
  current_setting('test.collab_note_id')::bigint
);

select pg_temp.assert_true(
  not coalesce((
    select share_link_used or can_write
    from public.authorize_field_note_collaboration_server(
      '70000000-0000-0000-0000-000000000003',
      current_setting('test.collab_note_id')::bigint,
      current_setting('test.collab_link_hash')
    )
  ), false),
  'revoking the link immediately removes link-based write access'
);

reset role;
set local role authenticated;
select pg_temp.authenticate_as(
  '70000000-0000-0000-0000-000000000004',
  'collab-outsider@test.rgan'
);

select pg_temp.expect_error(
  'select token_hash from public.field_note_share_links',
  'authenticated users cannot read stored share-link hashes'
);
select pg_temp.expect_error(
  format(
    $$select public.store_field_note_collab_document_server(%s, decode('05', 'hex'), 1::smallint)$$,
    current_setting('test.collab_note_id')
  ),
  'authenticated users cannot write the private Yjs document through server RPCs'
);

reset role;
rollback;
