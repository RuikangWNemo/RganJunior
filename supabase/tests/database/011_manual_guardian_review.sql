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
  (
    '51000000-0000-0000-0000-000000000001',
    'authenticated', 'authenticated', 'manual-child@test.rgan', '', now(),
    '{"provider":"email"}',
    '{"display_name":"Manual Child","age_band":"under_14"}',
    now(), now()
  ),
  (
    '51000000-0000-0000-0000-000000000002',
    'authenticated', 'authenticated', 'manual-reviewer@test.rgan', '', now(),
    '{"provider":"email"}',
    '{"display_name":"Manual Reviewer","age_band":"adult_18_plus"}',
    now(), now()
  ),
  (
    '51000000-0000-0000-0000-000000000003',
    'authenticated', 'authenticated', 'manual-unprivileged@test.rgan', '', now(),
    '{"provider":"email"}',
    '{"display_name":"Manual Unprivileged","age_band":"adult_18_plus"}',
    now(), now()
  ),
  (
    '51000000-0000-0000-0000-000000000004',
    'authenticated', 'authenticated', 'manual-decline-child@test.rgan', '', now(),
    '{"provider":"email"}',
    '{"display_name":"Manual Decline Child","age_band":"under_14"}',
    now(), now()
  ),
  (
    '51000000-0000-0000-0000-000000000005',
    'authenticated', 'authenticated', 'manual-teen@test.rgan', '', now(),
    '{"provider":"email"}',
    '{"display_name":"Manual Teen","age_band":"age_14_17"}',
    now(), now()
  );

insert into public.user_roles (user_id, role_id, assigned_by)
select '51000000-0000-0000-0000-000000000002', role.id, null
from public.roles role
where role.slug = 'admin';

-- Every age band can complete onboarding before Guardian review.
set local role authenticated;
select pg_temp.authenticate_as(
  '51000000-0000-0000-0000-000000000001',
  'manual-child@test.rgan'
);
select public.complete_community_onboarding(
  account_username => 'manual_child',
  person_display_name => '小树苗',
  person_name_zh => '小树苗',
  person_nature_name => '树苗',
  requested_profile_visibility => 'private'
);
select set_config(
  'test.manual_child_application_id',
  public.create_community_application('希望和伙伴一起学习。')::text,
  true
);
select pg_temp.assert_true(
  public.submit_community_application(
    current_setting('test.manual_child_application_id')::bigint,
    '希望和伙伴一起学习。'
  ) = 'pending_guardian',
  'under-14 submission waits for Guardian confirmation after onboarding'
);
select pg_temp.assert_true(
  (
    select destination = '/community/application'
    from public.get_my_community_state()
  ),
  'under-14 applicants can view application status before confirmation'
);

reset role;
set local role authenticated;
select pg_temp.authenticate_as(
  '51000000-0000-0000-0000-000000000005',
  'manual-teen@test.rgan'
);
select public.complete_community_onboarding(
  account_username => 'manual_teen',
  person_display_name => '青叶',
  person_name_zh => '青叶',
  person_nature_name => '青叶',
  requested_profile_visibility => 'private'
);
select set_config(
  'test.manual_teen_application_id',
  public.create_community_application('希望参加普通审核。')::text,
  true
);
select pg_temp.assert_true(
  public.submit_community_application(
    current_setting('test.manual_teen_application_id')::bigint,
    '希望参加普通审核。'
  ) = 'submitted',
  'age 14-17 submission enters ordinary review without Guardian confirmation'
);

-- Under-14 approval is impossible before the separate Guardian record.
reset role;
set local role authenticated;
select pg_temp.authenticate_as(
  '51000000-0000-0000-0000-000000000002',
  'manual-reviewer@test.rgan'
);
select pg_temp.expect_error(
  format(
    $$select public.review_community_application(%s, 'approve', '不应提前通过')$$,
    current_setting('test.manual_child_application_id')
  ),
  'staff cannot approve an under-14 application before Guardian confirmation'
);

-- The draft legal document cannot be used to create a contact request.
reset role;
set local role service_role;
select pg_temp.authenticate_service();
select pg_temp.expect_error(
  format(
    $$select public.create_guardian_consent_request_server(
      '51000000-0000-0000-0000-000000000001', %s,
      '监护人甲', '母亲', 'phone', 'encrypted:+8613800001234',
      repeat('1', 64), '1234',
      (select id from public.legal_documents
       where document_key = 'guardian-community-consent' and version = 1),
      private.sha256_hex(repeat('m', 64)),
      statement_timestamp() + interval '6 days'
    )$$,
    current_setting('test.manual_child_application_id')
  ),
  'inactive legal text cannot back a Guardian contact request'
);

