-- Member practice sessions, participation, waitlists, and host controls.

create table public.practice_sessions (
  id bigint generated always as identity primary key,
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null default 'Asia/Shanghai',
  capacity integer not null default 30,
  status text not null default 'draft',
  created_by uuid not null references auth.users(id) on delete restrict,
  facilitator_user_id uuid not null references auth.users(id) on delete restrict,
  published_at timestamptz,
  cancelled_at timestamptz,
  cancellation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint practice_sessions_time_check check (ends_at > starts_at),
  constraint practice_sessions_capacity_check check (capacity between 2 and 500),
  constraint practice_sessions_status_check check (
    status in ('draft', 'published', 'cancelled', 'completed')
  ),
  constraint practice_sessions_publication_check check (
    status <> 'published' or published_at is not null
  ),
  constraint practice_sessions_cancellation_check check (
    status <> 'cancelled'
    or (
      cancelled_at is not null
      and length(trim(cancellation_reason)) > 0
    )
  )
);

create index practice_sessions_schedule_idx
  on public.practice_sessions (starts_at, id)
  where status = 'published';
create index practice_sessions_facilitator_idx
  on public.practice_sessions (facilitator_user_id, starts_at desc);
create index practice_sessions_created_by_idx
  on public.practice_sessions (created_by, created_at desc);

create table public.practice_participants (
  session_id bigint not null references public.practice_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'joined',
  joined_at timestamptz not null default now(),
  cancelled_at timestamptz,
  checked_in_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (session_id, user_id),
  constraint practice_participants_status_check check (
    status in ('joined', 'waitlisted', 'cancelled', 'attended', 'no_show')
  ),
  constraint practice_participants_cancellation_check check (
    status <> 'cancelled' or cancelled_at is not null
  ),
  constraint practice_participants_attendance_check check (
    status <> 'attended' or checked_in_at is not null
  )
);

create index practice_participants_user_idx
  on public.practice_participants (user_id, joined_at desc);
create index practice_participants_waitlist_idx
  on public.practice_participants (session_id, joined_at, user_id)
  where status = 'waitlisted';
create index practice_participants_joined_idx
  on public.practice_participants (session_id, joined_at, user_id)
  where status in ('joined', 'attended');

create table private.practice_session_access (
  session_id bigint primary key references public.practice_sessions(id) on delete cascade,
  meeting_url text,
  access_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint practice_session_access_url_check check (
    meeting_url is null or meeting_url ~ '^https://'
  )
);

create trigger practice_sessions_set_updated_at
before update on public.practice_sessions
for each row execute function private.set_updated_at();
create trigger practice_participants_set_updated_at
before update on public.practice_participants
for each row execute function private.set_updated_at();
create trigger practice_session_access_set_updated_at
before update on private.practice_session_access
for each row execute function private.set_updated_at();

create trigger practice_sessions_audit_changes
after insert or update or delete on public.practice_sessions
for each row execute function private.audit_row_change('practice_session');
create trigger practice_participants_audit_changes
after insert or update or delete on public.practice_participants
for each row execute function private.audit_row_change('practice_participant');

alter table public.practice_sessions enable row level security;
alter table public.practice_participants enable row level security;
alter table private.practice_session_access enable row level security;

revoke all on public.practice_sessions from public, anon, authenticated;
revoke all on public.practice_participants from public, anon, authenticated;
revoke all on private.practice_session_access from public, anon, authenticated;

grant select on public.practice_sessions to authenticated;
grant select on public.practice_participants to authenticated;

create policy practice_sessions_select_members
on public.practice_sessions for select
to authenticated
using (
  private.has_active_membership((select auth.uid()))
  or private.has_permission('practice.host')
  or private.has_permission('practice.create')
);

create policy practice_participants_select_authorized
on public.practice_participants for select
to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1 from public.practice_sessions ps
    where ps.id = session_id
      and ps.facilitator_user_id = (select auth.uid())
  )
  or private.has_permission('practice.host')
);

create policy practice_session_access_deny_data_api
on private.practice_session_access
as restrictive for all to anon, authenticated
using (false) with check (false);

