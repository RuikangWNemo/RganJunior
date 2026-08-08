-- Versioned guardian informed consent, OTP evidence, and minor identity review.

create table public.legal_documents (
  id bigint generated always as identity primary key,
  document_key text not null,
  version integer not null check (version > 0),
  locale text not null default 'zh-CN',
  document_type text not null,
  title text not null,
  summary text not null,
  body_markdown text not null,
  content_sha256 text not null,
  status text not null default 'draft',
  is_material_change boolean not null default true,
  effective_at timestamptz,
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint legal_documents_key_check check (
    document_key ~ '^[a-z][a-z0-9_.-]*$'
  ),
  constraint legal_documents_locale_check check (
    locale ~ '^[a-z]{2}(-[A-Z]{2})?$'
  ),
  constraint legal_documents_type_check check (
    document_type in (
      'guardian_informed_consent',
      'youth_privacy_notice',
      'community_rules'
    )
  ),
  constraint legal_documents_status_check check (
    status in ('draft', 'active', 'retired')
  ),
  constraint legal_documents_hash_check check (
    content_sha256 ~ '^[0-9a-f]{64}$'
  ),
  constraint legal_documents_publication_check check (
    status <> 'active'
    or (
      effective_at is not null
      and published_at is not null
    )
  ),
  constraint legal_documents_version_unique unique (
    document_key, version, locale
  )
);

create unique index legal_documents_one_active_idx
  on public.legal_documents (document_key, locale)
  where status = 'active';
create index legal_documents_public_idx
  on public.legal_documents (document_type, locale, effective_at desc, id desc)
  where status = 'active';
create index legal_documents_created_by_idx
  on public.legal_documents (created_by, created_at desc)
  where created_by is not null;

create table private.guardian_consent_requests (
  id uuid primary key default gen_random_uuid(),
  minor_user_id uuid not null references auth.users(id) on delete cascade,
  application_id bigint references public.community_applications(id) on delete set null,
  legal_document_id bigint not null references public.legal_documents(id) on delete restrict,
  guardian_name text not null,
  guardian_relationship text not null,
  contact_channel text not null,
  contact_ciphertext text not null,
  contact_lookup_hash text not null,
  contact_last4 text not null,
  token_hash text not null unique,
  status text not null default 'pending',
  otp_send_count integer not null default 0,
  otp_verify_attempts integer not null default 0,
  max_otp_sends integer not null default 5,
  max_otp_attempts integer not null default 8,
  expires_at timestamptz not null,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint guardian_consent_requests_status_check check (
    status in (
      'pending', 'otp_pending', 'verified', 'declined',
      'withdrawn', 'revoked', 'expired'
    )
  ),
  constraint guardian_consent_requests_channel_check check (
    contact_channel in ('email', 'phone')
  ),
  constraint guardian_consent_requests_contact_hash_check check (
    contact_lookup_hash ~ '^[0-9a-f]{64}$'
  ),
  constraint guardian_consent_requests_token_hash_check check (
    token_hash ~ '^[0-9a-f]{64}$'
  ),
  constraint guardian_consent_requests_attempts_check check (
    otp_send_count >= 0
    and otp_verify_attempts >= 0
    and max_otp_sends between 1 and 10
    and max_otp_attempts between 1 and 20
  ),
  constraint guardian_consent_requests_expiry_check check (
    expires_at > created_at
  )
);

create unique index guardian_consent_requests_one_pending_idx
  on private.guardian_consent_requests (minor_user_id)
  where status in ('pending', 'otp_pending');
create index guardian_consent_requests_application_idx
  on private.guardian_consent_requests (application_id, created_at desc)
  where application_id is not null;
create index guardian_consent_requests_document_idx
  on private.guardian_consent_requests (legal_document_id, created_at desc);
create index guardian_consent_requests_expiry_idx
  on private.guardian_consent_requests (expires_at)
  where status in ('pending', 'otp_pending');

create table private.guardian_otp_challenges (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null
    references private.guardian_consent_requests(id) on delete cascade,
  otp_hash text not null,
  verification_phone_ciphertext text not null,
  verification_phone_lookup_hash text not null,
  verification_phone_last4 text not null,
  provider_delivery_hash text,
  status text not null default 'pending',
  attempt_count integer not null default 0,
  max_attempts integer not null default 5,
  expires_at timestamptz not null,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  constraint guardian_otp_challenges_hash_check check (
    otp_hash ~ '^[0-9a-f]{64,128}$'
    and verification_phone_lookup_hash ~ '^[0-9a-f]{64}$'
    and (
      provider_delivery_hash is null
      or provider_delivery_hash ~ '^[0-9a-f]{32,128}$'
    )
  ),
  constraint guardian_otp_challenges_status_check check (
    status in ('pending', 'verified', 'failed', 'expired', 'superseded')
  ),
  constraint guardian_otp_challenges_attempts_check check (
    attempt_count >= 0 and max_attempts between 1 and 10
  ),
  constraint guardian_otp_challenges_expiry_check check (
    expires_at > created_at
  )
);

create unique index guardian_otp_challenges_one_pending_idx
  on private.guardian_otp_challenges (request_id)
  where status = 'pending';
create index guardian_otp_challenges_expiry_idx
  on private.guardian_otp_challenges (expires_at)
  where status = 'pending';

