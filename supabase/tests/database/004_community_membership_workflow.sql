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

insert into auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  (
    '40000000-0000-0000-0000-000000000001',
    'authenticated', 'authenticated', 'application-adult@test.rgan', '', now(),
    '{"provider":"email"}',
    '{"display_name":"Application Adult","age_band":"adult_18_plus"}',
    now(), now()
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    'authenticated', 'authenticated', 'application-second@test.rgan', '', now(),
    '{"provider":"email"}',
    '{"display_name":"Second Applicant","age_band":"adult_18_plus"}',
    now(), now()
  ),
  (
    '40000000-0000-0000-0000-000000000003',
    'authenticated', 'authenticated', 'application-reviewer@test.rgan', '', now(),
    '{"provider":"email"}',
    '{"display_name":"Application Reviewer","age_band":"adult_18_plus"}',
    now(), now()
  ),
  (
    '40000000-0000-0000-0000-000000000004',
    'authenticated', 'authenticated', 'application-teen@test.rgan', '', now(),
    '{"provider":"email"}',
    '{"display_name":"Application Teen","age_band":"age_14_17"}',
    now(), now()
  );

insert into public.user_roles (user_id, role_id, assigned_by)
select
  '40000000-0000-0000-0000-000000000003',
  r.id,
  null
from public.roles r
where r.slug = 'admin';

-- Adult applicant completes onboarding and submits a first attempt.
set local role authenticated;
select pg_temp.authenticate_as(
  '40000000-0000-0000-0000-000000000001',
  'application-adult@test.rgan'
);

select public.complete_community_onboarding(
  account_username => 'application_adult',
  person_display_name => '申请人甲',
  person_name_zh => '林青',
  person_name_en => 'Lin Qing',
  person_nature_name => '青苔',
  person_bio => '喜欢观察苔藓。',
  person_city => '成都',
  person_region => '四川',
  person_country => '中国',
  requested_profile_visibility => 'public',
  requested_show_real_name => false,
  requested_allow_messages => true
);

select set_config(
  'test.membership_adult_application_id',
  public.create_community_application(
    application_motivation => '希望和伙伴一起长期练习。'
  )::text,
  true
);

select pg_temp.expect_error(
  $$select public.create_community_application('不能同时创建第二份申请')$$,
  'an applicant can have only one active attempt'
);

select pg_temp.assert_true(
  public.submit_community_application(
    current_setting('test.membership_adult_application_id')::bigint,
    '希望和伙伴一起长期练习。',
    '学习如何照顾自己与他人。',
    '愿意分享自然观察。'
  ) = 'submitted',
  'an adult application enters the review queue directly'
);

select pg_temp.assert_true(
  (
    select application_status = 'submitted'
      and destination = '/community/application'
    from public.get_my_community_state()
  ),
  'a submitted applicant is routed to application status'
);

select pg_temp.expect_error(
  $$select * from public.list_membership_applications()$$,
  'a registered applicant cannot inspect the review queue'
);

-- A second registered user is not allowed to inspect or review the first application.
reset role;
set local role authenticated;
select pg_temp.authenticate_as(
  '40000000-0000-0000-0000-000000000002',
  'application-second@test.rgan'
);

select public.complete_community_onboarding(
  account_username => 'application_second',
  person_display_name => '申请人乙',
  person_name_zh => '申请人乙',
  person_nature_name => '山风',
  requested_profile_visibility => 'public'
);

select pg_temp.assert_true(
  (
    select count(*)
    from public.community_applications
    where id = current_setting('test.membership_adult_application_id')::bigint
  ) = 0,
  'another registered user cannot read an application through the table API'
);

select pg_temp.expect_error(
  format(
    $$select public.review_community_application(%s, 'approve', '越权通过')$$,
    current_setting('test.membership_adult_application_id')
  ),
  'a registered user cannot review an application'
);

-- An administrator can inspect sensitive review fields and request changes.
reset role;
set local role authenticated;
select pg_temp.authenticate_as(
  '40000000-0000-0000-0000-000000000003',
  'application-reviewer@test.rgan'
);

