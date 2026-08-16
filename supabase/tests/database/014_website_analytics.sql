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

create or replace function pg_temp.authenticate_anon()
returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claim.role', 'anon', true);
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
end;
$$;

create or replace function pg_temp.authenticate_service()
returns void language plpgsql as $$
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
  ('e1000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'analytics-admin@test.rgan', '', now(), '{"provider":"email"}', '{"display_name":"Analytics Admin","age_band":"adult_18_plus"}', now(), now()),
  ('e1000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'analytics-reader@test.rgan', '', now(), '{"provider":"email"}', '{"display_name":"Analytics Reader","age_band":"adult_18_plus"}', now(), now()),
  ('e1000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'analytics-member@test.rgan', '', now(), '{"provider":"email"}', '{"display_name":"Analytics Member","age_band":"adult_18_plus"}', now(), now());

insert into public.roles (slug, name, description, is_system, is_active)
values ('analytics_reader_test', 'Analytics Reader Test', 'Read-only analytics regression role', false, true);

insert into public.role_permissions (role_id, permission_id, granted_by)
select r.id, p.id, null
from public.roles r
join public.permissions p on p.permission_key = 'analytics.read'
where r.slug = 'analytics_reader_test';

insert into public.user_roles (user_id, role_id, assigned_by)
select 'e1000000-0000-0000-0000-000000000001', r.id, null
from public.roles r where r.slug = 'admin';

insert into public.user_roles (user_id, role_id, assigned_by)
select 'e1000000-0000-0000-0000-000000000002', r.id, null
from public.roles r where r.slug = 'analytics_reader_test';

set local role anon;
select pg_temp.authenticate_anon();
select pg_temp.expect_error(
  'select * from private.website_analytics_sessions',
  'anonymous visitors cannot read raw analytics sessions'
);
select pg_temp.expect_error(
  'select * from private.website_analytics_web_vitals',
  'anonymous visitors cannot read raw Core Web Vitals'
);
select pg_temp.expect_error(
  'select public.get_website_analytics_dashboard(''7d'')',
  'anonymous visitors cannot call the analytics dashboard'
);

reset role;
set local role authenticated;
select pg_temp.authenticate_as(
  'e1000000-0000-0000-0000-000000000003',
  'analytics-member@test.rgan'
);
select pg_temp.expect_error(
  'select public.get_website_analytics_dashboard(''7d'')',
  'ordinary authenticated members cannot read analytics'
);

reset role;
set local role service_role;
select pg_temp.authenticate_service();

select pg_temp.assert_true(
  public.record_website_analytics_event_server(
    'page_view',
    'e2000000-0000-0000-0000-000000000001',
    'e3000000-0000-0000-0000-000000000001',
    '/about',
    'search',
    'www.baidu.com',
    null,
    null,
    null,
    'mobile',
    'zh',
    0
  ),
  'the service role records a valid anonymous page view'
);

select pg_temp.assert_true(
  not public.record_website_analytics_event_server(
    'page_view',
    'e2000000-0000-0000-0000-000000000001',
    'e3000000-0000-0000-0000-000000000001',
    '/about',
    'search',
    'www.baidu.com',
    null,
    null,
    null,
    'mobile',
    'zh',
    0
  ),
  'replayed page-view UUIDs are idempotent'
);

select pg_temp.assert_true(
  public.record_website_analytics_web_vital_server(
    'e2000000-0000-0000-0000-000000000001',
    'e3000000-0000-0000-0000-000000000001',
    '/about',
    'LCP',
    2300,
    'good',
    'navigate',
    '4g'
  ),
  'the service role records a bounded anonymous LCP sample'
);

select pg_temp.assert_true(
  public.record_website_analytics_web_vital_server(
    'e2000000-0000-0000-0000-000000000001',
    'e3000000-0000-0000-0000-000000000001',
    '/about',
    'CLS',
    0.08,
    'good',
    'navigate',
    '4g'
  ),
  'the service role records a bounded anonymous CLS sample'
);

select pg_temp.expect_error(
  $$select public.record_website_analytics_web_vital_server(
    'e2000000-0000-0000-0000-000000000001',
    'e3000000-0000-0000-0000-000000000001',
    '/about',
    'memory',
    500,
    'good',
    'navigate',
    '4g'
  )$$,
  'the service rejects fingerprint-shaped arbitrary performance metrics'
);

select pg_temp.assert_true(
  public.record_website_analytics_event_server(
    'engagement',
    'e2000000-0000-0000-0000-000000000001',
    'e3000000-0000-0000-0000-000000000001',
    '/about',
    'search',
    'www.baidu.com',
    null,
    null,
    null,
    'mobile',
    'zh',
    20
  ),
  'a valid heartbeat adds effective engagement time'
);

select pg_temp.assert_true(
  not public.record_website_analytics_event_server(
    'engagement',
    'e2000000-0000-0000-0000-000000000099',
    'e3000000-0000-0000-0000-000000000001',
    '/about',
    'search',
    'www.baidu.com',
    null,
    null,
    null,
    'mobile',
    'zh',
    20
  ),
  'a heartbeat cannot update another session view'
);

select pg_temp.expect_error(
  $$select public.record_website_analytics_event_server(
    'engagement',
    'e2000000-0000-0000-0000-000000000001',
    'e3000000-0000-0000-0000-000000000001',
    '/about',
    'search',
    'www.baidu.com',
    null,
    null,
    null,
    'mobile',
    'zh',
    31
  )$$,
  'a heartbeat cannot claim more than 30 seconds'
);

reset role;
select pg_temp.assert_true(
  (
    select page_view_count = 1 and engaged_seconds = 20
    from private.website_analytics_sessions
    where session_id = 'e2000000-0000-0000-0000-000000000001'
  )
  and (
    select engaged_seconds = 20
    from private.website_analytics_page_views
    where view_id = 'e3000000-0000-0000-0000-000000000001'
  )
  and (
    select count(*) = 2
    from private.website_analytics_web_vitals
    where view_id = 'e3000000-0000-0000-0000-000000000001'
  ),
  'idempotent views and capped engagement produce the expected totals'
);

set local role authenticated;
select pg_temp.authenticate_as(
  'e1000000-0000-0000-0000-000000000002',
  'analytics-reader@test.rgan'
);
select pg_temp.assert_true(
  (public.get_website_analytics_dashboard('7d')->'summary'->>'viewsToday')::integer = 1
  and (public.get_website_analytics_dashboard('7d')->'summary'->>'activeNow')::integer = 1,
  'the read-only role receives aggregate traffic and live counts'
);
select pg_temp.assert_true(
  jsonb_array_length(public.get_website_analytics_web_vitals('7d')) = 2
  and public.get_website_analytics_web_vitals('7d')->0->>'name' = 'LCP'
  and (public.get_website_analytics_web_vitals('7d')->0->>'p75')::numeric = 2300,
  'the read-only role receives aggregate-only Core Web Vitals'
);
select pg_temp.expect_error(
  $$select public.set_website_analytics_reporting_start_date(current_date + 1)$$,
  'the read-only analytics role cannot change settings'
);

reset role;
set local role authenticated;
select pg_temp.authenticate_as(
  'e1000000-0000-0000-0000-000000000001',
  'analytics-admin@test.rgan'
);
select public.set_website_analytics_reporting_start_date(current_date + 1);

select pg_temp.assert_true(
  (public.get_website_analytics_dashboard('7d')->'summary'->>'viewsToday')::integer = 0
  and (public.get_website_analytics_dashboard('7d')->'summary'->>'activeNow')::integer = 1,
  'the reporting start date clamps historical totals but not live activity'
);

reset role;
select pg_temp.assert_true(
  (select count(*) = 1 from private.website_analytics_page_views),
  'changing the reporting date never deletes already collected data'
);
select pg_temp.assert_true(
  exists (
    select 1
    from private.audit_logs
    where actor_user_id = 'e1000000-0000-0000-0000-000000000001'
      and action = 'analytics.reporting_start_date.set'
      and after_data->>'reporting_start_date' = (current_date + 1)::text
  ),
  'the reporting date change records the authenticated administrator'
);

insert into private.website_analytics_sessions (
  session_id,
  started_at,
  last_seen_at,
  landing_path,
  last_path,
  source_category,
  device_category,
  language
)
values (
  'e2000000-0000-0000-0000-000000000090',
  now() - interval '91 days',
  now() - interval '91 days',
  '/old-page',
  '/old-page',
  'direct',
  'desktop',
  'en'
);

insert into private.website_analytics_page_views (
  view_id,
  session_id,
  occurred_at,
  path,
  source_category,
  device_category,
  language
)
values (
  'e3000000-0000-0000-0000-000000000090',
  'e2000000-0000-0000-0000-000000000090',
  now() - interval '91 days',
  '/old-page',
  'direct',
  'desktop',
  'en'
);

update private.website_analytics_settings set last_cleanup_on = null where singleton;

set local role service_role;
select pg_temp.authenticate_service();
select public.record_website_analytics_event_server(
  'page_view',
  'e2000000-0000-0000-0000-000000000002',
  'e3000000-0000-0000-0000-000000000002',
  '/field-notes',
  'direct',
  null,
  null,
  null,
  null,
  'desktop',
  'en',
  0
);

reset role;
select pg_temp.assert_true(
  not exists (
    select 1 from private.website_analytics_sessions
    where session_id = 'e2000000-0000-0000-0000-000000000090'
  )
  and exists (
    select 1 from private.website_analytics_sessions
    where session_id = 'e2000000-0000-0000-0000-000000000001'
  ),
  'daily retention deletes only analytics older than 90 days'
);

rollback;
