-- Role-based authorization and append-only audit infrastructure.
create table public.roles (
  id bigint generated always as identity primary key,
  slug text not null,
  name text not null,
  description text,
  is_system boolean not null default false,
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint roles_slug_format_check check (
    slug ~ '^[a-z0-9]+(?:_[a-z0-9]+)*$'
  )
);

create unique index roles_slug_lower_uidx on public.roles (lower(slug));
create index roles_created_by_idx on public.roles (created_by) where created_by is not null;

create table public.permissions (
  id bigint generated always as identity primary key,
  permission_key text not null unique,
  description text,
  is_sensitive boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint permissions_key_format_check check (
    permission_key ~ '^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$'
  )
);

create table public.role_permissions (
  role_id bigint not null references public.roles(id) on delete cascade,
  permission_id bigint not null references public.permissions(id) on delete restrict,
  granted_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

create index role_permissions_permission_idx
  on public.role_permissions (permission_id, role_id);
create index role_permissions_granted_by_idx
  on public.role_permissions (granted_by)
  where granted_by is not null;

create table public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id bigint not null references public.roles(id) on delete restrict,
  assigned_by uuid references auth.users(id) on delete set null default auth.uid(),
  assigned_at timestamptz not null default now(),
  expires_at timestamptz,
  primary key (user_id, role_id),
  constraint user_roles_expiry_check check (
    expires_at is null or expires_at > assigned_at
  )
);

create index user_roles_role_idx on public.user_roles (role_id, user_id);
create index user_roles_active_user_idx
  on public.user_roles (user_id, expires_at);
create index user_roles_assigned_by_idx
  on public.user_roles (assigned_by)
  where assigned_by is not null;

create table private.audit_logs (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  before_data jsonb,
  after_data jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint audit_logs_action_format_check check (
    action ~ '^[a-z][a-z0-9_.-]*$'
  )
);

create index audit_logs_created_at_idx on private.audit_logs (created_at desc, id desc);
create index audit_logs_actor_idx
  on private.audit_logs (actor_user_id, created_at desc)
  where actor_user_id is not null;
create index audit_logs_entity_idx
  on private.audit_logs (entity_type, entity_id, created_at desc);

create trigger roles_set_updated_at
before update on public.roles
for each row execute function private.set_updated_at();

create trigger permissions_set_updated_at
before update on public.permissions
for each row execute function private.set_updated_at();

