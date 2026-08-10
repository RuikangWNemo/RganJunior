-- Connected community planets and reviewed identity declarations.

alter table public.identity_labels
  add column planet_slug text,
  add column selectable_on_signup boolean not null default false,
  add column is_core boolean not null default false,
  add column description_en text;

alter table public.identity_labels
  add constraint identity_labels_planet_slug_check check (
    planet_slug is null or planet_slug in ('youth', 'support', 'guardian')
  );

insert into public.identity_labels (
  slug, name_zh, name_en, description, description_en, color, icon,
  is_public, is_active, sort_order, planet_slug, selectable_on_signup, is_core
)
values
  (
    'rgan-founder', '阿柑少年发起人', 'R-Gan Junior Founder',
    '发起并持续守护阿柑少年方向。',
    'Initiates and stewards the direction of R-Gan Junior.',
    '#F08A4B', 'sparkles', true, true, 10, 'youth', false, true
  ),
  (
    'youth-co-creator', '青年共创伙伴', 'Youth Co-creator',
    '与伙伴一起设计、实践和记录真实行动。',
    'Co-designs, practices, and documents real-world action with peers.',
    '#F2B35D', 'orbit', true, true, 20, 'youth', true, true
  ),
  (
    'participant', '参与者', 'Participant',
    '参与阿柑少年的活动、共练与社群生活。',
    'Takes part in R-Gan Junior activities, practice, and community life.',
    '#E9C979', 'circle-dot', true, true, 30, 'youth', true, true
  ),
  (
    'adult-support', '成人支持团队', 'Adult Support Team',
    '支持青少年行动，并连接阿柑少年圈与家长守护团。',
    'Supports youth action and connects the youth and guardian planets.',
    '#72B18A', 'link', true, true, 40, 'support', true, true
  ),
  (
    'parent-guardian', '家长守护团', 'Parent Guardian Circle',
    '以家庭经验、陪伴与共同守护支持社群成长。',
    'Supports community growth through family experience, care, and guardianship.',
    '#8BB5C8', 'shield', true, true, 50, 'guardian', true, true
  )
on conflict do nothing;

update public.identity_labels
set
  name_zh = seed.name_zh,
  name_en = seed.name_en,
  description = seed.description,
  description_en = seed.description_en,
  color = seed.color,
  icon = seed.icon,
  is_public = true,
  is_active = true,
  sort_order = seed.sort_order,
  planet_slug = seed.planet_slug,
  selectable_on_signup = seed.selectable_on_signup,
  is_core = true,
  archived_at = null
from (
  values
    ('rgan-founder', '阿柑少年发起人', 'R-Gan Junior Founder', '发起并持续守护阿柑少年方向。', 'Initiates and stewards the direction of R-Gan Junior.', '#F08A4B', 'sparkles', 10, 'youth', false),
    ('youth-co-creator', '青年共创伙伴', 'Youth Co-creator', '与伙伴一起设计、实践和记录真实行动。', 'Co-designs, practices, and documents real-world action with peers.', '#F2B35D', 'orbit', 20, 'youth', true),
    ('participant', '参与者', 'Participant', '参与阿柑少年的活动、共练与社群生活。', 'Takes part in R-Gan Junior activities, practice, and community life.', '#E9C979', 'circle-dot', 30, 'youth', true),
    ('adult-support', '成人支持团队', 'Adult Support Team', '支持青少年行动，并连接阿柑少年圈与家长守护团。', 'Supports youth action and connects the youth and guardian planets.', '#72B18A', 'link', 40, 'support', true),
    ('parent-guardian', '家长守护团', 'Parent Guardian Circle', '以家庭经验、陪伴与共同守护支持社群成长。', 'Supports community growth through family experience, care, and guardianship.', '#8BB5C8', 'shield', 50, 'guardian', true)
) as seed(slug, name_zh, name_en, description, description_en, color, icon, sort_order, planet_slug, selectable_on_signup)
where lower(public.identity_labels.slug) = seed.slug;

create table private.community_identity_declarations (
  user_id uuid not null references auth.users(id) on delete cascade,
  identity_label_id bigint not null references public.identity_labels(id) on delete restrict,
  is_primary boolean not null default false,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'rejected', 'superseded')),
  declared_at timestamptz not null default now(),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  primary key (user_id, identity_label_id),
  constraint community_identity_declarations_review_check check (
    (status = 'pending' and reviewed_by is null and reviewed_at is null)
    or (status <> 'pending' and reviewed_at is not null)
  )
);

