begin;

create or replace function pg_temp.assert_true(
  test_condition boolean,
  test_label text
)
returns void
language plpgsql
as $$
begin
  if not coalesce(test_condition, false) then
    raise exception 'TEST_FAILED: %', test_label;
  end if;
end;
$$;

create or replace function pg_temp.expect_error(
  test_sql text,
  expected_message text,
  test_label text
)
returns void
language plpgsql
as $$
begin
  begin
    execute test_sql;
  exception when others then
    if sqlerrm is distinct from expected_message then
      raise exception 'TEST_FAILED: % (expected %, received %)',
        test_label,
        expected_message,
        sqlerrm;
    end if;
    return;
  end;
  raise exception 'TEST_FAILED: expected error: %', test_label;
end;
$$;

create or replace function pg_temp.authenticate_as(
  test_user_id uuid,
  test_email text
)
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

insert into auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    '15000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'access-member@test.rgan',
    '',
    now(),
    '{"provider":"email"}',
    '{"display_name":"Access Member","age_band":"adult_18_plus"}',
    now(),
    now()
  ),
  (
    '15000000-0000-0000-0000-000000000002',
    'authenticated',
    'authenticated',
    'access-admin@test.rgan',
    '',
    now(),
    '{"provider":"email"}',
    '{"display_name":"Access Admin","age_band":"adult_18_plus"}',
    now(),
    now()
  ),
  (
    '15000000-0000-0000-0000-000000000003',
    'authenticated',
    'authenticated',
    'access-super@test.rgan',
    '',
    now(),
    '{"provider":"email"}',
    '{"display_name":"Access Super","age_band":"adult_18_plus"}',
    now(),
    now()
  ),
  (
    '15000000-0000-0000-0000-000000000004',
    'authenticated',
    'authenticated',
    'access-existing-admin@test.rgan',
    '',
    now(),
    '{"provider":"email"}',
    '{"display_name":"Existing Admin","age_band":"adult_18_plus"}',
    now(),
    now()
  ),
  (
    '15000000-0000-0000-0000-000000000005',
    'authenticated',
    'authenticated',
    'access-admin-candidate@test.rgan',
    '',
    now(),
    '{"provider":"email"}',
    '{"display_name":"Admin Candidate","age_band":"adult_18_plus"}',
    now(),
    now()
  );

insert into public.user_roles (user_id, role_id, assigned_by)
select
  '15000000-0000-0000-0000-000000000002',
  r.id,
  null
from public.roles r
where r.slug = 'admin';

insert into public.user_roles (user_id, role_id, assigned_by)
select
  '15000000-0000-0000-0000-000000000003',
  r.id,
  null
from public.roles r
where r.slug = 'super_admin';

insert into public.user_roles (user_id, role_id, assigned_by)
select
  '15000000-0000-0000-0000-000000000004',
  r.id,
  null
from public.roles r
where r.slug = 'admin';

insert into public.user_roles (user_id, role_id, assigned_by)
select
  '15000000-0000-0000-0000-000000000005',
  r.id,
  null
from public.roles r
where r.slug = 'community_member';

set local role authenticated;
select pg_temp.authenticate_as(
  '15000000-0000-0000-0000-000000000001',
  'access-member@test.rgan'
);

select pg_temp.expect_error(
  $$select count(*) from public.list_community_access_users()$$,
  'PERMISSION_DENIED',
  'ordinary member cannot read the access roster'
);

select pg_temp.expect_error(
  $$select count(*) from public.list_community_access_roles()$$,
  'PERMISSION_DENIED',
  'ordinary member cannot read the role catalog'
);

reset role;
set local role authenticated;
select pg_temp.authenticate_as(
  '15000000-0000-0000-0000-000000000002',
  'access-admin@test.rgan'
);

select pg_temp.assert_true(
  (
    select not c.is_super_admin and 'admin' = any(c.role_slugs)
    from public.get_my_authorization_context() c
  ),
  'administrator context is explicit and is not super-admin context'
);

select pg_temp.assert_true(
  (
    select count(*)
    from public.list_community_access_users(
      search_query => 'Admin Candidate',
      membership_statuses => array['none'],
      page_size => 20
    )
  ) = 1,
  'authorized administrator can search the safe account roster'
);

select pg_temp.assert_true(
  (
    select count(*)
    from public.list_community_access_roles()
    where slug in ('admin', 'super_admin') and is_reserved
  ) = 2,
  'role catalog identifies reserved administrator roles'
);

select pg_temp.expect_error(
  $$select public.list_community_access_users(
    before_registered_at => statement_timestamp(),
    before_user_id => null
  )$$,
  'INVALID_ACCESS_CURSOR',
  'account roster rejects partial cursors'
);

select pg_temp.expect_error(
  $$select public.assign_user_role(
    '15000000-0000-0000-0000-000000000005',
    (select id from public.roles where slug = 'admin'),
    null
  )$$,
  'SUPER_ADMIN_REQUIRED',
  'ordinary administrator cannot appoint an administrator'
);