create or replace function private.create_practice_session(
  session_title text,
  session_description text,
  session_starts_at timestamptz,
  session_ends_at timestamptz,
  session_timezone text default 'Asia/Shanghai',
  session_capacity integer default 30,
  session_meeting_url text default null,
  session_access_notes text default null
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  session_id bigint;
begin
  if caller is null
     or not private.user_has_permission(caller, 'practice.create')
     or not private.has_active_membership(caller) then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;
  if nullif(trim(session_title), '') is null then
    raise exception using errcode = '22023', message = 'PRACTICE_TITLE_REQUIRED';
  end if;
  if session_ends_at <= session_starts_at
     or session_starts_at < statement_timestamp() - interval '15 minutes' then
    raise exception using errcode = '22023', message = 'INVALID_PRACTICE_TIME';
  end if;
  if session_capacity not between 2 and 500 then
    raise exception using errcode = '22023', message = 'INVALID_PRACTICE_CAPACITY';
  end if;
  if session_meeting_url is not null and session_meeting_url !~ '^https://' then
    raise exception using errcode = '22023', message = 'INVALID_PRACTICE_MEETING_URL';
  end if;

  insert into public.practice_sessions (
    title, description, starts_at, ends_at, timezone, capacity,
    created_by, facilitator_user_id
  ) values (
    trim(session_title),
    nullif(trim(session_description), ''),
    session_starts_at,
    session_ends_at,
    coalesce(nullif(trim(session_timezone), ''), 'Asia/Shanghai'),
    session_capacity,
    caller,
    caller
  ) returning id into session_id;

  insert into private.practice_session_access (
    session_id, meeting_url, access_notes
  ) values (
    session_id,
    nullif(trim(session_meeting_url), ''),
    nullif(trim(session_access_notes), '')
  );
  return session_id;
end;
$$;

create or replace function private.publish_practice_session(target_session_id bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
begin
  if caller is null or not private.user_has_permission(caller, 'practice.host') then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;
  update public.practice_sessions
  set status = 'published', published_at = statement_timestamp()
  where id = target_session_id
    and status = 'draft'
    and (
      facilitator_user_id = caller
      or private.user_has_permission(caller, 'practice.host')
    );
  if not found then
    raise exception using errcode = '22023', message = 'PRACTICE_SESSION_NOT_PUBLISHABLE';
  end if;
end;
$$;

create or replace function private.list_practice_sessions(
  page_size integer default 30,
  after_starts_at timestamptz default null,
  after_session_id bigint default null,
  include_past boolean default false
)
returns table (
  id bigint,
  title text,
  description text,
  starts_at timestamptz,
  ends_at timestamptz,
  timezone text,
  capacity integer,
  status text,
  facilitator_display_name text,
  facilitator_nature_name text,
  participant_count bigint,
  waitlist_count bigint,
  my_participation_status text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
begin
  if caller is null
     or not private.user_has_permission(caller, 'practice.read')
     or not private.has_active_membership(caller) then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;
  if (after_starts_at is null) <> (after_session_id is null) then
    raise exception using errcode = '22023', message = 'INVALID_PRACTICE_CURSOR';
  end if;

  return query
  select
    ps.id,
    ps.title,
    ps.description,
    ps.starts_at,
    ps.ends_at,
    ps.timezone,
    ps.capacity,
    ps.status,
    pe.display_name,
    pe.nature_name,
    count(pp.user_id) filter (where pp.status in ('joined', 'attended')),
    count(pp.user_id) filter (where pp.status = 'waitlisted'),
    max(pp.status) filter (where pp.user_id = caller)
  from public.practice_sessions ps
  left join public.people pe on pe.user_id = ps.facilitator_user_id
  left join public.practice_participants pp on pp.session_id = ps.id
  where ps.status in ('published', 'completed')
    and (include_past or ps.ends_at >= statement_timestamp())
    and (
      after_starts_at is null
      or (ps.starts_at, ps.id) > (after_starts_at, after_session_id)
    )
  group by ps.id, pe.display_name, pe.nature_name
  order by ps.starts_at, ps.id
  limit least(greatest(coalesce(page_size, 30), 1), 100);
end;
$$;

create or replace function private.join_practice_session(target_session_id bigint)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  session_row public.practice_sessions%rowtype;
  joined_count integer;
  next_status text;
begin
  if caller is null
     or not private.user_has_permission(caller, 'practice.join')
     or not private.has_active_membership(caller) then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;

  select * into session_row
  from public.practice_sessions ps
  where ps.id = target_session_id
  for update;
  if not found or session_row.status <> 'published'
     or session_row.starts_at <= statement_timestamp() then
    raise exception using errcode = '22023', message = 'PRACTICE_SESSION_NOT_JOINABLE';
  end if;

  select count(*) into joined_count
  from public.practice_participants pp
  where pp.session_id = target_session_id
    and pp.status in ('joined', 'attended');
  next_status := case when joined_count < session_row.capacity then 'joined' else 'waitlisted' end;

  insert into public.practice_participants (
    session_id, user_id, status, joined_at, cancelled_at, checked_in_at
  ) values (
    target_session_id, caller, next_status, statement_timestamp(), null, null
  )
  on conflict (session_id, user_id) do update
  set status = excluded.status,
      joined_at = excluded.joined_at,
      cancelled_at = null,
      checked_in_at = null
  where public.practice_participants.status = 'cancelled';
  if not found then
    raise exception using errcode = '22023', message = 'PRACTICE_ALREADY_JOINED';
  end if;
  return next_status;
end;
$$;

create or replace function private.cancel_practice_participation(target_session_id bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  previous_status text;
  promoted_user_id uuid;
begin
  if caller is null then
    raise exception using errcode = '42501', message = 'AUTH_REQUIRED';
  end if;
  select pp.status into previous_status
  from public.practice_participants pp
  where pp.session_id = target_session_id and pp.user_id = caller
  for update;
  if previous_status not in ('joined', 'waitlisted') then
    raise exception using errcode = '22023', message = 'PRACTICE_PARTICIPATION_NOT_CANCELLABLE';
  end if;

  update public.practice_participants
  set status = 'cancelled', cancelled_at = statement_timestamp()
  where session_id = target_session_id and user_id = caller;

  if previous_status = 'joined' then
    select pp.user_id into promoted_user_id
    from public.practice_participants pp
    where pp.session_id = target_session_id and pp.status = 'waitlisted'
    order by pp.joined_at, pp.user_id
    limit 1
    for update skip locked;
    if promoted_user_id is not null then
      update public.practice_participants
      set status = 'joined'
      where session_id = target_session_id and user_id = promoted_user_id;
      perform private.create_notification(
        promoted_user_id,
        'practice.waitlist_promoted',
        '共练候补已转为参加',
        'Practice waitlist spot confirmed',
        null, null,
        '/community/practice'
      );
    end if;
  end if;
end;
$$;

create or replace function private.get_practice_session_access(target_session_id bigint)
returns table (
  meeting_url text,
  access_notes text,
  available_now boolean
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
    case when eligible.available then psa.meeting_url else null end,
    case when eligible.available then psa.access_notes else null end,
    eligible.available
  from public.practice_sessions ps
  join private.practice_session_access psa on psa.session_id = ps.id
  cross join lateral (
    select (
      (
        exists (
          select 1 from public.practice_participants pp
          where pp.session_id = ps.id
            and pp.user_id = caller
            and pp.status in ('joined', 'attended')
        )
        and statement_timestamp() between ps.starts_at - interval '60 minutes'
          and ps.ends_at + interval '4 hours'
      )
      or (
        ps.facilitator_user_id = caller
        and private.user_has_permission(caller, 'practice.host')
      )
    ) as available
  ) eligible
  where ps.id = target_session_id
    and private.has_active_membership(caller);
end;
$$;

create or replace function private.check_in_practice_participant(
  target_session_id bigint,
  target_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
begin
  if caller is null or not private.user_has_permission(caller, 'practice.host') then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;
  if not exists (
    select 1 from public.practice_sessions ps
    where ps.id = target_session_id
      and (ps.facilitator_user_id = caller or private.has_permission('memberships.manage'))
  ) then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;
  update public.practice_participants
  set status = 'attended', checked_in_at = statement_timestamp()
  where session_id = target_session_id
    and user_id = target_user_id
    and status = 'joined';
  if not found then
    raise exception using errcode = '22023', message = 'PRACTICE_PARTICIPANT_NOT_JOINED';
  end if;
end;
$$;

revoke all on function private.create_practice_session(text, text, timestamptz, timestamptz, text, integer, text, text) from public, anon, authenticated;
revoke all on function private.publish_practice_session(bigint) from public, anon, authenticated;
revoke all on function private.list_practice_sessions(integer, timestamptz, bigint, boolean) from public, anon, authenticated;
revoke all on function private.join_practice_session(bigint) from public, anon, authenticated;
revoke all on function private.cancel_practice_participation(bigint) from public, anon, authenticated;
revoke all on function private.get_practice_session_access(bigint) from public, anon, authenticated;
revoke all on function private.check_in_practice_participant(bigint, uuid) from public, anon, authenticated;

grant execute on function private.create_practice_session(text, text, timestamptz, timestamptz, text, integer, text, text) to authenticated;
grant execute on function private.publish_practice_session(bigint) to authenticated;
grant execute on function private.list_practice_sessions(integer, timestamptz, bigint, boolean) to authenticated;
grant execute on function private.join_practice_session(bigint) to authenticated;
grant execute on function private.cancel_practice_participation(bigint) to authenticated;
grant execute on function private.get_practice_session_access(bigint) to authenticated;
grant execute on function private.check_in_practice_participant(bigint, uuid) to authenticated;

create function public.create_practice_session(
  session_title text,
  session_description text,
  session_starts_at timestamptz,
  session_ends_at timestamptz,
  session_timezone text default 'Asia/Shanghai',
  session_capacity integer default 30,
  session_meeting_url text default null,
  session_access_notes text default null
)
returns bigint language sql security invoker set search_path = '' as $$
  select private.create_practice_session(session_title, session_description, session_starts_at, session_ends_at, session_timezone, session_capacity, session_meeting_url, session_access_notes);
$$;
create function public.publish_practice_session(target_session_id bigint)
returns void language sql security invoker set search_path = '' as $$ select private.publish_practice_session(target_session_id); $$;
create function public.list_practice_sessions(page_size integer default 30, after_starts_at timestamptz default null, after_session_id bigint default null, include_past boolean default false)
returns table (id bigint, title text, description text, starts_at timestamptz, ends_at timestamptz, timezone text, capacity integer, status text, facilitator_display_name text, facilitator_nature_name text, participant_count bigint, waitlist_count bigint, my_participation_status text)
language sql stable security invoker set search_path = '' as $$ select * from private.list_practice_sessions(page_size, after_starts_at, after_session_id, include_past); $$;
create function public.join_practice_session(target_session_id bigint)
returns text language sql security invoker set search_path = '' as $$ select private.join_practice_session(target_session_id); $$;
create function public.cancel_practice_participation(target_session_id bigint)
returns void language sql security invoker set search_path = '' as $$ select private.cancel_practice_participation(target_session_id); $$;
create function public.get_practice_session_access(target_session_id bigint)
returns table (meeting_url text, access_notes text, available_now boolean)
language sql stable security invoker set search_path = '' as $$ select * from private.get_practice_session_access(target_session_id); $$;
create function public.check_in_practice_participant(target_session_id bigint, target_user_id uuid)
returns void language sql security invoker set search_path = '' as $$ select private.check_in_practice_participant(target_session_id, target_user_id); $$;

revoke all on function public.create_practice_session(text, text, timestamptz, timestamptz, text, integer, text, text) from public, anon;
revoke all on function public.publish_practice_session(bigint) from public, anon;
revoke all on function public.list_practice_sessions(integer, timestamptz, bigint, boolean) from public, anon;
revoke all on function public.join_practice_session(bigint) from public, anon;
revoke all on function public.cancel_practice_participation(bigint) from public, anon;
revoke all on function public.get_practice_session_access(bigint) from public, anon;
revoke all on function public.check_in_practice_participant(bigint, uuid) from public, anon;

grant execute on function public.create_practice_session(text, text, timestamptz, timestamptz, text, integer, text, text) to authenticated;
grant execute on function public.publish_practice_session(bigint) to authenticated;
grant execute on function public.list_practice_sessions(integer, timestamptz, bigint, boolean) to authenticated;
grant execute on function public.join_practice_session(bigint) to authenticated;
grant execute on function public.cancel_practice_participation(bigint) to authenticated;
grant execute on function public.get_practice_session_access(bigint) to authenticated;
grant execute on function public.check_in_practice_participant(bigint, uuid) to authenticated;

comment on table private.practice_session_access is 'Meeting links are released only near the session to joined participants or hosts.';