create table private.guardian_consents (
  id bigint generated always as identity primary key,
  request_id uuid not null unique
    references private.guardian_consent_requests(id) on delete restrict,
  minor_user_id uuid not null references auth.users(id) on delete cascade,
  legal_document_id bigint not null references public.legal_documents(id) on delete restrict,
  otp_challenge_id uuid not null unique
    references private.guardian_otp_challenges(id) on delete restrict,
  guardian_name text not null,
  guardian_relationship text not null,
  guardian_phone_last4 text not null,
  affirmed_guardianship boolean not null,
  affirmed_notice_read boolean not null,
  affirmed_joining boolean not null,
  consented_ip_hash text,
  consented_user_agent_hash text,
  consented_at timestamptz not null default now(),
  withdrawn_at timestamptz,
  withdrawal_reason text,
  withdrawal_verification_hash text,
  created_at timestamptz not null default now(),
  constraint guardian_consents_affirmations_check check (
    affirmed_guardianship
    and affirmed_notice_read
    and affirmed_joining
  ),
  constraint guardian_consents_evidence_hash_check check (
    (consented_ip_hash is null or consented_ip_hash ~ '^[0-9a-f]{32,128}$')
    and (
      consented_user_agent_hash is null
      or consented_user_agent_hash ~ '^[0-9a-f]{32,128}$'
    )
    and (
      withdrawal_verification_hash is null
      or withdrawal_verification_hash ~ '^[0-9a-f]{32,128}$'
    )
  ),
  constraint guardian_consents_withdrawal_check check (
    withdrawn_at is null
    or (
      length(trim(withdrawal_reason)) > 0
      and withdrawal_verification_hash is not null
    )
  )
);

create index guardian_consents_minor_idx
  on private.guardian_consents (minor_user_id, consented_at desc, id desc);
create index guardian_consents_document_idx
  on private.guardian_consents (legal_document_id, consented_at desc);

create table private.minor_identity_verifications (
  id bigint generated always as identity primary key,
  minor_user_id uuid not null references auth.users(id) on delete cascade,
  application_id bigint references public.community_applications(id) on delete set null,
  status text not null,
  verification_method text not null,
  evidence_reference_hash text,
  reviewed_by uuid not null references auth.users(id) on delete restrict,
  reviewer_note text not null,
  reviewed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint minor_identity_verifications_status_check check (
    status in ('verified', 'rejected')
  ),
  constraint minor_identity_verifications_method_check check (
    verification_method in (
      'guardian_attestation', 'manual_document_review',
      'trusted_offline_relationship', 'other'
    )
  ),
  constraint minor_identity_verifications_evidence_hash_check check (
    evidence_reference_hash is null
    or evidence_reference_hash ~ '^[0-9a-f]{32,128}$'
  )
);

create index minor_identity_verifications_minor_idx
  on private.minor_identity_verifications (minor_user_id, reviewed_at desc, id desc);
create index minor_identity_verifications_application_idx
  on private.minor_identity_verifications (application_id, reviewed_at desc)
  where application_id is not null;
create index minor_identity_verifications_reviewer_idx
  on private.minor_identity_verifications (reviewed_by, reviewed_at desc);

