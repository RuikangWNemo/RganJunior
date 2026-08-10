-- Keep community clients current without exposing application bodies in the
-- realtime payload. Reviewers reload the protected RPC after receiving a
-- minimal change signal.

drop function public.list_membership_applications(text[], integer, timestamptz, bigint);
drop function private.list_membership_applications(text[], integer, timestamptz, bigint);

create function private.list_membership_applications(
  application_statuses text[] default array['submitted', 'under_review', 'more_info_requested']::text[],
  page_size integer default 50,
  before_created_at timestamptz default null,
  before_application_id bigint default null
)
returns table (
  id bigint,
  user_id uuid,
  username text,
  display_name text,
  nature_name text,
  status text,
  motivation text,
  hopes text,
  contribution text,
  additional_info text,
  age_band text,
  guardian_consent_status text,
  identity_verification_status text,
  submitted_at timestamptz,
  assigned_reviewer_id uuid,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  can_read_sensitive boolean;
begin
  if caller is null or not private.user_has_permission(caller, 'memberships.review') then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;
  if (before_created_at is null) <> (before_application_id is null) then
    raise exception using errcode = '22023', message = 'INVALID_APPLICATION_CURSOR';
  end if;
  can_read_sensitive := private.user_has_permission(caller, 'memberships.review_sensitive');

  return query
  select
    ca.id,
    ca.user_id,
    p.username,
    pe.display_name,
    pe.nature_name,
    ca.status,
    ca.motivation,
    ca.hopes,
    ca.contribution,
    ca.additional_info,
    case when can_read_sensitive then s.age_band else null end,
    case when can_read_sensitive then s.guardian_consent_status else null end,
    case when can_read_sensitive then s.identity_verification_status else null end,
    ca.submitted_at,
    ca.assigned_reviewer_id,
    ca.created_at,
    ca.updated_at
  from public.community_applications ca
  join public.profiles p on p.user_id = ca.user_id
  left join public.people pe on pe.user_id = ca.user_id
  join private.account_safety_profiles s on s.user_id = ca.user_id
  where ca.status = any(coalesce(application_statuses, array[]::text[]))
    and (
      before_created_at is null
      or (ca.created_at, ca.id) < (before_created_at, before_application_id)
    )
  order by ca.created_at desc, ca.id desc
  limit least(greatest(coalesce(page_size, 50), 1), 100);
end;
$$;

revoke all on function private.list_membership_applications(text[], integer, timestamptz, bigint)
  from public, anon, authenticated;
grant execute on function private.list_membership_applications(text[], integer, timestamptz, bigint)
  to authenticated;

create function public.list_membership_applications(
  application_statuses text[] default array['submitted', 'under_review', 'more_info_requested']::text[],
  page_size integer default 50,
  before_created_at timestamptz default null,
  before_application_id bigint default null
)
returns table (
  id bigint,
  user_id uuid,
  username text,
  display_name text,
  nature_name text,
  status text,
  motivation text,
  hopes text,
  contribution text,
  additional_info text,
  age_band text,
  guardian_consent_status text,
  identity_verification_status text,
  submitted_at timestamptz,
  assigned_reviewer_id uuid,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from private.list_membership_applications(
    application_statuses,
    page_size,
    before_created_at,
    before_application_id
  );
$$;

revoke all on function public.list_membership_applications(text[], integer, timestamptz, bigint)
  from public, anon;
grant execute on function public.list_membership_applications(text[], integer, timestamptz, bigint)
  to authenticated;

-- Private channel authorization. Each member may receive only their own
-- community-state invalidation signal. Reviewers may additionally receive the
-- shared application-queue invalidation signal.
drop policy if exists community_change_broadcast_read on realtime.messages;
create policy community_change_broadcast_read
on realtime.messages
for select
to authenticated
using (
  realtime.messages.extension = 'broadcast'
  and (
    (select realtime.topic()) = 'community:user:' || (select auth.uid())::text
    or (
      (select realtime.topic()) = 'community:applications:review'
      and private.has_permission('memberships.review')
    )
  )
);

create function private.broadcast_community_application_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform realtime.send(
    jsonb_build_object('operation', tg_op),
    'application_changed',
    'community:applications:review',
    true
  );
  perform realtime.send(
    jsonb_build_object('source', 'application'),
    'community_state_changed',
    'community:user:' || new.user_id::text,
    true
  );
  return new;
end;
$$;

create function private.broadcast_community_state_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform realtime.send(
    jsonb_build_object('source', tg_table_schema || '.' || tg_table_name),
    'community_state_changed',
    'community:user:' || new.user_id::text,
    true
  );
  return new;
end;
$$;

revoke all on function private.broadcast_community_application_change()
  from public, anon, authenticated;
revoke all on function private.broadcast_community_state_change()
  from public, anon, authenticated;

create trigger community_applications_broadcast_change
after insert or update on public.community_applications
for each row execute function private.broadcast_community_application_change();

create trigger community_memberships_broadcast_change
after insert or update on public.community_memberships
for each row execute function private.broadcast_community_state_change();

create trigger profiles_broadcast_community_state_change
after insert or update on public.profiles
for each row execute function private.broadcast_community_state_change();

create trigger people_broadcast_community_state_change
after insert or update on public.people
for each row execute function private.broadcast_community_state_change();

create trigger account_safety_broadcast_community_state_change
after insert or update on private.account_safety_profiles
for each row execute function private.broadcast_community_state_change();

comment on function private.broadcast_community_application_change() is
  'Broadcasts invalidation signals only; application answers remain behind the review RPC.';