select pg_temp.assert_true(
  (
    select count(*) = 1
      and bool_and(age_band = 'adult_18_plus')
      and bool_and(guardian_consent_status = 'not_required')
      and bool_and(motivation = '希望和伙伴一起长期练习。')
      and bool_and(hopes = '学习如何照顾自己与他人。')
      and bool_and(contribution = '愿意分享自然观察。')
    from public.list_membership_applications(
      array['submitted']::text[],
      20,
      null,
      null
    )
    where id = current_setting('test.membership_adult_application_id')::bigint
  ),
  'an administrator sees the submitted application, its reason, and permitted safety fields'
);

select public.request_application_changes(
  current_setting('test.membership_adult_application_id')::bigint,
  '请补充你希望如何参与共练。',
  '第一次补件测试'
);

reset role;
set local role authenticated;
select pg_temp.authenticate_as(
  '40000000-0000-0000-0000-000000000001',
  'application-adult@test.rgan'
);

select pg_temp.assert_true(
  (
    select status = 'more_info_requested'
    from public.get_my_community_application()
  ),
  'the applicant can see a request for more information'
);

select pg_temp.assert_true(
  public.submit_community_application(
    current_setting('test.membership_adult_application_id')::bigint,
    '希望和伙伴一起长期练习。',
    '学习如何照顾自己与他人。',
    '愿意每月分享一次自然观察。',
    '已补充参与方式。'
  ) = 'submitted',
  'a supplemented application can be resubmitted'
);

-- Approval creates the business Membership, grants member capabilities, and
-- activates the requested public directory profile.
reset role;
set local role authenticated;
select pg_temp.authenticate_as(
  '40000000-0000-0000-0000-000000000003',
  'application-reviewer@test.rgan'
);

select public.review_community_application_with_identities(
  current_setting('test.membership_adult_application_id')::bigint,
  'approve',
  '欢迎进入阿柑少年社群。',
  '成年人流程测试通过',
  'participant',
  array[]::text[]
);

-- Retrying the same terminal decision is idempotent. This covers browser
-- double-clicks and network retries after the first transaction committed.
select public.review_community_application_with_identities(
  current_setting('test.membership_adult_application_id')::bigint,
  'approve',
  '欢迎进入阿柑少年社群。',
  '重复审批不应产生第二次副作用',
  'participant',
  array[]::text[]
);

select pg_temp.expect_error(
  format(
    $sql$select public.review_community_application(%s, 'reject', '改变审批决定', '终态不可反转')$sql$,
    current_setting('test.membership_adult_application_id')
  ),
  'an approved application cannot be changed to rejected'
);

reset role;
select pg_temp.assert_true(
  (
    select count(*)
    from private.community_application_events
    where application_id = current_setting('test.membership_adult_application_id')::bigint
      and event_type = 'application.approved'
  ) = 1,
  'an idempotent approval retry creates no duplicate application event'
);

select pg_temp.assert_true(
  (
    select status = 'active'
      and application_id = current_setting('test.membership_adult_application_id')::bigint
    from public.community_memberships
    where user_id = '40000000-0000-0000-0000-000000000001'
  ),
  'approval creates an active Membership tied to the application'
);

select pg_temp.assert_true(
  exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = '40000000-0000-0000-0000-000000000001'
      and r.slug = 'community_member'
  )
  and private.user_has_permission(
    '40000000-0000-0000-0000-000000000001',
    'messages.use'
  ),
  'approval grants the community-member capability bundle'
);

select pg_temp.assert_true(
  (
    select is_public
      and profile_visibility = 'public'
      and joined_at is not null
    from public.people
    where user_id = '40000000-0000-0000-0000-000000000001'
  ),
  'approval activates the member requested public profile'
);

set local role authenticated;
select pg_temp.authenticate_as(
  '40000000-0000-0000-0000-000000000001',
  'application-adult@test.rgan'
);
insert into public.field_notes (slug, title, content)
values (
  'membership-only-note-test',
  '成员限定文章',
  '只向当前正式成员开放。'
);
select set_config(
  'test.membership_field_note_tag_id',
  (public.find_or_create_field_note_tag('成员协作测试标签', 'Membership workflow test tag')).id::text,
  true
);
select public.save_field_note_metadata(
  (select id from public.field_notes where slug = 'membership-only-note-test'),
  (select id from public.article_categories where slug = 'people-stories'),
  array[current_setting('test.membership_field_note_tag_id')::bigint],
  'members'
);
update public.field_notes
set status = 'submitted'
where slug = 'membership-only-note-test';