select pg_temp.expect_error(
  $$select public.revoke_user_role(
    '15000000-0000-0000-0000-000000000004',
    (select id from public.roles where slug = 'admin')
  )$$,
  'SUPER_ADMIN_REQUIRED',
  'ordinary administrator cannot revoke an administrator'
);

select pg_temp.expect_error(
  $$select public.assign_user_role(
    '15000000-0000-0000-0000-000000000005',
    (select id from public.roles where slug = 'super_admin'),
    null
  )$$,
  'SUPER_ADMIN_REQUIRED',
  'ordinary administrator cannot appoint a super administrator'
);

select pg_temp.expect_error(
  $$select public.revoke_user_role(
    '15000000-0000-0000-0000-000000000003',
    (select id from public.roles where slug = 'super_admin')
  )$$,
  'SUPER_ADMIN_REQUIRED',
  'ordinary administrator cannot revoke a super administrator'
);

select pg_temp.expect_error(
  $$select public.assign_user_role(
    '15000000-0000-0000-0000-000000000001',
    (select id from public.roles where slug = 'registered_user'),
    null
  )$$,
  'ROLE_MANAGED_BY_SYSTEM',
  'registration role cannot be managed through generic role assignment'
);

select pg_temp.expect_error(
  $$select public.revoke_user_role(
    '15000000-0000-0000-0000-000000000001',
    (select id from public.roles where slug = 'registered_user')
  )$$,
  'ROLE_MANAGED_BY_SYSTEM',
  'registration role cannot be revoked through generic role assignment'
);

select pg_temp.expect_error(
  $$select public.assign_user_role(
    '15000000-0000-0000-0000-000000000001',
    (select id from public.roles where slug = 'community_member'),
    null
  )$$,
  'MEMBERSHIP_WORKFLOW_REQUIRED',
  'membership role cannot bypass the membership workflow'
);

select pg_temp.expect_error(
  $$select public.revoke_user_role(
    '15000000-0000-0000-0000-000000000005',
    (select id from public.roles where slug = 'community_member')
  )$$,
  'MEMBERSHIP_WORKFLOW_REQUIRED',
  'membership role cannot bypass suspension and restoration workflows'
);

select public.assign_user_role(
  '15000000-0000-0000-0000-000000000001',
  (select id from public.roles where slug = 'editor'),
  null
);

select pg_temp.assert_true(
  (
    select count(*)
    from public.list_community_access_users(
      role_slugs => array['editor'],
      page_size => 20
    ) u
    where u.user_id = '15000000-0000-0000-0000-000000000001'
  ) = 1,
  'administrator retains ordinary operational-role assignment ability'
);

select public.revoke_user_role(
  '15000000-0000-0000-0000-000000000001',
  (select id from public.roles where slug = 'editor')
);

reset role;
set local role authenticated;
select pg_temp.authenticate_as(
  '15000000-0000-0000-0000-000000000003',
  'access-super@test.rgan'
);

select pg_temp.assert_true(
  (
    select c.is_super_admin
      and 'super_admin' = any(c.role_slugs)
    from public.get_my_authorization_context() c
  ),
  'super-administrator context is explicit'
);

select public.assign_user_role(
  '15000000-0000-0000-0000-000000000005',
  (select id from public.roles where slug = 'admin'),
  null
);

select pg_temp.assert_true(
  exists (
    select 1
    from public.list_community_access_users(
      role_slugs => array['admin'],
      page_size => 20
    ) u
    cross join lateral jsonb_array_elements(u.role_assignments) assignment
    where u.user_id = '15000000-0000-0000-0000-000000000005'
      and assignment ->> 'slug' = 'admin'
  ),
  'super administrator can appoint an administrator and roster reflects it'
);

select pg_temp.assert_true(
  exists (
    select 1
    from public.get_audit_logs(200, null) a
    where a.actor_user_id = '15000000-0000-0000-0000-000000000003'
      and a.action = 'user_role.assign'
      and a.entity_id = '15000000-0000-0000-0000-000000000005'
      and a.after_data ->> 'role_slug' = 'admin'
  ),
  'administrator appointment writes an explicit authorization audit record'
);

select public.set_role_permissions(
  (select id from public.roles where slug = 'admin'),
  (select array_agg(permission_key order by permission_key) from public.permissions)
);

select pg_temp.assert_true(
  (
    select count(*)
    from public.role_permissions rp
    where rp.role_id = (select id from public.roles where slug = 'admin')
  ) = (select count(*) from public.permissions),
  'super administrator can configure the administrator permission set'
);

select public.revoke_user_role(
  '15000000-0000-0000-0000-000000000005',
  (select id from public.roles where slug = 'admin')
);

select pg_temp.assert_true(
  not exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = '15000000-0000-0000-0000-000000000005'
      and r.slug = 'admin'
  ),
  'super administrator can revoke an administrator'
);

reset role;
rollback;
