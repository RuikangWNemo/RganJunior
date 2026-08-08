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

insert into auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  (
    '30000000-0000-0000-0000-000000000001',
    'authenticated', 'authenticated', 'identity-adult@test.rgan', '', now(),
    '{"provider":"email"}',
    '{"display_name":"Adult Draft","age_band":"adult_18_plus"}',
    now(), now()
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    'authenticated', 'authenticated', 'identity-teen@test.rgan', '', now(),
    '{"provider":"email"}',
    '{"display_name":"Teen Draft","age_band":"age_14_17"}',
    now(), now()
  ),
  (
    '30000000-0000-0000-0000-000000000003',
    'authenticated', 'authenticated', 'identity-child@test.rgan', '', now(),
    '{"provider":"email"}',
    '{"display_name":"Must Not Be Copied","age_band":"under_14"}',
    now(), now()
  ),
  (
    '30000000-0000-0000-0000-000000000004',
    'authenticated', 'authenticated', 'identity-duplicate@test.rgan', '', now(),
    '{"provider":"email"}',
    '{"display_name":"Duplicate","age_band":"adult_18_plus"}',
    now(), now()
  );

select pg_temp.assert_true(
  (select count(*) from public.profiles where user_id::text like '30000000-%') = 4
  and (select count(*) from public.user_settings where user_id::text like '30000000-%') = 4
  and (select count(*) from private.account_safety_profiles where user_id::text like '30000000-%') = 4,
  'registration creates the profile, settings, and safety rows'
);

select pg_temp.assert_true(
  (
    select display_name = ''
    from public.profiles
    where user_id = '30000000-0000-0000-0000-000000000003'
  ),
  'under-14 registration does not copy a display name before guardian consent'
);

select pg_temp.assert_true(
  (
    select count(*)
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id::text like '30000000-%'
      and r.slug = 'registered_user'
  ) = 4,
  'every new account receives only the registered-user baseline role'
);

select pg_temp.assert_true(
  exists (select 1 from public.roles where slug = 'community_member' and is_system)
  and exists (select 1 from public.roles where slug = 'facilitator' and is_system),
  'community member and facilitator system roles are configured'
);

select pg_temp.assert_true(
  private.user_has_permission(
    '30000000-0000-0000-0000-000000000001',
    'community.apply'
  )
  and not private.user_has_permission(
    '30000000-0000-0000-0000-000000000001',
    'messages.use'
  ),
  'registered users may apply but cannot use member messaging'
);

select pg_temp.expect_error(
  $$insert into auth.users (
      id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) values (
      '30000000-0000-0000-0000-000000000099',
      'authenticated', 'authenticated', 'identity-no-age@test.rgan', '', now(),
      '{"provider":"email"}', '{}', now(), now()
    )$$,
  'registration requires one of the three age bands'
);

set local role authenticated;
select pg_temp.authenticate_as(
  '30000000-0000-0000-0000-000000000001',
  'identity-adult@test.rgan'
);

select pg_temp.assert_true(
  (
    select destination = '/community/onboarding'
    from public.get_my_community_state()
  ),
  'adult account starts at onboarding'
);

select set_config(
  'test.identity_adult_person_id',
  public.complete_community_onboarding(
    account_username => 'wild_mint',
    person_display_name => '野薄荷',
    person_name_zh => '小林',
    person_name_en => 'Lin',
    person_nature_name => '野薄荷',
    person_bio => '喜欢自然观察。',
    person_city => '成都',
    person_region => '四川',
    person_country => '中国',
    requested_profile_visibility => 'public',
    requested_show_real_name => false,
    requested_allow_messages => false
  )::text,
  true
);

select pg_temp.assert_true(
  (
    select username = 'wild_mint'
      and onboarding_completed_at is not null
    from public.profiles
    where user_id = '30000000-0000-0000-0000-000000000001'
  ),
  'onboarding reserves username and records completion'
);

