begin;
create or replace function pg_temp.assert_true(condition boolean, label text)
returns void language plpgsql as $$ begin if not coalesce(condition,false) then raise exception 'TEST_FAILED: %',label; end if; end; $$;
create or replace function pg_temp.expect_error(query text, label text)
returns void language plpgsql as $$ begin begin execute query; exception when others then return; end; raise exception 'TEST_FAILED: expected rejection: %',label; end; $$;

select pg_temp.assert_true((select total_sessions = (select count(*) from private.website_analytics_sessions) and total_page_views = (select count(*) from private.website_analytics_page_views) from private.website_analytics_totals where singleton),'backfill matches existing history');
create temporary table expected_totals as select total_sessions,total_page_views from private.website_analytics_totals where singleton;
select set_config('request.jwt.claim.role','service_role',true);
set local role service_role;
select public.record_website_analytics_event_server('page_view','f1000000-0000-4000-8000-000000000010','f2000000-0000-4000-8000-000000000010','/impact','direct');
select public.record_website_analytics_event_server('page_view','f1000000-0000-4000-8000-000000000010','f2000000-0000-4000-8000-000000000010','/impact','direct');
select public.record_website_analytics_event_server('page_view','f1000000-0000-4000-8000-000000000010','f2000000-0000-4000-8000-000000000011','/programs','direct');
select public.record_website_analytics_event_server('engagement','f1000000-0000-4000-8000-000000000010','f2000000-0000-4000-8000-000000000011','/programs','direct',null,null,null,null,'unknown','other',15);
reset role;
select pg_temp.assert_true((select t.total_sessions=e.total_sessions+1 and t.total_page_views=e.total_page_views+2 from private.website_analytics_totals t cross join expected_totals e),'new sessions and page views count once, replay and heartbeat do not inflate totals');

update private.website_analytics_settings set reporting_start_date = current_date + 1;
select pg_temp.assert_true((select t.total_sessions=e.total_sessions+1 and t.total_page_views=e.total_page_views+2 from private.website_analytics_totals t cross join expected_totals e),'admin report-date changes do not reset lifetime figures');
update private.website_analytics_sessions set started_at=statement_timestamp()-interval '101 days', last_seen_at=statement_timestamp()-interval '100 days' where session_id='f1000000-0000-4000-8000-000000000010';
update private.website_analytics_settings set last_cleanup_on=null;
set local role service_role;
select public.record_website_analytics_event_server('page_view','f1000000-0000-4000-8000-000000000020','f2000000-0000-4000-8000-000000000020','/impact','direct');
select pg_temp.assert_true((select count(*)=4 from jsonb_object_keys(public.get_public_website_visit_totals())),'server RPC exposes only the four aggregate fields');
reset role;
select pg_temp.assert_true(not exists(select 1 from private.website_analytics_sessions where session_id='f1000000-0000-4000-8000-000000000010'),'real retention cleanup removed the aged test session');
select pg_temp.assert_true(not exists(select 1 from private.website_analytics_page_views where session_id='f1000000-0000-4000-8000-000000000010'),'retention cascade removed its detail views');
select pg_temp.assert_true((select t.total_sessions=e.total_sessions+2 and t.total_page_views=e.total_page_views+3 from private.website_analytics_totals t cross join expected_totals e),'retention cleanup does not reduce lifetime totals');

set local role anon;
select set_config('request.jwt.claim.role','anon',true);
select pg_temp.expect_error('select * from private.website_analytics_totals','anon cannot read the private counter');
select pg_temp.assert_true((select count(*)=4 from jsonb_object_keys(public.get_public_website_visit_totals())),'public readers receive only aggregate fields');
select pg_temp.expect_error('select public.get_website_analytics_dashboard(''7d'')','anonymous readers cannot access the admin dashboard');
reset role;
set local role authenticated;
select set_config('request.jwt.claim.role','authenticated',true);
select pg_temp.assert_true((select count(*)=4 from jsonb_object_keys(public.get_public_website_visit_totals())),'members receive the same public aggregates');
select pg_temp.expect_error('select * from private.website_analytics_page_views','public summary access does not expose raw views');
reset role;
select pg_temp.assert_true((select relrowsecurity from pg_class where oid='private.website_analytics_totals'::regclass),'RLS is enabled');
rollback;