create or replace function private.user_has_permission(
  check_user_id uuid,
  check_permission_key text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    check_user_id is not null
    and (
      exists (
        select 1
        from public.user_roles ur
        join public.roles r on r.id = ur.role_id
        where ur.user_id = check_user_id
          and r.slug = 'super_admin'
          and r.is_active
          and (ur.expires_at is null or ur.expires_at > statement_timestamp())
      )
      or exists (
        select 1
        from public.user_roles ur
        join public.roles r on r.id = ur.role_id
        join public.role_permissions rp on rp.role_id = r.id
        join public.permissions p on p.id = rp.permission_id
        where ur.user_id = check_user_id
          and r.is_active
          and p.permission_key = check_permission_key
          and (ur.expires_at is null or ur.expires_at > statement_timestamp())
      )
    );
$$;

create or replace function private.has_permission(check_permission_key text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.user_has_permission((select auth.uid()), check_permission_key);
$$;

create or replace function private.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = (select auth.uid())
      and r.slug = 'super_admin'
      and r.is_active
      and (ur.expires_at is null or ur.expires_at > statement_timestamp())
  );
$$;

revoke all on function private.user_has_permission(uuid, text) from public, anon, authenticated;
revoke all on function private.has_permission(text) from public, anon, authenticated;
revoke all on function private.is_super_admin() from public, anon, authenticated;

grant usage on schema private to anon, authenticated;
grant execute on function private.has_permission(text) to authenticated;
grant execute on function private.is_super_admin() to authenticated;

create or replace function public.has_permission(permission_key text)
returns boolean
language sql
stable
set search_path = ''
as $$
  select private.has_permission(permission_key);
$$;

revoke all on function public.has_permission(text) from public, anon;
grant execute on function public.has_permission(text) to authenticated;

create or replace function private.write_audit(
  audit_action text,
  audit_entity_type text,
  audit_entity_id text,
  audit_before jsonb default null,
  audit_after jsonb default null,
  audit_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into private.audit_logs (
    actor_user_id,
    action,
    entity_type,
    entity_id,
    before_data,
    after_data,
    metadata
  ) values (
    (select auth.uid()),
    audit_action,
    audit_entity_type,
    audit_entity_id,
    audit_before,
    audit_after,
    coalesce(audit_metadata, '{}'::jsonb)
  );
end;
$$;

revoke all on function private.write_audit(text, text, text, jsonb, jsonb, jsonb)
  from public, anon, authenticated;

create or replace function private.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  before_row jsonb;
  after_row jsonb;
  entity_value text;
begin
  if (select auth.uid()) is null then
    return null;
  end if;

  before_row := case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end;
  after_row := case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end;
  entity_value := coalesce(
    after_row ->> 'id',
    before_row ->> 'id',
    after_row ->> 'user_id',
    before_row ->> 'user_id',
    after_row ->> 'person_id',
    before_row ->> 'person_id'
  );

  perform private.write_audit(
    lower(tg_op),
    tg_argv[0],
    entity_value,
    before_row,
    after_row,
    '{}'::jsonb
  );
  return null;
end;
$$;

revoke all on function private.audit_row_change() from public, anon, authenticated;

create trigger profiles_audit_changes
after update on public.profiles
for each row execute function private.audit_row_change('profile');

create trigger people_audit_changes
after insert or update or delete on public.people
for each row execute function private.audit_row_change('person');

create trigger identity_labels_audit_changes
after insert or update or delete on public.identity_labels
for each row execute function private.audit_row_change('identity_label');

create trigger person_identity_labels_audit_changes
after insert or update or delete on public.person_identity_labels
for each row execute function private.audit_row_change('person_identity_label');

create or replace function private.protect_role_fields()
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
      new.is_system = false;
    end if;
    return new;
  end if;

  if new.id is distinct from old.id
     or new.is_system is distinct from old.is_system
     or new.created_by is distinct from old.created_by
     or new.created_at is distinct from old.created_at then
    raise exception using errcode = '42501', message = 'ROLE_SYSTEM_FIELDS_IMMUTABLE';
  end if;
  return new;
end;
$$;

create trigger roles_protect_fields
before insert or update on public.roles
for each row execute function private.protect_role_fields();

create or replace function private.protect_user_role_fields()
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

  if new.user_id is distinct from old.user_id
     or new.role_id is distinct from old.role_id then
    raise exception using errcode = '42501', message = 'USER_ROLE_SYSTEM_FIELDS_IMMUTABLE';
  end if;
  return new;
end;
$$;

create trigger user_roles_protect_fields
before insert or update on public.user_roles
for each row execute function private.protect_user_role_fields();

create or replace function private.guard_last_super_admin()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  old_is_super boolean;
  old_is_active boolean;
  new_still_active boolean := false;
  remaining_count bigint;
begin
  select r.slug = 'super_admin'
  into old_is_super
  from public.roles r
  where r.id = old.role_id;

  old_is_active := old.expires_at is null or old.expires_at > statement_timestamp();

  if tg_op = 'UPDATE' then
    new_still_active := new.role_id = old.role_id
      and new.user_id = old.user_id
      and (new.expires_at is null or new.expires_at > statement_timestamp());
  end if;

  if coalesce(old_is_super, false) and old_is_active and not new_still_active then
    select count(*)
    into remaining_count
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where r.slug = 'super_admin'
      and r.is_active
      and (ur.expires_at is null or ur.expires_at > statement_timestamp())
      and not (ur.user_id = old.user_id and ur.role_id = old.role_id);

    if remaining_count = 0 then
      raise exception using errcode = '23514', message = 'LAST_SUPER_ADMIN_REQUIRED';
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger user_roles_guard_last_super_admin
before update or delete on public.user_roles
for each row execute function private.guard_last_super_admin();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted_roles integer;
begin
  insert into public.profiles (user_id, display_name)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      split_part(coalesce(new.email, ''), '@', 1)
    )
  );

  insert into public.user_roles (user_id, role_id, assigned_by)
  select new.id, r.id, null
  from public.roles r
  where r.slug = 'member' and r.is_active;

  get diagnostics inserted_roles = row_count;
  if inserted_roles <> 1 then
    raise exception using errcode = '23514', message = 'MEMBER_ROLE_NOT_CONFIGURED';
  end if;
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

