-- Anonymous first-party website analytics for public routes.

insert into public.permissions (permission_key, description, is_sensitive)
values
  ('analytics.read', 'Read aggregate anonymous website analytics', false),
  ('analytics.manage', 'Manage website analytics reporting settings', true)
on conflict (permission_key) do update
set description = excluded.description,
    is_sensitive = excluded.is_sensitive,
    updated_at = statement_timestamp();

insert into public.role_permissions (role_id, permission_id, granted_by)
select r.id, p.id, null
from public.roles r
join public.permissions p on p.permission_key in ('analytics.read', 'analytics.manage')
where r.slug in ('admin', 'super_admin')
on conflict do nothing;

create table private.website_analytics_settings (
  singleton boolean primary key default true,
  reporting_start_date date not null,
  collection_started_at timestamptz not null default statement_timestamp(),
  last_cleanup_on date,
  updated_at timestamptz not null default statement_timestamp(),
  updated_by uuid references auth.users(id) on delete set null,
  constraint website_analytics_settings_singleton_check check (singleton),
  constraint website_analytics_settings_reporting_date_check check (
    reporting_start_date between date '2020-01-01' and date '2100-12-31'
  )
);

insert into private.website_analytics_settings (
  singleton,
  reporting_start_date
)
values (
  true,
  (statement_timestamp() at time zone 'Asia/Shanghai')::date
);

create index website_analytics_settings_updated_by_idx
  on private.website_analytics_settings (updated_by)
  where updated_by is not null;

create table private.website_analytics_sessions (
  session_id uuid primary key,
  started_at timestamptz not null default statement_timestamp(),
  last_seen_at timestamptz not null default statement_timestamp(),
  landing_path text not null,
  last_path text not null,
  source_category text not null,
  referrer_host text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  device_category text not null,
  language text not null,
  page_view_count integer not null default 1,
  engaged_seconds integer not null default 0,
  constraint website_analytics_sessions_path_check check (
    length(landing_path) between 1 and 300
    and length(last_path) between 1 and 300
    and landing_path like '/%'
    and last_path like '/%'
    and landing_path !~ '^/community(?:/|$)'
    and last_path !~ '^/community(?:/|$)'
    and position('?' in landing_path) = 0
    and position('#' in landing_path) = 0
    and position('?' in last_path) = 0
    and position('#' in last_path) = 0
  ),
  constraint website_analytics_sessions_source_check check (
    source_category in ('direct', 'search', 'social', 'referral', 'campaign')
  ),
  constraint website_analytics_sessions_referrer_check check (
    referrer_host is null
    or (
      length(referrer_host) between 1 and 253
      and referrer_host !~ '[/:?#[:space:]]'
    )
  ),
  constraint website_analytics_sessions_utm_check check (
    (utm_source is null or length(utm_source) between 1 and 80)
    and (utm_medium is null or length(utm_medium) between 1 and 80)
    and (utm_campaign is null or length(utm_campaign) between 1 and 120)
  ),
  constraint website_analytics_sessions_device_check check (
    device_category in ('desktop', 'tablet', 'mobile', 'unknown')
  ),
  constraint website_analytics_sessions_language_check check (
    language in ('zh', 'en', 'other')
  ),
  constraint website_analytics_sessions_counts_check check (
    page_view_count between 1 and 10000
    and engaged_seconds between 0 and 604800
  ),
  constraint website_analytics_sessions_time_check check (last_seen_at >= started_at)
);

create index website_analytics_sessions_last_seen_idx
  on private.website_analytics_sessions (last_seen_at desc);
create index website_analytics_sessions_started_idx
  on private.website_analytics_sessions (started_at desc);
create index website_analytics_sessions_source_idx
  on private.website_analytics_sessions (source_category, started_at desc);

