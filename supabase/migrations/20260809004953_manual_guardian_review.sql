-- Staff-led Guardian confirmation for under-14 applicants.
-- Automated invite/OTP functions remain intact for a future flow mode.

alter table private.guardian_consents
  alter column otp_challenge_id drop not null,
  add column verification_method text not null default 'otp',
  add column recorded_by uuid references auth.users(id) on delete restrict,
  add column verification_basis text,
  add column reviewer_note text;

alter table private.guardian_consents
  add constraint guardian_consents_verification_method_check check (
    verification_method in (
      'otp', 'manual_phone', 'manual_email', 'manual_video',
      'manual_in_person', 'trusted_offline_relationship', 'other'
    )
  ),
  add constraint guardian_consents_verification_provenance_check check (
    (
      verification_method = 'otp'
      and otp_challenge_id is not null
      and recorded_by is null
      and verification_basis is null
      and reviewer_note is null
    )
    or (
      verification_method <> 'otp'
      and otp_challenge_id is null
      and recorded_by is not null
      and length(trim(verification_basis)) between 5 and 500
      and (
        reviewer_note is null
        or length(trim(reviewer_note)) between 1 and 1000
      )
    )
  );

create index guardian_consents_recorded_by_idx
  on private.guardian_consents (recorded_by, consented_at desc)
  where recorded_by is not null;

