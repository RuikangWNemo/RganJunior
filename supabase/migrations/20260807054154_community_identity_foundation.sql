-- Community identity foundation: account tiers, age gate, profile projection,
-- privacy settings, and controlled onboarding.

update public.roles
set slug = 'registered_user',
    name = 'Registered User',
    description = 'Account holder who may complete a profile and apply to the community',
    updated_at = statement_timestamp()
where slug = 'member';

update public.roles
set slug = 'community_member',
    name = 'Community Member',
    description = 'Approved Rgan Junior community member',
    updated_at = statement_timestamp()
where slug = 'contributor';

insert into public.roles (
  slug, name, description, is_system, is_active, created_by
)
values (
  'facilitator',
  'Facilitator',
  'Community member who may create and host practice sessions',
  true,
  true,
  null
);

insert into public.permissions (permission_key, description, is_sensitive)
values
  ('community.apply', 'Create and maintain the caller community application', false),
  ('memberships.read', 'Read active community member directory data', false),
  ('memberships.review', 'Review community membership applications', false),
  ('memberships.review_sensitive', 'Read minor, guardian, and identity-review data', true),
  ('memberships.manage', 'Suspend and restore community memberships', true),
  ('profiles.read_members', 'Read member-visible profile projections', false),
  ('messages.use', 'Use member-to-member messaging', false),
  ('messages.moderate', 'Moderate messages, blocks, and message reports', true),
  ('practice.read', 'Read member practice spaces and sessions', false),
  ('practice.join', 'Join and check in to practice sessions', false),
  ('practice.create', 'Create practice sessions', false),
  ('practice.host', 'Host and control practice sessions', false),
  ('moderation.manage', 'Manage community reports and restrictions', true),
  ('notifications.manage', 'Manage community notifications', false),
  ('field_notes.publish_own', 'Publish approved owned Field Notes', false)
on conflict (permission_key) do update
set description = excluded.description,
    is_sensitive = excluded.is_sensitive,
    updated_at = statement_timestamp();

-- Registered users keep private media for avatars and may apply.
insert into public.role_permissions (role_id, permission_id, granted_by)
select r.id, p.id, null
from public.roles r
join public.permissions p on p.permission_key in (
  'community.apply', 'media.upload', 'media.manage_own'
)
where r.slug = 'registered_user'
on conflict do nothing;

-- Approved members receive the publishing, People, Practice, and messaging baseline.
insert into public.role_permissions (role_id, permission_id, granted_by)
select r.id, p.id, null
from public.roles r
join public.permissions p on p.permission_key in (
  'community.apply',
  'memberships.read', 'profiles.read_members',
  'media.upload', 'media.manage_own',
  'field_notes.create', 'field_notes.edit_own', 'field_notes.submit',
  'messages.use',
  'practice.read', 'practice.join'
)
where r.slug = 'community_member'
on conflict do nothing;

-- Facilitators inherit the complete member baseline plus scheduling/hosting.
insert into public.role_permissions (role_id, permission_id, granted_by)
select r.id, p.id, null
from public.roles r
join public.permissions p on p.permission_key in (
  'community.apply',
  'memberships.read', 'profiles.read_members',
  'media.upload', 'media.manage_own',
  'field_notes.create', 'field_notes.edit_own', 'field_notes.submit',
  'messages.use',
  'practice.read', 'practice.join', 'practice.create', 'practice.host'
)
where r.slug = 'facilitator'
on conflict do nothing;

-- Editors operate as full members in addition to the existing editorial queue.
insert into public.role_permissions (role_id, permission_id, granted_by)
select r.id, p.id, null
from public.roles r
join public.permissions p on p.permission_key in (
  'community.apply',
  'memberships.read', 'profiles.read_members',
  'messages.use',
  'practice.read', 'practice.join'
)
where r.slug = 'editor'
on conflict do nothing;

-- Existing admins and Super Admins receive all new permission keys. Sensitive
-- permission delegation remains protected by the existing RPC guards.
insert into public.role_permissions (role_id, permission_id, granted_by)
select r.id, p.id, null
from public.roles r
join public.permissions p on p.permission_key in (
  'community.apply',
  'memberships.read', 'memberships.review',
  'memberships.review_sensitive', 'memberships.manage',
  'profiles.read_members',
  'messages.use', 'messages.moderate',
  'practice.read', 'practice.join', 'practice.create', 'practice.host',
  'moderation.manage', 'notifications.manage',
  'field_notes.publish_own'
)
where r.slug in ('admin', 'super_admin')
on conflict do nothing;

alter table public.profiles
  add column onboarding_completed_at timestamptz,
  add column account_status text not null default 'active';

alter table public.profiles
  add constraint profiles_account_status_check check (
    account_status in ('active', 'restricted', 'suspended', 'deactivated')
  );

alter table public.people
  add column name_zh text,
  add column name_en text,
  add column profile_visibility text not null default 'private',
  add column show_real_name boolean not null default false;