reset role;
set local role authenticated;
select pg_temp.authenticate_as(
  '40000000-0000-0000-0000-000000000003',
  'application-reviewer@test.rgan'
);
update public.field_notes
set status = 'in_review'
where slug = 'membership-only-note-test';
update public.field_notes
set status = 'approved'
where slug = 'membership-only-note-test';
update public.field_notes
set status = 'published', published_at = now()
where slug = 'membership-only-note-test';

insert into public.field_notes (slug, title, content, visibility, category_id)
values (
  'membership-access-note-test',
  '另一位成员的限定文章',
  '用来验证成员状态，而不是作者所有权。',
  'members',
  (select id from public.article_categories where slug = 'people-stories')
);
update public.field_notes
set status = 'submitted'
where slug = 'membership-access-note-test';
update public.field_notes
set status = 'in_review'
where slug = 'membership-access-note-test';
update public.field_notes
set status = 'approved'
where slug = 'membership-access-note-test';
update public.field_notes
set status = 'published', published_at = now()
where slug = 'membership-access-note-test';

reset role;
set local role anon;
select pg_temp.authenticate_anon();
select pg_temp.expect_error(
  $$select * from public.list_community_people(20, null, null)$$,
  'anonymous visitors cannot read the member-only People directory'
);
select pg_temp.assert_true(
  (
    select count(*)
    from public.field_notes
    where slug = 'membership-only-note-test'
  ) = 0,
  'anonymous visitors cannot read member-only Field Notes'
);

reset role;
set local role authenticated;
select pg_temp.authenticate_as(
  '40000000-0000-0000-0000-000000000002',
  'application-second@test.rgan'
);
select pg_temp.assert_true(
  (
    select count(*)
    from public.field_notes
    where slug = 'membership-only-note-test'
  ) = 0,
  'a registered non-member cannot read member-only Field Notes'
);

reset role;
set local role authenticated;
select pg_temp.authenticate_as(
  '40000000-0000-0000-0000-000000000001',
  'application-adult@test.rgan'
);

select pg_temp.assert_true(
  (
    select destination = '/community'
      and membership_status = 'active'
    from public.get_my_community_state()
  ),
  'an approved member is routed into the community'
);
select pg_temp.assert_true(
  (
    select count(*)
    from public.field_notes
    where slug = 'membership-access-note-test'
  ) = 1,
  'an active member can read another author member-only Field Note'
);
select pg_temp.assert_true(
  (
    select count(*)
    from public.notifications
    where notification_type in (
      'membership.changes_requested',
      'membership.approved'
    )
  ) = 2,
  'the applicant receives workflow notifications'
);

select set_config(
  'test.membership_approved_notification_id',
  (
    select id::text
    from public.notifications
    where notification_type = 'membership.approved'
    order by id desc
    limit 1
  ),
  true
);
select public.mark_notification_read(
  current_setting('test.membership_approved_notification_id')::bigint
);
select pg_temp.assert_true(
  (
    select read_at is not null
    from public.notifications
    where id = current_setting('test.membership_approved_notification_id')::bigint
  ),
  'a user can mark their own notification as read'
);
select pg_temp.expect_error(
  format(
    $$update public.notifications set title_zh = '篡改' where id = %s$$,
    current_setting('test.membership_approved_notification_id')
  ),
  'a user cannot mutate notification system fields'
);
select pg_temp.expect_error(
  'select count(*) from private.community_application_events',
  'application event history is not exposed through the Data API'
);

-- Suspension immediately closes member-only access and public directory exposure.
reset role;
set local role authenticated;
select pg_temp.authenticate_as(
  '40000000-0000-0000-0000-000000000003',
  'application-reviewer@test.rgan'
);
select public.suspend_community_membership(
  '40000000-0000-0000-0000-000000000001',
  '自动化测试暂停'
);

reset role;
set local role authenticated;
select pg_temp.authenticate_as(
  '40000000-0000-0000-0000-000000000001',
  'application-adult@test.rgan'
);
select pg_temp.assert_true(
  (
    select destination = '/community/application'
      and membership_status = 'suspended'
    from public.get_my_community_state()
  ),
  'a suspended member is routed away from the community'
);
select pg_temp.assert_true(
  (
    select count(*)
    from public.field_notes
    where slug = 'membership-access-note-test'
  ) = 0,
  'a suspended member immediately loses access to other member-only Field Notes'
);