reset role;
update public.legal_documents
set status = 'active',
    effective_at = statement_timestamp() - interval '1 minute',
    published_at = statement_timestamp() - interval '1 minute'
where document_key = 'guardian-community-consent'
  and version = 1
  and locale = 'zh-CN';
select set_config(
  'test.manual_legal_document_id',
  (
    select id::text from public.legal_documents
    where document_key = 'guardian-community-consent'
      and version = 1
      and locale = 'zh-CN'
  ),
  true
);

set local role service_role;
select pg_temp.authenticate_service();
select set_config(
  'test.manual_request_id',
  public.create_guardian_consent_request_server(
    '51000000-0000-0000-0000-000000000001',
    current_setting('test.manual_child_application_id')::bigint,
    '监护人甲',
    '母亲',
    'phone',
    'encrypted:+8613800001234',
    repeat('1', 64),
    '1234',
    current_setting('test.manual_legal_document_id')::bigint,
    private.sha256_hex(repeat('m', 64)),
    statement_timestamp() + interval '6 days'
  )::text,
  true
);

-- Both the private table and server projection remain unavailable to browsers.
reset role;
set local role authenticated;
select pg_temp.authenticate_as(
  '51000000-0000-0000-0000-000000000001',
  'manual-child@test.rgan'
);
select pg_temp.expect_error(
  'select contact_ciphertext from private.guardian_consent_requests',
  'the applicant cannot read private Guardian contact data'
);
select pg_temp.expect_error(
  format(
    $$select * from public.get_manual_guardian_review_server(
      %s,
      '51000000-0000-0000-0000-000000000002'
    )$$,
    current_setting('test.manual_child_application_id')
  ),
  'browser roles cannot call the manual Guardian server projection'
);

-- Service-role calls still validate the supplied staff actor's capability.
reset role;
set local role service_role;
select pg_temp.authenticate_service();
select pg_temp.expect_error(
  format(
    $$select * from public.get_manual_guardian_review_server(
      %s,
      '51000000-0000-0000-0000-000000000003'
    )$$,
    current_setting('test.manual_child_application_id')
  ),
  'an unprivileged actor cannot be used to read Guardian contact data'
);
select pg_temp.assert_true(
  (
    select request_status = 'pending'
      and contact_ciphertext = 'encrypted:+8613800001234'
      and document_status = 'active'
    from public.get_manual_guardian_review_server(
      current_setting('test.manual_child_application_id')::bigint,
      '51000000-0000-0000-0000-000000000002'
    )
  ),
  'the server projection returns the minimal encrypted record to authorized staff'
);

-- Confirmation fails closed if the referenced notice is no longer active.
reset role;
update public.legal_documents
set status = 'draft'
where id = current_setting('test.manual_legal_document_id')::bigint;
set local role service_role;
select pg_temp.authenticate_service();
select pg_temp.expect_error(
  format(
    $$select public.record_manual_guardian_confirmation_server(
      %s,
      '51000000-0000-0000-0000-000000000002',
      'manual_phone', statement_timestamp(),
      true, true, true,
      '电话联系监护人并逐项说明知情文件。',
      '未保存证件全文。'
    )$$,
    current_setting('test.manual_child_application_id')
  ),
  'manual confirmation requires an active legal document'
);

reset role;
update public.legal_documents
set status = 'active'
where id = current_setting('test.manual_legal_document_id')::bigint;
set local role service_role;
select pg_temp.authenticate_service();
select set_config(
  'test.manual_consent_id',
  public.record_manual_guardian_confirmation_server(
    current_setting('test.manual_child_application_id')::bigint,
    '51000000-0000-0000-0000-000000000002',
    'manual_phone',
    statement_timestamp(),
    true, true, true,
    '电话联系监护人并逐项说明知情文件。',
    '仅记录必要核验摘要。'
  )::text,
  true
);
select pg_temp.assert_true(
  public.record_manual_guardian_confirmation_server(
    current_setting('test.manual_child_application_id')::bigint,
    '51000000-0000-0000-0000-000000000002',
    'manual_phone',
    statement_timestamp(),
    true, true, true,
    '电话联系监护人并逐项说明知情文件。',
    '重复请求应返回同一记录。'
  ) = current_setting('test.manual_consent_id')::bigint,
  'manual confirmation is idempotent for the same request'
);