create table private.website_analytics_page_views (
  view_id uuid primary key,
  session_id uuid not null references private.website_analytics_sessions(session_id) on delete cascade,
  occurred_at timestamptz not null default statement_timestamp(),
  last_engaged_at timestamptz,
  path text not null,
  source_category text not null,
  referrer_host text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  device_category text not null,
  language text not null,
  engaged_seconds integer not null default 0,
  constraint website_analytics_page_views_path_check check (
    length(path) between 1 and 300
    and path like '/%'
    and path !~ '^/community(?:/|$)'
    and position('?' in path) = 0
    and position('#' in path) = 0
  ),
  constraint website_analytics_page_views_source_check check (
    source_category in ('direct', 'search', 'social', 'referral', 'campaign')
  ),
  constraint website_analytics_page_views_referrer_check check (
    referrer_host is null
    or (
      length(referrer_host) between 1 and 253
      and referrer_host !~ '[/:?#[:space:]]'
    )
  ),
  constraint website_analytics_page_views_utm_check check (
    (utm_source is null or length(utm_source) between 1 and 80)
    and (utm_medium is null or length(utm_medium) between 1 and 80)
    and (utm_campaign is null or length(utm_campaign) between 1 and 120)
  ),
  constraint website_analytics_page_views_device_check check (
    device_category in ('desktop', 'tablet', 'mobile', 'unknown')
  ),
  constraint website_analytics_page_views_language_check check (
    language in ('zh', 'en', 'other')
  ),
  constraint website_analytics_page_views_engagement_check check (
    engaged_seconds between 0 and 21600
  )
);

create index website_analytics_page_views_occurred_idx
  on private.website_analytics_page_views (occurred_at desc);
create index website_analytics_page_views_path_idx
  on private.website_analytics_page_views (path, occurred_at desc);
create index website_analytics_page_views_source_idx
  on private.website_analytics_page_views (source_category, occurred_at desc);
create index website_analytics_page_views_session_idx
  on private.website_analytics_page_views (session_id, occurred_at desc);

alter table private.website_analytics_settings enable row level security;
alter table private.website_analytics_sessions enable row level security;
alter table private.website_analytics_page_views enable row level security;

revoke all on private.website_analytics_settings from public, anon, authenticated;
revoke all on private.website_analytics_sessions from public, anon, authenticated;
revoke all on private.website_analytics_page_views from public, anon, authenticated;

create policy website_analytics_settings_deny_data_api
on private.website_analytics_settings
as restrictive for all to anon, authenticated
using (false) with check (false);

create policy website_analytics_sessions_deny_data_api
on private.website_analytics_sessions
as restrictive for all to anon, authenticated
using (false) with check (false);

create policy website_analytics_page_views_deny_data_api
on private.website_analytics_page_views
as restrictive for all to anon, authenticated
using (false) with check (false);