create or replace function private.bootstrap_super_admin(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  super_role_id bigint;
begin
  if not exists (select 1 from auth.users u where u.id = target_user_id) then
    raise exception using errcode = '22023', message = 'USER_NOT_FOUND';
  end if;

  if exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where r.slug = 'super_admin'
      and r.is_active
      and (ur.expires_at is null or ur.expires_at > statement_timestamp())
  ) then
    raise exception using errcode = '42501', message = 'SUPER_ADMIN_ALREADY_BOOTSTRAPPED';
  end if;

  select id into super_role_id
  from public.roles
  where slug = 'super_admin' and is_active;

  if super_role_id is null then
    raise exception using errcode = '23514', message = 'SUPER_ADMIN_ROLE_NOT_CONFIGURED';
  end if;

  insert into public.user_roles (user_id, role_id, assigned_by)
  values (target_user_id, super_role_id, null)
  on conflict (user_id, role_id) do update
    set expires_at = null;
end;
$$;

revoke all on function private.bootstrap_super_admin(uuid) from public, anon, authenticated;
grant execute on function private.bootstrap_super_admin(uuid) to postgres, service_role;

create or replace function public.create_role(
  role_slug text,
  role_name text,
  role_description text default null
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  created_role_id bigint;
begin
  if caller is null or not private.user_has_permission(caller, 'roles.manage') then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;
  if role_slug !~ '^[a-z0-9]+(?:_[a-z0-9]+)*$' then
    raise exception using errcode = '22023', message = 'INVALID_ROLE_SLUG';
  end if;
  if nullif(trim(role_name), '') is null then
    raise exception using errcode = '22023', message = 'ROLE_NAME_REQUIRED';
  end if;

  insert into public.roles (slug, name, description, is_system, created_by)
  values (lower(role_slug), trim(role_name), nullif(trim(role_description), ''), false, caller)
  returning id into created_role_id;

  perform private.write_audit(
    'role.create', 'role', created_role_id::text, null,
    (select to_jsonb(r) from public.roles r where r.id = created_role_id)
  );
  return created_role_id;
end;
$$;

create or replace function public.set_role_permissions(
  target_role_id bigint,
  permission_keys text[]
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  target_role public.roles%rowtype;
  requested_count integer;
  existing_count integer;
  before_permissions jsonb;
  after_permissions jsonb;
begin
  if caller is null or not private.user_has_permission(caller, 'roles.manage') then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;

  select * into target_role from public.roles where id = target_role_id for update;
  if not found then
    raise exception using errcode = '22023', message = 'ROLE_NOT_FOUND';
  end if;
  if target_role.is_system and not private.is_super_admin() then
    raise exception using errcode = '42501', message = 'SUPER_ADMIN_REQUIRED';
  end if;

  select count(distinct key_value)
  into requested_count
  from unnest(coalesce(permission_keys, array[]::text[])) as key_value;

  select count(*)
  into existing_count
  from public.permissions p
  where p.permission_key = any(coalesce(permission_keys, array[]::text[]));

  if existing_count <> requested_count then
    raise exception using errcode = '22023', message = 'UNKNOWN_PERMISSION';
  end if;

  if not private.is_super_admin() and exists (
    select 1
    from public.permissions p
    where p.permission_key = any(coalesce(permission_keys, array[]::text[]))
      and (
        p.is_sensitive
        or not private.user_has_permission(caller, p.permission_key)
      )
  ) then
    raise exception using errcode = '42501', message = 'CANNOT_GRANT_PERMISSION';
  end if;

  select coalesce(jsonb_agg(p.permission_key order by p.permission_key), '[]'::jsonb)
  into before_permissions
  from public.role_permissions rp
  join public.permissions p on p.id = rp.permission_id
  where rp.role_id = target_role_id;

  delete from public.role_permissions where role_id = target_role_id;
  insert into public.role_permissions (role_id, permission_id, granted_by)
  select target_role_id, p.id, caller
  from public.permissions p
  where p.permission_key = any(coalesce(permission_keys, array[]::text[]));

  select coalesce(jsonb_agg(p.permission_key order by p.permission_key), '[]'::jsonb)
  into after_permissions
  from public.role_permissions rp
  join public.permissions p on p.id = rp.permission_id
  where rp.role_id = target_role_id;

  perform private.write_audit(
    'role.permissions.set', 'role', target_role_id::text,
    jsonb_build_object('permissions', before_permissions),
    jsonb_build_object('permissions', after_permissions)
  );
end;
$$;

create or replace function public.assign_user_role(
  target_user_id uuid,
  target_role_id bigint,
  role_expires_at timestamptz default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  target_role public.roles%rowtype;
begin
  if caller is null or not private.user_has_permission(caller, 'role_assignments.manage') then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;
  if not exists (select 1 from auth.users u where u.id = target_user_id) then
    raise exception using errcode = '22023', message = 'USER_NOT_FOUND';
  end if;
  if role_expires_at is not null and role_expires_at <= statement_timestamp() then
    raise exception using errcode = '22023', message = 'INVALID_ROLE_EXPIRY';
  end if;

  select * into target_role
  from public.roles
  where id = target_role_id and is_active;
  if not found then
    raise exception using errcode = '22023', message = 'ROLE_NOT_FOUND';
  end if;
  if target_role.slug = 'super_admin' and not private.is_super_admin() then
    raise exception using errcode = '42501', message = 'SUPER_ADMIN_REQUIRED';
  end if;
  if not private.is_super_admin() and exists (
    select 1
    from public.role_permissions rp
    join public.permissions p on p.id = rp.permission_id
    where rp.role_id = target_role_id
      and not private.user_has_permission(caller, p.permission_key)
  ) then
    raise exception using errcode = '42501', message = 'CANNOT_ASSIGN_ROLE_WITH_EXTRA_PERMISSIONS';
  end if;

  insert into public.user_roles (
    user_id, role_id, assigned_by, assigned_at, expires_at
  ) values (
    target_user_id, target_role_id, caller, statement_timestamp(), role_expires_at
  )
  on conflict (user_id, role_id) do update
    set assigned_by = excluded.assigned_by,
        assigned_at = excluded.assigned_at,
        expires_at = excluded.expires_at;

  perform private.write_audit(
    'user_role.assign', 'user_role', target_user_id::text, null,
    jsonb_build_object('role_id', target_role_id, 'expires_at', role_expires_at)
  );
end;
$$;

create or replace function public.revoke_user_role(
  target_user_id uuid,
  target_role_id bigint
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  target_slug text;
begin
  if caller is null or not private.user_has_permission(caller, 'role_assignments.manage') then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;
  select slug into target_slug from public.roles where id = target_role_id;
  if target_slug is null then
    raise exception using errcode = '22023', message = 'ROLE_NOT_FOUND';
  end if;
  if target_slug = 'super_admin' and not private.is_super_admin() then
    raise exception using errcode = '42501', message = 'SUPER_ADMIN_REQUIRED';
  end if;

  delete from public.user_roles
  where user_id = target_user_id and role_id = target_role_id;

  perform private.write_audit(
    'user_role.revoke', 'user_role', target_user_id::text,
    jsonb_build_object('role_id', target_role_id), null
  );
end;
$$;

create or replace function public.get_my_permissions()
returns table (permission_key text)
language sql
stable
security definer
set search_path = ''
as $$
  select distinct p.permission_key
  from public.permissions p
  where (select auth.uid()) is not null
    and private.user_has_permission((select auth.uid()), p.permission_key)
  order by p.permission_key;
$$;

create or replace function public.get_audit_logs(
  page_size integer default 100,
  before_created_at timestamptz default null
)
returns table (
  id bigint,
  actor_user_id uuid,
  action text,
  entity_type text,
  entity_id text,
  before_data jsonb,
  after_data jsonb,
  metadata jsonb,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.has_permission('audit.read') then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;
  return query
  select a.id, a.actor_user_id, a.action, a.entity_type, a.entity_id,
         a.before_data, a.after_data, a.metadata, a.created_at
  from private.audit_logs a
  where before_created_at is null or a.created_at < before_created_at
  order by a.created_at desc, a.id desc
  limit least(greatest(coalesce(page_size, 100), 1), 200);
end;
$$;

revoke all on function public.create_role(text, text, text) from public, anon;
revoke all on function public.set_role_permissions(bigint, text[]) from public, anon;
revoke all on function public.assign_user_role(uuid, bigint, timestamptz) from public, anon;
revoke all on function public.revoke_user_role(uuid, bigint) from public, anon;
revoke all on function public.get_my_permissions() from public, anon;
revoke all on function public.get_audit_logs(integer, timestamptz) from public, anon;

grant execute on function public.create_role(text, text, text) to authenticated;
grant execute on function public.set_role_permissions(bigint, text[]) to authenticated;
grant execute on function public.assign_user_role(uuid, bigint, timestamptz) to authenticated;
grant execute on function public.revoke_user_role(uuid, bigint) to authenticated;
grant execute on function public.get_my_permissions() to authenticated;
grant execute on function public.get_audit_logs(integer, timestamptz) to authenticated;

alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_roles enable row level security;
alter table private.audit_logs enable row level security;

revoke all on public.roles from anon, authenticated;
revoke all on public.permissions from anon, authenticated;
revoke all on public.role_permissions from anon, authenticated;
revoke all on public.user_roles from anon, authenticated;
revoke all on private.audit_logs from public, anon, authenticated;

grant select on public.roles to authenticated;
grant select on public.permissions to authenticated;
grant select on public.role_permissions to authenticated;
grant select on public.user_roles to authenticated;

create policy roles_select_authorized
on public.roles for select
to authenticated
using (
  private.has_permission('roles.read')
  or private.has_permission('roles.manage')
  or private.has_permission('role_assignments.manage')
);

create policy permissions_select_authorized
on public.permissions for select
to authenticated
using (
  private.has_permission('roles.read')
  or private.has_permission('roles.manage')
);

create policy role_permissions_select_authorized
on public.role_permissions for select
to authenticated
using (
  private.has_permission('roles.read')
  or private.has_permission('roles.manage')
  or private.has_permission('role_assignments.manage')
);

create policy user_roles_select_own_or_authorized
on public.user_roles for select
to authenticated
using (
  user_id = (select auth.uid())
  or private.has_permission('roles.read')
  or private.has_permission('role_assignments.manage')
);

create policy profiles_select_admin
on public.profiles for select
to authenticated
using (
  private.has_permission('users.read')
  or private.has_permission('users.manage')
);

create policy profiles_update_admin
on public.profiles for update
to authenticated
using (private.has_permission('users.manage'))
with check (private.has_permission('users.manage'));

create policy people_select_private_authorized
on public.people for select
to authenticated
using (
  private.has_permission('people.read_private')
  or private.has_permission('people.manage')
);

create policy people_insert_authorized
on public.people for insert
to authenticated
with check (private.has_permission('people.manage'));

create policy people_update_authorized
on public.people for update
to authenticated
using (private.has_permission('people.manage'))
with check (private.has_permission('people.manage'));

create policy identity_labels_select_authorized
on public.identity_labels for select
to authenticated
using (private.has_permission('identity_labels.manage'));

create policy identity_labels_insert_authorized
on public.identity_labels for insert
to authenticated
with check (private.has_permission('identity_labels.manage'));

create policy identity_labels_update_authorized
on public.identity_labels for update
to authenticated
using (private.has_permission('identity_labels.manage'))
with check (private.has_permission('identity_labels.manage'));

create policy person_identity_labels_select_authorized
on public.person_identity_labels for select
to authenticated
using (
  private.has_permission('identity_assignments.manage')
  or private.has_permission('people.read_private')
  or private.has_permission('people.manage')
);

create policy person_identity_labels_insert_authorized
on public.person_identity_labels for insert
to authenticated
with check (private.has_permission('identity_assignments.manage'));

create policy person_identity_labels_update_authorized
on public.person_identity_labels for update
to authenticated
using (private.has_permission('identity_assignments.manage'))
with check (private.has_permission('identity_assignments.manage'));

create policy person_identity_labels_delete_authorized
on public.person_identity_labels for delete
to authenticated
using (private.has_permission('identity_assignments.manage'));

grant insert, update on public.people to authenticated;
grant insert, update on public.identity_labels to authenticated;
grant insert, update, delete on public.person_identity_labels to authenticated;
grant usage, select on sequence public.people_id_seq to authenticated;
grant usage, select on sequence public.identity_labels_id_seq to authenticated;

comment on function private.has_permission(text) is
  'Database authorization helper backed by active user roles and fixed permission keys.';
comment on table private.audit_logs is
  'Append-only sensitive operation history; read through public.get_audit_logs only.';