create or replace function private.get_manual_guardian_review_server(
  target_application_id bigint,
  target_actor_user_id uuid
)
returns table (
  request_id uuid,
  request_status text,
  guardian_name text,
  guardian_relationship text,
  contact_channel text,
  contact_ciphertext text,
  contact_last4 text,
  legal_document_id bigint,
  document_key text,
  document_version integer,
  document_locale text,
  document_title text,
  document_status text,
  document_effective_at timestamptz,
  request_created_at timestamptz,
  consented_at timestamptz,
  verification_method text,
  verification_basis text,
  reviewer_note text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  application_user_id uuid;
  application_age_band text;
begin
  perform private.require_service_role();
  if target_actor_user_id is null
     or not private.user_has_permission(
       target_actor_user_id,
       'memberships.review_sensitive'
     ) then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;

  select ca.user_id, safety.age_band
  into application_user_id, application_age_band
  from public.community_applications ca
  join private.account_safety_profiles safety on safety.user_id = ca.user_id
  where ca.id = target_application_id;
  if not found then
    raise exception using errcode = '22023', message = 'APPLICATION_NOT_FOUND';
  end if;
  if application_age_band <> 'under_14' then
    raise exception using errcode = '22023', message = 'UNDER_14_APPLICATION_REQUIRED';
  end if;

  return query
  select
    request.id,
    request.status,
    request.guardian_name,
    request.guardian_relationship,
    request.contact_channel,
    request.contact_ciphertext,
    request.contact_last4,
    document.id,
    document.document_key,
    document.version,
    document.locale,
    document.title,
    document.status,
    document.effective_at,
    request.created_at,
    consent.consented_at,
    consent.verification_method,
    consent.verification_basis,
    consent.reviewer_note
  from private.guardian_consent_requests request
  join public.legal_documents document on document.id = request.legal_document_id
  left join private.guardian_consents consent on consent.request_id = request.id
  where request.minor_user_id = application_user_id
    and request.application_id = target_application_id
  order by request.created_at desc, request.id desc
  limit 1;
end;
$$;

-- Guardian withdrawal only gates Membership for the under-14 policy band.
create or replace function private.withdraw_guardian_consent_server(
  target_request_id uuid,
  target_withdrawal_verification_hash text,
  target_reason text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_row private.guardian_consent_requests%rowtype;
  application_row public.community_applications%rowtype;
  safety_age_band text;
begin
  perform private.require_service_role();
  if target_withdrawal_verification_hash !~ '^[0-9a-f]{32,128}$'
     or nullif(trim(target_reason), '') is null then
    raise exception using errcode = '22023', message = 'WITHDRAWAL_EVIDENCE_REQUIRED';
  end if;

  select * into request_row
  from private.guardian_consent_requests request
  where request.id = target_request_id and request.status = 'verified'
  for update;
  if not found then
    raise exception using errcode = '22023', message = 'VERIFIED_CONSENT_NOT_FOUND';
  end if;
  if not exists (
    select 1
    from private.guardian_consents consent
    where consent.request_id = request_row.id and consent.withdrawn_at is null
    for update
  ) then
    raise exception using errcode = '22023', message = 'VERIFIED_CONSENT_NOT_FOUND';
  end if;

  update private.guardian_consents
  set withdrawn_at = statement_timestamp(),
      withdrawal_reason = trim(target_reason),
      withdrawal_verification_hash = target_withdrawal_verification_hash
  where request_id = request_row.id;
  update private.guardian_consent_requests
  set status = 'withdrawn', responded_at = statement_timestamp()
  where id = request_row.id;
  update private.account_safety_profiles
  set guardian_consent_status = 'withdrawn'
  where user_id = request_row.minor_user_id
  returning age_band into safety_age_band;

  if safety_age_band = 'under_14' then
    select * into application_row
    from public.community_applications application
    where application.user_id = request_row.minor_user_id
      and application.status in ('submitted', 'under_review', 'more_info_requested')
    order by application.attempt_number desc
    limit 1
    for update;
    if found then
      update public.community_applications
      set status = 'pending_guardian',
          submitted_at = null,
          assigned_reviewer_id = null,
          reviewed_at = null
      where id = application_row.id;
      perform private.write_application_event(
        application_row.id,
        'application.guardian_withdrawn',
        application_row.status,
        'pending_guardian'
      );
    end if;

    perform private.suspend_minor_membership(
      request_row.minor_user_id,
      'guardian_consent',
      '监护人已撤回知情同意。'
    );
  end if;

  perform private.create_notification(
    request_row.minor_user_id,
    'guardian_consent.withdrawn',
    '监护人知情同意已撤回',
    'Guardian consent was withdrawn',
    case when safety_age_band = 'under_14'
      then '内部社群能力已暂停；基础账号仍然保留。'
      else '记录已更新；当前普通审核或成员资格不受影响。'
    end,
    case when safety_age_band = 'under_14'
      then 'Internal community access is paused; the base account remains available.'
      else 'The record was updated; ordinary review or Membership is unchanged.'
    end,
    '/community/application'
  );
  perform private.write_guardian_consent_event(
    request_row.id,
    request_row.minor_user_id,
    'guardian.consent_withdrawn'
  );
end;
$$;

create or replace function private.record_manual_guardian_confirmation_server(
  target_application_id bigint,
  target_actor_user_id uuid,
  target_verification_method text,
  target_confirmed_at timestamptz,
  affirmed_guardianship boolean,
  affirmed_notice_read boolean,
  affirmed_joining boolean,
  target_verification_basis text,
  target_reviewer_note text default null
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  application_row public.community_applications%rowtype;
  safety private.account_safety_profiles%rowtype;
  request_row private.guardian_consent_requests%rowtype;
  document_row public.legal_documents%rowtype;
  existing_consent private.guardian_consents%rowtype;
  consent_id bigint;
  identity_verification_id bigint;
  normalized_basis text := nullif(trim(target_verification_basis), '');
  normalized_note text := nullif(trim(target_reviewer_note), '');
begin
  perform private.require_service_role();
  if target_actor_user_id is null
     or not private.user_has_permission(
       target_actor_user_id,
       'memberships.review_sensitive'
     ) then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;
  if target_verification_method not in (
    'manual_phone', 'manual_email', 'manual_video',
    'manual_in_person', 'trusted_offline_relationship', 'other'
  ) then
    raise exception using errcode = '22023', message = 'INVALID_VERIFICATION_METHOD';
  end if;
  if not coalesce(affirmed_guardianship, false)
     or not coalesce(affirmed_notice_read, false)
     or not coalesce(affirmed_joining, false) then
    raise exception using errcode = '22023', message = 'GUARDIAN_AFFIRMATIONS_REQUIRED';
  end if;
  if normalized_basis is null or length(normalized_basis) > 500 then
    raise exception using errcode = '22023', message = 'VERIFICATION_BASIS_REQUIRED';
  end if;
  if normalized_note is not null and length(normalized_note) > 1000 then
    raise exception using errcode = '22023', message = 'REVIEWER_NOTE_TOO_LONG';
  end if;
  if target_confirmed_at is null
     or target_confirmed_at < statement_timestamp() - interval '30 days'
     or target_confirmed_at > statement_timestamp() + interval '5 minutes' then
    raise exception using errcode = '22023', message = 'INVALID_CONFIRMATION_TIME';
  end if;

  select * into application_row
  from public.community_applications application
  where application.id = target_application_id
  for update;
  if not found then
    raise exception using errcode = '22023', message = 'APPLICATION_NOT_FOUND';
  end if;

  select * into safety
  from private.account_safety_profiles profile
  where profile.user_id = application_row.user_id
  for update;
  if not found or safety.age_band <> 'under_14' then
    raise exception using errcode = '22023', message = 'UNDER_14_APPLICATION_REQUIRED';
  end if;

  select * into request_row
  from private.guardian_consent_requests request
  where request.minor_user_id = application_row.user_id
    and request.application_id = target_application_id
  order by request.created_at desc, request.id desc
  limit 1
  for update;
  if not found then
    raise exception using errcode = '22023', message = 'GUARDIAN_REQUEST_REQUIRED';
  end if;

  select * into existing_consent
  from private.guardian_consents consent
  where consent.request_id = request_row.id;
  if found then
    if request_row.status = 'verified'
       and existing_consent.withdrawn_at is null
       and existing_consent.verification_method <> 'otp' then
      return existing_consent.id;
    end if;
    raise exception using errcode = '22023', message = 'GUARDIAN_CONFIRMATION_STATE_CONFLICT';
  end if;
  if request_row.status <> 'pending'
     or request_row.expires_at <= statement_timestamp() then
    raise exception using errcode = '22023', message = 'GUARDIAN_REQUEST_NOT_PENDING';
  end if;

  select * into document_row
  from public.legal_documents document
  where document.id = request_row.legal_document_id
  for share;
  if not found
     or document_row.document_type <> 'guardian_informed_consent'
     or document_row.status <> 'active'
     or document_row.effective_at is null
     or document_row.effective_at > target_confirmed_at then
    raise exception using errcode = '42501', message = 'GUARDIAN_LEGAL_DOCUMENT_NOT_ACTIVE';
  end if;

  update private.guardian_consent_requests
  set status = 'verified', responded_at = target_confirmed_at
  where id = request_row.id;

  insert into private.guardian_consents (
    request_id,
    minor_user_id,
    legal_document_id,
    otp_challenge_id,
    guardian_name,
    guardian_relationship,
    guardian_phone_last4,
    affirmed_guardianship,
    affirmed_notice_read,
    affirmed_joining,
    consented_at,
    verification_method,
    recorded_by,
    verification_basis,
    reviewer_note
  ) values (
    request_row.id,
    request_row.minor_user_id,
    request_row.legal_document_id,
    null,
    request_row.guardian_name,
    request_row.guardian_relationship,
    request_row.contact_last4,
    true,
    true,
    true,
    target_confirmed_at,
    target_verification_method,
    target_actor_user_id,
    normalized_basis,
    normalized_note
  ) returning id into consent_id;

  insert into private.minor_identity_verifications (
    minor_user_id,
    application_id,
    status,
    verification_method,
    evidence_reference_hash,
    reviewed_by,
    reviewer_note,
    reviewed_at
  ) values (
    request_row.minor_user_id,
    target_application_id,
    'verified',
    'guardian_attestation',
    null,
    target_actor_user_id,
    left(
      normalized_basis
      || coalesce(' — ' || normalized_note, ''),
      1000
    ),
    target_confirmed_at
  ) returning id into identity_verification_id;

  update private.account_safety_profiles
  set guardian_consent_status = 'verified',
      identity_verification_status = 'verified'
  where user_id = request_row.minor_user_id;

  if application_row.status = 'pending_guardian' then
    update public.community_applications
    set status = 'submitted',
        submitted_at = coalesce(submitted_at, statement_timestamp())
    where id = target_application_id;
    perform private.write_application_event(
      target_application_id,
      'application.guardian_verified',
      'pending_guardian',
      'submitted'
    );
  elsif application_row.status not in ('submitted', 'under_review') then
    raise exception using errcode = '22023', message = 'APPLICATION_STATE_CONFLICT';
  end if;

  insert into private.guardian_consent_events (
    request_id,
    minor_user_id,
    actor_user_id,
    event_type,
    metadata
  ) values (
    request_row.id,
    request_row.minor_user_id,
    target_actor_user_id,
    'guardian.consent_verified_manual',
    jsonb_build_object(
      'consent_id', consent_id,
      'identity_verification_id', identity_verification_id,
      'verification_method', target_verification_method,
      'legal_document_id', request_row.legal_document_id,
      'recorded_by', target_actor_user_id
    )
  );
  perform private.create_notification(
    request_row.minor_user_id,
    'guardian_consent.verified',
    '监护人知情确认已完成',
    'Guardian confirmation completed',
    '申请已进入工作人员审核队列。',
    'Your application has entered the staff review queue.',
    '/community/application'
  );

  return consent_id;
end;
$$;

create or replace function private.decline_manual_guardian_confirmation_server(
  target_application_id bigint,
  target_actor_user_id uuid,
  target_reason text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  application_row public.community_applications%rowtype;
  safety private.account_safety_profiles%rowtype;
  request_row private.guardian_consent_requests%rowtype;
  normalized_reason text := nullif(trim(target_reason), '');
begin
  perform private.require_service_role();
  if target_actor_user_id is null
     or not private.user_has_permission(
       target_actor_user_id,
       'memberships.review_sensitive'
     ) then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;
  if normalized_reason is null or length(normalized_reason) > 500 then
    raise exception using errcode = '22023', message = 'DECLINE_REASON_REQUIRED';
  end if;

  select * into application_row
  from public.community_applications application
  where application.id = target_application_id
  for update;
  if not found then
    raise exception using errcode = '22023', message = 'APPLICATION_NOT_FOUND';
  end if;
  select * into safety
  from private.account_safety_profiles profile
  where profile.user_id = application_row.user_id
  for update;
  if not found or safety.age_band <> 'under_14' then
    raise exception using errcode = '22023', message = 'UNDER_14_APPLICATION_REQUIRED';
  end if;

  select * into request_row
  from private.guardian_consent_requests request
  where request.minor_user_id = application_row.user_id
    and request.application_id = target_application_id
  order by request.created_at desc, request.id desc
  limit 1
  for update;
  if not found then
    raise exception using errcode = '22023', message = 'GUARDIAN_REQUEST_REQUIRED';
  end if;
  if request_row.status = 'declined' then
    return;
  end if;
  if request_row.status <> 'pending' then
    raise exception using errcode = '22023', message = 'GUARDIAN_CONFIRMATION_STATE_CONFLICT';
  end if;

  update private.guardian_consent_requests
  set status = 'declined', responded_at = statement_timestamp()
  where id = request_row.id;
  update private.account_safety_profiles
  set guardian_consent_status = 'required'
  where user_id = request_row.minor_user_id;

  insert into private.guardian_consent_events (
    request_id,
    minor_user_id,
    actor_user_id,
    event_type,
    metadata
  ) values (
    request_row.id,
    request_row.minor_user_id,
    target_actor_user_id,
    'guardian.consent_declined_manual',
    jsonb_build_object(
      'recorded_by', target_actor_user_id,
      'reason_length', length(normalized_reason)
    )
  );
  perform private.create_notification(
    request_row.minor_user_id,
    'guardian_consent.declined',
    '监护人确认尚未完成',
    'Guardian confirmation is not complete',
    '请等待工作人员联系并说明后续步骤。',
    'Please wait for staff to explain the next steps.',
    '/community/application'
  );
end;
$$;

revoke all on function private.get_manual_guardian_review_server(bigint, uuid)
  from public, anon, authenticated;
revoke all on function private.record_manual_guardian_confirmation_server(
  bigint, uuid, text, timestamptz, boolean, boolean, boolean, text, text
) from public, anon, authenticated;
revoke all on function private.decline_manual_guardian_confirmation_server(
  bigint, uuid, text
) from public, anon, authenticated;
grant execute on function private.get_manual_guardian_review_server(bigint, uuid)
  to service_role;
grant execute on function private.record_manual_guardian_confirmation_server(
  bigint, uuid, text, timestamptz, boolean, boolean, boolean, text, text
) to service_role;
grant execute on function private.decline_manual_guardian_confirmation_server(
  bigint, uuid, text
) to service_role;

create function public.get_manual_guardian_review_server(
  target_application_id bigint,
  target_actor_user_id uuid
)
returns table (
  request_id uuid,
  request_status text,
  guardian_name text,
  guardian_relationship text,
  contact_channel text,
  contact_ciphertext text,
  contact_last4 text,
  legal_document_id bigint,
  document_key text,
  document_version integer,
  document_locale text,
  document_title text,
  document_status text,
  document_effective_at timestamptz,
  request_created_at timestamptz,
  consented_at timestamptz,
  verification_method text,
  verification_basis text,
  reviewer_note text
)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from private.get_manual_guardian_review_server(
    target_application_id,
    target_actor_user_id
  );
$$;

create function public.record_manual_guardian_confirmation_server(
  target_application_id bigint,
  target_actor_user_id uuid,
  target_verification_method text,
  target_confirmed_at timestamptz,
  affirmed_guardianship boolean,
  affirmed_notice_read boolean,
  affirmed_joining boolean,
  target_verification_basis text,
  target_reviewer_note text default null
)
returns bigint
language sql
security invoker
set search_path = ''
as $$
  select private.record_manual_guardian_confirmation_server(
    target_application_id,
    target_actor_user_id,
    target_verification_method,
    target_confirmed_at,
    affirmed_guardianship,
    affirmed_notice_read,
    affirmed_joining,
    target_verification_basis,
    target_reviewer_note
  );
$$;

create function public.decline_manual_guardian_confirmation_server(
  target_application_id bigint,
  target_actor_user_id uuid,
  target_reason text
)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.decline_manual_guardian_confirmation_server(
    target_application_id,
    target_actor_user_id,
    target_reason
  );
$$;

revoke all on function public.get_manual_guardian_review_server(bigint, uuid)
  from public, anon, authenticated;
revoke all on function public.record_manual_guardian_confirmation_server(
  bigint, uuid, text, timestamptz, boolean, boolean, boolean, text, text
) from public, anon, authenticated;
revoke all on function public.decline_manual_guardian_confirmation_server(
  bigint, uuid, text
) from public, anon, authenticated;
grant execute on function public.get_manual_guardian_review_server(bigint, uuid)
  to service_role;
grant execute on function public.record_manual_guardian_confirmation_server(
  bigint, uuid, text, timestamptz, boolean, boolean, boolean, text, text
) to service_role;
grant execute on function public.decline_manual_guardian_confirmation_server(
  bigint, uuid, text
) to service_role;

comment on function public.get_manual_guardian_review_server(bigint, uuid) is
  'Server-only, permission-checked Guardian contact projection for manual staff review.';
comment on function public.record_manual_guardian_confirmation_server(
  bigint, uuid, text, timestamptz, boolean, boolean, boolean, text, text
) is 'Server-only atomic manual Guardian confirmation; never approves Membership.';

-- Approved age-routing and safety-gate overrides.

create or replace function private.complete_community_onboarding(
  account_username text,
  person_display_name text,
  person_name_zh text default null,
  person_name_en text default null,
  person_nature_name text default null,
  person_bio text default null,
  person_avatar_media_id bigint default null,
  person_city text default null,
  person_region text default null,
  person_country text default null,
  requested_profile_visibility text default 'private',
  requested_show_real_name boolean default false,
  requested_allow_messages boolean default true,
  requested_language text default 'zh',
  requested_timezone text default 'Asia/Shanghai'
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  normalized_username text := lower(trim(account_username));
  normalized_display_name text := trim(person_display_name);
  normalized_name_zh text := nullif(trim(person_name_zh), '');
  normalized_name_en text := nullif(trim(person_name_en), '');
  safety private.account_safety_profiles%rowtype;
  created_person_id bigint;
  generated_slug text;
begin
  if caller is null then
    raise exception using errcode = '42501', message = 'AUTH_REQUIRED';
  end if;

  select * into safety
  from private.account_safety_profiles s
  where s.user_id = caller
  for update;

  if not found then
    raise exception using errcode = '22023', message = 'ACCOUNT_SAFETY_PROFILE_NOT_FOUND';
  end if;
  if normalized_username !~ '^[a-z0-9][a-z0-9_-]{2,31}$' then
    raise exception using errcode = '22023', message = 'INVALID_USERNAME';
  end if;
  if coalesce(normalized_display_name, '') = '' then
    raise exception using errcode = '22023', message = 'DISPLAY_NAME_REQUIRED';
  end if;
  if normalized_name_zh is null and normalized_name_en is null then
    raise exception using errcode = '22023', message = 'PERSON_NAME_REQUIRED';
  end if;
  if requested_profile_visibility not in ('private', 'members', 'public') then
    raise exception using errcode = '22023', message = 'INVALID_PROFILE_VISIBILITY';
  end if;
  if requested_language not in ('zh', 'en') then
    raise exception using errcode = '22023', message = 'INVALID_LANGUAGE';
  end if;
  if not private.is_valid_timezone(requested_timezone) then
    raise exception using errcode = '22023', message = 'INVALID_TIMEZONE';
  end if;

  generated_slug := regexp_replace(normalized_username, '_', '-', 'g')
    || '-' || left(replace(caller::text, '-', ''), 8);

  update public.profiles p
  set username = normalized_username,
      display_name = normalized_display_name,
      avatar_media_id = person_avatar_media_id,
      bio = nullif(trim(person_bio), ''),
      city = nullif(trim(person_city), ''),
      region = nullif(trim(person_region), ''),
      country = nullif(trim(person_country), ''),
      preferred_language = requested_language,
      timezone = requested_timezone,
      onboarding_completed_at = coalesce(p.onboarding_completed_at, statement_timestamp())
  where p.user_id = caller
    and p.account_status = 'active';

  if not found then
    raise exception using errcode = '42501', message = 'ACCOUNT_NOT_ACTIVE';
  end if;

  insert into public.people (
    user_id,
    slug,
    display_name,
    name_zh,
    name_en,
    full_name_private,
    nature_name,
    bio,
    avatar_media_id,
    city,
    region,
    country,
    profile_visibility,
    show_real_name,
    is_public,
    status
  ) values (
    caller,
    generated_slug,
    normalized_display_name,
    normalized_name_zh,
    normalized_name_en,
    coalesce(normalized_name_zh, normalized_name_en),
    nullif(trim(person_nature_name), ''),
    nullif(trim(person_bio), ''),
    person_avatar_media_id,
    nullif(trim(person_city), ''),
    nullif(trim(person_region), ''),
    nullif(trim(person_country), ''),
    requested_profile_visibility,
    requested_show_real_name,
    false,
    'active'
  )
  on conflict (user_id) do update
  set display_name = excluded.display_name,
      name_zh = excluded.name_zh,
      name_en = excluded.name_en,
      full_name_private = excluded.full_name_private,
      nature_name = excluded.nature_name,
      bio = excluded.bio,
      avatar_media_id = excluded.avatar_media_id,
      city = excluded.city,
      region = excluded.region,
      country = excluded.country,
      profile_visibility = excluded.profile_visibility,
      show_real_name = excluded.show_real_name
  returning id into created_person_id;

  update public.user_settings
  set allow_messages = requested_allow_messages
  where user_id = caller;

  return created_person_id;
exception
  when unique_violation then
    raise exception using errcode = '23505', message = 'USERNAME_NOT_AVAILABLE';
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
    when safety.age_band = 'under_14'
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
     and safety.age_band = 'under_14'
     and safety.guardian_consent_status <> 'verified' then
    raise exception using errcode = '42501', message = 'GUARDIAN_CONSENT_REQUIRED';
  end if;
  if review_decision = 'approve'
     and safety.age_band in ('under_14', 'age_14_17')
     and safety.identity_verification_status <> 'verified' then
    raise exception using errcode = '42501', message = 'IDENTITY_VERIFICATION_REQUIRED';
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

create or replace function private.review_minor_identity_verification(
  target_minor_user_id uuid,
  review_decision text,
  target_verification_method text,
  target_reviewer_note text,
  target_evidence_reference_hash text default null
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  safety private.account_safety_profiles%rowtype;
  latest_application_id bigint;
  verification_id bigint;
  next_status text;
begin
  if caller is null
     or not private.user_has_permission(caller, 'memberships.review_sensitive') then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;
  if review_decision not in ('verify', 'reject') then
    raise exception using errcode = '22023', message = 'INVALID_IDENTITY_DECISION';
  end if;
  if target_verification_method not in (
    'guardian_attestation', 'manual_document_review',
    'trusted_offline_relationship', 'other'
  ) then
    raise exception using errcode = '22023', message = 'INVALID_VERIFICATION_METHOD';
  end if;
  if nullif(trim(target_reviewer_note), '') is null then
    raise exception using errcode = '22023', message = 'REVIEWER_NOTE_REQUIRED';
  end if;
  if target_evidence_reference_hash is not null
     and target_evidence_reference_hash !~ '^[0-9a-f]{32,128}$' then
    raise exception using errcode = '22023', message = 'INVALID_EVIDENCE_REFERENCE';
  end if;

  select * into safety
  from private.account_safety_profiles s
  where s.user_id = target_minor_user_id
  for update;
  if not found or safety.age_band not in ('under_14', 'age_14_17') then
    raise exception using errcode = '22023', message = 'MINOR_ACCOUNT_REQUIRED';
  end if;
  if review_decision = 'verify'
     and safety.age_band = 'under_14'
     and safety.guardian_consent_status <> 'verified' then
    raise exception using errcode = '42501', message = 'GUARDIAN_CONSENT_REQUIRED';
  end if;

  select ca.id into latest_application_id
  from public.community_applications ca
  where ca.user_id = target_minor_user_id
  order by ca.attempt_number desc
  limit 1;

  next_status := case when review_decision = 'verify' then 'verified' else 'rejected' end;
  insert into private.minor_identity_verifications (
    minor_user_id,
    application_id,
    status,
    verification_method,
    evidence_reference_hash,
    reviewed_by,
    reviewer_note
  ) values (
    target_minor_user_id,
    latest_application_id,
    next_status,
    target_verification_method,
    target_evidence_reference_hash,
    caller,
    trim(target_reviewer_note)
  )
  returning id into verification_id;

  update private.account_safety_profiles
  set identity_verification_status = next_status
  where user_id = target_minor_user_id;

  if next_status = 'rejected' then
    perform private.suspend_minor_membership(
      target_minor_user_id,
      'identity_verification',
      '未成年人身份核验状态不再满足社群要求。'
    );
  else
    perform private.restore_minor_membership_if_eligible(target_minor_user_id);
  end if;

  perform private.create_notification(
    target_minor_user_id,
    'identity_verification.' || next_status,
    case
      when next_status = 'verified' then '身份核验已完成'
      else '身份核验需要重新处理'
    end,
    case
      when next_status = 'verified' then 'Identity verification completed'
      else 'Identity verification needs attention'
    end,
    case
      when next_status = 'verified' then '你的社群申请可以继续审核。'
      else '请等待工作人员联系并说明后续步骤。'
    end,
    case
      when next_status = 'verified' then 'Your community application can continue.'
      else 'Please wait for staff to explain the next steps.'
    end,
    '/community/application'
  );
  perform private.write_guardian_consent_event(
    null,
    target_minor_user_id,
    'minor_identity.' || next_status,
    jsonb_build_object(
      'verification_id', verification_id,
      'verification_method', target_verification_method
    )
  );
  return verification_id;
end;
$$;

create or replace function private.get_my_guardian_consent_state()
returns table (
  age_band text,
  guardian_consent_status text,
  identity_verification_status text,
  latest_request_id uuid,
  latest_request_status text,
  latest_request_expires_at timestamptz,
  legal_document_id bigint,
  legal_document_title text,
  can_complete_onboarding boolean,
  eligible_for_membership_approval boolean
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
    s.age_band,
    s.guardian_consent_status,
    s.identity_verification_status,
    gr.id,
    case
      when gr.status in ('pending', 'otp_pending')
        and gr.expires_at <= statement_timestamp() then 'expired'
      else gr.status
    end,
    gr.expires_at,
    ld.id,
    ld.title,
    true,
    s.age_band = 'adult_18_plus'
      or (
        s.age_band = 'age_14_17'
        and s.identity_verification_status = 'verified'
      )
      or (
        s.age_band = 'under_14'
        and s.guardian_consent_status = 'verified'
        and s.identity_verification_status = 'verified'
      )
  from private.account_safety_profiles s
  left join lateral (
    select latest.*
    from private.guardian_consent_requests latest
    where latest.minor_user_id = s.user_id
    order by latest.created_at desc, latest.id desc
    limit 1
  ) gr on true
  left join public.legal_documents ld on ld.id = gr.legal_document_id
  where s.user_id = caller;
end;
$$;

create or replace function private.restore_minor_membership_if_eligible(
  target_user_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  member_role_id bigint;
  membership_changed boolean := false;
begin
  if not exists (
    select 1
    from private.account_safety_profiles s
    join public.profiles p on p.user_id = s.user_id
    where s.user_id = target_user_id
      and (
        (
          s.age_band = 'under_14'
          and s.guardian_consent_status = 'verified'
          and s.identity_verification_status = 'verified'
        )
        or (
          s.age_band = 'age_14_17'
          and s.identity_verification_status = 'verified'
        )
      )
      and p.account_status = 'active'
  ) then
    return false;
  end if;

  update public.community_memberships
  set status = 'active',
      suspended_by = null,
      suspended_at = null,
      suspension_reason = null,
      suspension_source = null,
      ended_at = null
  where user_id = target_user_id
    and status = 'suspended'
    and suspension_source in ('guardian_consent', 'identity_verification');
  membership_changed := found;

  if membership_changed then
    select r.id into member_role_id
    from public.roles r
    where r.slug = 'community_member' and r.is_active;
    if member_role_id is null then
      raise exception using errcode = '23514', message = 'COMMUNITY_MEMBER_ROLE_NOT_CONFIGURED';
    end if;

    insert into public.user_roles (user_id, role_id, assigned_by)
    values (target_user_id, member_role_id, (select auth.uid()))
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
      '监护人同意与身份核验状态已满足要求。',
      'Guardian consent and identity verification requirements are satisfied.',
      '/community'
    );
  end if;
  return membership_changed;
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
  safety private.account_safety_profiles%rowtype;
begin
  if caller is null or not private.user_has_permission(caller, 'memberships.manage') then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;

  select * into safety
  from private.account_safety_profiles s
  where s.user_id = target_user_id;
  if not found then
    raise exception using errcode = '22023', message = 'ACCOUNT_SAFETY_PROFILE_NOT_FOUND';
  end if;
  if safety.age_band = 'under_14'
     and (
       safety.guardian_consent_status <> 'verified'
       or safety.identity_verification_status <> 'verified'
     ) then
    raise exception using errcode = '42501', message = 'MINOR_SAFETY_REQUIREMENTS_NOT_MET';
  end if;
  if safety.age_band = 'age_14_17'
     and safety.identity_verification_status <> 'verified' then
    raise exception using errcode = '42501', message = 'MINOR_SAFETY_REQUIREMENTS_NOT_MET';
  end if;

  update public.community_memberships
  set status = 'active',
      suspended_by = null,
      suspended_at = null,
      suspension_reason = null,
      suspension_source = null,
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
