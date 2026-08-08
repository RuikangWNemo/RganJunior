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
    '50000000-0000-0000-0000-000000000001',
    'authenticated', 'authenticated', 'guardian-child@test.rgan', '', now(),
    '{"provider":"email"}',
    '{"display_name":"Must Stay Empty","age_band":"under_14"}',
    now(), now()
  ),
  (
    '50000000-0000-0000-0000-000000000002',
    'authenticated', 'authenticated', 'guardian-teen@test.rgan', '', now(),
    '{"provider":"email"}',
    '{"display_name":"Guardian Teen","age_band":"age_14_17"}',
    now(), now()
  ),
  (
    '50000000-0000-0000-0000-000000000003',
    'authenticated', 'authenticated', 'guardian-reviewer@test.rgan', '', now(),
    '{"provider":"email"}',
    '{"display_name":"Guardian Reviewer","age_band":"adult_18_plus"}',
    now(), now()
  ),
  (
    '50000000-0000-0000-0000-000000000004',
    'authenticated', 'authenticated', 'guardian-lock@test.rgan', '', now(),
    '{"provider":"email"}',
    '{"display_name":"Must Also Stay Empty","age_band":"under_14"}',
    now(), now()
  );

insert into public.user_roles (user_id, role_id, assigned_by)
select
  '50000000-0000-0000-0000-000000000003',
  r.id,
  null
from public.roles r
where r.slug = 'admin';

update public.legal_documents
set status = 'active',
    effective_at = statement_timestamp(),
    published_at = statement_timestamp()
where document_key = 'guardian-community-consent'
  and version = 1
  and locale = 'zh-CN';

select set_config(
  'test.guardian_legal_document_id',
  (
    select id::text
    from public.legal_documents
    where document_key = 'guardian-community-consent'
      and version = 1
      and locale = 'zh-CN'
  ),
  true
);

-- Under-14 data remains minimized before consent.
set local role authenticated;
select pg_temp.authenticate_as(
  '50000000-0000-0000-0000-000000000001',
  'guardian-child@test.rgan'
);
select pg_temp.assert_true(
  (
    select display_name = ''
    from public.profiles
    where user_id = '50000000-0000-0000-0000-000000000001'
  )
  and (
    select guardian_consent_status = 'required'
      and not can_complete_onboarding
    from public.get_my_guardian_consent_state()
  ),
  'under-14 registration remains minimized and onboarding stays closed'
);
select pg_temp.expect_error(
  $$select public.create_guardian_consent_request_server(
    '50000000-0000-0000-0000-000000000001', null,
    '监护人甲', '母亲', 'email', 'ciphertext',
    repeat('1', 64), '1234',
    current_setting('test.guardian_legal_document_id')::bigint,
    repeat('2', 64), now() + interval '2 days'
  )$$,
  'browser-authenticated users cannot call service consent functions'
);

-- The secret-backed server creates an invitation with only encrypted contact data.
reset role;
set local role service_role;
select pg_temp.authenticate_service();
select set_config(
  'test.guardian_child_request_id',
  public.create_guardian_consent_request_server(
    '50000000-0000-0000-0000-000000000001',
    null,
    '监护人甲',
    '母亲',
    'email',
    'encrypted:guardian-a@example.test',
    repeat('1', 64),
    '1234',
    current_setting('test.guardian_legal_document_id')::bigint,
    private.sha256_hex(repeat('a', 64)),
    statement_timestamp() + interval '2 days'
  )::text,
  true
);

reset role;
set local role anon;
select pg_temp.authenticate_anon();
select pg_temp.assert_true(
  (
    select request_status = 'pending'
      and guardian_name = '监护人甲'
      and contact_last4 = '1234'
      and minor_age_band = 'under_14'
      and minor_display_label = '一位未满 14 岁的申请者'
      and otp_required
      and document_title like '%草案%'
    from public.get_guardian_consent_request(repeat('a', 64))
  ),
  'the bearer link reveals only the minimal guardian-facing request projection'
);
select pg_temp.expect_error(
  $$select * from public.get_guardian_consent_request(repeat('z', 64))$$,
  'an unknown bearer token reveals no request details'
);
select pg_temp.expect_error(
  'select count(*) from private.guardian_consent_requests',
  'anonymous visitors cannot query private guardian request rows'
);

