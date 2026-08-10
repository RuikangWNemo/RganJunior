-- Account, person, and identity-label foundations.
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text,
  display_name text not null default '',
  avatar_media_id bigint,
  bio text,
  city text,
  region text,
  country text,
  preferred_language text not null default 'zh'
    check (preferred_language in ('zh', 'en')),
  timezone text not null default 'Asia/Shanghai',
  website text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format_check check (
    username is null
    or username ~ '^[a-z0-9][a-z0-9_-]{2,31}$'
  )
);

create unique index profiles_username_lower_uidx
  on public.profiles (lower(username))
  where username is not null;

create table public.people (
  id bigint generated always as identity primary key,
  user_id uuid unique references auth.users(id) on delete set null,
  slug text not null,
  display_name text not null,
  full_name_private text,
  bio text,
  avatar_media_id bigint,
  city text,
  region text,
  country text,
  joined_at date,
  is_public boolean not null default false,
  status text not null default 'active'
    check (status in ('active', 'inactive', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint people_slug_format_check check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  )
);

create unique index people_slug_lower_uidx on public.people (lower(slug));
create index people_user_id_idx on public.people (user_id) where user_id is not null;
create index people_public_sort_idx
  on public.people (display_name, id)
  where is_public and status = 'active';

create table public.identity_labels (
  id bigint generated always as identity primary key,
  slug text not null,
  name_zh text not null,
  name_en text,
  description text,
  color text,
  icon text,
  is_public boolean not null default true,
  is_active boolean not null default true,
  sort_order integer not null default 0 check (sort_order >= 0),
  archived_at timestamptz,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint identity_labels_slug_format_check check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint identity_labels_color_check check (
    color is null or color ~ '^#[0-9A-Fa-f]{6}$'
  )
);

create unique index identity_labels_slug_lower_uidx
  on public.identity_labels (lower(slug));
create index identity_labels_public_sort_idx
  on public.identity_labels (sort_order, id)
  where is_public and is_active and archived_at is null;
create index identity_labels_created_by_idx
  on public.identity_labels (created_by)
  where created_by is not null;

create table public.person_identity_labels (
  person_id bigint not null references public.people(id) on delete cascade,
  identity_label_id bigint not null references public.identity_labels(id) on delete restrict,
  is_primary boolean not null default false,
  assigned_by uuid references auth.users(id) on delete set null default auth.uid(),
  assigned_at timestamptz not null default now(),
  valid_from date,
  valid_until date,
  visibility text not null default 'public'
    check (visibility in ('public', 'members', 'private')),
  primary key (person_id, identity_label_id),
  constraint person_identity_labels_validity_check check (
    valid_until is null or valid_from is null or valid_until >= valid_from
  )
);

create index person_identity_labels_label_idx
  on public.person_identity_labels (identity_label_id, person_id);
create index person_identity_labels_assigned_by_idx
  on public.person_identity_labels (assigned_by)
  where assigned_by is not null;
create unique index person_identity_labels_one_primary_uidx
  on public.person_identity_labels (person_id)
  where is_primary;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create trigger people_set_updated_at
before update on public.people
for each row execute function private.set_updated_at();

create trigger identity_labels_set_updated_at
before update on public.identity_labels
for each row execute function private.set_updated_at();

create or replace function private.protect_profile_system_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.user_id is distinct from old.user_id
     or new.created_at is distinct from old.created_at then
    raise exception using
      errcode = '42501',
      message = 'PROFILE_SYSTEM_FIELDS_IMMUTABLE';
  end if;
  return new;
end;
$$;

create trigger profiles_protect_system_fields
before update on public.profiles
for each row execute function private.protect_profile_system_fields();

create or replace function private.protect_identity_label_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
begin
  if tg_op = 'INSERT' then
    if caller is not null then
      new.created_by = caller;
    end if;
    return new;
  end if;

  if new.id is distinct from old.id
     or new.created_by is distinct from old.created_by
     or new.created_at is distinct from old.created_at then
    raise exception using
      errcode = '42501',
      message = 'IDENTITY_LABEL_SYSTEM_FIELDS_IMMUTABLE';
  end if;
  return new;
end;
$$;

create trigger identity_labels_protect_fields
before insert or update on public.identity_labels
for each row execute function private.protect_identity_label_fields();

create or replace function private.protect_identity_assignment_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
begin
  if tg_op = 'INSERT' then
    if caller is not null then
      new.assigned_by = caller;
      new.assigned_at = statement_timestamp();
    end if;
    return new;
  end if;

  if new.person_id is distinct from old.person_id
     or new.identity_label_id is distinct from old.identity_label_id
     or new.assigned_by is distinct from old.assigned_by
     or new.assigned_at is distinct from old.assigned_at then
    raise exception using
      errcode = '42501',
      message = 'IDENTITY_ASSIGNMENT_SYSTEM_FIELDS_IMMUTABLE';
  end if;
  return new;
end;
$$;

create trigger person_identity_labels_protect_fields
before insert or update on public.person_identity_labels
for each row execute function private.protect_identity_assignment_fields();

alter table public.profiles enable row level security;
alter table public.people enable row level security;
alter table public.identity_labels enable row level security;
alter table public.person_identity_labels enable row level security;

revoke all on public.profiles from anon, authenticated;
revoke all on public.people from anon, authenticated;
revoke all on public.identity_labels from anon, authenticated;
revoke all on public.person_identity_labels from anon, authenticated;

grant select, update on public.profiles to authenticated;
grant select on public.people to anon, authenticated;
grant select on public.identity_labels to anon, authenticated;
grant select on public.person_identity_labels to anon, authenticated;

create policy profiles_select_own
on public.profiles for select
to authenticated
using ((select auth.uid()) = user_id);

create policy profiles_update_own
on public.profiles for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy people_select_public
on public.people for select
to anon, authenticated
using (is_public and status = 'active');

create policy people_select_linked_account
on public.people for select
to authenticated
using ((select auth.uid()) = user_id);

create policy identity_labels_select_public
on public.identity_labels for select
to anon, authenticated
using (is_public and is_active and archived_at is null);

create policy person_identity_labels_select_public
on public.person_identity_labels for select
to anon, authenticated
using (
  visibility = 'public'
  and (valid_from is null or valid_from <= current_date)
  and (valid_until is null or valid_until >= current_date)
  and exists (
    select 1
    from public.people p
    where p.id = person_id
      and p.is_public
      and p.status = 'active'
  )
  and exists (
    select 1
    from public.identity_labels il
    where il.id = identity_label_id
      and il.is_public
      and il.is_active
      and il.archived_at is null
  )
);

create policy person_identity_labels_select_linked_account
on public.person_identity_labels for select
to authenticated
using (
  exists (
    select 1
    from public.people p
    where p.id = person_id
      and p.user_id = (select auth.uid())
  )
);

comment on table public.profiles is 'Private-by-default account profiles linked 1:1 to auth.users.';
comment on table public.people is 'Real-world people; an account link is optional.';
comment on table public.identity_labels is 'Dynamic relationship labels, independent from authorization roles.';
