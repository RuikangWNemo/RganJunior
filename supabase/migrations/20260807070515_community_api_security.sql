-- Safe People projections and persistent hashed rate limits for server endpoints.

create table private.api_rate_limits (
  scope text not null,
  key_hash text not null,
  window_started_at timestamptz not null default now(),
  attempt_count integer not null default 0,
  blocked_until timestamptz,
  updated_at timestamptz not null default now(),
  primary key (scope, key_hash),
  constraint api_rate_limits_scope_check check (
    scope ~ '^[a-z][a-z0-9_.-]{1,63}$'
  ),
  constraint api_rate_limits_hash_check check (
    key_hash ~ '^[0-9a-f]{64}$'
  ),
  constraint api_rate_limits_attempt_check check (attempt_count >= 0)
);

create index api_rate_limits_updated_idx
  on private.api_rate_limits (updated_at);
create index api_rate_limits_blocked_idx
  on private.api_rate_limits (blocked_until)
  where blocked_until is not null;

create trigger api_rate_limits_set_updated_at
before update on private.api_rate_limits
for each row execute function private.set_updated_at();

alter table private.api_rate_limits enable row level security;
revoke all on private.api_rate_limits from public, anon, authenticated;

create policy api_rate_limits_deny_data_api
on private.api_rate_limits
as restrictive for all to anon, authenticated
using (false) with check (false);

