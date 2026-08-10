-- Controlled community application, membership, notification, and directory workflow.

create table public.community_applications (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  attempt_number integer not null check (attempt_number > 0),
  form_version text not null default 'v1',
  status text not null default 'draft',
  motivation text not null default '',
  hopes text,
  contribution text,
  additional_info text,
  submitted_at timestamptz,
  assigned_reviewer_id uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  decided_by uuid references auth.users(id) on delete set null,
  decided_at timestamptz,
  decision_reason text,
  withdrawn_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint community_applications_status_check check (
    status in (
      'draft', 'pending_guardian', 'submitted', 'under_review',
      'more_info_requested', 'approved', 'rejected', 'withdrawn'
    )
  ),
  constraint community_applications_attempt_unique unique (user_id, attempt_number),
  constraint community_applications_decision_check check (
    (
      status in ('approved', 'rejected')
      and decided_by is not null
      and decided_at is not null
    )
    or status not in ('approved', 'rejected')
  )
);

create unique index community_applications_one_active_uidx
  on public.community_applications (user_id)
  where status in (
    'draft', 'pending_guardian', 'submitted',
    'under_review', 'more_info_requested'
  );
create index community_applications_review_queue_idx
  on public.community_applications (status, submitted_at, id)
  where status in ('submitted', 'under_review', 'more_info_requested');
create index community_applications_reviewer_idx
  on public.community_applications (assigned_reviewer_id, updated_at desc)
  where assigned_reviewer_id is not null;
create index community_applications_decided_by_idx
  on public.community_applications (decided_by, decided_at desc)
  where decided_by is not null;

create table private.community_application_events (
  id bigint generated always as identity primary key,
  application_id bigint not null
    references public.community_applications(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  from_status text,
  to_status text,
  public_message text,
  internal_note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint community_application_events_type_check check (
    event_type ~ '^[a-z][a-z0-9_.-]*$'
  )
);

create index community_application_events_application_idx
  on private.community_application_events (application_id, created_at, id);
create index community_application_events_actor_idx
  on private.community_application_events (actor_user_id, created_at desc)
  where actor_user_id is not null;

create table public.community_memberships (
  user_id uuid primary key references auth.users(id) on delete cascade,
  application_id bigint unique
    references public.community_applications(id) on delete restrict,
  status text not null default 'active',
  approved_by uuid not null references auth.users(id) on delete restrict,
  approved_at timestamptz not null default now(),
  member_since date not null default current_date,
  suspended_by uuid references auth.users(id) on delete set null,
  suspended_at timestamptz,
  suspension_reason text,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint community_memberships_status_check check (
    status in ('active', 'suspended', 'left', 'revoked')
  ),
  constraint community_memberships_suspension_check check (
    (
      status = 'suspended'
      and suspended_by is not null
      and suspended_at is not null
      and length(trim(suspension_reason)) > 0
    )
    or status <> 'suspended'
  )
);

create index community_memberships_approved_by_idx
  on public.community_memberships (approved_by, approved_at desc);
create index community_memberships_suspended_by_idx
  on public.community_memberships (suspended_by, suspended_at desc)
  where suspended_by is not null;
create index community_memberships_active_since_idx
  on public.community_memberships (member_since desc, user_id)
  where status = 'active';

create table public.notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  notification_type text not null,
  title_zh text not null,
  title_en text not null,
  body_zh text,
  body_en text,
  action_url text,
  read_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  constraint notifications_type_check check (
    notification_type ~ '^[a-z][a-z0-9_.-]*$'
  ),
  constraint notifications_action_url_check check (
    action_url is null or action_url ~ '^/'
  ),
  constraint notifications_expiry_check check (
    expires_at is null or expires_at > created_at
  )
);

create index notifications_user_unread_idx
  on public.notifications (user_id, created_at desc, id desc)
  where read_at is null and archived_at is null;
create index notifications_user_history_idx
  on public.notifications (user_id, created_at desc, id desc);

create trigger community_applications_set_updated_at
before update on public.community_applications
for each row execute function private.set_updated_at();