-- OTP codes are represented only by a server-side HMAC and attempts persist.
reset role;
set local role service_role;
select pg_temp.authenticate_service();
select set_config(
  'test.guardian_child_challenge_id',
  public.begin_guardian_otp_server(
    repeat('a', 64),
    repeat('b', 64),
    'encrypted:+8613800001234',
    repeat('c', 64),
    '1234',
    repeat('d', 64),
    statement_timestamp() + interval '5 minutes'
  )::text,
  true
);
select pg_temp.assert_true(
  public.verify_guardian_otp_server(
    repeat('a', 64),
    current_setting('test.guardian_child_challenge_id')::uuid,
    repeat('e', 64),
    true, true, true,
    repeat('f', 64),
    repeat('0', 64)
  ) = 'invalid',
  'an incorrect OTP HMAC is rejected without losing the attempt record'
);
select pg_temp.assert_true(
  public.verify_guardian_otp_server(
    repeat('a', 64),
    current_setting('test.guardian_child_challenge_id')::uuid,
    repeat('b', 64),
    true, true, true,
    repeat('f', 64),
    repeat('0', 64)
  ) = 'verified',
  'the matching OTP HMAC and all three affirmations complete consent'
);
select pg_temp.assert_true(
  public.verify_guardian_otp_server(
    repeat('a', 64),
    current_setting('test.guardian_child_challenge_id')::uuid,
    repeat('b', 64),
    true, true, true
  ) = 'not_available',
  'a verified request cannot be replayed'
);

reset role;
select pg_temp.assert_true(
  (
    select guardian_consent_status = 'verified'
      and identity_verification_status = 'pending'
    from private.account_safety_profiles
    where user_id = '50000000-0000-0000-0000-000000000001'
  )
  and (
    select otp_verify_attempts = 1 and status = 'verified'
    from private.guardian_consent_requests
    where id = current_setting('test.guardian_child_request_id')::uuid
  )
  and exists (
    select 1
    from private.guardian_consents
    where request_id = current_setting('test.guardian_child_request_id')::uuid
      and guardian_phone_last4 = '1234'
      and withdrawn_at is null
  ),
  'verified consent updates safety state and stores the minimal evidence record'
);

set local role authenticated;
select pg_temp.authenticate_as(
  '50000000-0000-0000-0000-000000000001',
  'guardian-child@test.rgan'
);
select pg_temp.assert_true(
  (
    select can_complete_onboarding
      and not eligible_for_membership_approval
    from public.get_my_guardian_consent_state()
  ),
  'consent opens under-14 onboarding but identity review is still separate'
);
select public.complete_community_onboarding(
  account_username => 'guardian_child',
  person_display_name => '小小树',
  person_name_zh => '小树',
  person_nature_name => '小小树',
  requested_profile_visibility => 'members'
);

-- A 14-17 applicant can onboard first but remains pending until guardian confirmation.
reset role;
set local role authenticated;
select pg_temp.authenticate_as(
  '50000000-0000-0000-0000-000000000002',
  'guardian-teen@test.rgan'
);
select public.complete_community_onboarding(
  account_username => 'guardian_teen',
  person_display_name => '少年青叶',
  person_name_zh => '青叶',
  person_nature_name => '青叶',
  requested_profile_visibility => 'public'
);
select set_config(
  'test.guardian_teen_application_id',
  public.create_community_application('希望加入长期共练。')::text,
  true
);
select pg_temp.assert_true(
  public.submit_community_application(
    current_setting('test.guardian_teen_application_id')::bigint,
    '希望加入长期共练。'
  ) = 'pending_guardian',
  'a 14-17 application waits outside the review queue'
);

reset role;
set local role service_role;
select pg_temp.authenticate_service();
select set_config(
  'test.guardian_teen_request_id',
  public.create_guardian_consent_request_server(
    '50000000-0000-0000-0000-000000000002',
    current_setting('test.guardian_teen_application_id')::bigint,
    '监护人乙',
    '父亲',
    'phone',
    'encrypted:+8613900005678',
    repeat('2', 64),
    '5678',
    current_setting('test.guardian_legal_document_id')::bigint,
    private.sha256_hex(repeat('g', 64)),
    statement_timestamp() + interval '2 days'
  )::text,
  true
);
select set_config(
  'test.guardian_teen_challenge_id',
  public.begin_guardian_otp_server(
    repeat('g', 64),
    repeat('a', 64),
    'encrypted:+8613900005678',
    repeat('3', 64),
    '5678',
    repeat('4', 64),
    statement_timestamp() + interval '5 minutes'
  )::text,
  true
);
select pg_temp.assert_true(
  public.verify_guardian_otp_server(
    repeat('g', 64),
    current_setting('test.guardian_teen_challenge_id')::uuid,
    repeat('a', 64),
    true, true, true
  ) = 'verified',
  'teen guardian confirmation completes'
);

reset role;
select pg_temp.assert_true(
  (
    select status = 'submitted' and submitted_at is not null
    from public.community_applications
    where id = current_setting('test.guardian_teen_application_id')::bigint
  ),
  'guardian verification moves the teen application into the review queue'
);