reset role;
select pg_temp.assert_true(
  (
    select status = 'submitted' and submitted_at is not null
    from public.community_applications
    where id = current_setting('test.manual_child_application_id')::bigint
  )
  and (
    select guardian_consent_status = 'verified'
      and identity_verification_status = 'verified'
    from private.account_safety_profiles
    where user_id = '51000000-0000-0000-0000-000000000001'
  )
  and (
    select verification_method = 'manual_phone'
      and otp_challenge_id is null
      and recorded_by = '51000000-0000-0000-0000-000000000002'
      and withdrawn_at is null
    from private.guardian_consents
    where id = current_setting('test.manual_consent_id')::bigint
  )
  and exists (
    select 1 from private.guardian_consent_events
    where request_id = current_setting('test.manual_request_id')::uuid
      and event_type = 'guardian.consent_verified_manual'
      and actor_user_id = '51000000-0000-0000-0000-000000000002'
  )
  and not exists (
    select 1 from public.community_memberships
    where user_id = '51000000-0000-0000-0000-000000000001'
  ),
  'manual confirmation writes provenance and safety state without approving Membership'
);

reset role;
set local role authenticated;
select pg_temp.authenticate_as(
  '51000000-0000-0000-0000-000000000002',
  'manual-reviewer@test.rgan'
);
select public.review_community_application(
  current_setting('test.manual_child_application_id')::bigint,
  'approve',
  '欢迎进入阿柑少年社群。'
);
reset role;
select pg_temp.assert_true(
  (
    select status = 'active'
    from public.community_memberships
    where user_id = '51000000-0000-0000-0000-000000000001'
  ),
  'staff approval remains a separate step after Guardian confirmation'
);

-- Manual decline is idempotent and leaves a second under-14 application blocked.
set local role authenticated;
select pg_temp.authenticate_as(
  '51000000-0000-0000-0000-000000000004',
  'manual-decline-child@test.rgan'
);
select public.complete_community_onboarding(
  account_username => 'manual_decline_child',
  person_display_name => '小溪',
  person_name_zh => '小溪',
  person_nature_name => '小溪',
  requested_profile_visibility => 'private'
);
select set_config(
  'test.manual_decline_application_id',
  public.create_community_application('希望加入共练。')::text,
  true
);
select public.submit_community_application(
  current_setting('test.manual_decline_application_id')::bigint,
  '希望加入共练。'
);

reset role;
set local role service_role;
select pg_temp.authenticate_service();
select set_config(
  'test.manual_decline_request_id',
  public.create_guardian_consent_request_server(
    '51000000-0000-0000-0000-000000000004',
    current_setting('test.manual_decline_application_id')::bigint,
    '监护人乙', '父亲', 'email', 'encrypted:guardian@example.test',
    repeat('2', 64), 'test',
    current_setting('test.manual_legal_document_id')::bigint,
    private.sha256_hex(repeat('d', 64)),
    statement_timestamp() + interval '6 days'
  )::text,
  true
);
select public.decline_manual_guardian_confirmation_server(
  current_setting('test.manual_decline_application_id')::bigint,
  '51000000-0000-0000-0000-000000000002',
  '监护人暂未同意加入。'
);
select public.decline_manual_guardian_confirmation_server(
  current_setting('test.manual_decline_application_id')::bigint,
  '51000000-0000-0000-0000-000000000002',
  '重复提交应安全返回。'
);

reset role;
select pg_temp.assert_true(
  (
    select status = 'pending_guardian'
    from public.community_applications
    where id = current_setting('test.manual_decline_application_id')::bigint
  )
  and (
    select status = 'declined'
    from private.guardian_consent_requests
    where id = current_setting('test.manual_decline_request_id')::uuid
  )
  and not exists (
    select 1 from private.guardian_consents
    where request_id = current_setting('test.manual_decline_request_id')::uuid
  )
  and exists (
    select 1 from private.guardian_consent_events
    where request_id = current_setting('test.manual_decline_request_id')::uuid
      and event_type = 'guardian.consent_declined_manual'
      and actor_user_id = '51000000-0000-0000-0000-000000000002'
  ),
  'manual decline is audited without manufacturing consent or unblocking Membership'
);

rollback;
