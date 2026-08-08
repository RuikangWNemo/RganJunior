begin;

create or replace function pg_temp.assert_true(test_condition boolean, test_label text)
returns void language plpgsql as $$
begin if not coalesce(test_condition, false) then raise exception 'TEST_FAILED: %', test_label; end if; end;
$$;
create or replace function pg_temp.expect_error(test_sql text, test_label text)
returns void language plpgsql as $$
begin begin execute test_sql; exception when others then return; end; raise exception 'TEST_FAILED: expected error: %', test_label; end;
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
  ('80000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'message-a@test.rgan', '', now(), '{"provider":"email"}', '{"age_band":"adult_18_plus"}', now(), now()),
  ('80000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'message-b@test.rgan', '', now(), '{"provider":"email"}', '{"age_band":"age_14_17"}', now(), now()),
  ('80000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'message-c@test.rgan', '', now(), '{"provider":"email"}', '{"age_band":"adult_18_plus"}', now(), now()),
  ('80000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'message-outsider@test.rgan', '', now(), '{"provider":"email"}', '{"age_band":"adult_18_plus"}', now(), now()),
  ('80000000-0000-0000-0000-000000000005', 'authenticated', 'authenticated', 'message-admin@test.rgan', '', now(), '{"provider":"email"}', '{"age_band":"adult_18_plus"}', now(), now());

insert into public.community_memberships (user_id, status, approved_by, approved_at, member_since)
values
  ('80000000-0000-0000-0000-000000000001', 'active', '80000000-0000-0000-0000-000000000005', now(), current_date),
  ('80000000-0000-0000-0000-000000000002', 'active', '80000000-0000-0000-0000-000000000005', now(), current_date),
  ('80000000-0000-0000-0000-000000000003', 'active', '80000000-0000-0000-0000-000000000005', now(), current_date);

insert into public.user_roles (user_id, role_id, assigned_by)
select members.user_id, r.id, null
from (
  values
    ('80000000-0000-0000-0000-000000000001'::uuid),
    ('80000000-0000-0000-0000-000000000002'::uuid),
    ('80000000-0000-0000-0000-000000000003'::uuid)
) members(user_id)
cross join public.roles r where r.slug = 'community_member';
insert into public.user_roles (user_id, role_id, assigned_by)
select '80000000-0000-0000-0000-000000000005', r.id, null
from public.roles r where r.slug = 'admin';

set local role authenticated;
select pg_temp.authenticate_as('80000000-0000-0000-0000-000000000004', 'message-outsider@test.rgan');
select pg_temp.expect_error(
  $$select public.create_direct_conversation('80000000-0000-0000-0000-000000000002')$$,
  'an external registered adult cannot initiate contact with a community minor'
);

reset role;
set local role authenticated;
select pg_temp.authenticate_as('80000000-0000-0000-0000-000000000001', 'message-a@test.rgan');
select set_config(
  'test.message_conversation_id',
  public.create_direct_conversation('80000000-0000-0000-0000-000000000002')::text,
  true
);
select set_config(
  'test.message_first_id',
  public.send_direct_message(
    current_setting('test.message_conversation_id')::uuid,
    '你好，欢迎来到社群。'
  )::text,
  true
);
select pg_temp.assert_true(
  (
    select count(*) from public.direct_messages
    where conversation_id = current_setting('test.message_conversation_id')::uuid
  ) = 1,
  'the sender can read their conversation message through RLS'
);

reset role;
set local role authenticated;
select pg_temp.authenticate_as('80000000-0000-0000-0000-000000000003', 'message-c@test.rgan');
select pg_temp.assert_true(
  (
    select count(*) from public.direct_messages
    where conversation_id = current_setting('test.message_conversation_id')::uuid
  ) = 0,
  'another active member cannot inspect a conversation they do not participate in'
);

reset role;
set local role authenticated;
select pg_temp.authenticate_as('80000000-0000-0000-0000-000000000002', 'message-b@test.rgan');
select pg_temp.assert_true(
  (
    select count(*) = 1 and bool_and(unread_count = 1)
    from public.list_direct_conversations()
    where conversation_id = current_setting('test.message_conversation_id')::uuid
  ),
  'the recipient sees one unread conversation'
);
select pg_temp.assert_true(
  (
    select count(*) = 1 and bool_and(body = '你好，欢迎来到社群。')
    from public.list_direct_messages(current_setting('test.message_conversation_id')::uuid)
  ),
  'the recipient can read the conversation safely'
);
select public.mark_conversation_read(current_setting('test.message_conversation_id')::uuid);
select pg_temp.assert_true(
  (
    select bool_and(unread_count = 0)
    from public.list_direct_conversations()
    where conversation_id = current_setting('test.message_conversation_id')::uuid
  ),
  'marking a conversation read clears the unread count'
);

update public.user_settings
set allow_messages = false
where user_id = '80000000-0000-0000-0000-000000000002';

reset role;
set local role authenticated;
select pg_temp.authenticate_as('80000000-0000-0000-0000-000000000001', 'message-a@test.rgan');
select pg_temp.expect_error(
  format(
    $$select public.send_direct_message('%s', '不应送达')$$,
    current_setting('test.message_conversation_id')
  ),
  'turning off private messages blocks new incoming messages'
);

reset role;
update public.user_settings
set allow_messages = true
where user_id = '80000000-0000-0000-0000-000000000002';

set local role authenticated;
select pg_temp.authenticate_as('80000000-0000-0000-0000-000000000001', 'message-a@test.rgan');
select public.block_community_member('80000000-0000-0000-0000-000000000002');
select pg_temp.expect_error(
  format(
    $$select public.send_direct_message('%s', '拉黑后不应送达')$$,
    current_setting('test.message_conversation_id')
  ),
  'blocking immediately locks the direct conversation'
);
select public.unblock_community_member('80000000-0000-0000-0000-000000000002');
select pg_temp.assert_true(
  public.send_direct_message(
    current_setting('test.message_conversation_id')::uuid,
    '解除拉黑后可以继续。'
  ) > current_setting('test.message_first_id')::bigint,
  'unblocking restores the conversation when neither side blocks the other'
);

reset role;
set local role authenticated;
select pg_temp.authenticate_as('80000000-0000-0000-0000-000000000002', 'message-b@test.rgan');
select set_config(
  'test.message_report_id',
  public.report_direct_message(
    current_setting('test.message_first_id')::bigint,
    'unsafe_contact',
    '希望管理员查看这条消息。'
  )::text,
  true
);
select pg_temp.assert_true(
  (
    select count(*) from public.community_reports
    where id = current_setting('test.message_report_id')::bigint
  ) = 1,
  'a recipient can read their own submitted report'
);

reset role;
set local role authenticated;
select pg_temp.authenticate_as('80000000-0000-0000-0000-000000000001', 'message-a@test.rgan');
select pg_temp.assert_true(
  (
    select count(*) from public.community_reports
    where id = current_setting('test.message_report_id')::bigint
  ) = 0,
  'the reported member cannot inspect the reporter details'
);

reset role;
set local role authenticated;
select pg_temp.authenticate_as('80000000-0000-0000-0000-000000000005', 'message-admin@test.rgan');
select pg_temp.assert_true(
  (
    select count(*) = 1 and bool_and(category = 'unsafe_contact')
    from public.list_community_reports()
    where id = current_setting('test.message_report_id')::bigint
  ),
  'a moderator can inspect the report queue'
);
select public.resolve_community_report(
  current_setting('test.message_report_id')::bigint,
  'resolved',
  '已联系相关成员并完成处理。'
);
select public.suspend_community_membership(
  '80000000-0000-0000-0000-000000000002',
  '消息安全测试暂停'
);

reset role;
set local role authenticated;
select pg_temp.authenticate_as('80000000-0000-0000-0000-000000000001', 'message-a@test.rgan');
select pg_temp.expect_error(
  format(
    $$select public.send_direct_message('%s', '暂停后不应送达')$$,
    current_setting('test.message_conversation_id')
  ),
  'suspending the recipient Membership immediately blocks sending'
);

reset role;
select pg_temp.assert_true(
  exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'direct_messages'
  ),
  'direct messages are included in the hosted Realtime publication'
);
select pg_temp.assert_true(
  (
    select count(*) from private.audit_logs
    where entity_type in ('member_block', 'community_report')
      and actor_user_id::text like '80000000-%'
  ) >= 3,
  'blocks and report resolution are audited'
);

rollback;