create unique index community_identity_declarations_one_primary_uidx
  on private.community_identity_declarations (user_id)
  where is_primary and status in ('pending', 'confirmed');
create index community_identity_declarations_status_idx
  on private.community_identity_declarations (status, identity_label_id, user_id);

create trigger community_identity_declarations_audit_changes
after insert or update or delete on private.community_identity_declarations
for each row execute function private.audit_row_change('community_identity_declaration');

revoke all on private.community_identity_declarations from public, anon, authenticated;

-- Replace the existing signup hook so identity intent is captured beside the
-- existing age-band profile creation. The metadata is never used for access.
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
  primary_identity_slug text := lower(trim(new.raw_user_meta_data ->> 'community_primary_identity_slug'));
  secondary_identity_slugs jsonb := new.raw_user_meta_data -> 'community_secondary_identity_slugs';
  primary_identity_id bigint;
  secondary_identity_slug text;
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

  if nullif(primary_identity_slug, '') is not null then
    select il.id into primary_identity_id
    from public.identity_labels il
    where lower(il.slug) = primary_identity_slug
      and il.selectable_on_signup
      and il.is_active
      and il.archived_at is null;

    if primary_identity_id is null then
      raise exception using errcode = '22023', message = 'INVALID_SIGNUP_IDENTITY';
    end if;

    insert into private.community_identity_declarations (
      user_id, identity_label_id, is_primary
    ) values (new.id, primary_identity_id, true);

    if jsonb_typeof(secondary_identity_slugs) = 'array' then
      for secondary_identity_slug in
        select distinct lower(trim(value))
        from jsonb_array_elements_text(secondary_identity_slugs)
      loop
        if secondary_identity_slug <> primary_identity_slug then
          insert into private.community_identity_declarations (
            user_id, identity_label_id, is_primary
          )
          select new.id, il.id, false
          from public.identity_labels il
          where lower(il.slug) = secondary_identity_slug
            and il.selectable_on_signup
            and il.is_active
            and il.archived_at is null
          on conflict (user_id, identity_label_id) do nothing;
        end if;
      end loop;
    end if;
  end if;

  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

