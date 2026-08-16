-- Aggregate-only Core Web Vitals for anonymous public website analytics.

create table private.website_analytics_web_vitals (
  view_id uuid not null references private.website_analytics_page_views(view_id) on delete cascade,
  metric_name text not null,
  metric_value numeric(12, 4) not null,
  rating text not null,
  navigation_type text not null,
  effective_connection_type text not null,
  occurred_at timestamptz not null default statement_timestamp(),
  primary key (view_id, metric_name),
  constraint website_analytics_web_vitals_name_check check (
    metric_name in ('LCP', 'CLS', 'INP', 'FCP', 'TTFB')
  ),
  constraint website_analytics_web_vitals_value_check check (
    metric_value between 0 and 120000
  ),
  constraint website_analytics_web_vitals_rating_check check (
    rating in ('good', 'needs-improvement', 'poor')
  ),
  constraint website_analytics_web_vitals_navigation_check check (
    navigation_type in ('navigate', 'reload', 'back_forward', 'prerender', 'other')
  ),
  constraint website_analytics_web_vitals_connection_check check (
    effective_connection_type in ('slow-2g', '2g', '3g', '4g', 'unknown')
  )
);

create index website_analytics_web_vitals_metric_occurred_idx
  on private.website_analytics_web_vitals (metric_name, occurred_at desc);

alter table private.website_analytics_web_vitals enable row level security;
revoke all on private.website_analytics_web_vitals from public, anon, authenticated;

create policy website_analytics_web_vitals_deny_data_api
on private.website_analytics_web_vitals
as restrictive for all to anon, authenticated
using (false) with check (false);

create or replace function private.record_website_analytics_web_vital_server(
  target_session_id uuid,
  target_view_id uuid,
  target_path text,
  target_metric_name text,
  target_metric_value numeric,
  target_rating text,
  target_navigation_type text,
  target_effective_connection_type text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  event_now timestamptz := statement_timestamp();
  affected_count integer := 0;
begin
  perform private.require_service_role();

  if target_session_id is null
     or target_view_id is null
     or target_path is null
     or length(target_path) not between 1 and 300
     or target_path not like '/%'
     or target_path ~ '^/community(?:/|$)'
     or position('?' in target_path) > 0
     or position('#' in target_path) > 0
     or target_metric_name not in ('LCP', 'CLS', 'INP', 'FCP', 'TTFB')
     or target_metric_value not between 0 and 120000
     or target_rating not in ('good', 'needs-improvement', 'poor')
     or target_navigation_type not in ('navigate', 'reload', 'back_forward', 'prerender', 'other')
     or target_effective_connection_type not in ('slow-2g', '2g', '3g', '4g', 'unknown') then
    raise exception using errcode = '22023', message = 'INVALID_WEBSITE_ANALYTICS_WEB_VITAL';
  end if;

  insert into private.website_analytics_web_vitals (
    view_id,
    metric_name,
    metric_value,
    rating,
    navigation_type,
    effective_connection_type,
    occurred_at
  )
  select
    pv.view_id,
    target_metric_name,
    target_metric_value,
    target_rating,
    target_navigation_type,
    target_effective_connection_type,
    event_now
  from private.website_analytics_page_views pv
  where pv.view_id = target_view_id
    and pv.session_id = target_session_id
    and pv.path = target_path
    and pv.occurred_at >= event_now - interval '24 hours'
  on conflict (view_id, metric_name) do update
  set metric_value = excluded.metric_value,
      rating = excluded.rating,
      navigation_type = excluded.navigation_type,
      effective_connection_type = excluded.effective_connection_type,
      occurred_at = excluded.occurred_at;

  get diagnostics affected_count = row_count;
  return affected_count = 1;
end;
$$;

create or replace function private.get_website_analytics_web_vitals(
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
begin
  if caller is null or not private.user_has_permission(caller, 'analytics.read') then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;
  if target_range not in ('24h', '7d', '30d', '90d') then
    raise exception using errcode = '22023', message = 'INVALID_ANALYTICS_RANGE';
  end if;

  requested_start := case target_range
    when '24h' then generated_at - interval '24 hours'
    when '7d' then generated_at - interval '7 days'
    when '30d' then generated_at - interval '30 days'
    else generated_at - interval '90 days'
  end;
  select reporting_start_date::timestamp at time zone 'Asia/Shanghai'
  into reporting_start
  from private.website_analytics_settings
  where singleton;
  effective_start := greatest(requested_start, reporting_start);

  return coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'name', metric_name,
        'p75', p75,
        'goodRatio', good_ratio,
        'samples', samples
      )
      order by array_position(array['LCP', 'CLS', 'INP', 'FCP', 'TTFB'], metric_name)
    )
    from (
      select
        vital.metric_name,
        round((percentile_disc(0.75) within group (order by vital.metric_value))::numeric, 4) as p75,
        round(
          count(*) filter (where vital.rating = 'good') * 100.0 / nullif(count(*), 0),
          1
        ) as good_ratio,
        count(*)::integer as samples
      from private.website_analytics_web_vitals vital
      where vital.occurred_at >= effective_start
        and vital.occurred_at <= generated_at
      group by vital.metric_name
    ) summary
  ), '[]'::jsonb);
end;
$$;

revoke all on function private.record_website_analytics_web_vital_server(
  uuid, uuid, text, text, numeric, text, text, text
) from public, anon, authenticated;
revoke all on function private.get_website_analytics_web_vitals(text)
  from public, anon, authenticated;

grant execute on function private.record_website_analytics_web_vital_server(
  uuid, uuid, text, text, numeric, text, text, text
) to service_role;
grant execute on function private.get_website_analytics_web_vitals(text)
  to authenticated;

create function public.record_website_analytics_web_vital_server(
  target_session_id uuid,
  target_view_id uuid,
  target_path text,
  target_metric_name text,
  target_metric_value numeric,
  target_rating text,
  target_navigation_type text,
  target_effective_connection_type text
)
returns boolean
language sql
security invoker
set search_path = ''
as $$
  select private.record_website_analytics_web_vital_server(
    target_session_id,
    target_view_id,
    target_path,
    target_metric_name,
    target_metric_value,
    target_rating,
    target_navigation_type,
    target_effective_connection_type
  );
$$;

create function public.get_website_analytics_web_vitals(
  target_range text default '7d'
)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select private.get_website_analytics_web_vitals(target_range);
$$;

revoke all on function public.record_website_analytics_web_vital_server(
  uuid, uuid, text, text, numeric, text, text, text
) from public, anon, authenticated;
revoke all on function public.get_website_analytics_web_vitals(text)
  from public, anon;

grant execute on function public.record_website_analytics_web_vital_server(
  uuid, uuid, text, text, numeric, text, text, text
) to service_role;
grant execute on function public.get_website_analytics_web_vitals(text)
  to authenticated;

comment on table private.website_analytics_web_vitals is
  'Anonymous per-view Core Web Vitals; cascade-retained with page views and exposed only as permission-checked aggregates.';
comment on function public.get_website_analytics_web_vitals(text) is
  'Permission-checked aggregate Core Web Vitals p75, good ratio, and sample counts.';
