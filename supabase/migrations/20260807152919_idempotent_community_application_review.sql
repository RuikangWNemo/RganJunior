-- Make terminal membership-review retries safe while preserving the rule that
-- an approved decision cannot be reversed into a rejection (or vice versa).
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
  target_terminal_status text;
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

  target_terminal_status := case review_decision
    when 'approve' then 'approved'
    else 'rejected'
  end;

  select * into application_row
  from public.community_applications ca
  where ca.id = target_application_id
  for update;
  if not found then
    raise exception using errcode = '22023', message = 'APPLICATION_NOT_FOUND';
  end if;

  -- A browser retry after a committed response is a successful no-op. An
  -- opposite decision still fails so terminal decisions cannot be reversed.
  if application_row.status in ('approved', 'rejected') then
    if application_row.status = target_terminal_status then
      return;
    end if;
    raise exception using errcode = '22023', message = 'APPLICATION_STATE_CONFLICT';
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