alter table public.people
  add constraint people_profile_visibility_check check (
    profile_visibility in ('private', 'members', 'public')
  ),
  add constraint people_name_zh_length_check check (
    name_zh is null or length(name_zh) between 1 and 120
  ),
  add constraint people_name_en_length_check check (
    name_en is null or length(name_en) between 1 and 120
  );

update public.people
set profile_visibility = case when is_public then 'public' else 'private' end;

create table public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  allow_messages boolean not null default true,
  email_notifications boolean not null default true,
  in_app_notifications boolean not null default true,
  reduced_motion boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table private.account_safety_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  age_band text not null,
  guardian_consent_status text not null,
  identity_verification_status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint account_safety_profiles_age_band_check check (
    age_band in ('under_14', 'age_14_17', 'adult_18_plus')
  ),
  constraint account_safety_profiles_guardian_status_check check (
    guardian_consent_status in (
      'not_required', 'required', 'pending', 'verified', 'withdrawn'
    )
  ),
  constraint account_safety_profiles_identity_status_check check (
    identity_verification_status in (
      'not_required', 'pending', 'verified', 'rejected'
    )
  ),
  constraint account_safety_profiles_age_state_check check (
    (
      age_band = 'adult_18_plus'
      and guardian_consent_status = 'not_required'
      and identity_verification_status = 'not_required'
    )
    or (
      age_band in ('under_14', 'age_14_17')
      and guardian_consent_status <> 'not_required'
      and identity_verification_status <> 'not_required'
    )
  )
);

create trigger user_settings_set_updated_at
before update on public.user_settings
for each row execute function private.set_updated_at();

create trigger account_safety_profiles_set_updated_at
before update on private.account_safety_profiles
for each row execute function private.set_updated_at();

create or replace function private.protect_profile_system_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
begin
  if new.user_id is distinct from old.user_id
     or new.created_at is distinct from old.created_at
     or new.registered_at is distinct from old.registered_at then
    raise exception using
      errcode = '42501',
      message = 'PROFILE_SYSTEM_FIELDS_IMMUTABLE';
  end if;

  if caller is not null
     and current_user <> 'postgres'
     and not private.user_has_permission(caller, 'users.manage')
     and (
       new.onboarding_completed_at is distinct from old.onboarding_completed_at
       or new.account_status is distinct from old.account_status
     ) then
    raise exception using
      errcode = '42501',
      message = 'PROFILE_SYSTEM_FIELDS_IMMUTABLE';
  end if;
  return new;
end;
$$;

create or replace function private.protect_user_settings_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.user_id is distinct from old.user_id
     or new.created_at is distinct from old.created_at then
    raise exception using errcode = '42501', message = 'USER_SETTINGS_SYSTEM_FIELDS_IMMUTABLE';
  end if;
  return new;
end;
$$;

create trigger user_settings_protect_fields
before update on public.user_settings
for each row execute function private.protect_user_settings_fields();

create or replace function private.protect_people_community_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  caller_can_manage boolean := private.user_has_permission(caller, 'people.manage');
begin
  new.display_name := trim(new.display_name);
  new.name_zh := nullif(trim(new.name_zh), '');
  new.name_en := nullif(trim(new.name_en), '');
  new.nature_name := nullif(trim(new.nature_name), '');

  if coalesce(new.display_name, '') = '' then
    raise exception using errcode = '22023', message = 'DISPLAY_NAME_REQUIRED';
  end if;

  if tg_op = 'INSERT' then
    if caller is not null and not caller_can_manage and current_user <> 'postgres' then
      new.user_id := caller;
      new.is_public := false;
      new.status := 'active';
    end if;
    return new;
  end if;

  if new.id is distinct from old.id
     or new.user_id is distinct from old.user_id
     or new.slug is distinct from old.slug
     or new.created_at is distinct from old.created_at then
    raise exception using errcode = '42501', message = 'PERSON_SYSTEM_FIELDS_IMMUTABLE';
  end if;

  if caller is not null
     and current_user <> 'postgres'
     and not caller_can_manage then
    if old.user_id <> caller then
      raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
    end if;
    if new.status is distinct from old.status
       or new.joined_at is distinct from old.joined_at
       or new.is_public is distinct from old.is_public then
      raise exception using errcode = '42501', message = 'PERSON_SYSTEM_FIELDS_IMMUTABLE';
    end if;
  end if;
  return new;
end;
$$;

create trigger people_protect_community_fields
before insert or update on public.people
for each row execute function private.protect_people_community_fields();

create trigger user_settings_audit_changes
after update on public.user_settings
for each row execute function private.audit_row_change('user_settings');

alter table public.user_settings enable row level security;
alter table private.account_safety_profiles enable row level security;

revoke all on public.user_settings from public, anon, authenticated;
revoke all on private.account_safety_profiles from public, anon, authenticated;

grant select, update on public.user_settings to authenticated;

create policy user_settings_select_authenticated
on public.user_settings for select
to authenticated
using (
  user_id = (select auth.uid())
  or private.has_permission('users.read')
  or private.has_permission('users.manage')
);

create policy user_settings_update_authenticated
on public.user_settings for update
to authenticated
using (
  user_id = (select auth.uid())
  or private.has_permission('users.manage')
)
with check (
  user_id = (select auth.uid())
  or private.has_permission('users.manage')
);

