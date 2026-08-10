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
  (
    '60000000-0000-0000-0000-000000000001',
    'authenticated', 'authenticated', 'safe-public@test.rgan', '', now(),
    '{"provider":"email"}',
    '{"display_name":"Safe Public","age_band":"adult_18_plus"}',
    now(), now()
  ),
  (
    '60000000-0000-0000-0000-000000000002',
    'authenticated', 'authenticated', 'safe-members@test.rgan', '', now(),
    '{"provider":"email"}',
    '{"display_name":"Safe Members","age_band":"adult_18_plus"}',
    now(), now()
  ),
  (
    '60000000-0000-0000-0000-000000000003',
    'authenticated', 'authenticated', 'safe-registered@test.rgan', '', now(),
    '{"provider":"email"}',
    '{"display_name":"Safe Registered","age_band":"adult_18_plus"}',
    now(), now()
  ),
  (
    '60000000-0000-0000-0000-000000000004',
    'authenticated', 'authenticated', 'safe-admin@test.rgan', '', now(),
    '{"provider":"email"}',
    '{"display_name":"Safe Admin","age_band":"adult_18_plus"}',
    now(), now()
  );

insert into public.user_roles (user_id, role_id, assigned_by)
select '60000000-0000-0000-0000-000000000004', r.id, null
from public.roles r where r.slug = 'admin';

set local role authenticated;
select pg_temp.authenticate_as(
  '60000000-0000-0000-0000-000000000001',
  'safe-public@test.rgan'
);
select public.complete_community_onboarding(
  account_username => 'public_leaf',
  person_display_name => '公开叶片',
  person_name_zh => '不公开真名甲',
  person_name_en => 'Hidden A',
  person_nature_name => '叶片',
  requested_profile_visibility => 'public',
  requested_show_real_name => false,
  requested_allow_messages => true
);

reset role;
set local role authenticated;
select pg_temp.authenticate_as(
  '60000000-0000-0000-0000-000000000002',
  'safe-members@test.rgan'
);
select public.complete_community_onboarding(
  account_username => 'member_moss',
  person_display_name => '成员青苔',
  person_name_zh => '可见真名乙',
  person_name_en => 'Visible B',
  person_nature_name => '青苔',
  requested_profile_visibility => 'members',
  requested_show_real_name => true,
  requested_allow_messages => false
);

reset role;
set local role authenticated;
select pg_temp.authenticate_as(
  '60000000-0000-0000-0000-000000000003',
  'safe-registered@test.rgan'
);
select public.complete_community_onboarding(
  account_username => 'registered_wind',
  person_display_name => '尚未入群',
  person_name_zh => '未入群姓名',
  person_nature_name => '风',
  requested_profile_visibility => 'public',
  requested_show_real_name => true
);

reset role;
insert into public.community_memberships (
  user_id, status, approved_by, approved_at, member_since
)
values
  (
    '60000000-0000-0000-0000-000000000001',
    'active', '60000000-0000-0000-0000-000000000004', now(), current_date
  ),
  (
    '60000000-0000-0000-0000-000000000002',
    'active', '60000000-0000-0000-0000-000000000004', now(), current_date
  );

insert into public.user_roles (user_id, role_id, assigned_by)
select target.user_id, r.id, '60000000-0000-0000-0000-000000000004'
from (
  values
    ('60000000-0000-0000-0000-000000000001'::uuid),
    ('60000000-0000-0000-0000-000000000002'::uuid)
) target(user_id)
cross join public.roles r
where r.slug = 'community_member';

update public.people
set is_public = (profile_visibility = 'public'),
    joined_at = current_date,
    full_name_private = case
      when user_id = '60000000-0000-0000-0000-000000000001'
        then '绝不能公开的全名甲'
      else '绝不能越权读取的全名乙'
    end
where user_id in (
  '60000000-0000-0000-0000-000000000001',
  '60000000-0000-0000-0000-000000000002'
);

-- Raw rows are closed; anonymous callers receive only public safe fields.
set local role anon;
select pg_temp.authenticate_anon();
select pg_temp.expect_error(
  'select * from public.people',
  'anonymous callers cannot select raw People rows'
);
select pg_temp.assert_true(
  (
    select count(*) = 1
      and bool_and(display_name = '公开叶片')
      and bool_and(name_zh is null)
      and bool_and(name_en is null)
    from public.list_community_people(20, null, null)
  ),
  'public projection exposes one public member and honors hidden real-name settings'
);
select pg_temp.assert_true(
  (
    select not (to_jsonb(person_row) ? 'full_name_private')
      and name_zh is null
    from public.get_community_person_by_slug('public-leaf-60000000') person_row
  ),
  'person detail projection has no private-name field'
);