create table private.guardian_consent_events (
  id bigint generated always as identity primary key,
  request_id uuid references private.guardian_consent_requests(id) on delete set null,
  minor_user_id uuid not null references auth.users(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint guardian_consent_events_type_check check (
    event_type ~ '^[a-z][a-z0-9_.-]*$'
  )
);

create index guardian_consent_events_minor_idx
  on private.guardian_consent_events (minor_user_id, created_at desc, id desc);
create index guardian_consent_events_request_idx
  on private.guardian_consent_events (request_id, created_at, id)
  where request_id is not null;
create index guardian_consent_events_actor_idx
  on private.guardian_consent_events (actor_user_id, created_at desc)
  where actor_user_id is not null;

create trigger legal_documents_set_updated_at
before update on public.legal_documents
for each row execute function private.set_updated_at();

create trigger guardian_consent_requests_set_updated_at
before update on private.guardian_consent_requests
for each row execute function private.set_updated_at();

create trigger legal_documents_audit_changes
after insert or update on public.legal_documents
for each row execute function private.audit_row_change('legal_document');

alter table public.legal_documents enable row level security;
alter table private.guardian_consent_requests enable row level security;
alter table private.guardian_otp_challenges enable row level security;
alter table private.guardian_consents enable row level security;
alter table private.minor_identity_verifications enable row level security;
alter table private.guardian_consent_events enable row level security;

revoke all on public.legal_documents from public, anon, authenticated;
revoke all on private.guardian_consent_requests from public, anon, authenticated;
revoke all on private.guardian_otp_challenges from public, anon, authenticated;
revoke all on private.guardian_consents from public, anon, authenticated;
revoke all on private.minor_identity_verifications from public, anon, authenticated;
revoke all on private.guardian_consent_events from public, anon, authenticated;

grant select on public.legal_documents to anon, authenticated;

create policy legal_documents_select_public_or_manager
on public.legal_documents for select
to anon, authenticated
using (
  (
    status = 'active'
    and effective_at <= statement_timestamp()
  )
  or private.has_permission('memberships.manage')
);

create policy guardian_consent_requests_deny_data_api
on private.guardian_consent_requests
as restrictive for all to anon, authenticated
using (false) with check (false);

create policy guardian_otp_challenges_deny_data_api
on private.guardian_otp_challenges
as restrictive for all to anon, authenticated
using (false) with check (false);

create policy guardian_consents_deny_data_api
on private.guardian_consents
as restrictive for all to anon, authenticated
using (false) with check (false);

create policy minor_identity_verifications_deny_data_api
on private.minor_identity_verifications
as restrictive for all to anon, authenticated
using (false) with check (false);

create policy guardian_consent_events_deny_data_api
on private.guardian_consent_events
as restrictive for all to anon, authenticated
using (false) with check (false);

alter table public.community_memberships
  add column suspension_source text;

alter table public.community_memberships
  drop constraint community_memberships_suspension_check;

alter table public.community_memberships
  add constraint community_memberships_suspension_source_check check (
    suspension_source is null
    or suspension_source in (
      'administrator', 'guardian_consent',
      'identity_verification', 'system'
    )
  ),
  add constraint community_memberships_suspension_check check (
    (
      status = 'suspended'
      and suspended_at is not null
      and length(trim(suspension_reason)) > 0
      and suspension_source is not null
      and (
        suspension_source <> 'administrator'
        or suspended_by is not null
      )
    )
    or status <> 'suspended'
  );

create or replace function private.sha256_hex(input_value text)
returns text
language sql
immutable
strict
set search_path = ''
as $$
  select encode(extensions.digest(input_value, 'sha256'), 'hex');
$$;

create or replace function private.require_service_role()
returns void
language plpgsql
stable
set search_path = ''
as $$
declare
  claim_role text := coalesce(
    current_setting('request.jwt.claim.role', true),
    auth.jwt() ->> 'role',
    ''
  );
begin
  if current_user <> 'service_role' and claim_role <> 'service_role' then
    raise exception using errcode = '42501', message = 'SERVICE_ROLE_REQUIRED';
  end if;
end;
$$;

create or replace function private.write_guardian_consent_event(
  target_request_id uuid,
  target_minor_user_id uuid,
  target_event_type text,
  target_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into private.guardian_consent_events (
    request_id, minor_user_id, actor_user_id, event_type, metadata
  ) values (
    target_request_id,
    target_minor_user_id,
    (select auth.uid()),
    target_event_type,
    coalesce(target_metadata, '{}'::jsonb)
  );
end;
$$;

revoke all on function private.sha256_hex(text)
  from public, anon, authenticated;
revoke all on function private.require_service_role()
  from public, anon, authenticated;
revoke all on function private.write_guardian_consent_event(uuid, uuid, text, jsonb)
  from public, anon, authenticated;

grant usage on schema private to service_role;
grant execute on function private.sha256_hex(text) to service_role;
grant execute on function private.require_service_role() to service_role;

create or replace function private.suspend_minor_membership(
  target_user_id uuid,
  target_source text,
  target_reason text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  membership_changed boolean := false;
begin
  if target_source not in ('guardian_consent', 'identity_verification', 'system') then
    raise exception using errcode = '22023', message = 'INVALID_SUSPENSION_SOURCE';
  end if;
  if nullif(trim(target_reason), '') is null then
    raise exception using errcode = '22023', message = 'SUSPENSION_REASON_REQUIRED';
  end if;

  update public.community_memberships
  set status = 'suspended',
      suspended_by = (select auth.uid()),
      suspended_at = statement_timestamp(),
      suspension_reason = trim(target_reason),
      suspension_source = target_source
  where user_id = target_user_id
    and status = 'active';
  membership_changed := found;

  if membership_changed then
    delete from public.user_roles ur
    using public.roles r
    where ur.user_id = target_user_id
      and ur.role_id = r.id
      and r.slug in ('community_member', 'facilitator');

    update public.people
    set is_public = false
    where user_id = target_user_id;

    perform private.create_notification(
      target_user_id,
      'membership.suspended',
      '社群成员资格已暂停',
      'Community membership suspended',
      target_reason,
      target_reason,
      '/community/guardian-consent'
    );
  end if;
  return membership_changed;
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
      and s.age_band in ('under_14', 'age_14_17')
      and s.guardian_consent_status = 'verified'
      and s.identity_verification_status = 'verified'
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

revoke all on function private.suspend_minor_membership(uuid, text, text)
  from public, anon, authenticated;
revoke all on function private.restore_minor_membership_if_eligible(uuid)
  from public, anon, authenticated;

create or replace function private.create_guardian_consent_request_server(
  target_minor_user_id uuid,
  target_application_id bigint,
  target_guardian_name text,
  target_guardian_relationship text,
  target_contact_channel text,
  target_contact_ciphertext text,
  target_contact_lookup_hash text,
  target_contact_last4 text,
  target_legal_document_id bigint,
  target_token_hash text,
  target_expires_at timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_id uuid;
  safety private.account_safety_profiles%rowtype;
  legal_document public.legal_documents%rowtype;
begin
  perform private.require_service_role();

  select * into safety
  from private.account_safety_profiles s
  where s.user_id = target_minor_user_id
  for update;
  if not found or safety.age_band not in ('under_14', 'age_14_17') then
    raise exception using errcode = '22023', message = 'MINOR_ACCOUNT_REQUIRED';
  end if;
  if not exists (
    select 1 from public.profiles p
    where p.user_id = target_minor_user_id and p.account_status = 'active'
  ) then
    raise exception using errcode = '42501', message = 'ACCOUNT_NOT_ACTIVE';
  end if;

  select * into legal_document
  from public.legal_documents ld
  where ld.id = target_legal_document_id
    and ld.document_type = 'guardian_informed_consent'
    and ld.status = 'active'
    and ld.effective_at <= statement_timestamp();
  if not found then
    raise exception using errcode = '22023', message = 'ACTIVE_GUARDIAN_DOCUMENT_REQUIRED';
  end if;

  if target_application_id is not null and not exists (
    select 1
    from public.community_applications ca
    where ca.id = target_application_id
      and ca.user_id = target_minor_user_id
      and ca.status in (
        'draft', 'pending_guardian', 'submitted',
        'under_review', 'more_info_requested', 'approved'
      )
  ) then
    raise exception using errcode = '22023', message = 'APPLICATION_NOT_FOUND';
  end if;

  if nullif(trim(target_guardian_name), '') is null
     or nullif(trim(target_guardian_relationship), '') is null then
    raise exception using errcode = '22023', message = 'GUARDIAN_DETAILS_REQUIRED';
  end if;
  if target_contact_channel not in ('email', 'phone')
     or nullif(trim(target_contact_ciphertext), '') is null
     or target_contact_lookup_hash !~ '^[0-9a-f]{64}$'
     or length(trim(target_contact_last4)) not between 2 and 8 then
    raise exception using errcode = '22023', message = 'INVALID_GUARDIAN_CONTACT';
  end if;
  if target_token_hash !~ '^[0-9a-f]{64}$' then
    raise exception using errcode = '22023', message = 'INVALID_CONSENT_TOKEN_HASH';
  end if;
  if target_expires_at < statement_timestamp() + interval '5 minutes'
     or target_expires_at > statement_timestamp() + interval '7 days' then
    raise exception using errcode = '22023', message = 'INVALID_CONSENT_EXPIRY';
  end if;
  if exists (
    select 1
    from private.guardian_consents gc
    where gc.minor_user_id = target_minor_user_id
      and gc.legal_document_id = target_legal_document_id
      and gc.withdrawn_at is null
  ) then
    raise exception using errcode = '22023', message = 'CONSENT_ALREADY_VERIFIED';
  end if;

  update private.guardian_otp_challenges oc
  set status = 'superseded'
  where oc.status = 'pending'
    and oc.request_id in (
      select old_request.id
      from private.guardian_consent_requests old_request
      where old_request.minor_user_id = target_minor_user_id
        and old_request.status in ('pending', 'otp_pending')
    );

  update private.guardian_consent_requests
  set status = 'revoked', responded_at = statement_timestamp()
  where minor_user_id = target_minor_user_id
    and status in ('pending', 'otp_pending');

  insert into private.guardian_consent_requests (
    minor_user_id,
    application_id,
    legal_document_id,
    guardian_name,
    guardian_relationship,
    contact_channel,
    contact_ciphertext,
    contact_lookup_hash,
    contact_last4,
    token_hash,
    expires_at
  ) values (
    target_minor_user_id,
    target_application_id,
    target_legal_document_id,
    trim(target_guardian_name),
    trim(target_guardian_relationship),
    target_contact_channel,
    target_contact_ciphertext,
    target_contact_lookup_hash,
    trim(target_contact_last4),
    target_token_hash,
    target_expires_at
  )
  returning id into request_id;

  update private.account_safety_profiles
  set guardian_consent_status = 'pending'
  where user_id = target_minor_user_id;

  perform private.write_guardian_consent_event(
    request_id,
    target_minor_user_id,
    'guardian.request_created',
    jsonb_build_object(
      'contact_channel', target_contact_channel,
      'contact_last4', trim(target_contact_last4),
      'legal_document_id', target_legal_document_id
    )
  );
  return request_id;
end;
$$;

create or replace function private.get_guardian_consent_request(
  request_token text
)
returns table (
  request_id uuid,
  request_status text,
  guardian_name text,
  guardian_relationship text,
  contact_channel text,
  contact_last4 text,
  minor_age_band text,
  minor_display_label text,
  legal_document_id bigint,
  document_key text,
  document_version integer,
  document_locale text,
  document_title text,
  document_summary text,
  document_body_markdown text,
  expires_at timestamptz,
  otp_required boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  hashed_token text;
begin
  if length(coalesce(request_token, '')) < 32 then
    raise exception using errcode = '22023', message = 'CONSENT_REQUEST_NOT_FOUND';
  end if;
  hashed_token := private.sha256_hex(request_token);

  return query
  select
    gr.id,
    case
      when gr.status in ('pending', 'otp_pending')
        and gr.expires_at <= statement_timestamp() then 'expired'
      else gr.status
    end,
    gr.guardian_name,
    gr.guardian_relationship,
    gr.contact_channel,
    gr.contact_last4,
    s.age_band,
    case
      when s.age_band = 'under_14' then '一位未满 14 岁的申请者'
      else coalesce(nullif(pe.display_name, ''), nullif(p.display_name, ''), '一位未成年申请者')
    end,
    ld.id,
    ld.document_key,
    ld.version,
    ld.locale,
    ld.title,
    ld.summary,
    ld.body_markdown,
    gr.expires_at,
    gr.status in ('pending', 'otp_pending')
      and gr.expires_at > statement_timestamp()
  from private.guardian_consent_requests gr
  join private.account_safety_profiles s on s.user_id = gr.minor_user_id
  join public.profiles p on p.user_id = gr.minor_user_id
  left join public.people pe on pe.user_id = gr.minor_user_id
  join public.legal_documents ld on ld.id = gr.legal_document_id
  where gr.token_hash = hashed_token;

  if not found then
    raise exception using errcode = '22023', message = 'CONSENT_REQUEST_NOT_FOUND';
  end if;
end;
$$;

revoke all on function private.create_guardian_consent_request_server(
  uuid, bigint, text, text, text, text, text, text, bigint, text, timestamptz
) from public, anon, authenticated;
revoke all on function private.get_guardian_consent_request(text)
  from public, anon, authenticated;

grant execute on function private.create_guardian_consent_request_server(
  uuid, bigint, text, text, text, text, text, text, bigint, text, timestamptz
) to service_role;
grant execute on function private.get_guardian_consent_request(text)
  to anon, authenticated, service_role;

create or replace function private.begin_guardian_otp_server(
  request_token text,
  target_otp_hash text,
  target_phone_ciphertext text,
  target_phone_lookup_hash text,
  target_phone_last4 text,
  target_provider_delivery_hash text,
  target_expires_at timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_row private.guardian_consent_requests%rowtype;
  challenge_id uuid;
begin
  perform private.require_service_role();

  select * into request_row
  from private.guardian_consent_requests gr
  where gr.token_hash = private.sha256_hex(request_token)
  for update;
  if not found
     or request_row.status not in ('pending', 'otp_pending')
     or request_row.expires_at <= statement_timestamp() then
    raise exception using errcode = '22023', message = 'CONSENT_REQUEST_NOT_AVAILABLE';
  end if;
  if request_row.otp_send_count >= request_row.max_otp_sends then
    raise exception using errcode = '22023', message = 'OTP_SEND_LIMIT_REACHED';
  end if;
  if target_otp_hash !~ '^[0-9a-f]{64,128}$'
     or target_phone_lookup_hash !~ '^[0-9a-f]{64}$'
     or nullif(trim(target_phone_ciphertext), '') is null
     or length(trim(target_phone_last4)) not between 2 and 8
     or (
       target_provider_delivery_hash is not null
       and target_provider_delivery_hash !~ '^[0-9a-f]{32,128}$'
     ) then
    raise exception using errcode = '22023', message = 'INVALID_OTP_EVIDENCE';
  end if;
  if target_expires_at < statement_timestamp() + interval '1 minute'
     or target_expires_at > statement_timestamp() + interval '15 minutes'
     or target_expires_at > request_row.expires_at then
    raise exception using errcode = '22023', message = 'INVALID_OTP_EXPIRY';
  end if;

  update private.guardian_otp_challenges
  set status = 'superseded'
  where request_id = request_row.id and status = 'pending';

  insert into private.guardian_otp_challenges (
    request_id,
    otp_hash,
    verification_phone_ciphertext,
    verification_phone_lookup_hash,
    verification_phone_last4,
    provider_delivery_hash,
    expires_at
  ) values (
    request_row.id,
    target_otp_hash,
    target_phone_ciphertext,
    target_phone_lookup_hash,
    trim(target_phone_last4),
    target_provider_delivery_hash,
    target_expires_at
  )
  returning id into challenge_id;

  update private.guardian_consent_requests
  set status = 'otp_pending',
      otp_send_count = otp_send_count + 1
  where id = request_row.id;

  perform private.write_guardian_consent_event(
    request_row.id,
    request_row.minor_user_id,
    'guardian.otp_sent',
    jsonb_build_object('phone_last4', trim(target_phone_last4))
  );
  return challenge_id;
end;
$$;

create or replace function private.verify_guardian_otp_server(
  request_token text,
  target_challenge_id uuid,
  submitted_otp_hash text,
  affirmed_guardianship boolean,
  affirmed_notice_read boolean,
  affirmed_joining boolean,
  target_ip_hash text default null,
  target_user_agent_hash text default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_row private.guardian_consent_requests%rowtype;
  challenge_row private.guardian_otp_challenges%rowtype;
  application_row public.community_applications%rowtype;
  next_request_attempts integer;
  next_challenge_attempts integer;
begin
  perform private.require_service_role();

  select * into request_row
  from private.guardian_consent_requests gr
  where gr.token_hash = private.sha256_hex(request_token)
  for update;
  if not found or request_row.status <> 'otp_pending' then
    return 'not_available';
  end if;

  select * into challenge_row
  from private.guardian_otp_challenges oc
  where oc.id = target_challenge_id
    and oc.request_id = request_row.id
  for update;
  if not found or challenge_row.status <> 'pending' then
    return 'not_available';
  end if;

  if request_row.expires_at <= statement_timestamp()
     or challenge_row.expires_at <= statement_timestamp() then
    update private.guardian_consent_requests
    set status = 'expired', responded_at = statement_timestamp()
    where id = request_row.id;
    update private.guardian_otp_challenges
    set status = 'expired'
    where id = challenge_row.id;
    perform private.write_guardian_consent_event(
      request_row.id,
      request_row.minor_user_id,
      'guardian.otp_expired'
    );
    return 'expired';
  end if;

  if not coalesce(affirmed_guardianship, false)
     or not coalesce(affirmed_notice_read, false)
     or not coalesce(affirmed_joining, false) then
    return 'affirmations_required';
  end if;
  if target_ip_hash is not null and target_ip_hash !~ '^[0-9a-f]{32,128}$' then
    raise exception using errcode = '22023', message = 'INVALID_IP_EVIDENCE_HASH';
  end if;
  if target_user_agent_hash is not null
     and target_user_agent_hash !~ '^[0-9a-f]{32,128}$' then
    raise exception using errcode = '22023', message = 'INVALID_USER_AGENT_EVIDENCE_HASH';
  end if;

  if submitted_otp_hash is distinct from challenge_row.otp_hash then
    next_request_attempts := request_row.otp_verify_attempts + 1;
    next_challenge_attempts := challenge_row.attempt_count + 1;

    update private.guardian_consent_requests
    set otp_verify_attempts = next_request_attempts,
        status = case
          when next_request_attempts >= request_row.max_otp_attempts
            then 'revoked'
          else status
        end,
        responded_at = case
          when next_request_attempts >= request_row.max_otp_attempts
            then statement_timestamp()
          else responded_at
        end
    where id = request_row.id;

    update private.guardian_otp_challenges
    set attempt_count = next_challenge_attempts,
        status = case
          when next_challenge_attempts >= challenge_row.max_attempts
            or next_request_attempts >= request_row.max_otp_attempts
            then 'failed'
          else status
        end
    where id = challenge_row.id;

    perform private.write_guardian_consent_event(
      request_row.id,
      request_row.minor_user_id,
      case
        when next_challenge_attempts >= challenge_row.max_attempts
          or next_request_attempts >= request_row.max_otp_attempts
          then 'guardian.otp_locked'
        else 'guardian.otp_failed'
      end,
      jsonb_build_object(
        'request_attempts', next_request_attempts,
        'challenge_attempts', next_challenge_attempts
      )
    );

    if next_challenge_attempts >= challenge_row.max_attempts
       or next_request_attempts >= request_row.max_otp_attempts then
      return 'locked';
    end if;
    return 'invalid';
  end if;

  update private.guardian_otp_challenges
  set status = 'verified', verified_at = statement_timestamp()
  where id = challenge_row.id;

  update private.guardian_consent_requests
  set status = 'verified', responded_at = statement_timestamp()
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
    consented_ip_hash,
    consented_user_agent_hash
  ) values (
    request_row.id,
    request_row.minor_user_id,
    request_row.legal_document_id,
    challenge_row.id,
    request_row.guardian_name,
    request_row.guardian_relationship,
    challenge_row.verification_phone_last4,
    true,
    true,
    true,
    target_ip_hash,
    target_user_agent_hash
  );

  update private.account_safety_profiles
  set guardian_consent_status = 'verified'
  where user_id = request_row.minor_user_id;

  select * into application_row
  from public.community_applications ca
  where ca.user_id = request_row.minor_user_id
    and ca.status = 'pending_guardian'
  order by ca.attempt_number desc
  limit 1
  for update;
  if found then
    update public.community_applications
    set status = 'submitted', submitted_at = statement_timestamp()
    where id = application_row.id;
    perform private.write_application_event(
      application_row.id,
      'application.guardian_verified',
      'pending_guardian',
      'submitted'
    );
  end if;

  perform private.restore_minor_membership_if_eligible(request_row.minor_user_id);
  perform private.create_notification(
    request_row.minor_user_id,
    'guardian_consent.verified',
    '监护人知情确认已完成',
    'Guardian confirmation completed',
    '现在可以继续完成资料或等待社群审核。',
    'You can now continue onboarding or wait for community review.',
    '/community'
  );
  perform private.write_guardian_consent_event(
    request_row.id,
    request_row.minor_user_id,
    'guardian.consent_verified',
    jsonb_build_object(
      'phone_last4', challenge_row.verification_phone_last4,
      'legal_document_id', request_row.legal_document_id
    )
  );
  return 'verified';
end;
$$;

create or replace function private.decline_guardian_consent_server(
  request_token text,
  decline_reason text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_row private.guardian_consent_requests%rowtype;
begin
  perform private.require_service_role();
  select * into request_row
  from private.guardian_consent_requests gr
  where gr.token_hash = private.sha256_hex(request_token)
  for update;
  if not found
     or request_row.status not in ('pending', 'otp_pending')
     or request_row.expires_at <= statement_timestamp() then
    raise exception using errcode = '22023', message = 'CONSENT_REQUEST_NOT_AVAILABLE';
  end if;

  update private.guardian_otp_challenges
  set status = 'superseded'
  where request_id = request_row.id and status = 'pending';
  update private.guardian_consent_requests
  set status = 'declined', responded_at = statement_timestamp()
  where id = request_row.id;
  update private.account_safety_profiles
  set guardian_consent_status = 'required'
  where user_id = request_row.minor_user_id;

  perform private.create_notification(
    request_row.minor_user_id,
    'guardian_consent.declined',
    '监护人未确认加入社群',
    'Guardian confirmation was declined',
    nullif(trim(decline_reason), ''),
    null,
    '/community/guardian-consent'
  );
  perform private.write_guardian_consent_event(
    request_row.id,
    request_row.minor_user_id,
    'guardian.consent_declined'
  );
end;
$$;

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
begin
  perform private.require_service_role();
  if target_withdrawal_verification_hash !~ '^[0-9a-f]{32,128}$'
     or nullif(trim(target_reason), '') is null then
    raise exception using errcode = '22023', message = 'WITHDRAWAL_EVIDENCE_REQUIRED';
  end if;

  select * into request_row
  from private.guardian_consent_requests gr
  where gr.id = target_request_id and gr.status = 'verified'
  for update;
  if not found then
    raise exception using errcode = '22023', message = 'VERIFIED_CONSENT_NOT_FOUND';
  end if;
  if not exists (
    select 1
    from private.guardian_consents gc
    where gc.request_id = request_row.id and gc.withdrawn_at is null
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
  where user_id = request_row.minor_user_id;

  select * into application_row
  from public.community_applications ca
  where ca.user_id = request_row.minor_user_id
    and ca.status in ('submitted', 'under_review', 'more_info_requested')
  order by ca.attempt_number desc
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
  perform private.create_notification(
    request_row.minor_user_id,
    'guardian_consent.withdrawn',
    '监护人知情同意已撤回',
    'Guardian consent was withdrawn',
    '内部社群能力已暂停；基础账号仍然保留。',
    'Internal community access is paused; the base account remains available.',
    '/community/guardian-consent'
  );
  perform private.write_guardian_consent_event(
    request_row.id,
    request_row.minor_user_id,
    'guardian.consent_withdrawn'
  );
end;
$$;

revoke all on function private.begin_guardian_otp_server(
  text, text, text, text, text, text, timestamptz
) from public, anon, authenticated;
revoke all on function private.verify_guardian_otp_server(
  text, uuid, text, boolean, boolean, boolean, text, text
) from public, anon, authenticated;
revoke all on function private.decline_guardian_consent_server(text, text)
  from public, anon, authenticated;
revoke all on function private.withdraw_guardian_consent_server(uuid, text, text)
  from public, anon, authenticated;

grant execute on function private.begin_guardian_otp_server(
  text, text, text, text, text, text, timestamptz
) to service_role;
grant execute on function private.verify_guardian_otp_server(
  text, uuid, text, boolean, boolean, boolean, text, text
) to service_role;
grant execute on function private.decline_guardian_consent_server(text, text)
  to service_role;
grant execute on function private.withdraw_guardian_consent_server(uuid, text, text)
  to service_role;

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
    s.age_band <> 'under_14' or s.guardian_consent_status = 'verified',
    s.age_band = 'adult_18_plus'
      or (
        s.guardian_consent_status = 'verified'
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

revoke all on function private.review_minor_identity_verification(
  uuid, text, text, text, text
) from public, anon, authenticated;
revoke all on function private.get_my_guardian_consent_state()
  from public, anon, authenticated;
grant execute on function private.review_minor_identity_verification(
  uuid, text, text, text, text
) to authenticated;
grant execute on function private.get_my_guardian_consent_state()
  to authenticated;

-- Preserve the administrator workflow while recording why a Membership is suspended.
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
      suspension_reason = trim(target_reason),
      suspension_source = 'administrator'
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
  if safety.age_band in ('under_14', 'age_14_17')
     and (
       safety.guardian_consent_status <> 'verified'
       or safety.identity_verification_status <> 'verified'
     ) then
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

create function public.create_guardian_consent_request_server(
  target_minor_user_id uuid,
  target_application_id bigint,
  target_guardian_name text,
  target_guardian_relationship text,
  target_contact_channel text,
  target_contact_ciphertext text,
  target_contact_lookup_hash text,
  target_contact_last4 text,
  target_legal_document_id bigint,
  target_token_hash text,
  target_expires_at timestamptz
)
returns uuid
language sql
security invoker
set search_path = ''
as $$
  select private.create_guardian_consent_request_server(
    target_minor_user_id,
    target_application_id,
    target_guardian_name,
    target_guardian_relationship,
    target_contact_channel,
    target_contact_ciphertext,
    target_contact_lookup_hash,
    target_contact_last4,
    target_legal_document_id,
    target_token_hash,
    target_expires_at
  );
$$;

create function public.get_guardian_consent_request(request_token text)
returns table (
  request_id uuid,
  request_status text,
  guardian_name text,
  guardian_relationship text,
  contact_channel text,
  contact_last4 text,
  minor_age_band text,
  minor_display_label text,
  legal_document_id bigint,
  document_key text,
  document_version integer,
  document_locale text,
  document_title text,
  document_summary text,
  document_body_markdown text,
  expires_at timestamptz,
  otp_required boolean
)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from private.get_guardian_consent_request(request_token);
$$;

create function public.begin_guardian_otp_server(
  request_token text,
  target_otp_hash text,
  target_phone_ciphertext text,
  target_phone_lookup_hash text,
  target_phone_last4 text,
  target_provider_delivery_hash text,
  target_expires_at timestamptz
)
returns uuid
language sql
security invoker
set search_path = ''
as $$
  select private.begin_guardian_otp_server(
    request_token,
    target_otp_hash,
    target_phone_ciphertext,
    target_phone_lookup_hash,
    target_phone_last4,
    target_provider_delivery_hash,
    target_expires_at
  );
$$;

create function public.verify_guardian_otp_server(
  request_token text,
  target_challenge_id uuid,
  submitted_otp_hash text,
  affirmed_guardianship boolean,
  affirmed_notice_read boolean,
  affirmed_joining boolean,
  target_ip_hash text default null,
  target_user_agent_hash text default null
)
returns text
language sql
security invoker
set search_path = ''
as $$
  select private.verify_guardian_otp_server(
    request_token,
    target_challenge_id,
    submitted_otp_hash,
    affirmed_guardianship,
    affirmed_notice_read,
    affirmed_joining,
    target_ip_hash,
    target_user_agent_hash
  );
$$;

create function public.decline_guardian_consent_server(
  request_token text,
  decline_reason text default null
)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.decline_guardian_consent_server(request_token, decline_reason);
$$;

create function public.withdraw_guardian_consent_server(
  target_request_id uuid,
  target_withdrawal_verification_hash text,
  target_reason text
)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.withdraw_guardian_consent_server(
    target_request_id,
    target_withdrawal_verification_hash,
    target_reason
  );
$$;

create function public.review_minor_identity_verification(
  target_minor_user_id uuid,
  review_decision text,
  target_verification_method text,
  target_reviewer_note text,
  target_evidence_reference_hash text default null
)
returns bigint
language sql
security invoker
set search_path = ''
as $$
  select private.review_minor_identity_verification(
    target_minor_user_id,
    review_decision,
    target_verification_method,
    target_reviewer_note,
    target_evidence_reference_hash
  );
$$;

create function public.get_my_guardian_consent_state()
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
language sql
stable
security invoker
set search_path = ''
as $$
  select * from private.get_my_guardian_consent_state();
$$;

revoke all on function public.create_guardian_consent_request_server(
  uuid, bigint, text, text, text, text, text, text, bigint, text, timestamptz
) from public, anon, authenticated;
revoke all on function public.get_guardian_consent_request(text)
  from public;
revoke all on function public.begin_guardian_otp_server(
  text, text, text, text, text, text, timestamptz
) from public, anon, authenticated;
revoke all on function public.verify_guardian_otp_server(
  text, uuid, text, boolean, boolean, boolean, text, text
) from public, anon, authenticated;
revoke all on function public.decline_guardian_consent_server(text, text)
  from public, anon, authenticated;
revoke all on function public.withdraw_guardian_consent_server(uuid, text, text)
  from public, anon, authenticated;
revoke all on function public.review_minor_identity_verification(
  uuid, text, text, text, text
) from public, anon;
revoke all on function public.get_my_guardian_consent_state()
  from public, anon;

grant execute on function public.create_guardian_consent_request_server(
  uuid, bigint, text, text, text, text, text, text, bigint, text, timestamptz
) to service_role;
grant execute on function public.get_guardian_consent_request(text)
  to anon, authenticated, service_role;
grant execute on function public.begin_guardian_otp_server(
  text, text, text, text, text, text, timestamptz
) to service_role;
grant execute on function public.verify_guardian_otp_server(
  text, uuid, text, boolean, boolean, boolean, text, text
) to service_role;
grant execute on function public.decline_guardian_consent_server(text, text)
  to service_role;
grant execute on function public.withdraw_guardian_consent_server(uuid, text, text)
  to service_role;
grant execute on function public.review_minor_identity_verification(
  uuid, text, text, text, text
) to authenticated;
grant execute on function public.get_my_guardian_consent_state()
  to authenticated;

-- Draft only: a legally reviewed version must be activated in a later migration.
with draft_document(body_markdown) as (
  values ($document$
# 阿柑少年社群监护人知情确认（草案，未启用）

此文本仅用于产品流程和法律审核，不构成当前有效协议。

阿柑少年社群可能向正式成员开放个人主页、文章与图片发布、伙伴目录、共练活动和成员间消息。监护人应在了解青少年隐私说明、社区规则、举报与安全机制后，自主决定是否同意未成年人加入。

确认时，监护人需要声明其为父母或其他监护人，确认已经阅读相关说明，并明确同意未成年人加入。平台将通过手机验证码核验联系方式控制权；该验证码本身不等同于法定监护关系或真实身份的证明。
$document$::text)
)
insert into public.legal_documents (
  document_key,
  version,
  locale,
  document_type,
  title,
  summary,
  body_markdown,
  content_sha256,
  status,
  is_material_change
)
select
  'guardian-community-consent',
  1,
  'zh-CN',
  'guardian_informed_consent',
  '阿柑少年社群监护人知情确认（草案）',
  '未成年人加入正式社群前的功能、隐私与安全说明。',
  body_markdown,
  private.sha256_hex(body_markdown),
  'draft',
  true
from draft_document;

comment on table public.legal_documents is
  'Versioned legal and safety notices; only reviewed active rows are public.';
comment on table private.guardian_consent_requests is
  'Encrypted-contact guardian invitations with one-time hashed bearer tokens.';
comment on table private.guardian_otp_challenges is
  'Short-lived OTP HMAC evidence; plaintext verification codes are never stored.';
comment on table private.guardian_consents is
  'Immutable consent evidence plus explicit withdrawal metadata.';
comment on table private.minor_identity_verifications is
  'Staff attestations kept separate from guardian phone-control verification.';