create or replace function private.record_website_analytics_event_server(
  target_event_type text,
  target_session_id uuid,
  target_view_id uuid,
  target_path text,
  target_source_category text,
  target_referrer_host text default null,
  target_utm_source text default null,
  target_utm_medium text default null,
  target_utm_campaign text default null,
  target_device_category text default 'unknown',
  target_language text default 'other',
  target_engaged_seconds integer default 0
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  event_now timestamptz := statement_timestamp();
  inserted_count integer := 0;
  current_engaged_seconds integer;
  applied_engaged_seconds integer;
  cleanup_claimed boolean := false;
begin
  perform private.require_service_role();

  if target_event_type not in ('page_view', 'engagement')
     or target_session_id is null
     or target_view_id is null
     or target_path is null
     or length(target_path) not between 1 and 300
     or target_path not like '/%'
     or target_path ~ '^/community(?:/|$)'
     or position('?' in target_path) > 0
     or position('#' in target_path) > 0
     or target_source_category not in ('direct', 'search', 'social', 'referral', 'campaign')
     or target_device_category not in ('desktop', 'tablet', 'mobile', 'unknown')
     or target_language not in ('zh', 'en', 'other')
     or (
       target_referrer_host is not null
       and (
         length(target_referrer_host) not between 1 and 253
         or target_referrer_host ~ '[/:?#[:space:]]'
       )
     )
     or (target_utm_source is not null and length(target_utm_source) not between 1 and 80)
     or (target_utm_medium is not null and length(target_utm_medium) not between 1 and 80)
     or (target_utm_campaign is not null and length(target_utm_campaign) not between 1 and 120) then
    raise exception using errcode = '22023', message = 'INVALID_WEBSITE_ANALYTICS_EVENT';
  end if;

  if target_event_type = 'page_view' then
    if target_engaged_seconds <> 0 then
      raise exception using errcode = '22023', message = 'INVALID_WEBSITE_ANALYTICS_ENGAGEMENT';
    end if;

    insert into private.website_analytics_sessions (
      session_id,
      started_at,
      last_seen_at,
      landing_path,
      last_path,
      source_category,
      referrer_host,
      utm_source,
      utm_medium,
      utm_campaign,
      device_category,
      language,
      page_view_count,
      engaged_seconds
    ) values (
      target_session_id,
      event_now,
      event_now,
      target_path,
      target_path,
      target_source_category,
      target_referrer_host,
      target_utm_source,
      target_utm_medium,
      target_utm_campaign,
      target_device_category,
      target_language,
      1,
      0
    )
    on conflict (session_id) do nothing;

    insert into private.website_analytics_page_views (
      view_id,
      session_id,
      occurred_at,
      path,
      source_category,
      referrer_host,
      utm_source,
      utm_medium,
      utm_campaign,
      device_category,
      language
    ) values (
      target_view_id,
      target_session_id,
      event_now,
      target_path,
      target_source_category,
      target_referrer_host,
      target_utm_source,
      target_utm_medium,
      target_utm_campaign,
      target_device_category,
      target_language
    )
    on conflict (view_id) do nothing;

    get diagnostics inserted_count = row_count;
    if inserted_count = 1 then
      update private.website_analytics_sessions
      set last_seen_at = greatest(last_seen_at, event_now),
          last_path = target_path,
          page_view_count = case
            when started_at = event_now then page_view_count
            else least(10000, page_view_count + 1)
          end
      where session_id = target_session_id;
    end if;

    update private.website_analytics_settings
    set last_cleanup_on = (event_now at time zone 'UTC')::date
    where singleton
      and (
        last_cleanup_on is null
        or last_cleanup_on < (event_now at time zone 'UTC')::date
      )
    returning true into cleanup_claimed;

    if cleanup_claimed then
      delete from private.website_analytics_sessions
      where last_seen_at < event_now - interval '90 days';
    end if;

    return inserted_count = 1;
  end if;

  if target_engaged_seconds not between 1 and 30 then
    raise exception using errcode = '22023', message = 'INVALID_WEBSITE_ANALYTICS_ENGAGEMENT';
  end if;

  select pv.engaged_seconds
  into current_engaged_seconds
  from private.website_analytics_page_views pv
  where pv.view_id = target_view_id
    and pv.session_id = target_session_id
    and pv.path = target_path
    and pv.occurred_at >= event_now - interval '24 hours'
  for update;

  if not found then
    return false;
  end if;

  applied_engaged_seconds := least(target_engaged_seconds, 21600 - current_engaged_seconds);
  if applied_engaged_seconds <= 0 then
    return false;
  end if;

  update private.website_analytics_page_views
  set engaged_seconds = engaged_seconds + applied_engaged_seconds,
      last_engaged_at = event_now
  where view_id = target_view_id;

  update private.website_analytics_sessions
  set last_seen_at = greatest(last_seen_at, event_now),
      last_path = target_path,
      engaged_seconds = least(604800, engaged_seconds + applied_engaged_seconds)
  where session_id = target_session_id;

  return true;
end;
$$;

create or replace function private.get_website_analytics_dashboard(
  target_range text default '7d'
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  generated_at timestamptz := statement_timestamp();
  requested_start timestamptz;
  reporting_start timestamptz;
  effective_start timestamptz;
  today_start timestamptz;
  bucket_kind text;
  bucket_step interval;
  settings_row private.website_analytics_settings%rowtype;
begin
  if caller is null or not private.user_has_permission(caller, 'analytics.read') then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;
  if target_range not in ('24h', '7d', '30d', '90d') then
    raise exception using errcode = '22023', message = 'INVALID_ANALYTICS_RANGE';
  end if;

  select * into settings_row
  from private.website_analytics_settings
  where singleton;

  requested_start := case target_range
    when '24h' then generated_at - interval '24 hours'
    when '7d' then generated_at - interval '7 days'
    when '30d' then generated_at - interval '30 days'
    else generated_at - interval '90 days'
  end;
  reporting_start := settings_row.reporting_start_date::timestamp
    at time zone 'Asia/Shanghai';
  effective_start := greatest(requested_start, reporting_start);
  today_start := (generated_at at time zone 'Asia/Shanghai')::date::timestamp
    at time zone 'Asia/Shanghai';
  bucket_kind := case when target_range = '24h' then 'hour' else 'day' end;
  bucket_step := case when target_range = '24h' then interval '1 hour' else interval '1 day' end;

  return jsonb_build_object(
    'generatedAt', generated_at,
    'range', target_range,
    'settings', jsonb_build_object(
      'reportingStartDate', settings_row.reporting_start_date,
      'collectionStartedAt', settings_row.collection_started_at,
      'earliestAvailableAt', (
        select min(pv.occurred_at) from private.website_analytics_page_views pv
      ),
      'updatedAt', settings_row.updated_at,
      'canManage', private.user_has_permission(caller, 'analytics.manage')
    ),
    'summary', jsonb_build_object(
      'activeNow', (
        select count(*) from private.website_analytics_sessions s
        where s.last_seen_at >= generated_at - interval '5 minutes'
      ),
      'viewsToday', (
        select count(*) from private.website_analytics_page_views pv
        where pv.occurred_at >= greatest(today_start, reporting_start)
          and pv.occurred_at <= generated_at
      ),
      'sessionsToday', (
        select count(distinct pv.session_id) from private.website_analytics_page_views pv
        where pv.occurred_at >= greatest(today_start, reporting_start)
          and pv.occurred_at <= generated_at
      ),
      'averageEngagedSecondsToday', coalesce((
        select round(avg(session_seconds))::integer
        from (
          select pv.session_id, sum(pv.engaged_seconds)::numeric as session_seconds
          from private.website_analytics_page_views pv
          where pv.occurred_at >= greatest(today_start, reporting_start)
            and pv.occurred_at <= generated_at
          group by pv.session_id
        ) engaged_sessions
      ), 0)
    ),
    'trend', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'bucket', buckets.bucket,
          'views', coalesce(counts.views, 0),
          'sessions', coalesce(counts.sessions, 0)
        ) order by buckets.bucket
      )
      from generate_series(
        case
          when bucket_kind = 'hour' then date_trunc('hour', effective_start at time zone 'Asia/Shanghai') at time zone 'Asia/Shanghai'
          else date_trunc('day', effective_start at time zone 'Asia/Shanghai') at time zone 'Asia/Shanghai'
        end,
        generated_at,
        bucket_step
      ) as buckets(bucket)
      left join (
        select
          case
            when bucket_kind = 'hour' then date_trunc('hour', pv.occurred_at at time zone 'Asia/Shanghai') at time zone 'Asia/Shanghai'
            else date_trunc('day', pv.occurred_at at time zone 'Asia/Shanghai') at time zone 'Asia/Shanghai'
          end as bucket,
          count(*) as views,
          count(distinct pv.session_id) as sessions
        from private.website_analytics_page_views pv
        where pv.occurred_at >= effective_start
          and pv.occurred_at <= generated_at
        group by 1
      ) counts on counts.bucket = buckets.bucket
    ), '[]'::jsonb),
    'popularPages', coalesce((
      select jsonb_agg(to_jsonb(popular) order by popular.views desc, popular.path)
      from (
        select
          pv.path,
          count(*)::integer as views,
          count(distinct pv.session_id)::integer as sessions,
          round(avg(pv.engaged_seconds))::integer as "averageEngagedSeconds",
          round((count(*) * 100.0) / nullif(sum(count(*)) over (), 0), 1) as share
        from private.website_analytics_page_views pv
        where pv.occurred_at >= effective_start
          and pv.occurred_at <= generated_at
        group by pv.path
        order by views desc, pv.path
        limit 10
      ) popular
    ), '[]'::jsonb),
    'sources', coalesce((
      select jsonb_agg(to_jsonb(source_rows) order by source_rows.views desc, source_rows.label)
      from (
        select
          pv.source_category as category,
          coalesce(pv.referrer_host, pv.utm_source, 'direct') as label,
          count(*)::integer as views,
          count(distinct pv.session_id)::integer as sessions
        from private.website_analytics_page_views pv
        where pv.occurred_at >= effective_start
          and pv.occurred_at <= generated_at
        group by pv.source_category, coalesce(pv.referrer_host, pv.utm_source, 'direct')
        order by views desc, label
        limit 12
      ) source_rows
    ), '[]'::jsonb),
    'recentActivity', coalesce((
      select jsonb_agg(to_jsonb(recent) order by recent."occurredAt" desc)
      from (
        select
          pv.occurred_at as "occurredAt",
          pv.path,
          pv.source_category as "sourceCategory",
          pv.referrer_host as "referrerHost",
          pv.device_category as "deviceCategory",
          pv.engaged_seconds as "engagedSeconds"
        from private.website_analytics_page_views pv
        order by pv.occurred_at desc
        limit 12
      ) recent
    ), '[]'::jsonb)
  );