create or replace function private.set_confirmed_person_identities(
  target_person_id bigint,
  primary_identity_slug text,
  secondary_identity_slugs text[],
  actor_user_id uuid,
  allow_founder boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_primary text := lower(trim(primary_identity_slug));
  normalized_secondary text[];
  selected_slugs text[];
  matched_count integer;
begin
  if nullif(normalized_primary, '') is null then
    raise exception using errcode = '22023', message = 'PRIMARY_IDENTITY_REQUIRED';
  end if;

  select coalesce(array_agg(value order by value), array[]::text[])
  into normalized_secondary
  from (
    select distinct lower(trim(raw_value)) as value
    from unnest(coalesce(secondary_identity_slugs, array[]::text[])) as secondary(raw_value)
    where nullif(trim(raw_value), '') is not null
      and lower(trim(raw_value)) <> normalized_primary
  ) normalized;

  selected_slugs := array_prepend(normalized_primary, normalized_secondary);

  select count(*) into matched_count
  from public.identity_labels il
  where lower(il.slug) = any(selected_slugs)
    and il.is_active
    and il.archived_at is null
    and il.planet_slug is not null;

  if matched_count <> cardinality(selected_slugs) then
    raise exception using errcode = '22023', message = 'INVALID_CONFIRMED_IDENTITY';
  end if;
  if 'rgan-founder' = any(selected_slugs) and not allow_founder then
    raise exception using errcode = '42501', message = 'FOUNDER_IDENTITY_REQUIRES_PEOPLE_MANAGER';
  end if;

  delete from public.person_identity_labels pil
  where pil.person_id = target_person_id;

  insert into public.person_identity_labels (
    person_id,
    identity_label_id,
    is_primary,
    assigned_by,
    assigned_at,
    valid_from,
    visibility
  )
  select
    target_person_id,
    il.id,
    lower(il.slug) = normalized_primary,
    actor_user_id,
    statement_timestamp(),
    current_date,
    'members'
  from unnest(selected_slugs) with ordinality selected(slug, position)
  join public.identity_labels il on lower(il.slug) = selected.slug
  order by selected.position;
end;
$$;

revoke all on function private.set_confirmed_person_identities(bigint, text, text[], uuid, boolean)
  from public, anon, authenticated;

create or replace function private.list_signup_identity_options()
returns table (
  id bigint,
  slug text,
  name_zh text,
  name_en text,
  description_zh text,
  description_en text,
  color text,
  icon text,
  planet_slug text,
  sort_order integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    il.id, il.slug, il.name_zh, il.name_en, il.description, il.description_en,
    il.color, il.icon, il.planet_slug, il.sort_order
  from public.identity_labels il
  where il.selectable_on_signup
    and il.is_active
    and il.archived_at is null
    and il.planet_slug is not null
    and lower(il.slug) <> 'rgan-founder'
  order by il.sort_order, il.id;
$$;

revoke all on function private.list_signup_identity_options() from public, anon, authenticated;
grant execute on function private.list_signup_identity_options() to anon, authenticated;

create function public.list_signup_identity_options()
returns table (
  id bigint,
  slug text,
  name_zh text,
  name_en text,
  description_zh text,
  description_en text,
  color text,
  icon text,
  planet_slug text,
  sort_order integer
)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from private.list_signup_identity_options();
$$;

revoke all on function public.list_signup_identity_options() from public;
grant execute on function public.list_signup_identity_options() to anon, authenticated;

create or replace function private.list_membership_application_identity_declarations(
  target_application_ids bigint[] default null
)
returns table (
  application_id bigint,
  user_id uuid,
  primary_identity_slug text,
  secondary_identity_slugs text[]
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare caller uuid := (select auth.uid());
begin
  if caller is null or not private.user_has_permission(caller, 'memberships.review') then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;

  return query
  select
    ca.id,
    ca.user_id,
    max(il.slug) filter (where cid.is_primary),
    coalesce(
      array_agg(il.slug order by il.sort_order, il.id)
        filter (where not cid.is_primary),
      array[]::text[]
    )
  from public.community_applications ca
  left join private.community_identity_declarations cid
    on cid.user_id = ca.user_id and cid.status = 'pending'
  left join public.identity_labels il on il.id = cid.identity_label_id
  where target_application_ids is null or ca.id = any(target_application_ids)
  group by ca.id, ca.user_id
  order by ca.id;
end;
$$;

revoke all on function private.list_membership_application_identity_declarations(bigint[])
  from public, anon, authenticated;
grant execute on function private.list_membership_application_identity_declarations(bigint[])
  to authenticated;

create function public.list_membership_application_identity_declarations(
  target_application_ids bigint[] default null
)
returns table (
  application_id bigint,
  user_id uuid,
  primary_identity_slug text,
  secondary_identity_slugs text[]
)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from private.list_membership_application_identity_declarations(target_application_ids);
$$;

revoke all on function public.list_membership_application_identity_declarations(bigint[])
  from public, anon;
grant execute on function public.list_membership_application_identity_declarations(bigint[])
  to authenticated;

create or replace function private.review_community_application_with_identities(
  target_application_id bigint,
  review_decision text,
  applicant_message text,
  reviewer_internal_note text default null,
  confirmed_primary_identity_slug text default null,
  confirmed_secondary_identity_slugs text[] default array[]::text[]
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  application_row public.community_applications%rowtype;
  person_id bigint;
  was_terminal boolean;
begin
  if caller is null or not private.user_has_permission(caller, 'memberships.review') then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;

  select * into application_row
  from public.community_applications ca
  where ca.id = target_application_id
  for update;
  if not found then
    raise exception using errcode = '22023', message = 'APPLICATION_NOT_FOUND';
  end if;

  was_terminal := application_row.status in ('approved', 'rejected');

  if review_decision = 'approve' and not was_terminal then
    select pe.id into person_id
    from public.people pe
    where pe.user_id = application_row.user_id;
    if person_id is null then
      raise exception using errcode = '22023', message = 'COMMUNITY_PERSON_NOT_FOUND';
    end if;

    -- Validate before the membership transition. The transaction still rolls
    -- back both operations if any later write fails.
    perform private.set_confirmed_person_identities(
      person_id,
      confirmed_primary_identity_slug,
      confirmed_secondary_identity_slugs,
      caller,
      private.user_has_permission(caller, 'people.manage')
    );
  end if;

  perform private.review_community_application(
    target_application_id,
    review_decision,
    applicant_message,
    reviewer_internal_note
  );

  if was_terminal then
    return;
  end if;

  update private.community_identity_declarations cid
  set
    status = case
      when review_decision = 'approve'
        and lower(il.slug) = any(
          array_prepend(
            lower(trim(confirmed_primary_identity_slug)),
            coalesce(confirmed_secondary_identity_slugs, array[]::text[])
          )
        ) then 'confirmed'
      else 'rejected'
    end,
    reviewed_by = caller,
    reviewed_at = statement_timestamp()
  from public.identity_labels il
  where cid.user_id = application_row.user_id
    and cid.identity_label_id = il.id
    and cid.status = 'pending';

  if review_decision = 'approve' then
    perform private.write_audit(
      'application.identities.confirmed',
      'community_application',
      target_application_id::text,
      null,
      jsonb_build_object(
        'primary', lower(trim(confirmed_primary_identity_slug)),
        'secondary', coalesce(confirmed_secondary_identity_slugs, array[]::text[])
      ),
      '{}'::jsonb
    );
  end if;
end;
$$;

revoke all on function private.review_community_application_with_identities(bigint, text, text, text, text, text[])
  from public, anon, authenticated;
grant execute on function private.review_community_application_with_identities(bigint, text, text, text, text, text[])
  to authenticated;

create function public.review_community_application_with_identities(
  target_application_id bigint,
  review_decision text,
  applicant_message text,
  reviewer_internal_note text default null,
  confirmed_primary_identity_slug text default null,
  confirmed_secondary_identity_slugs text[] default array[]::text[]
)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.review_community_application_with_identities(
    target_application_id,
    review_decision,
    applicant_message,
    reviewer_internal_note,
    confirmed_primary_identity_slug,
    confirmed_secondary_identity_slugs
  );
$$;

revoke all on function public.review_community_application_with_identities(bigint, text, text, text, text, text[])
  from public, anon;
grant execute on function public.review_community_application_with_identities(bigint, text, text, text, text, text[])
  to authenticated;

create or replace function private.list_community_identity_labels_admin()
returns table (
  id bigint,
  slug text,
  name_zh text,
  name_en text,
  description_zh text,
  description_en text,
  color text,
  icon text,
  planet_slug text,
  selectable_on_signup boolean,
  is_public boolean,
  is_active boolean,
  is_core boolean,
  sort_order integer,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare caller uuid := (select auth.uid());
begin
  if caller is null or not private.user_has_permission(caller, 'people.manage') then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;
  return query
  select
    il.id, il.slug, il.name_zh, il.name_en, il.description, il.description_en,
    il.color, il.icon, il.planet_slug, il.selectable_on_signup,
    il.is_public, il.is_active, il.is_core, il.sort_order, il.updated_at
  from public.identity_labels il
  order by il.sort_order, il.id;
end;
$$;

create or replace function private.update_community_identity_label_admin(
  target_label_id bigint,
  target_name_zh text,
  target_name_en text default null,
  target_description_zh text default null,
  target_description_en text default null,
  target_color text default null,
  target_planet_slug text default null,
  target_selectable_on_signup boolean default false,
  target_is_active boolean default true,
  target_sort_order integer default 0
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  label_slug text;
begin
  if caller is null or not private.user_has_permission(caller, 'people.manage') then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;
  if nullif(trim(target_name_zh), '') is null then
    raise exception using errcode = '22023', message = 'IDENTITY_NAME_REQUIRED';
  end if;
  if target_planet_slug not in ('youth', 'support', 'guardian') then
    raise exception using errcode = '22023', message = 'INVALID_PLANET_SLUG';
  end if;
  if target_color is not null and target_color !~ '^#[0-9A-Fa-f]{6}$' then
    raise exception using errcode = '22023', message = 'INVALID_IDENTITY_COLOR';
  end if;
  if target_sort_order < 0 then
    raise exception using errcode = '22023', message = 'INVALID_IDENTITY_SORT_ORDER';
  end if;

  select lower(il.slug) into label_slug
  from public.identity_labels il
  where il.id = target_label_id
  for update;
  if not found then
    raise exception using errcode = '22023', message = 'IDENTITY_LABEL_NOT_FOUND';
  end if;
  if label_slug = 'rgan-founder' and target_selectable_on_signup then
    raise exception using errcode = '42501', message = 'FOUNDER_IDENTITY_CANNOT_BE_SELF_SELECTED';
  end if;

  update public.identity_labels
  set
    name_zh = trim(target_name_zh),
    name_en = nullif(trim(target_name_en), ''),
    description = nullif(trim(target_description_zh), ''),
    description_en = nullif(trim(target_description_en), ''),
    color = upper(target_color),
    planet_slug = target_planet_slug,
    selectable_on_signup = target_selectable_on_signup,
    is_active = target_is_active,
    archived_at = case when target_is_active then null else statement_timestamp() end,
    sort_order = target_sort_order
  where id = target_label_id;
end;
$$;

create or replace function private.list_community_identity_members_admin(
  search_query text default null,
  page_size integer default 100
)
returns table (
  person_id bigint,
  user_id uuid,
  display_name text,
  nature_name text,
  membership_status text,
  primary_identity_slug text,
  secondary_identity_slugs text[],
  planet_slugs text[],
  latest_assigned_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  normalized_query text := nullif(lower(trim(search_query)), '');
begin
  if caller is null or not private.user_has_permission(caller, 'people.manage') then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;

  return query
  select
    pe.id,
    pe.user_id,
    pe.display_name,
    pe.nature_name,
    cm.status,
    max(il.slug) filter (where pil.is_primary),
    coalesce(
      array_agg(il.slug order by il.sort_order, il.id)
        filter (where not pil.is_primary and il.id is not null),
      array[]::text[]
    ),
    coalesce(
      array_agg(distinct il.planet_slug order by il.planet_slug)
        filter (where il.planet_slug is not null),
      array[]::text[]
    ),
    max(pil.assigned_at)
  from public.people pe
  join public.community_memberships cm on cm.user_id = pe.user_id
  left join public.person_identity_labels pil on pil.person_id = pe.id
  left join public.identity_labels il on il.id = pil.identity_label_id
  where cm.status = 'active'
    and (
      normalized_query is null
      or lower(pe.display_name) like '%' || normalized_query || '%'
      or lower(coalesce(pe.nature_name, '')) like '%' || normalized_query || '%'
      or lower(pe.slug) like '%' || normalized_query || '%'
    )
  group by pe.id, pe.user_id, pe.display_name, pe.nature_name, cm.status
  order by pe.display_name, pe.id
  limit least(greatest(coalesce(page_size, 100), 1), 200);
end;
$$;

create or replace function private.set_community_member_identities_admin(
  target_person_id bigint,
  primary_identity_slug text,
  secondary_identity_slugs text[] default array[]::text[]
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare caller uuid := (select auth.uid());
begin
  if caller is null or not private.user_has_permission(caller, 'people.manage') then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;
  if not exists (
    select 1
    from public.people pe
    join public.community_memberships cm on cm.user_id = pe.user_id
    where pe.id = target_person_id and cm.status = 'active'
  ) then
    raise exception using errcode = '22023', message = 'ACTIVE_MEMBER_NOT_FOUND';
  end if;

  perform private.set_confirmed_person_identities(
    target_person_id,
    primary_identity_slug,
    secondary_identity_slugs,
    caller,
    true
  );
end;
$$;

create or replace function private.get_community_identity_stats_admin()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  result jsonb;
begin
  if caller is null or not private.user_has_permission(caller, 'people.manage') then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;

  with active_people as (
    select pe.id
    from public.people pe
    join public.community_memberships cm on cm.user_id = pe.user_id
    where cm.status = 'active'
  ),
  person_planets as (
    select
      ap.id as person_id,
      coalesce(
        array_agg(distinct il.planet_slug order by il.planet_slug)
          filter (where il.planet_slug is not null),
        array[]::text[]
      ) as planets
    from active_people ap
    left join public.person_identity_labels pil on pil.person_id = ap.id
    left join public.identity_labels il
      on il.id = pil.identity_label_id
      and il.is_active
      and il.archived_at is null
    group by ap.id
  )
  select jsonb_build_object(
    'declared', coalesce((
      select jsonb_agg(jsonb_build_object('slug', counts.slug, 'count', counts.total) order by counts.sort_order)
      from (
        select il.slug, il.sort_order, count(distinct cid.user_id) as total
        from private.community_identity_declarations cid
        join public.identity_labels il on il.id = cid.identity_label_id
        where cid.status = 'pending'
        group by il.slug, il.sort_order
      ) counts
    ), '[]'::jsonb),
    'confirmedPrimary', coalesce((
      select jsonb_agg(jsonb_build_object('slug', counts.slug, 'count', counts.total) order by counts.sort_order)
      from (
        select il.slug, il.sort_order, count(distinct pil.person_id) as total
        from public.person_identity_labels pil
        join active_people ap on ap.id = pil.person_id
        join public.identity_labels il on il.id = pil.identity_label_id
        where pil.is_primary
        group by il.slug, il.sort_order
      ) counts
    ), '[]'::jsonb),
    'planets', coalesce((
      select jsonb_agg(jsonb_build_object('slug', planet, 'count', total) order by planet)
      from (
        select planet, count(*) as total
        from person_planets pp
        cross join lateral unnest(pp.planets) as expanded(planet)
        group by expanded.planet
      ) counts
    ), '[]'::jsonb),
    'overlaps', coalesce((
      select jsonb_agg(jsonb_build_object('planets', planets, 'count', total) order by planets::text)
      from (
        select pp.planets, count(*) as total
        from person_planets pp
        where cardinality(pp.planets) > 1
        group by pp.planets
      ) counts
    ), '[]'::jsonb),
    'pendingDeclarations', (
      select count(distinct cid.user_id)
      from private.community_identity_declarations cid
      where cid.status = 'pending'
    ),
    'missingPrimary', (
      select count(*)
      from person_planets pp
      where cardinality(pp.planets) = 0
    )
  ) into result;

  return result;
end;
$$;

revoke all on function private.list_community_identity_labels_admin(),
  private.update_community_identity_label_admin(bigint, text, text, text, text, text, text, boolean, boolean, integer),
  private.list_community_identity_members_admin(text, integer),
  private.set_community_member_identities_admin(bigint, text, text[]),
  private.get_community_identity_stats_admin()
  from public, anon, authenticated;
grant execute on function private.list_community_identity_labels_admin(),
  private.update_community_identity_label_admin(bigint, text, text, text, text, text, text, boolean, boolean, integer),
  private.list_community_identity_members_admin(text, integer),
  private.set_community_member_identities_admin(bigint, text, text[]),
  private.get_community_identity_stats_admin()
  to authenticated;

create function public.list_community_identity_labels_admin()
returns table (
  id bigint, slug text, name_zh text, name_en text, description_zh text,
  description_en text, color text, icon text, planet_slug text,
  selectable_on_signup boolean, is_public boolean, is_active boolean,
  is_core boolean, sort_order integer, updated_at timestamptz
)
language sql stable security invoker set search_path = ''
as $$ select * from private.list_community_identity_labels_admin(); $$;

create function public.update_community_identity_label_admin(
  target_label_id bigint,
  target_name_zh text,
  target_name_en text default null,
  target_description_zh text default null,
  target_description_en text default null,
  target_color text default null,
  target_planet_slug text default null,
  target_selectable_on_signup boolean default false,
  target_is_active boolean default true,
  target_sort_order integer default 0
)
returns void language sql security invoker set search_path = ''
as $$
  select private.update_community_identity_label_admin(
    target_label_id, target_name_zh, target_name_en,
    target_description_zh, target_description_en, target_color,
    target_planet_slug, target_selectable_on_signup,
    target_is_active, target_sort_order
  );
$$;

create function public.list_community_identity_members_admin(
  search_query text default null,
  page_size integer default 100
)
returns table (
  person_id bigint, user_id uuid, display_name text, nature_name text,
  membership_status text, primary_identity_slug text,
  secondary_identity_slugs text[], planet_slugs text[],
  latest_assigned_at timestamptz
)
language sql stable security invoker set search_path = ''
as $$ select * from private.list_community_identity_members_admin(search_query, page_size); $$;

create function public.set_community_member_identities_admin(
  target_person_id bigint,
  primary_identity_slug text,
  secondary_identity_slugs text[] default array[]::text[]
)
returns void language sql security invoker set search_path = ''
as $$
  select private.set_community_member_identities_admin(
    target_person_id, primary_identity_slug, secondary_identity_slugs
  );
$$;

create function public.get_community_identity_stats_admin()
returns jsonb language sql stable security invoker set search_path = ''
as $$ select private.get_community_identity_stats_admin(); $$;

revoke all on function public.list_community_identity_labels_admin(),
  public.update_community_identity_label_admin(bigint, text, text, text, text, text, text, boolean, boolean, integer),
  public.list_community_identity_members_admin(text, integer),
  public.set_community_member_identities_admin(bigint, text, text[]),
  public.get_community_identity_stats_admin()
  from public, anon;
grant execute on function public.list_community_identity_labels_admin(),
  public.update_community_identity_label_admin(bigint, text, text, text, text, text, text, boolean, boolean, integer),
  public.list_community_identity_members_admin(text, integer),
  public.set_community_member_identities_admin(bigint, text, text[]),
  public.get_community_identity_stats_admin()
  to authenticated;

-- Return confirmed identity and planet data with the existing people directory.
drop function public.list_community_people(integer, date, bigint);
drop function private.list_community_people(integer, date, bigint);

create function private.list_community_people(
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
  profile_visibility text,
  primary_identity_slug text,
  primary_identity_name_zh text,
  primary_identity_name_en text,
  primary_identity_color text,
  primary_planet_slug text,
  identity_labels jsonb,
  planet_slugs text[]
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
    pe.profile_visibility,
    identities.primary_slug,
    identities.primary_name_zh,
    identities.primary_name_en,
    identities.primary_color,
    identities.primary_planet,
    identities.labels,
    identities.planets
  from public.people pe
  join lateral (
    select
      max(il.slug) filter (where pil.is_primary) as primary_slug,
      max(il.name_zh) filter (where pil.is_primary) as primary_name_zh,
      max(il.name_en) filter (where pil.is_primary) as primary_name_en,
      max(il.color) filter (where pil.is_primary) as primary_color,
      max(il.planet_slug) filter (where pil.is_primary) as primary_planet,
      jsonb_agg(
        jsonb_build_object(
          'slug', il.slug,
          'nameZh', il.name_zh,
          'nameEn', il.name_en,
          'color', il.color,
          'planetSlug', il.planet_slug,
          'isPrimary', pil.is_primary
        )
        order by pil.is_primary desc, il.sort_order, il.id
      ) as labels,
      array_agg(distinct il.planet_slug order by il.planet_slug) as planets
    from public.person_identity_labels pil
    join public.identity_labels il on il.id = pil.identity_label_id
    where pil.person_id = pe.id
      and il.is_active
      and il.archived_at is null
      and il.planet_slug is not null
      and (pil.valid_from is null or pil.valid_from <= current_date)
      and (pil.valid_until is null or pil.valid_until >= current_date)
      and (
        pil.visibility = 'public'
        or (pil.visibility = 'members' and caller_is_member)
        or pe.user_id = caller
        or caller_can_manage
      )
    having bool_or(pil.is_primary)
  ) identities on true
  where pe.status = 'active'
    and private.has_active_membership(pe.user_id)
    and (
      (pe.is_public and pe.profile_visibility = 'public')
      or (pe.profile_visibility = 'members' and caller_is_member)
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

revoke all on function private.list_community_people(integer, date, bigint)
  from public, anon, authenticated;
grant execute on function private.list_community_people(integer, date, bigint)
  to authenticated;

create function public.list_community_people(
  page_size integer default 40,
  before_joined_at date default null,
  before_person_id bigint default null
)
returns table (
  id bigint, slug text, display_name text, name_zh text, name_en text,
  nature_name text, bio text, city text, region text, country text,
  avatar_media_id bigint, joined_at date, profile_visibility text,
  primary_identity_slug text, primary_identity_name_zh text,
  primary_identity_name_en text, primary_identity_color text,
  primary_planet_slug text, identity_labels jsonb, planet_slugs text[]
)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from private.list_community_people(page_size, before_joined_at, before_person_id);
$$;

revoke all on function public.list_community_people(integer, date, bigint)
  from public, anon;
grant execute on function public.list_community_people(integer, date, bigint)
  to authenticated;

comment on function public.list_signup_identity_options() is
  'Public registration labels. These are self-reported intent only and never grant access.';
comment on function public.review_community_application_with_identities(bigint, text, text, text, text, text[]) is
  'Atomically reviews a membership application and confirms one primary plus optional secondary identities.';
comment on function public.get_community_identity_stats_admin() is
  'People-manager-only declared, confirmed, planet, overlap, and missing-identity counts.';