-- OTP does not masquerade as identity verification.
set local role authenticated;
select pg_temp.authenticate_as(
  '50000000-0000-0000-0000-000000000003',
  'guardian-reviewer@test.rgan'
);
select pg_temp.expect_error(
  format(
    $$select public.review_community_application(%s, 'approve', '不应通过')$$,
    current_setting('test.guardian_teen_application_id')
  ),
  'guardian phone verification alone cannot approve a minor Membership'
);
select public.review_minor_identity_verification(
  '50000000-0000-0000-0000-000000000002',
  'verify',
  'trusted_offline_relationship',
  '工作人员在线下关系中完成身份核验。',
  repeat('5', 64)
);
select public.review_community_application(
  current_setting('test.guardian_teen_application_id')::bigint,
  'approve',
  '欢迎进入阿柑少年社群。'
);

reset role;
select pg_temp.assert_true(
  (
    select status = 'active'
    from public.community_memberships
    where user_id = '50000000-0000-0000-0000-000000000002'
  )
  and exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = '50000000-0000-0000-0000-000000000002'
      and r.slug = 'community_member'
  ),
  'separate consent and identity evidence allow the reviewed teen Membership'
);

-- Verified withdrawal suspends internal access but preserves the base account.
set local role service_role;
select pg_temp.authenticate_service();
select public.withdraw_guardian_consent_server(
  current_setting('test.guardian_teen_request_id')::uuid,
  repeat('6', 64),
  '监护人改变决定。'
);

reset role;
select pg_temp.assert_true(
  (
    select guardian_consent_status = 'withdrawn'
    from private.account_safety_profiles
    where user_id = '50000000-0000-0000-0000-000000000002'
  )
  and (
    select status = 'suspended'
      and suspension_source = 'guardian_consent'
    from public.community_memberships
    where user_id = '50000000-0000-0000-0000-000000000002'
  )
  and not exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = '50000000-0000-0000-0000-000000000002'
      and r.slug in ('community_member', 'facilitator')
  )
  and (
    select account_status = 'active'
    from public.profiles
    where user_id = '50000000-0000-0000-0000-000000000002'
  ),
  'withdrawal suspends Membership capabilities while preserving the account'
);

set local role authenticated;
select pg_temp.authenticate_as(
  '50000000-0000-0000-0000-000000000003',
  'guardian-reviewer@test.rgan'
);
select pg_temp.expect_error(
  $$select public.restore_community_membership(
    '50000000-0000-0000-0000-000000000002'
  )$$,
  'an administrator cannot bypass missing minor consent when restoring Membership'
);

-- A renewed verified request automatically restores a safety-suspended Membership.
reset role;
set local role service_role;
select pg_temp.authenticate_service();
select set_config(
  'test.guardian_teen_renewal_request_id',
  public.create_guardian_consent_request_server(
    '50000000-0000-0000-0000-000000000002',
    current_setting('test.guardian_teen_application_id')::bigint,
    '监护人乙',
    '父亲',
    'phone',
    'encrypted:+8613900005678',
    repeat('2', 64),
    '5678',
    current_setting('test.guardian_legal_document_id')::bigint,
    private.sha256_hex(repeat('i', 64)),
    statement_timestamp() + interval '2 days'
  )::text,
  true
);
select set_config(
  'test.guardian_teen_renewal_challenge_id',
  public.begin_guardian_otp_server(
    repeat('i', 64),
    repeat('b', 64),
    'encrypted:+8613900005678',
    repeat('3', 64),
    '5678',
    repeat('7', 64),
    statement_timestamp() + interval '5 minutes'
  )::text,
  true
);
select pg_temp.assert_true(
  public.verify_guardian_otp_server(
    repeat('i', 64),
    current_setting('test.guardian_teen_renewal_challenge_id')::uuid,
    repeat('b', 64),
    true, true, true
  ) = 'verified',
  'renewed consent verifies'
);

reset role;
select pg_temp.assert_true(
  (
    select status = 'active' and suspension_source is null
    from public.community_memberships
    where user_id = '50000000-0000-0000-0000-000000000002'
  )
  and exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = '50000000-0000-0000-0000-000000000002'
      and r.slug = 'community_member'
  ),
  'renewal restores Membership only because identity remains verified'
);