create trigger community_memberships_set_updated_at
before update on public.community_memberships
for each row execute function private.set_updated_at();

create trigger community_applications_audit_changes
after insert or update on public.community_applications
for each row execute function private.audit_row_change('community_application');

create trigger community_memberships_audit_changes
after insert or update or delete on public.community_memberships
for each row execute function private.audit_row_change('community_membership');

create or replace function private.protect_notification_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
begin
  if tg_op = 'INSERT' then
    return new;
  end if;

  if new.id is distinct from old.id
     or new.user_id is distinct from old.user_id
     or new.notification_type is distinct from old.notification_type
     or new.title_zh is distinct from old.title_zh
     or new.title_en is distinct from old.title_en
     or new.body_zh is distinct from old.body_zh
     or new.body_en is distinct from old.body_en
     or new.action_url is distinct from old.action_url
     or new.created_at is distinct from old.created_at
     or new.expires_at is distinct from old.expires_at then
    raise exception using errcode = '42501', message = 'NOTIFICATION_SYSTEM_FIELDS_IMMUTABLE';
  end if;

  if caller is not null and caller <> old.user_id
     and not private.user_has_permission(caller, 'notifications.manage') then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;
  return new;
end;
$$;

create trigger notifications_protect_fields
before update on public.notifications
for each row execute function private.protect_notification_fields();

alter table public.community_applications enable row level security;
alter table private.community_application_events enable row level security;
alter table public.community_memberships enable row level security;
alter table public.notifications enable row level security;

revoke all on public.community_applications from public, anon, authenticated;
revoke all on private.community_application_events from public, anon, authenticated;
revoke all on public.community_memberships from public, anon, authenticated;
revoke all on public.notifications from public, anon, authenticated;

grant select on public.community_applications to authenticated;
grant select on public.community_memberships to authenticated;
grant select, update on public.notifications to authenticated;

create policy community_applications_select_authorized
on public.community_applications for select
to authenticated
using (
  user_id = (select auth.uid())
  or private.has_permission('memberships.review')
  or private.has_permission('memberships.manage')
);

create policy community_application_events_deny_data_api
on private.community_application_events
as restrictive
for all
to anon, authenticated
using (false)
with check (false);

create policy community_memberships_select_authorized
on public.community_memberships for select
to authenticated
using (
  user_id = (select auth.uid())
  or private.has_permission('memberships.read')
  or private.has_permission('memberships.review')
  or private.has_permission('memberships.manage')
);

create policy notifications_select_own
on public.notifications for select
to authenticated
using (user_id = (select auth.uid()));

create policy notifications_update_own
on public.notifications for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create or replace function private.has_active_membership(check_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.community_memberships cm
    join public.profiles p on p.user_id = cm.user_id
    where cm.user_id = check_user_id
      and cm.status = 'active'
      and p.account_status = 'active'
  );
$$;

revoke all on function private.has_active_membership(uuid)
  from public, anon, authenticated;
-- This private-schema helper is referenced directly by People RLS policies.
-- The private schema is not part of the Data API exposure list, and the
-- function reveals only the boolean Membership state needed by those policies.
grant execute on function private.has_active_membership(uuid)
  to anon, authenticated;