end;
$$;

create or replace function private.set_website_analytics_reporting_start_date(
  target_date date
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  previous_date date;
  settings_row private.website_analytics_settings%rowtype;
begin
  if caller is null or not private.user_has_permission(caller, 'analytics.manage') then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;
  if target_date is null or target_date not between date '2020-01-01' and date '2100-12-31' then
    raise exception using errcode = '22023', message = 'INVALID_ANALYTICS_REPORTING_DATE';
  end if;

  select reporting_start_date into previous_date
  from private.website_analytics_settings
  where singleton
  for update;

  update private.website_analytics_settings
  set reporting_start_date = target_date,
      updated_at = statement_timestamp(),
      updated_by = caller
  where singleton
  returning * into settings_row;

  perform private.write_audit(
    'analytics.reporting_start_date.set',
    'website_analytics_settings',
    'singleton',
    jsonb_build_object('reporting_start_date', previous_date),
    jsonb_build_object('reporting_start_date', target_date),
    '{}'::jsonb
  );

  return jsonb_build_object(
    'reportingStartDate', settings_row.reporting_start_date,
    'collectionStartedAt', settings_row.collection_started_at,
    'earliestAvailableAt', (
      select min(pv.occurred_at) from private.website_analytics_page_views pv
    ),
    'updatedAt', settings_row.updated_at,
    'canManage', true
  );
end;
$$;

revoke all on function private.record_website_analytics_event_server(
  text, uuid, uuid, text, text, text, text, text, text, text, text, integer
) from public, anon, authenticated;
revoke all on function private.get_website_analytics_dashboard(text)
  from public, anon, authenticated;
revoke all on function private.set_website_analytics_reporting_start_date(date)
  from public, anon, authenticated;

grant execute on function private.record_website_analytics_event_server(
  text, uuid, uuid, text, text, text, text, text, text, text, text, integer
) to service_role;
grant execute on function private.get_website_analytics_dashboard(text)
  to authenticated;
grant execute on function private.set_website_analytics_reporting_start_date(date)
  to authenticated;

create function public.record_website_analytics_event_server(
  target_event_type text,
  target_session_id uuid,
  target_view_id uuid,
  target_path text,
  target_source_category text,
  target_referrer_host text default null,
  target_utm_source text default null,
  target_utm_medium text default null,
  target_utm_campaign text default null,
  target_device_category text default 'unknown',
  target_language text default 'other',
  target_engaged_seconds integer default 0
)
returns boolean
language sql
security invoker
set search_path = ''
as $$
  select private.record_website_analytics_event_server(
    target_event_type,
    target_session_id,
    target_view_id,
    target_path,
    target_source_category,
    target_referrer_host,
    target_utm_source,
    target_utm_medium,
    target_utm_campaign,
    target_device_category,
    target_language,
    target_engaged_seconds
  );
$$;

create function public.get_website_analytics_dashboard(
  target_range text default '7d'
)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select private.get_website_analytics_dashboard(target_range);
$$;

create function public.set_website_analytics_reporting_start_date(
  target_date date
)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select private.set_website_analytics_reporting_start_date(target_date);
$$;

revoke all on function public.record_website_analytics_event_server(
  text, uuid, uuid, text, text, text, text, text, text, text, text, integer
) from public, anon, authenticated;
revoke all on function public.get_website_analytics_dashboard(text)
  from public, anon;
revoke all on function public.set_website_analytics_reporting_start_date(date)
  from public, anon;

grant execute on function public.record_website_analytics_event_server(
  text, uuid, uuid, text, text, text, text, text, text, text, text, integer
) to service_role;
grant execute on function public.get_website_analytics_dashboard(text)
  to authenticated;
grant execute on function public.set_website_analytics_reporting_start_date(date)
  to authenticated;

comment on table private.website_analytics_sessions is
  'Anonymous short-lived public-site sessions; contains no account ID or raw IP address.';
comment on table private.website_analytics_page_views is
  'Anonymous public-route page views and capped visible engagement time; retained for 90 days.';
comment on function public.get_website_analytics_dashboard(text) is
  'Permission-checked aggregate-only website analytics dashboard payload.';