-- Per-challenge OTP limits persist, and expiry is reported without exposing data.
set local role service_role;
select pg_temp.authenticate_service();
select set_config(
  'test.guardian_lock_request_id',
  public.create_guardian_consent_request_server(
    '50000000-0000-0000-0000-000000000004',
    null,
    '监护人丙',
    '其他监护人',
    'email',
    'encrypted:guardian-c@example.test',
    repeat('8', 64),
    '8888',
    current_setting('test.guardian_legal_document_id')::bigint,
    private.sha256_hex(repeat('k', 64)),
    statement_timestamp() + interval '2 days'
  )::text,
  true
);
select set_config(
  'test.guardian_lock_challenge_id',
  public.begin_guardian_otp_server(
    repeat('k', 64),
    repeat('c', 64),
    'encrypted:+8613700008888',
    repeat('9', 64),
    '8888',
    null,
    statement_timestamp() + interval '5 minutes'
  )::text,
  true
);
select pg_temp.assert_true(
  public.verify_guardian_otp_server(
    repeat('k', 64), current_setting('test.guardian_lock_challenge_id')::uuid,
    repeat('d', 64), true, true, true
  ) = 'invalid',
  'first wrong challenge attempt remains retryable'
);
select public.verify_guardian_otp_server(
  repeat('k', 64), current_setting('test.guardian_lock_challenge_id')::uuid,
  repeat('d', 64), true, true, true
);
select public.verify_guardian_otp_server(
  repeat('k', 64), current_setting('test.guardian_lock_challenge_id')::uuid,
  repeat('d', 64), true, true, true
);
select public.verify_guardian_otp_server(
  repeat('k', 64), current_setting('test.guardian_lock_challenge_id')::uuid,
  repeat('d', 64), true, true, true
);
select pg_temp.assert_true(
  public.verify_guardian_otp_server(
    repeat('k', 64), current_setting('test.guardian_lock_challenge_id')::uuid,
    repeat('d', 64), true, true, true
  ) = 'locked',
  'the fifth wrong challenge attempt locks that OTP challenge'
);
select pg_temp.assert_true(
  public.verify_guardian_otp_server(
    repeat('k', 64), current_setting('test.guardian_lock_challenge_id')::uuid,
    repeat('c', 64), true, true, true
  ) = 'not_available',
  'a locked OTP challenge cannot be recovered with a later correct code'
);

reset role;
update private.guardian_consent_requests
set created_at = statement_timestamp() - interval '3 hours',
    expires_at = statement_timestamp() - interval '1 hour'
where id = current_setting('test.guardian_lock_request_id')::uuid;

set local role anon;
select pg_temp.authenticate_anon();
select pg_temp.assert_true(
  (
    select request_status = 'expired' and not otp_required
    from public.get_guardian_consent_request(repeat('k', 64))
  ),
  'expired bearer links return an expired state without usable OTP access'
);

-- A guardian can decline without creating consent evidence.
reset role;
set local role service_role;
select pg_temp.authenticate_service();
select set_config(
  'test.guardian_decline_request_id',
  public.create_guardian_consent_request_server(
    '50000000-0000-0000-0000-000000000004',
    null,
    '监护人丙',
    '其他监护人',
    'email',
    'encrypted:guardian-c@example.test',
    repeat('8', 64),
    '8888',
    current_setting('test.guardian_legal_document_id')::bigint,
    private.sha256_hex(repeat('n', 64)),
    statement_timestamp() + interval '2 days'
  )::text,
  true
);
select public.decline_guardian_consent_server(
  repeat('n', 64),
  '暂不同意加入。'
);

reset role;
select pg_temp.assert_true(
  (
    select status = 'declined'
    from private.guardian_consent_requests
    where id = current_setting('test.guardian_decline_request_id')::uuid
  )
  and (
    select guardian_consent_status = 'required'
    from private.account_safety_profiles
    where user_id = '50000000-0000-0000-0000-000000000004'
  )
  and not exists (
    select 1
    from private.guardian_consents
    where request_id = current_setting('test.guardian_decline_request_id')::uuid
  ),
  'declining records the decision without manufacturing consent evidence'
);

select pg_temp.assert_true(
  not exists (
    select 1
    from private.guardian_consent_events gce
    where gce.metadata::text like '%encrypted:%'
  ),
  'guardian event metadata never duplicates encrypted contact payloads'
);
select pg_temp.assert_true(
  (
    select count(*)
    from private.guardian_consent_events
    where minor_user_id in (
      '50000000-0000-0000-0000-000000000001',
      '50000000-0000-0000-0000-000000000002',
      '50000000-0000-0000-0000-000000000004'
    )
      and event_type in (
        'guardian.request_created',
        'guardian.otp_sent',
        'guardian.otp_failed',
        'guardian.otp_locked',
        'guardian.consent_verified',
        'guardian.consent_withdrawn',
        'guardian.consent_declined',
        'minor_identity.verified'
      )
  ) >= 16,
  'sanitized consent and identity lifecycle events are retained'
);

rollback;