create or replace function private.consume_api_rate_limit_server(
  target_scope text,
  target_key_hash text,
  target_max_attempts integer,
  target_window_seconds integer,
  target_block_seconds integer
)
returns table (
  allowed boolean,
  retry_after_seconds integer,
  remaining_attempts integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  rate_row private.api_rate_limits%rowtype;
  rate_now timestamptz := statement_timestamp();
  next_attempt_count integer;
begin
  perform private.require_service_role();
  if target_scope !~ '^[a-z][a-z0-9_.-]{1,63}$'
     or target_key_hash !~ '^[0-9a-f]{64}$'
     or target_max_attempts not between 1 and 100
     or target_window_seconds not between 10 and 86400
     or target_block_seconds not between 10 and 604800 then
    raise exception using errcode = '22023', message = 'INVALID_RATE_LIMIT_CONFIGURATION';
  end if;

  select * into rate_row
  from private.api_rate_limits arl
  where arl.scope = target_scope and arl.key_hash = target_key_hash
  for update;

  if not found then
    insert into private.api_rate_limits (
      scope, key_hash, window_started_at, attempt_count
    ) values (
      target_scope, target_key_hash, rate_now, 1
    );
    return query select true, 0, target_max_attempts - 1;
    return;
  end if;

  if rate_row.blocked_until is not null and rate_row.blocked_until > rate_now then
    return query select
      false,
      greatest(1, ceil(extract(epoch from (rate_row.blocked_until - rate_now)))::integer),
      0;
    return;
  end if;

  if rate_row.window_started_at
       + make_interval(secs => target_window_seconds) <= rate_now then
    update private.api_rate_limits
    set window_started_at = rate_now,
        attempt_count = 1,
        blocked_until = null
    where scope = target_scope and key_hash = target_key_hash;
    return query select true, 0, target_max_attempts - 1;
    return;
  end if;

  next_attempt_count := rate_row.attempt_count + 1;
  if next_attempt_count > target_max_attempts then
    update private.api_rate_limits
    set attempt_count = next_attempt_count,
        blocked_until = rate_now + make_interval(secs => target_block_seconds)
    where scope = target_scope and key_hash = target_key_hash;
    return query select false, target_block_seconds, 0;
    return;
  end if;

  update private.api_rate_limits
  set attempt_count = next_attempt_count,
      blocked_until = null
  where scope = target_scope and key_hash = target_key_hash;
  return query select true, 0, target_max_attempts - next_attempt_count;
end;
$$;

create or replace function private.resolve_login_email_server(login_identifier text)
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  normalized_identifier text := lower(trim(login_identifier));
  resolved_email text;
begin
  perform private.require_service_role();
  if normalized_identifier ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    return normalized_identifier;
  end if;
  if normalized_identifier !~ '^[a-z0-9][a-z0-9_-]{2,31}$' then
    return null;
  end if;

  select au.email into resolved_email
  from public.profiles p
  join auth.users au on au.id = p.user_id
  where lower(p.username) = normalized_identifier
    and p.account_status = 'active'
  limit 1;
  return resolved_email;
end;
$$;

create or replace function private.list_community_people(
  page_size integer default 40,
  before_joined_at date default null,
  before_person_id bigint default null
)
returns table (
  id bigint,
  slug text,
  display_name text,
  name_zh text,
  name_en text,
  nature_name text,
  bio text,
  city text,
  region text,
  country text,
  avatar_media_id bigint,
  joined_at date,
  profile_visibility text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  caller_is_member boolean := private.has_active_membership(caller);
  caller_can_manage boolean := caller is not null
    and private.user_has_permission(caller, 'people.manage');
begin
  if (before_joined_at is null) <> (before_person_id is null) then
    raise exception using errcode = '22023', message = 'INVALID_PEOPLE_CURSOR';
  end if;

  return query
  select
    pe.id,
    pe.slug,
    pe.display_name,
    case when pe.show_real_name then pe.name_zh else null end,
    case when pe.show_real_name then pe.name_en else null end,
    pe.nature_name,
    pe.bio,
    pe.city,
    pe.region,
    pe.country,
    pe.avatar_media_id,
    pe.joined_at,
    pe.profile_visibility
  from public.people pe
  where pe.status = 'active'
    and private.has_active_membership(pe.user_id)
    and (
      (
        pe.is_public
        and pe.profile_visibility = 'public'
      )
      or (
        pe.profile_visibility = 'members'
        and caller_is_member
      )
      or pe.user_id = caller
      or caller_can_manage
    )
    and (
      before_joined_at is null
      or (pe.joined_at, pe.id) < (before_joined_at, before_person_id)
    )
  order by pe.joined_at desc, pe.id desc
  limit least(greatest(coalesce(page_size, 40), 1), 100);
end;
$$;

create or replace function private.get_community_person_by_slug(person_slug text)
returns table (
  id bigint,
  slug text,
  display_name text,
  name_zh text,
  name_en text,
  nature_name text,
  bio text,
  city text,
  region text,
  country text,
  avatar_media_id bigint,
  joined_at date,
  profile_visibility text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    pe.id,
    pe.slug,
    pe.display_name,
    case when pe.show_real_name then pe.name_zh else null end,
    case when pe.show_real_name then pe.name_en else null end,
    pe.nature_name,
    pe.bio,
    pe.city,
    pe.region,
    pe.country,
    pe.avatar_media_id,
    pe.joined_at,
    pe.profile_visibility
  from public.people pe
  where pe.slug = lower(trim(person_slug))
    and pe.status = 'active'
    and private.has_active_membership(pe.user_id)
    and (
      (
        pe.is_public
        and pe.profile_visibility = 'public'
      )
      or (
        pe.profile_visibility = 'members'
        and private.has_active_membership((select auth.uid()))
      )
      or pe.user_id = (select auth.uid())
      or private.has_permission('people.manage')
    )
  limit 1;
$$;

create or replace function private.get_my_community_profile()
returns table (
  user_id uuid,
  username text,
  account_display_name text,
  onboarding_completed_at timestamptz,
  person_id bigint,
  person_slug text,
  person_display_name text,
  full_name_private text,
  name_zh text,
  name_en text,
  nature_name text,
  bio text,
  city text,
  region text,
  country text,
  avatar_media_id bigint,
  joined_at date,
  profile_visibility text,
  show_real_name boolean,
  allow_messages boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
begin
  if caller is null then
    raise exception using errcode = '42501', message = 'AUTH_REQUIRED';
  end if;

  return query
  select
    p.user_id,
    p.username,
    p.display_name,
    p.onboarding_completed_at,
    pe.id,
    pe.slug,
    pe.display_name,
    pe.full_name_private,
    pe.name_zh,
    pe.name_en,
    pe.nature_name,
    pe.bio,
    pe.city,
    pe.region,
    pe.country,
    pe.avatar_media_id,
    pe.joined_at,
    pe.profile_visibility,
    pe.show_real_name,
    us.allow_messages
  from public.profiles p
  join public.user_settings us on us.user_id = p.user_id
  left join public.people pe on pe.user_id = p.user_id
  where p.user_id = caller;
end;
$$;

create or replace function private.update_my_community_profile(
  person_display_name text,
  person_full_name_private text default null,
  person_name_zh text default null,
  person_name_en text default null,
  person_nature_name text default null,
  person_bio text default null,
  person_city text default null,
  person_region text default null,
  person_country text default null,
  requested_profile_visibility text default 'private',
  requested_show_real_name boolean default false,
  requested_allow_messages boolean default true
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  safety private.account_safety_profiles%rowtype;
  normalized_name_zh text := nullif(trim(person_name_zh), '');
  normalized_name_en text := nullif(trim(person_name_en), '');
begin
  if caller is null then
    raise exception using errcode = '42501', message = 'AUTH_REQUIRED';
  end if;
  select * into safety
  from private.account_safety_profiles s
  where s.user_id = caller;
  if not found then
    raise exception using errcode = '22023', message = 'ACCOUNT_SAFETY_PROFILE_NOT_FOUND';
  end if;
  if safety.age_band = 'under_14'
     and safety.guardian_consent_status <> 'verified' then
    raise exception using errcode = '42501', message = 'GUARDIAN_CONSENT_REQUIRED';
  end if;
  if not exists (
    select 1 from public.profiles p
    where p.user_id = caller and p.onboarding_completed_at is not null
  ) then
    raise exception using errcode = '42501', message = 'PROFILE_INCOMPLETE';
  end if;
  if nullif(trim(person_display_name), '') is null then
    raise exception using errcode = '22023', message = 'DISPLAY_NAME_REQUIRED';
  end if;
  if normalized_name_zh is null and normalized_name_en is null then
    raise exception using errcode = '22023', message = 'PERSON_NAME_REQUIRED';
  end if;
  if requested_profile_visibility not in ('private', 'members', 'public') then
    raise exception using errcode = '22023', message = 'INVALID_PROFILE_VISIBILITY';
  end if;

  update public.people
  set display_name = trim(person_display_name),
      full_name_private = nullif(trim(person_full_name_private), ''),
      name_zh = normalized_name_zh,
      name_en = normalized_name_en,
      nature_name = nullif(trim(person_nature_name), ''),
      bio = nullif(trim(person_bio), ''),
      city = nullif(trim(person_city), ''),
      region = nullif(trim(person_region), ''),
      country = nullif(trim(person_country), ''),
      profile_visibility = requested_profile_visibility,
      show_real_name = coalesce(requested_show_real_name, false),
      is_public = private.has_active_membership(caller)
        and requested_profile_visibility = 'public'
  where user_id = caller;
  if not found then
    raise exception using errcode = '22023', message = 'PERSON_NOT_FOUND';
  end if;

  update public.profiles
  set display_name = trim(person_display_name),
      bio = nullif(trim(person_bio), ''),
      city = nullif(trim(person_city), ''),
      region = nullif(trim(person_region), ''),
      country = nullif(trim(person_country), '')
  where user_id = caller;

  update public.user_settings
  set allow_messages = coalesce(requested_allow_messages, true)
  where user_id = caller;
end;
$$;

-- Browser roles can no longer select raw People rows containing private names.
revoke select on public.people from anon, authenticated;

revoke all on function private.consume_api_rate_limit_server(text, text, integer, integer, integer)
  from public, anon, authenticated;
revoke all on function private.resolve_login_email_server(text)
  from public, anon, authenticated;
revoke all on function private.list_community_people(integer, date, bigint)
  from public, anon, authenticated;
revoke all on function private.get_community_person_by_slug(text)
  from public, anon, authenticated;
revoke all on function private.get_my_community_profile()
  from public, anon, authenticated;
revoke all on function private.update_my_community_profile(
  text, text, text, text, text, text, text, text, text, text, boolean, boolean
) from public, anon, authenticated;

grant execute on function private.consume_api_rate_limit_server(text, text, integer, integer, integer)
  to service_role;
grant execute on function private.resolve_login_email_server(text)
  to service_role;
grant execute on function private.list_community_people(integer, date, bigint)
  to anon, authenticated;
grant execute on function private.get_community_person_by_slug(text)
  to anon, authenticated;
grant execute on function private.get_my_community_profile()
  to authenticated;
grant execute on function private.update_my_community_profile(
  text, text, text, text, text, text, text, text, text, text, boolean, boolean
) to authenticated;

create function public.consume_api_rate_limit_server(
  target_scope text,
  target_key_hash text,
  target_max_attempts integer,
  target_window_seconds integer,
  target_block_seconds integer
)
returns table (
  allowed boolean,
  retry_after_seconds integer,
  remaining_attempts integer
)
language sql
security invoker
set search_path = ''
as $$
  select * from private.consume_api_rate_limit_server(
    target_scope,
    target_key_hash,
    target_max_attempts,
    target_window_seconds,
    target_block_seconds
  );
$$;

create function public.resolve_login_email_server(login_identifier text)
returns text
language sql
stable
security invoker
set search_path = ''
as $$
  select private.resolve_login_email_server(login_identifier);
$$;

create function public.list_community_people(
  page_size integer default 40,
  before_joined_at date default null,
  before_person_id bigint default null
)
returns table (
  id bigint,
  slug text,
  display_name text,
  name_zh text,
  name_en text,
  nature_name text,
  bio text,
  city text,
  region text,
  country text,
  avatar_media_id bigint,
  joined_at date,
  profile_visibility text
)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from private.list_community_people(page_size, before_joined_at, before_person_id);
$$;

create function public.get_community_person_by_slug(person_slug text)
returns table (
  id bigint,
  slug text,
  display_name text,
  name_zh text,
  name_en text,
  nature_name text,
  bio text,
  city text,
  region text,
  country text,
  avatar_media_id bigint,
  joined_at date,
  profile_visibility text
)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from private.get_community_person_by_slug(person_slug);
$$;

create function public.get_my_community_profile()
returns table (
  user_id uuid,
  username text,
  account_display_name text,
  onboarding_completed_at timestamptz,
  person_id bigint,
  person_slug text,
  person_display_name text,
  full_name_private text,
  name_zh text,
  name_en text,
  nature_name text,
  bio text,
  city text,
  region text,
  country text,
  avatar_media_id bigint,
  joined_at date,
  profile_visibility text,
  show_real_name boolean,
  allow_messages boolean
)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from private.get_my_community_profile();
$$;

create function public.update_my_community_profile(
  person_display_name text,
  person_full_name_private text default null,
  person_name_zh text default null,
  person_name_en text default null,
  person_nature_name text default null,
  person_bio text default null,
  person_city text default null,
  person_region text default null,
  person_country text default null,
  requested_profile_visibility text default 'private',
  requested_show_real_name boolean default false,
  requested_allow_messages boolean default true
)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.update_my_community_profile(
    person_display_name,
    person_full_name_private,
    person_name_zh,
    person_name_en,
    person_nature_name,
    person_bio,
    person_city,
    person_region,
    person_country,
    requested_profile_visibility,
    requested_show_real_name,
    requested_allow_messages
  );
$$;

revoke all on function public.consume_api_rate_limit_server(text, text, integer, integer, integer)
  from public, anon, authenticated;
revoke all on function public.resolve_login_email_server(text)
  from public, anon, authenticated;
revoke all on function public.list_community_people(integer, date, bigint)
  from public;
revoke all on function public.get_community_person_by_slug(text)
  from public;
revoke all on function public.get_my_community_profile()
  from public, anon;
revoke all on function public.update_my_community_profile(
  text, text, text, text, text, text, text, text, text, text, boolean, boolean
) from public, anon;

grant execute on function public.consume_api_rate_limit_server(text, text, integer, integer, integer)
  to service_role;
grant execute on function public.resolve_login_email_server(text)
  to service_role;
grant execute on function public.list_community_people(integer, date, bigint)
  to anon, authenticated;
grant execute on function public.get_community_person_by_slug(text)
  to anon, authenticated;
grant execute on function public.get_my_community_profile()
  to authenticated;
grant execute on function public.update_my_community_profile(
  text, text, text, text, text, text, text, text, text, text, boolean, boolean
) to authenticated;

comment on function public.list_community_people(integer, date, bigint) is
  'Safe People directory projection; never returns full_name_private or hidden real names.';
comment on table private.api_rate_limits is
  'Persistent fixed-window counters keyed only by server-side hashes.';