create or replace function private.write_application_event(
  target_application_id bigint,
  application_event_type text,
  application_from_status text,
  application_to_status text,
  application_public_message text default null,
  application_internal_note text default null,
  application_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into private.community_application_events (
    application_id,
    actor_user_id,
    event_type,
    from_status,
    to_status,
    public_message,
    internal_note,
    metadata
  ) values (
    target_application_id,
    (select auth.uid()),
    application_event_type,
    application_from_status,
    application_to_status,
    nullif(trim(application_public_message), ''),
    nullif(trim(application_internal_note), ''),
    coalesce(application_metadata, '{}'::jsonb)
  );
end;
$$;

create or replace function private.create_notification(
  target_user_id uuid,
  target_notification_type text,
  target_title_zh text,
  target_title_en text,
  target_body_zh text default null,
  target_body_en text default null,
  target_action_url text default null
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  notification_id bigint;
begin
  insert into public.notifications (
    user_id,
    notification_type,
    title_zh,
    title_en,
    body_zh,
    body_en,
    action_url
  ) values (
    target_user_id,
    target_notification_type,
    trim(target_title_zh),
    trim(target_title_en),
    nullif(trim(target_body_zh), ''),
    nullif(trim(target_body_en), ''),
    target_action_url
  )
  returning id into notification_id;
  return notification_id;
end;
$$;

revoke all on function private.write_application_event(
  bigint, text, text, text, text, text, jsonb
) from public, anon, authenticated;
revoke all on function private.create_notification(
  uuid, text, text, text, text, text, text
) from public, anon, authenticated;

create or replace function private.create_community_application(
  application_motivation text default '',
  application_hopes text default null,
  application_contribution text default null,
  application_additional_info text default null,
  application_form_version text default 'v1'
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  created_application_id bigint;
  next_attempt integer;
  existing_status text;
begin
  if caller is null then
    raise exception using errcode = '42501', message = 'AUTH_REQUIRED';
  end if;
  if not private.user_has_permission(caller, 'community.apply') then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;
  if not exists (
    select 1 from public.profiles p
    where p.user_id = caller
      and p.account_status = 'active'
      and p.onboarding_completed_at is not null
  ) then
    raise exception using errcode = '42501', message = 'PROFILE_INCOMPLETE';
  end if;
  if private.has_active_membership(caller) then
    raise exception using errcode = '22023', message = 'ALREADY_COMMUNITY_MEMBER';
  end if;

  select ca.status into existing_status
  from public.community_applications ca
  where ca.user_id = caller
    and ca.status in (
      'draft', 'pending_guardian', 'submitted',
      'under_review', 'more_info_requested'
    );
  if existing_status is not null then
    raise exception using errcode = '23505', message = 'APPLICATION_ALREADY_PENDING';
  end if;

  select coalesce(max(ca.attempt_number), 0) + 1
  into next_attempt
  from public.community_applications ca
  where ca.user_id = caller;

  insert into public.community_applications (
    user_id,
    attempt_number,
    form_version,
    motivation,
    hopes,
    contribution,
    additional_info
  ) values (
    caller,
    next_attempt,
    coalesce(nullif(trim(application_form_version), ''), 'v1'),
    trim(coalesce(application_motivation, '')),
    nullif(trim(application_hopes), ''),
    nullif(trim(application_contribution), ''),
    nullif(trim(application_additional_info), '')
  )
  returning id into created_application_id;

  perform private.write_application_event(
    created_application_id,
    'application.created',
    null,
    'draft'
  );
  return created_application_id;
end;
$$;

create or replace function private.submit_community_application(
  target_application_id bigint,
  application_motivation text,
  application_hopes text default null,
  application_contribution text default null,
  application_additional_info text default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  application_row public.community_applications%rowtype;
  safety private.account_safety_profiles%rowtype;
  next_status text;
begin
  if caller is null then
    raise exception using errcode = '42501', message = 'AUTH_REQUIRED';
  end if;

  select * into application_row
  from public.community_applications ca
  where ca.id = target_application_id
    and ca.user_id = caller
  for update;
  if not found then
    raise exception using errcode = '22023', message = 'APPLICATION_NOT_FOUND';
  end if;
  if application_row.status not in ('draft', 'more_info_requested') then
    raise exception using errcode = '22023', message = 'APPLICATION_STATE_CONFLICT';
  end if;
  if nullif(trim(application_motivation), '') is null then
    raise exception using errcode = '22023', message = 'APPLICATION_MOTIVATION_REQUIRED';
  end if;

  select * into safety
  from private.account_safety_profiles s
  where s.user_id = caller;
  if not found then
    raise exception using errcode = '22023', message = 'ACCOUNT_SAFETY_PROFILE_NOT_FOUND';
  end if;

  next_status := case
    when safety.age_band in ('under_14', 'age_14_17')
      and safety.guardian_consent_status <> 'verified'
      then 'pending_guardian'
    else 'submitted'
  end;

  update public.community_applications
  set motivation = trim(application_motivation),
      hopes = nullif(trim(application_hopes), ''),
      contribution = nullif(trim(application_contribution), ''),
      additional_info = nullif(trim(application_additional_info), ''),
      status = next_status,
      submitted_at = case when next_status = 'submitted' then statement_timestamp() else null end,
      assigned_reviewer_id = null,
      reviewed_at = null,
      decided_by = null,
      decided_at = null,
      decision_reason = null
  where id = target_application_id;

  perform private.write_application_event(
    target_application_id,
    'application.submitted',
    application_row.status,
    next_status
  );
  return next_status;
end;
$$;

create or replace function private.get_my_community_application()
returns table (
  id bigint,
  attempt_number integer,
  form_version text,
  status text,
  motivation text,
  hopes text,
  contribution text,
  additional_info text,
  submitted_at timestamptz,
  decision_reason text,
  decided_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    ca.id,
    ca.attempt_number,
    ca.form_version,
    ca.status,
    ca.motivation,
    ca.hopes,
    ca.contribution,
    ca.additional_info,
    ca.submitted_at,
    ca.decision_reason,
    ca.decided_at,
    ca.created_at,
    ca.updated_at
  from public.community_applications ca
  where ca.user_id = (select auth.uid())
  order by ca.attempt_number desc
  limit 1;
$$;

create or replace function private.list_membership_applications(
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

create or replace function private.request_application_changes(
  target_application_id bigint,
  applicant_message text,
  reviewer_internal_note text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  application_row public.community_applications%rowtype;
begin
  if caller is null or not private.user_has_permission(caller, 'memberships.review') then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;
  if nullif(trim(applicant_message), '') is null then
    raise exception using errcode = '22023', message = 'APPLICANT_MESSAGE_REQUIRED';
  end if;

  select * into application_row
  from public.community_applications ca
  where ca.id = target_application_id
  for update;
  if not found then
    raise exception using errcode = '22023', message = 'APPLICATION_NOT_FOUND';
  end if;
  if application_row.status not in ('submitted', 'under_review') then
    raise exception using errcode = '22023', message = 'APPLICATION_STATE_CONFLICT';
  end if;

  update public.community_applications
  set status = 'more_info_requested',
      assigned_reviewer_id = caller,
      reviewed_at = statement_timestamp()
  where id = target_application_id;

  perform private.write_application_event(
    target_application_id,
    'application.changes_requested',
    application_row.status,
    'more_info_requested',
    applicant_message,
    reviewer_internal_note
  );
  perform private.create_notification(
    application_row.user_id,
    'membership.changes_requested',
    '入群申请需要补充资料',
    'More information is needed',
    applicant_message,
    applicant_message,
    '/community/application'
  );
end;
$$;

create or replace function private.review_community_application(
  target_application_id bigint,
  review_decision text,
  applicant_message text,
  reviewer_internal_note text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  application_row public.community_applications%rowtype;
  safety private.account_safety_profiles%rowtype;
  member_role_id bigint;
begin
  if caller is null or not private.user_has_permission(caller, 'memberships.review') then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;
  if review_decision not in ('approve', 'reject') then
    raise exception using errcode = '22023', message = 'INVALID_REVIEW_DECISION';
  end if;
  if nullif(trim(applicant_message), '') is null then
    raise exception using errcode = '22023', message = 'APPLICANT_MESSAGE_REQUIRED';
  end if;

  select * into application_row
  from public.community_applications ca
  where ca.id = target_application_id
  for update;
  if not found then
    raise exception using errcode = '22023', message = 'APPLICATION_NOT_FOUND';
  end if;
  if application_row.status not in ('submitted', 'under_review') then
    raise exception using errcode = '22023', message = 'APPLICATION_STATE_CONFLICT';
  end if;

  select * into safety
  from private.account_safety_profiles s
  where s.user_id = application_row.user_id
  for update;
  if not found then
    raise exception using errcode = '22023', message = 'ACCOUNT_SAFETY_PROFILE_NOT_FOUND';
  end if;

  if review_decision = 'approve'
     and safety.age_band in ('under_14', 'age_14_17') then
    if safety.guardian_consent_status <> 'verified' then
      raise exception using errcode = '42501', message = 'GUARDIAN_CONSENT_REQUIRED';
    end if;
    if safety.identity_verification_status <> 'verified' then
      raise exception using errcode = '42501', message = 'IDENTITY_VERIFICATION_REQUIRED';
    end if;
  end if;

  if review_decision = 'approve' then
    select r.id into member_role_id
    from public.roles r
    where r.slug = 'community_member' and r.is_active;
    if member_role_id is null then
      raise exception using errcode = '23514', message = 'COMMUNITY_MEMBER_ROLE_NOT_CONFIGURED';
    end if;

    update public.community_applications
    set status = 'approved',
        assigned_reviewer_id = caller,
        reviewed_at = statement_timestamp(),
        decided_by = caller,
        decided_at = statement_timestamp(),
        decision_reason = trim(applicant_message)
    where id = target_application_id;

    insert into public.community_memberships (
      user_id,
      application_id,
      status,
      approved_by,
      approved_at,
      member_since
    ) values (
      application_row.user_id,
      target_application_id,
      'active',
      caller,
      statement_timestamp(),
      current_date
    )
    on conflict (user_id) do update
    set application_id = excluded.application_id,
        status = 'active',
        approved_by = excluded.approved_by,
        approved_at = excluded.approved_at,
        member_since = excluded.member_since,
        suspended_by = null,
        suspended_at = null,
        suspension_reason = null,
        ended_at = null;

    insert into public.user_roles (user_id, role_id, assigned_by)
    values (application_row.user_id, member_role_id, caller)
    on conflict (user_id, role_id) do update
    set assigned_by = excluded.assigned_by,
        assigned_at = statement_timestamp(),
        expires_at = null;

    update public.people
    set joined_at = coalesce(joined_at, current_date),
        is_public = (profile_visibility = 'public')
    where user_id = application_row.user_id;

    perform private.write_application_event(
      target_application_id,
      'application.approved',
      application_row.status,
      'approved',
      applicant_message,
      reviewer_internal_note
    );
    perform private.create_notification(
      application_row.user_id,
      'membership.approved',
      '欢迎进入阿柑少年社群',
      'Welcome to the Rgan Junior community',
      applicant_message,
      applicant_message,
      '/community'
    );
  else
    update public.community_applications
    set status = 'rejected',
        assigned_reviewer_id = caller,
        reviewed_at = statement_timestamp(),
        decided_by = caller,
        decided_at = statement_timestamp(),
        decision_reason = trim(applicant_message)
    where id = target_application_id;

    perform private.write_application_event(
      target_application_id,
      'application.rejected',
      application_row.status,
      'rejected',
      applicant_message,
      reviewer_internal_note
    );
    perform private.create_notification(
      application_row.user_id,
      'membership.rejected',
      '入群申请审核结果',
      'Community application result',
      applicant_message,
      applicant_message,
      '/community/application'
    );
  end if;
end;
$$;

create or replace function private.withdraw_community_application(
  target_application_id bigint
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  previous_status text;
begin
  if caller is null then
    raise exception using errcode = '42501', message = 'AUTH_REQUIRED';
  end if;
  select ca.status into previous_status
  from public.community_applications ca
  where ca.id = target_application_id
    and ca.user_id = caller
  for update;
  if previous_status is null then
    raise exception using errcode = '22023', message = 'APPLICATION_NOT_FOUND';
  end if;
  if previous_status not in (
    'draft', 'pending_guardian', 'submitted',
    'under_review', 'more_info_requested'
  ) then
    raise exception using errcode = '22023', message = 'APPLICATION_STATE_CONFLICT';
  end if;

  update public.community_applications
  set status = 'withdrawn', withdrawn_at = statement_timestamp()
  where id = target_application_id;

  perform private.write_application_event(
    target_application_id,
    'application.withdrawn',
    previous_status,
    'withdrawn'
  );
end;
$$;

create or replace function private.suspend_community_membership(
  target_user_id uuid,
  target_reason text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
begin
  if caller is null or not private.user_has_permission(caller, 'memberships.manage') then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;
  if nullif(trim(target_reason), '') is null then
    raise exception using errcode = '22023', message = 'SUSPENSION_REASON_REQUIRED';
  end if;

  update public.community_memberships
  set status = 'suspended',
      suspended_by = caller,
      suspended_at = statement_timestamp(),
      suspension_reason = trim(target_reason)
  where user_id = target_user_id
    and status = 'active';
  if not found then
    raise exception using errcode = '22023', message = 'ACTIVE_MEMBERSHIP_NOT_FOUND';
  end if;

  delete from public.user_roles ur
  using public.roles r
  where ur.user_id = target_user_id
    and ur.role_id = r.id
    and r.slug in ('community_member', 'facilitator');

  update public.people set is_public = false where user_id = target_user_id;
  perform private.create_notification(
    target_user_id,
    'membership.suspended',
    '社群成员资格已暂停',
    'Community membership suspended',
    target_reason,
    target_reason,
    '/community/application'
  );
end;
$$;

create or replace function private.restore_community_membership(
  target_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  member_role_id bigint;
begin
  if caller is null or not private.user_has_permission(caller, 'memberships.manage') then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;

  update public.community_memberships
  set status = 'active',
      suspended_by = null,
      suspended_at = null,
      suspension_reason = null,
      ended_at = null
  where user_id = target_user_id
    and status = 'suspended';
  if not found then
    raise exception using errcode = '22023', message = 'SUSPENDED_MEMBERSHIP_NOT_FOUND';
  end if;

  select r.id into member_role_id
  from public.roles r
  where r.slug = 'community_member' and r.is_active;
  if member_role_id is null then
    raise exception using errcode = '23514', message = 'COMMUNITY_MEMBER_ROLE_NOT_CONFIGURED';
  end if;

  insert into public.user_roles (user_id, role_id, assigned_by)
  values (target_user_id, member_role_id, caller)
  on conflict (user_id, role_id) do update
  set assigned_by = excluded.assigned_by,
      assigned_at = statement_timestamp(),
      expires_at = null;

  update public.people
  set is_public = (profile_visibility = 'public')
  where user_id = target_user_id;

  perform private.create_notification(
    target_user_id,
    'membership.restored',
    '社群成员资格已恢复',
    'Community membership restored',
    null,
    null,
    '/community'
  );
end;
$$;

create or replace function private.mark_notification_read(target_notification_id bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
begin
  if caller is null then
    raise exception using errcode = '42501', message = 'AUTH_REQUIRED';
  end if;
  update public.notifications
  set read_at = coalesce(read_at, statement_timestamp())
  where id = target_notification_id and user_id = caller;
  if not found then
    raise exception using errcode = '22023', message = 'NOTIFICATION_NOT_FOUND';
  end if;
end;
$$;

-- Replace the destination resolver with application and Membership awareness.
create or replace function private.get_my_community_state()
returns table (
  user_id uuid,
  account_status text,
  onboarding_completed boolean,
  age_band text,
  guardian_consent_status text,
  identity_verification_status text,
  person_id bigint,
  application_status text,
  membership_status text,
  destination text
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
    p.account_status,
    p.onboarding_completed_at is not null,
    s.age_band,
    s.guardian_consent_status,
    s.identity_verification_status,
    pe.id,
    ca.status,
    cm.status,
    case
      when p.account_status <> 'active' then '/community/settings'
      when s.age_band = 'under_14' and s.guardian_consent_status <> 'verified'
        then '/community/guardian-consent'
      when p.onboarding_completed_at is null then '/community/onboarding'
      when cm.status = 'active' then '/community'
      when cm.status = 'suspended' then '/community/application'
      when ca.status in (
        'pending_guardian', 'submitted', 'under_review',
        'more_info_requested', 'approved'
      ) then '/community/application'
      else '/community/apply'
    end
  from public.profiles p
  join private.account_safety_profiles s on s.user_id = p.user_id
  left join public.people pe on pe.user_id = p.user_id
  left join public.community_memberships cm on cm.user_id = p.user_id
  left join lateral (
    select latest.status
    from public.community_applications latest
    where latest.user_id = p.user_id
    order by latest.attempt_number desc
    limit 1
  ) ca on true
  where p.user_id = caller;
end;
$$;

-- Members-only Field Notes require an active Membership, not merely a login.
create or replace function private.can_read_field_note(check_field_note_id bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.field_notes fn
    where fn.id = check_field_note_id
      and (
        (fn.status = 'published' and fn.visibility = 'public')
        or (
          fn.status = 'published'
          and fn.visibility = 'members'
          and private.has_active_membership((select auth.uid()))
        )
        or fn.created_by = (select auth.uid())
        or private.has_permission('field_notes.edit_any')
        or private.has_permission('field_notes.review')
        or private.has_permission('field_notes.approve')
        or private.has_permission('field_notes.publish')
        or private.has_permission('field_notes.archive')
      )
  );
$$;

-- Directory exposure requires an active target Membership. Member-only People
-- also require an active Membership for the caller.
drop policy people_select_anon on public.people;
drop policy people_select_authenticated on public.people;

create policy people_select_anon
on public.people for select
to anon
using (
  is_public
  and profile_visibility = 'public'
  and status = 'active'
  and private.has_active_membership(user_id)
);

create policy people_select_authenticated
on public.people for select
to authenticated
using (
  (
    is_public
    and profile_visibility = 'public'
    and status = 'active'
    and private.has_active_membership(user_id)
  )
  or user_id = (select auth.uid())
  or (
    profile_visibility = 'members'
    and status = 'active'
    and private.has_active_membership(user_id)
    and (select private.has_active_membership((select auth.uid())))
  )
  or private.has_permission('people.read_private')
  or private.has_permission('people.manage')
);

-- Private implementations are executable only through authenticated public wrappers.
revoke all on function private.create_community_application(text, text, text, text, text)
  from public, anon, authenticated;
revoke all on function private.submit_community_application(bigint, text, text, text, text)
  from public, anon, authenticated;
revoke all on function private.get_my_community_application()
  from public, anon, authenticated;
revoke all on function private.list_membership_applications(text[], integer, timestamptz, bigint)
  from public, anon, authenticated;
revoke all on function private.request_application_changes(bigint, text, text)
  from public, anon, authenticated;
revoke all on function private.review_community_application(bigint, text, text, text)
  from public, anon, authenticated;
revoke all on function private.withdraw_community_application(bigint)
  from public, anon, authenticated;
revoke all on function private.suspend_community_membership(uuid, text)
  from public, anon, authenticated;
revoke all on function private.restore_community_membership(uuid)
  from public, anon, authenticated;
revoke all on function private.mark_notification_read(bigint)
  from public, anon, authenticated;

grant execute on function private.create_community_application(text, text, text, text, text)
  to authenticated;
grant execute on function private.submit_community_application(bigint, text, text, text, text)
  to authenticated;
grant execute on function private.get_my_community_application() to authenticated;
grant execute on function private.list_membership_applications(text[], integer, timestamptz, bigint)
  to authenticated;
grant execute on function private.request_application_changes(bigint, text, text)
  to authenticated;
grant execute on function private.review_community_application(bigint, text, text, text)
  to authenticated;
grant execute on function private.withdraw_community_application(bigint) to authenticated;
grant execute on function private.suspend_community_membership(uuid, text) to authenticated;
grant execute on function private.restore_community_membership(uuid) to authenticated;
grant execute on function private.mark_notification_read(bigint) to authenticated;

create function public.create_community_application(
  application_motivation text default '',
  application_hopes text default null,
  application_contribution text default null,
  application_additional_info text default null,
  application_form_version text default 'v1'
)
returns bigint
language sql
security invoker
set search_path = ''
as $$
  select private.create_community_application(
    application_motivation,
    application_hopes,
    application_contribution,
    application_additional_info,
    application_form_version
  );
$$;

create function public.submit_community_application(
  target_application_id bigint,
  application_motivation text,
  application_hopes text default null,
  application_contribution text default null,
  application_additional_info text default null
)
returns text
language sql
security invoker
set search_path = ''
as $$
  select private.submit_community_application(
    target_application_id,
    application_motivation,
    application_hopes,
    application_contribution,
    application_additional_info
  );
$$;

create function public.get_my_community_application()
returns table (
  id bigint,
  attempt_number integer,
  form_version text,
  status text,
  motivation text,
  hopes text,
  contribution text,
  additional_info text,
  submitted_at timestamptz,
  decision_reason text,
  decided_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from private.get_my_community_application();
$$;

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

create function public.request_application_changes(
  target_application_id bigint,
  applicant_message text,
  reviewer_internal_note text default null
)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.request_application_changes(
    target_application_id,
    applicant_message,
    reviewer_internal_note
  );
$$;

create function public.review_community_application(
  target_application_id bigint,
  review_decision text,
  applicant_message text,
  reviewer_internal_note text default null
)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.review_community_application(
    target_application_id,
    review_decision,
    applicant_message,
    reviewer_internal_note
  );
$$;

create function public.withdraw_community_application(target_application_id bigint)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.withdraw_community_application(target_application_id);
$$;

create function public.suspend_community_membership(target_user_id uuid, target_reason text)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.suspend_community_membership(target_user_id, target_reason);
$$;

create function public.restore_community_membership(target_user_id uuid)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.restore_community_membership(target_user_id);
$$;

create function public.mark_notification_read(target_notification_id bigint)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.mark_notification_read(target_notification_id);
$$;

revoke all on function public.create_community_application(text, text, text, text, text)
  from public, anon;
revoke all on function public.submit_community_application(bigint, text, text, text, text)
  from public, anon;
revoke all on function public.get_my_community_application() from public, anon;
revoke all on function public.list_membership_applications(text[], integer, timestamptz, bigint)
  from public, anon;
revoke all on function public.request_application_changes(bigint, text, text)
  from public, anon;
revoke all on function public.review_community_application(bigint, text, text, text)
  from public, anon;
revoke all on function public.withdraw_community_application(bigint) from public, anon;
revoke all on function public.suspend_community_membership(uuid, text) from public, anon;
revoke all on function public.restore_community_membership(uuid) from public, anon;
revoke all on function public.mark_notification_read(bigint) from public, anon;

grant execute on function public.create_community_application(text, text, text, text, text)
  to authenticated;
grant execute on function public.submit_community_application(bigint, text, text, text, text)
  to authenticated;
grant execute on function public.get_my_community_application() to authenticated;
grant execute on function public.list_membership_applications(text[], integer, timestamptz, bigint)
  to authenticated;
grant execute on function public.request_application_changes(bigint, text, text)
  to authenticated;
grant execute on function public.review_community_application(bigint, text, text, text)
  to authenticated;
grant execute on function public.withdraw_community_application(bigint) to authenticated;
grant execute on function public.suspend_community_membership(uuid, text) to authenticated;
grant execute on function public.restore_community_membership(uuid) to authenticated;
grant execute on function public.mark_notification_read(bigint) to authenticated;

comment on table public.community_applications is
  'Versioned community-entry attempts; applicants keep their accounts after rejection.';
comment on table public.community_memberships is
  'Business record of approved community access, separate from permission-bundle roles.';
comment on table private.community_application_events is
  'Append-only public/internal state-transition history for community applications.';
comment on table public.notifications is
  'User-owned in-app notifications created only through trusted database workflows.';
