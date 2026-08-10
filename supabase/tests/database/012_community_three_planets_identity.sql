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

-- A founder declaration is rejected by the signup hook.
select pg_temp.expect_error(
  $signup$
    insert into auth.users (
      id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) values (
      'c1000000-0000-0000-0000-000000000003',
      'authenticated', 'authenticated', 'founder-self@test.rgan', '', now(),
      '{"provider":"email"}',
      '{"age_band":"adult_18_plus","community_primary_identity_slug":"rgan-founder"}',
      now(), now()
    )
  $signup$,
  'a registrant cannot self-declare the founder identity'
);

insert into auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  (
    'c1000000-0000-0000-0000-000000000001',
    'authenticated', 'authenticated', 'planet-applicant@test.rgan', '', now(),
    '{"provider":"email"}',
    '{"age_band":"adult_18_plus","community_primary_identity_slug":"participant","community_secondary_identity_slugs":["adult-support"]}',
    now(), now()
  ),
  (
    'c1000000-0000-0000-0000-000000000002',
    'authenticated', 'authenticated', 'planet-admin@test.rgan', '', now(),
    '{"provider":"email"}',
    '{"age_band":"adult_18_plus"}',
    now(), now()
  );

insert into public.user_roles (user_id, role_id, assigned_by)
select 'c1000000-0000-0000-0000-000000000002', r.id, null
from public.roles r
where r.slug = 'admin'
on conflict (user_id, role_id) do nothing;

set local role authenticated;
select pg_temp.authenticate_as(
  'c1000000-0000-0000-0000-000000000001',
  'planet-applicant@test.rgan'
);

reset role;
select pg_temp.assert_true(
  (
    select count(*) = 0
    from public.person_identity_labels pil
    join public.people pe on pe.id = pil.person_id
    where pe.user_id = 'c1000000-0000-0000-0000-000000000001'
  ),
  'self-reported metadata does not create confirmed identities'
);

set local role authenticated;
select pg_temp.authenticate_as(
  'c1000000-0000-0000-0000-000000000001',
  'planet-applicant@test.rgan'
);

select public.complete_community_onboarding(
  account_username => 'planet_applicant',
  person_display_name => '三星申请人',
  person_name_zh => '三星申请人',
  person_nature_name => '山海',
  person_bio => '希望连接行动与家庭。',
  requested_profile_visibility => 'public'
);

select set_config(
  'test.planet_application_id',
  public.create_community_application('希望参与三星社群。')::text,
  true
);

select public.submit_community_application(
  current_setting('test.planet_application_id')::bigint,
  '希望参与三星社群。'
);

select pg_temp.expect_error(
  $$select public.get_community_identity_stats_admin()$$,
  'a registered applicant cannot read identity statistics'
);

reset role;
set local role authenticated;
select pg_temp.authenticate_as(
  'c1000000-0000-0000-0000-000000000002',
  'planet-admin@test.rgan'
);

select set_config(
  'test.planet_missing_primary_before',
  (public.get_community_identity_stats_admin() ->> 'missingPrimary'),
  true
);

select pg_temp.assert_true(
  (
    select primary_identity_slug = 'participant'
      and secondary_identity_slugs = array['adult-support']::text[]
    from public.list_membership_application_identity_declarations(
      array[current_setting('test.planet_application_id')::bigint]
    )
  ),
  'reviewers see the declared primary and secondary identities'
);

select public.review_community_application_with_identities(
  current_setting('test.planet_application_id')::bigint,
  'approve',
  '欢迎加入三星社群。',
  'identity-planets-test',
  'participant',
  array['adult-support']::text[]
);

reset role;
select pg_temp.assert_true(
  (
    select count(*) = 2
      and count(*) filter (where pil.is_primary and il.slug = 'participant') = 1
      and count(*) filter (where not pil.is_primary and il.slug = 'adult-support') = 1
    from public.person_identity_labels pil
    join public.identity_labels il on il.id = pil.identity_label_id
    join public.people pe on pe.id = pil.person_id
    where pe.user_id = 'c1000000-0000-0000-0000-000000000001'
  ),
  'approval atomically confirms one primary and one secondary identity'
);

set local role authenticated;
select pg_temp.authenticate_as(
  'c1000000-0000-0000-0000-000000000001',
  'planet-applicant@test.rgan'
);

select pg_temp.assert_true(
  (
    select count(*) = 1
      and bool_and(planet_slugs @> array['support', 'youth']::text[])
      and bool_and(primary_identity_slug = 'participant')
    from public.list_community_people()
    where slug = 'planet-applicant-c1000000'
  ),
  'the people directory returns confirmed planets and primary identity'
);

reset role;
set local role authenticated;
select pg_temp.authenticate_as(
  'c1000000-0000-0000-0000-000000000002',
  'planet-admin@test.rgan'
);

select pg_temp.assert_true(
  (
    select (public.get_community_identity_stats_admin() ->> 'missingPrimary')::integer
        = current_setting('test.planet_missing_primary_before')::integer
      and jsonb_array_length(public.get_community_identity_stats_admin() -> 'overlaps') >= 1
  ),
  'admin statistics include overlap data without missing the approved primary'
);

select public.set_community_member_identities_admin(
  (
    select person_id
    from public.list_community_identity_members_admin('山海')
    limit 1
  ),
  'rgan-founder',
  array['participant']::text[]
);

select pg_temp.assert_true(
  (
    select bool_and(primary_identity_slug = 'rgan-founder')
    from public.list_community_identity_members_admin('山海')
  ),
  'an administrator can assign the founder identity after review'
);

rollback;
