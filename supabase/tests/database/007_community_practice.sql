begin;

create or replace function pg_temp.assert_true(test_condition boolean, test_label text)
returns void language plpgsql as $$
begin
  if not coalesce(test_condition, false) then raise exception 'TEST_FAILED: %', test_label; end if;
end;
$$;

create or replace function pg_temp.expect_error(test_sql text, test_label text)
returns void language plpgsql as $$
begin
  begin execute test_sql; exception when others then return; end;
  raise exception 'TEST_FAILED: expected error: %', test_label;
end;
$$;

create or replace function pg_temp.authenticate_as(test_user_id uuid, test_email text)
returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', test_user_id::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claims', jsonb_build_object('sub', test_user_id, 'role', 'authenticated', 'email', test_email)::text, true);
end;
$$;

insert into auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  ('70000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'practice-one@test.rgan', '', now(), '{"provider":"email"}', '{"age_band":"adult_18_plus"}', now(), now()),
  ('70000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'practice-two@test.rgan', '', now(), '{"provider":"email"}', '{"age_band":"adult_18_plus"}', now(), now()),
  ('70000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'practice-host@test.rgan', '', now(), '{"provider":"email"}', '{"age_band":"adult_18_plus"}', now(), now()),
  ('70000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'practice-outsider@test.rgan', '', now(), '{"provider":"email"}', '{"age_band":"adult_18_plus"}', now(), now()),
  ('70000000-0000-0000-0000-000000000005', 'authenticated', 'authenticated', 'practice-three@test.rgan', '', now(), '{"provider":"email"}', '{"age_band":"adult_18_plus"}', now(), now());

insert into public.community_memberships (user_id, status, approved_by, approved_at, member_since)
values
  ('70000000-0000-0000-0000-000000000001', 'active', '70000000-0000-0000-0000-000000000003', now(), current_date),
  ('70000000-0000-0000-0000-000000000002', 'active', '70000000-0000-0000-0000-000000000003', now(), current_date),
  ('70000000-0000-0000-0000-000000000003', 'active', '70000000-0000-0000-0000-000000000003', now(), current_date),
  ('70000000-0000-0000-0000-000000000005', 'active', '70000000-0000-0000-0000-000000000003', now(), current_date);

insert into public.user_roles (user_id, role_id, assigned_by)
select members.user_id, r.id, null
from (
  values
    ('70000000-0000-0000-0000-000000000001'::uuid),
    ('70000000-0000-0000-0000-000000000002'::uuid),
    ('70000000-0000-0000-0000-000000000003'::uuid),
    ('70000000-0000-0000-0000-000000000005'::uuid)
) members(user_id)
cross join public.roles r
where r.slug = 'community_member';

insert into public.user_roles (user_id, role_id, assigned_by)
select '70000000-0000-0000-0000-000000000003', r.id, null
from public.roles r where r.slug = 'facilitator';

set local role authenticated;
select pg_temp.authenticate_as('70000000-0000-0000-0000-000000000004', 'practice-outsider@test.rgan');
select pg_temp.expect_error(
  'select * from public.list_practice_sessions()',
  'a registered non-member cannot list member practice sessions'
);

reset role;
set local role authenticated;
select pg_temp.authenticate_as('70000000-0000-0000-0000-000000000001', 'practice-one@test.rgan');
select pg_temp.expect_error(
  $$select public.create_practice_session(
    '越权场次', null, now() + interval '2 days', now() + interval '2 days 1 hour'
  )$$,
  'a member without facilitator permission cannot create sessions'
);

reset role;
set local role authenticated;
select pg_temp.authenticate_as('70000000-0000-0000-0000-000000000003', 'practice-host@test.rgan');
select set_config(
  'test.practice_session_id',
  public.create_practice_session(
    '晚间安静共练',
    '一起进行二十分钟安静练习与分享。',
    statement_timestamp() + interval '2 days',
    statement_timestamp() + interval '2 days 1 hour',
    'Asia/Shanghai',
    2,
    'https://meet.example.test/rgan-practice',
    '请提前五分钟进入。'
  )::text,
  true
);
select public.publish_practice_session(current_setting('test.practice_session_id')::bigint);

select pg_temp.assert_true(
  (
    select count(*) = 1 and bool_and(participant_count = 0)
    from public.list_practice_sessions()
    where id = current_setting('test.practice_session_id')::bigint
  ),
  'a facilitator creates and publishes a safe session projection'
);
select pg_temp.assert_true(
  (
    select available_now and meeting_url = 'https://meet.example.test/rgan-practice'
    from public.get_practice_session_access(current_setting('test.practice_session_id')::bigint)
  ),
  'the host can always see private session access details'
);

reset role;
set local role authenticated;
select pg_temp.authenticate_as('70000000-0000-0000-0000-000000000001', 'practice-one@test.rgan');
select pg_temp.assert_true(
  public.join_practice_session(current_setting('test.practice_session_id')::bigint) = 'joined',
  'the first member joins an available place'
);
select pg_temp.assert_true(
  (
    select not available_now and meeting_url is null and access_notes is null
    from public.get_practice_session_access(current_setting('test.practice_session_id')::bigint)
  ),
  'a joined participant cannot see meeting access days too early'
);

reset role;
set local role authenticated;
select pg_temp.authenticate_as('70000000-0000-0000-0000-000000000002', 'practice-two@test.rgan');
select pg_temp.assert_true(
  public.join_practice_session(current_setting('test.practice_session_id')::bigint) = 'joined',
  'the second member fills capacity'
);

reset role;
set local role authenticated;
select pg_temp.authenticate_as('70000000-0000-0000-0000-000000000005', 'practice-three@test.rgan');
select pg_temp.assert_true(
  public.join_practice_session(current_setting('test.practice_session_id')::bigint) = 'waitlisted',
  'the next member enters the ordered waitlist'
);

reset role;
set local role authenticated;
select pg_temp.authenticate_as('70000000-0000-0000-0000-000000000001', 'practice-one@test.rgan');
select public.cancel_practice_participation(current_setting('test.practice_session_id')::bigint);

reset role;
select pg_temp.assert_true(
  (
    select status = 'cancelled' and cancelled_at is not null
    from public.practice_participants
    where session_id = current_setting('test.practice_session_id')::bigint
      and user_id = '70000000-0000-0000-0000-000000000001'
  )
  and (
    select status = 'joined'
    from public.practice_participants
    where session_id = current_setting('test.practice_session_id')::bigint
      and user_id = '70000000-0000-0000-0000-000000000005'
  )
  and exists (
    select 1 from public.notifications
    where user_id = '70000000-0000-0000-0000-000000000005'
      and notification_type = 'practice.waitlist_promoted'
  ),
  'cancelling a joined place promotes and notifies the first waitlisted member'
);

update public.practice_sessions
set starts_at = statement_timestamp() + interval '30 minutes',
    ends_at = statement_timestamp() + interval '90 minutes'
where id = current_setting('test.practice_session_id')::bigint;

set local role authenticated;
select pg_temp.authenticate_as('70000000-0000-0000-0000-000000000005', 'practice-three@test.rgan');
select pg_temp.assert_true(
  (
    select available_now and meeting_url = 'https://meet.example.test/rgan-practice'
    from public.get_practice_session_access(current_setting('test.practice_session_id')::bigint)
  ),
  'a promoted participant receives access within the release window'
);
select pg_temp.assert_true(
  (
    select count(*) from public.practice_participants
    where session_id = current_setting('test.practice_session_id')::bigint
  ) = 1,
  'a participant can select only their own participation row'
);

reset role;
set local role authenticated;
select pg_temp.authenticate_as('70000000-0000-0000-0000-000000000003', 'practice-host@test.rgan');
select public.check_in_practice_participant(
  current_setting('test.practice_session_id')::bigint,
  '70000000-0000-0000-0000-000000000002'
);
select pg_temp.assert_true(
  (
    select status = 'attended' and checked_in_at is not null
    from public.practice_participants
    where session_id = current_setting('test.practice_session_id')::bigint
      and user_id = '70000000-0000-0000-0000-000000000002'
  ),
  'the facilitator can check in a joined participant'
);

reset role;
select pg_temp.assert_true(
  (
    select count(*) from private.audit_logs
    where entity_type in ('practice_session', 'practice_participant')
      and actor_user_id::text like '70000000-%'
  ) >= 7,
  'practice session and participation transitions are audited'
);

rollback;