-- Registered users do not gain members-only profiles.
reset role;
set local role authenticated;
select pg_temp.authenticate_as(
  '60000000-0000-0000-0000-000000000003',
  'safe-registered@test.rgan'
);
select pg_temp.expect_error(
  'select * from public.people',
  'authenticated callers cannot select raw People rows either'
);
select pg_temp.assert_true(
  (
    select count(*) from public.list_community_people(20, null, null)
  ) = 1,
  'a registered non-member sees only public active-member profiles'
);

-- Active members can see member-visible projections and only explicitly shown names.
reset role;
set local role authenticated;
select pg_temp.authenticate_as(
  '60000000-0000-0000-0000-000000000001',
  'safe-public@test.rgan'
);
select pg_temp.assert_true(
  (
    select count(*) = 2
      and count(*) filter (
        where display_name = '成员青苔'
          and name_zh = '可见真名乙'
          and name_en = 'Visible B'
      ) = 1
    from public.list_community_people(20, null, null)
  ),
  'active members see public and members-only safe projections'
);
select pg_temp.assert_true(
  (
    select full_name_private = '绝不能公开的全名甲'
      and name_zh = '不公开真名甲'
      and allow_messages
    from public.get_my_community_profile()
  ),
  'the owner-only profile RPC returns the caller private fields and settings'
);

select public.update_my_community_profile(
  person_display_name => '更新后的叶片',
  person_full_name_private => '更新后的私密全名',
  person_name_zh => '更新后姓名',
  person_name_en => 'Updated Name',
  person_nature_name => '叶片',
  person_bio => '更新后的简介',
  requested_profile_visibility => 'members',
  requested_show_real_name => true,
  requested_allow_messages => false
);
select pg_temp.assert_true(
  (
    select person_display_name = '更新后的叶片'
      and full_name_private = '更新后的私密全名'
      and profile_visibility = 'members'
      and show_real_name
      and not allow_messages
    from public.get_my_community_profile()
  ),
  'controlled self-profile updates keep private fields owner-only'
);

-- Secret-backed login resolution and rate limits never expose identifiers publicly.
reset role;
set local role authenticated;
select pg_temp.authenticate_as(
  '60000000-0000-0000-0000-000000000003',
  'safe-registered@test.rgan'
);
select pg_temp.expect_error(
  $$select public.resolve_login_email_server('registered_wind')$$,
  'browser users cannot resolve a username to an Auth email'
);
select pg_temp.expect_error(
  $$select * from public.consume_api_rate_limit_server(
    'username-login', repeat('a', 64), 2, 60, 120
  )$$,
  'browser users cannot consume trusted rate-limit counters'
);
select pg_temp.expect_error(
  'select count(*) from private.api_rate_limits',
  'browser users cannot inspect hashed rate-limit rows'
);

reset role;
set local role service_role;
select pg_temp.authenticate_service();
select pg_temp.assert_true(
  public.resolve_login_email_server('REGISTERED_WIND') = 'safe-registered@test.rgan'
  and public.resolve_login_email_server(' Direct@Example.Test ') = 'direct@example.test'
  and public.resolve_login_email_server('missing_user') is null,
  'service username resolution is normalized and returns null for unknown users'
);
select pg_temp.assert_true(
  (
    select allowed and remaining_attempts = 1
    from public.consume_api_rate_limit_server(
      'username-login', repeat('a', 64), 2, 60, 120
    )
  ),
  'first hashed request is allowed'
);
select pg_temp.assert_true(
  (
    select allowed and remaining_attempts = 0
    from public.consume_api_rate_limit_server(
      'username-login', repeat('a', 64), 2, 60, 120
    )
  ),
  'second hashed request consumes the remaining allowance'
);
select pg_temp.assert_true(
  (
    select not allowed and retry_after_seconds = 120 and remaining_attempts = 0
    from public.consume_api_rate_limit_server(
      'username-login', repeat('a', 64), 2, 60, 120
    )
  ),
  'the next request is persistently blocked without storing a raw identifier'
);

reset role;
select pg_temp.assert_true(
  (
    select count(*) = 1
      and bool_and(key_hash = repeat('a', 64))
      and bool_and(attempt_count = 3)
    from private.api_rate_limits
    where scope = 'username-login'
  ),
  'rate-limit storage contains only the server supplied hash and counter'
);

rollback;