select pg_temp.assert_true(
  (
    select profile_visibility = 'public'
      and nature_name = '野薄荷'
      and name_zh = '小林'
      and name_en = 'Lin'
    from public.get_my_community_profile()
  )
  and (
    select count(*)
    from public.list_community_people(20, null, null)
    where id = current_setting('test.identity_adult_person_id')::bigint
  ) = 0,
  'onboarding stores the requested profile but does not publish a non-member'
);

select pg_temp.assert_true(
  (
    select not allow_messages
    from public.user_settings
    where user_id = '30000000-0000-0000-0000-000000000001'
  ),
  'onboarding stores the message preference'
);

select public.update_my_community_profile(
  person_display_name => '野薄荷',
  person_full_name_private => '小林',
  person_name_zh => '小林',
  person_name_en => 'Lin',
  person_nature_name => '野薄荷',
  person_bio => '本人可以继续编辑主页草稿。',
  person_city => '成都',
  person_region => '四川',
  person_country => '中国',
  requested_profile_visibility => 'public',
  requested_show_real_name => false,
  requested_allow_messages => false
);

select pg_temp.assert_true(
  (
    select bio = '本人可以继续编辑主页草稿。'
    from public.get_my_community_profile()
  )
  and (
    select count(*)
    from public.list_community_people(20, null, null)
    where id = current_setting('test.identity_adult_person_id')::bigint
  ) = 0,
  'registered users edit through the controlled RPC without activating public exposure'
);

select pg_temp.expect_error(
  $$update public.profiles
    set onboarding_completed_at = null
    where user_id = '30000000-0000-0000-0000-000000000001'$$,
  'onboarding state cannot be forged through direct profile update'
);

select pg_temp.expect_error(
  'select count(*) from private.account_safety_profiles',
  'authenticated users cannot query private age and consent state directly'
);

select pg_temp.assert_true(
  (
    select destination = '/community/apply'
    from public.get_my_community_state()
  ),
  'completed adult onboarding routes to application'
);

reset role;
set local role authenticated;
select pg_temp.authenticate_as(
  '30000000-0000-0000-0000-000000000004',
  'identity-duplicate@test.rgan'
);
select pg_temp.expect_error(
  $$select public.complete_community_onboarding(
    account_username => 'wild_mint',
    person_display_name => '重复用户名',
    person_name_zh => '重复用户名'
  )$$,
  'username uniqueness is enforced case-insensitively'
);

reset role;
set local role authenticated;
select pg_temp.authenticate_as(
  '30000000-0000-0000-0000-000000000002',
  'identity-teen@test.rgan'
);

select pg_temp.assert_true(
  (
    select age_band = 'age_14_17'
      and guardian_consent_status = 'required'
      and destination = '/community/onboarding'
    from public.get_my_community_state()
  ),
  '14-17 account needs consent for membership but may complete onboarding first'
);

select public.complete_community_onboarding(
  account_username => 'young_leaf',
  person_display_name => '小叶',
  person_name_zh => '小叶',
  requested_profile_visibility => 'members'
);

select pg_temp.assert_true(
  (
    select destination = '/community/apply'
    from public.get_my_community_state()
  ),
  '14-17 onboarding may complete before guardian consent'
);

reset role;
set local role authenticated;
select pg_temp.authenticate_as(
  '30000000-0000-0000-0000-000000000003',
  'identity-child@test.rgan'
);

select pg_temp.assert_true(
  (
    select age_band = 'under_14'
      and guardian_consent_status = 'required'
      and destination = '/community/guardian-consent'
    from public.get_my_community_state()
  ),
  'under-14 account routes to guardian consent before onboarding'
);

select pg_temp.expect_error(
  $$select public.complete_community_onboarding(
    account_username => 'small_seed',
    person_display_name => '小种子',
    person_name_zh => '小种子'
  )$$,
  'under-14 account cannot collect full profile before guardian consent'
);

reset role;
select pg_temp.assert_true(
  (
    select count(*)
    from private.audit_logs
    where actor_user_id in (
      '30000000-0000-0000-0000-000000000001',
      '30000000-0000-0000-0000-000000000002'
    )
      and entity_type in ('profile', 'person', 'user_settings')
  ) >= 4,
  'onboarding and self-profile changes create audit records'
);

rollback;
