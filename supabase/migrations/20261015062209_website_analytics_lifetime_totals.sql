-- Preserve anonymous session/PV totals independently of the 90-day detail retention.
-- Backfill and trigger installation share one transaction/lock to avoid a counting gap.
set local lock_timeout = '3s';
set local statement_timeout = '20s';
lock table private.website_analytics_sessions, private.website_analytics_page_views
  in share row exclusive mode;

create table if not exists private.website_analytics_totals (
  singleton boolean primary key default true check (singleton),
  recorded_since timestamptz not null,
  initialized_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null,
  total_sessions bigint not null check (total_sessions >= 0),
  total_page_views bigint not null check (total_page_views >= 0)
);

alter table private.website_analytics_totals enable row level security;
revoke all on private.website_analytics_totals from public, anon, authenticated, service_role;

do $$
declare collection_start timestamptz;
begin
  if not exists (select 1 from private.website_analytics_totals where singleton) then
    select collection_started_at into collection_start
    from private.website_analytics_settings where singleton;
    if collection_start is null or collection_start < statement_timestamp() - interval '90 days' then
      raise exception using errcode = '22023', message = 'ANALYTICS_HISTORY_REVIEW_REQUIRED';
    end if;
    insert into private.website_analytics_totals (
      singleton, recorded_since, updated_at, total_sessions, total_page_views
    )
    select true,
      coalesce(least((select min(started_at) from private.website_analytics_sessions),
                     (select min(occurred_at) from private.website_analytics_page_views)), collection_start),
      coalesce((select max(occurred_at) from private.website_analytics_page_views), collection_start),
      (select count(*) from private.website_analytics_sessions),
      (select count(*) from private.website_analytics_page_views);
  end if;
end;
$$;

create or replace function private.increment_website_analytics_totals()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- INSERT triggers run only for accepted rows, never for ON CONFLICT DO NOTHING.
  update private.website_analytics_totals
  set total_sessions = total_sessions + case when tg_table_name = 'website_analytics_sessions' then 1 else 0 end,
      total_page_views = total_page_views + case when tg_table_name = 'website_analytics_page_views' then 1 else 0 end,
      updated_at = greatest(updated_at, statement_timestamp())
  where singleton;
  if not found then raise exception 'ANALYTICS_TOTALS_NOT_INITIALIZED'; end if;
  return new;
end;
$$;
revoke all on function private.increment_website_analytics_totals() from public, anon, authenticated, service_role;

drop trigger if exists website_analytics_sessions_lifetime_total on private.website_analytics_sessions;
create trigger website_analytics_sessions_lifetime_total
  after insert on private.website_analytics_sessions
  for each row execute function private.increment_website_analytics_totals();
drop trigger if exists website_analytics_views_lifetime_total on private.website_analytics_page_views;
create trigger website_analytics_views_lifetime_total
  after insert on private.website_analytics_page_views
  for each row execute function private.increment_website_analytics_totals();

-- This intentionally public RPC exposes only four aggregate fields. Raw tables and admin reports stay private.
create or replace function private.get_public_website_visit_totals()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare result jsonb;
begin
  select jsonb_build_object(
    'recordedSince', recorded_since,
    'updatedAt', updated_at,
    'totalSessions', total_sessions,
    'totalPageViews', total_page_views
  ) into result from private.website_analytics_totals where singleton;
  if result is null then raise exception 'ANALYTICS_TOTALS_NOT_INITIALIZED'; end if;
  return result;
end;
$$;
revoke all on function private.get_public_website_visit_totals() from public, anon, authenticated;
grant execute on function private.get_public_website_visit_totals() to anon, authenticated, service_role;

create or replace function public.get_public_website_visit_totals()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$ select private.get_public_website_visit_totals(); $$;
revoke all on function public.get_public_website_visit_totals() from public, anon, authenticated;
grant execute on function public.get_public_website_visit_totals() to anon, authenticated, service_role;

comment on table private.website_analytics_totals is
  'Aggregate lifetime totals initialized from verified retained history. No visitor identifiers. Detail deletion and report-date changes do not reduce or reset these counters.';