reset role;
select pg_temp.assert_true(
  not exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = '40000000-0000-0000-0000-000000000001'
      and r.slug in ('community_member', 'facilitator')
  )
  and (
    select not is_public
    from public.people
    where user_id = '40000000-0000-0000-0000-000000000001'
  ),
  'suspension removes member roles and public directory exposure'
);

set local role authenticated;
select pg_temp.authenticate_as(
  '40000000-0000-0000-0000-000000000003',
  'application-reviewer@test.rgan'
);
select public.restore_community_membership(
  '40000000-0000-0000-0000-000000000001'
);

reset role;
select pg_temp.assert_true(
  (
    select status = 'active'
    from public.community_memberships
    where user_id = '40000000-0000-0000-0000-000000000001'
  )
  and exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = '40000000-0000-0000-0000-000000000001'
      and r.slug = 'community_member'
  )
  and (
    select is_public
    from public.people
    where user_id = '40000000-0000-0000-0000-000000000001'
  ),
  'restoration reactivates Membership, member role, and requested visibility'
);

-- Rejection keeps the account and permits a later application attempt.
set local role authenticated;
select pg_temp.authenticate_as(
  '40000000-0000-0000-0000-000000000002',
  'application-second@test.rgan'
);
select set_config(
  'test.membership_second_application_id',
  public.create_community_application('第一次申请')::text,
  true
);
select public.submit_community_application(
  current_setting('test.membership_second_application_id')::bigint,
  '第一次申请'
);

reset role;
set local role authenticated;
select pg_temp.authenticate_as(
  '40000000-0000-0000-0000-000000000003',
  'application-reviewer@test.rgan'
);
select public.review_community_application(
  current_setting('test.membership_second_application_id')::bigint,
  'reject',
  '本次申请暂未通过。'
);

reset role;
set local role authenticated;
select pg_temp.authenticate_as(
  '40000000-0000-0000-0000-000000000002',
  'application-second@test.rgan'
);
select pg_temp.assert_true(
  (
    select account_status = 'active'
      and application_status = 'rejected'
      and destination = '/community/apply'
    from public.get_my_community_state()
  ),
  'rejection keeps the registered account active and returns it to apply'
);
select set_config(
  'test.membership_second_attempt_id',
  public.create_community_application('第二次申请')::text,
  true
);
select pg_temp.assert_true(
  (
    select attempt_number = 2 and status = 'draft'
    from public.get_my_community_application()
  ),
  'a rejected applicant can create a second versioned attempt'
);

-- A 14-17 applicant enters ordinary review without Guardian confirmation.
reset role;
set local role authenticated;
select pg_temp.authenticate_as(
  '40000000-0000-0000-0000-000000000004',
  'application-teen@test.rgan'
);
select public.complete_community_onboarding(
  account_username => 'application_teen',
  person_display_name => '少年申请人',
  person_name_zh => '少年申请人',
  person_nature_name => '嫩芽',
  requested_profile_visibility => 'members'
);
select set_config(
  'test.membership_teen_application_id',
  public.create_community_application('希望参加青少年共练。')::text,
  true
);
select pg_temp.assert_true(
  public.submit_community_application(
    current_setting('test.membership_teen_application_id')::bigint,
    '希望参加青少年共练。'
  ) = 'submitted',
  'a 14-17 application enters the ordinary review queue'
);

reset role;
select pg_temp.assert_true(
  (
    select count(*)
    from private.community_application_events
    where application_id = current_setting('test.membership_adult_application_id')::bigint
      and event_type in (
        'application.created',
        'application.submitted',
        'application.changes_requested',
        'application.approved'
      )
  ) = 5,
  'the application state machine preserves an append-only transition history'
);
select pg_temp.assert_true(
  (
    select count(*)
    from private.audit_logs
    where actor_user_id in (
      '40000000-0000-0000-0000-000000000001',
      '40000000-0000-0000-0000-000000000002',
      '40000000-0000-0000-0000-000000000003'
    )
      and entity_type in ('community_application', 'community_membership')
  ) >= 8,
  'application and Membership changes are represented in the audit log'
);

rollback;