create policy account_safety_profiles_deny_data_api
on private.account_safety_profiles
as restrictive
for all
to anon, authenticated
using (false)
with check (false);

drop policy people_update_authorized on public.people;
create policy people_update_authenticated
on public.people for update
to authenticated
using (
  user_id = (select auth.uid())
  or private.has_permission('people.manage')
)
with check (
  user_id = (select auth.uid())
  or private.has_permission('people.manage')
);

-- Existing projects may have accounts. Populate settings and a conservative
-- legacy adult safety row; the hosted project currently has no such rows.
insert into public.user_settings (user_id)
select p.user_id from public.profiles p
on conflict (user_id) do nothing;

insert into private.account_safety_profiles (
  user_id, age_band, guardian_consent_status, identity_verification_status
)
select p.user_id, 'adult_18_plus', 'not_required', 'not_required'
from public.profiles p
on conflict (user_id) do nothing;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted_roles integer;
  selected_age_band text := new.raw_user_meta_data ->> 'age_band';
  initial_display_name text;
begin
  if selected_age_band not in ('under_14', 'age_14_17', 'adult_18_plus') then
    raise exception using errcode = '22023', message = 'AGE_BAND_REQUIRED';
  end if;

  initial_display_name := case
    when selected_age_band = 'under_14' then ''
    else coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), '')
  end;

  insert into public.profiles (user_id, display_name, registered_at)
  values (
    new.id,
    initial_display_name,
    coalesce(new.created_at, statement_timestamp())
  );

  insert into public.user_settings (user_id)
  values (new.id);

  insert into private.account_safety_profiles (
    user_id,
    age_band,
    guardian_consent_status,
    identity_verification_status
  ) values (
    new.id,
    selected_age_band,
    case when selected_age_band = 'adult_18_plus' then 'not_required' else 'required' end,
    case when selected_age_band = 'adult_18_plus' then 'not_required' else 'pending' end
  );

  insert into public.user_roles (user_id, role_id, assigned_by)
  select new.id, r.id, null
  from public.roles r
  where r.slug = 'registered_user' and r.is_active;

  get diagnostics inserted_roles = row_count;
  if inserted_roles <> 1 then
    raise exception using errcode = '23514', message = 'REGISTERED_USER_ROLE_NOT_CONFIGURED';
  end if;

  update public.subscribers
  set user_id = new.id
  where user_id is null
    and lower(email) = lower(new.email);
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

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
  if safety.age_band = 'under_14' and safety.guardian_consent_status <> 'verified' then
    raise exception using errcode = '42501', message = 'GUARDIAN_CONSENT_REQUIRED';
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
    null::text,
    null::text,
    case
      when p.account_status <> 'active' then '/community/settings'
      when s.age_band = 'under_14' and s.guardian_consent_status <> 'verified'
        then '/community/guardian-consent'
      when p.onboarding_completed_at is null then '/community/onboarding'
      else '/community/apply'
    end
  from public.profiles p
  join private.account_safety_profiles s on s.user_id = p.user_id
  left join public.people pe on pe.user_id = p.user_id
  where p.user_id = caller;
end;
$$;

revoke all on function private.complete_community_onboarding(
  text, text, text, text, text, text, bigint, text, text, text,
  text, boolean, boolean, text, text
) from public, anon, authenticated;
revoke all on function private.get_my_community_state()
  from public, anon, authenticated;

grant execute on function private.complete_community_onboarding(
  text, text, text, text, text, text, bigint, text, text, text,
  text, boolean, boolean, text, text
) to authenticated;
grant execute on function private.get_my_community_state() to authenticated;

create function public.complete_community_onboarding(
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
language sql
security invoker
set search_path = ''
as $$
  select private.complete_community_onboarding(
    account_username,
    person_display_name,
    person_name_zh,
    person_name_en,
    person_nature_name,
    person_bio,
    person_avatar_media_id,
    person_city,
    person_region,
    person_country,
    requested_profile_visibility,
    requested_show_real_name,
    requested_allow_messages,
    requested_language,
    requested_timezone
  );
$$;

create function public.get_my_community_state()
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
language sql
stable
security invoker
set search_path = ''
as $$
  select * from private.get_my_community_state();
$$;

revoke all on function public.complete_community_onboarding(
  text, text, text, text, text, text, bigint, text, text, text,
  text, boolean, boolean, text, text
) from public, anon;
revoke all on function public.get_my_community_state() from public, anon;

grant execute on function public.complete_community_onboarding(
  text, text, text, text, text, text, bigint, text, text, text,
  text, boolean, boolean, text, text
) to authenticated;
grant execute on function public.get_my_community_state() to authenticated;

comment on table public.user_settings is
  'Private account preferences; profile-directory visibility remains on people.';
comment on table private.account_safety_profiles is
  'Private age-band, guardian-consent, and real-identity verification state.';
comment on function public.complete_community_onboarding(
  text, text, text, text, text, text, bigint, text, text, text,
  text, boolean, boolean, text, text
) is 'Completes the caller profile and linked Person through a controlled transaction.';
