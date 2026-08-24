-- Strict Community authorization hierarchy and safe administration projections.

create or replace function private.assign_user_role(
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
  if caller is null
     or not private.user_has_permission(caller, 'role_assignments.manage') then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;
  if not exists (select 1 from auth.users u where u.id = target_user_id) then
    raise exception using errcode = '22023', message = 'USER_NOT_FOUND';
  end if;
  if role_expires_at is not null
     and role_expires_at <= statement_timestamp() then
    raise exception using errcode = '22023', message = 'INVALID_ROLE_EXPIRY';
  end if;

  select * into target_role
  from public.roles
  where id = target_role_id and is_active;
  if not found then
    raise exception using errcode = '22023', message = 'ROLE_NOT_FOUND';
  end if;

  -- Administrator appointment is never delegable. This check is intentionally
  -- independent of the caller's permission set because the seeded admin role
  -- otherwise has enough permissions to appoint another administrator.
  if target_role.slug in ('admin', 'super_admin')
     and not private.is_super_admin() then
    raise exception using errcode = '42501', message = 'SUPER_ADMIN_REQUIRED';
  end if;

  if not private.is_super_admin() and exists (
    select 1
    from public.role_permissions rp
    join public.permissions p on p.id = rp.permission_id
    where rp.role_id = target_role_id
      and not private.user_has_permission(caller, p.permission_key)
  ) then
    raise exception using
      errcode = '42501',
      message = 'CANNOT_ASSIGN_ROLE_WITH_EXTRA_PERMISSIONS';
  end if;

  insert into public.user_roles (
    user_id, role_id, assigned_by, assigned_at, expires_at
  ) values (
    target_user_id,
    target_role_id,
    caller,
    statement_timestamp(),
    role_expires_at
  )
  on conflict (user_id, role_id) do update
    set assigned_by = excluded.assigned_by,
        assigned_at = excluded.assigned_at,
        expires_at = excluded.expires_at;

  perform private.write_audit(
    'user_role.assign',
    'user_role',
    target_user_id::text,
    null,
    jsonb_build_object(
      'role_id', target_role_id,
      'role_slug', target_role.slug,
      'expires_at', role_expires_at
    )
  );
end;
$$;

create or replace function private.revoke_user_role(
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
  if caller is null
     or not private.user_has_permission(caller, 'role_assignments.manage') then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;

  select r.slug into target_slug
  from public.roles r
  where r.id = target_role_id;
  if target_slug is null then
    raise exception using errcode = '22023', message = 'ROLE_NOT_FOUND';
  end if;

  if target_slug in ('admin', 'super_admin')
     and not private.is_super_admin() then
    raise exception using errcode = '42501', message = 'SUPER_ADMIN_REQUIRED';
  end if;

  delete from public.user_roles
  where user_id = target_user_id and role_id = target_role_id;

  perform private.write_audit(
    'user_role.revoke',
    'user_role',
    target_user_id::text,
    jsonb_build_object('role_id', target_role_id, 'role_slug', target_slug),
    null
  );
end;
$$;

create or replace function private.get_my_authorization_context()
returns table (
  is_super_admin boolean,
  role_slugs text[]
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
    raise exception using errcode = '42501', message = 'AUTHENTICATION_REQUIRED';
  end if;

  return query
  select
    private.is_super_admin(),
    coalesce(
      array_agg(r.slug order by r.slug)
        filter (where r.id is not null),
      array[]::text[]
    )
  from public.user_roles ur
  join public.roles r on r.id = ur.role_id
  where ur.user_id = caller
    and r.is_active
    and (ur.expires_at is null or ur.expires_at > statement_timestamp());
end;
$$;

create or replace function private.list_community_access_users(
  search_query text default null,
  membership_statuses text[] default null,
  role_slugs text[] default null,
  page_size integer default 50,
  before_registered_at timestamptz default null,
  before_user_id uuid default null
)
returns table (
  user_id uuid,
  display_name text,
  username text,
  account_status text,
  registered_at timestamptz,
  membership_status text,
  member_since date,
  suspended_at timestamptz,
  suspension_reason text,
  role_assignments jsonb
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  normalized_query text := nullif(lower(trim(search_query)), '');
  can_manage_memberships boolean;
begin
  if caller is null or not (
    private.user_has_permission(caller, 'users.read')
    or private.user_has_permission(caller, 'users.manage')
    or private.user_has_permission(caller, 'memberships.manage')
    or private.user_has_permission(caller, 'role_assignments.manage')
  ) then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;

  if (before_registered_at is null) <> (before_user_id is null) then
    raise exception using errcode = '22023', message = 'INVALID_ACCESS_CURSOR';
  end if;

  can_manage_memberships :=
    private.user_has_permission(caller, 'memberships.manage');

  return query
  select
    p.user_id,
    p.display_name,
    p.username,
    p.account_status,
    p.registered_at,
    coalesce(cm.status, 'none'),
    cm.member_since,
    cm.suspended_at,
    case when can_manage_memberships then cm.suspension_reason else null end,
    role_data.assignments
  from public.profiles p
  left join public.community_memberships cm on cm.user_id = p.user_id
  cross join lateral (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'roleId', r.id,
          'slug', r.slug,
          'name', r.name,
          'isSystem', r.is_system,
          'assignedAt', ur.assigned_at,
          'expiresAt', ur.expires_at
        )
        order by r.is_system desc, r.name, r.id
      ),
      '[]'::jsonb
    ) as assignments
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = p.user_id
      and r.is_active
      and (ur.expires_at is null or ur.expires_at > statement_timestamp())
  ) role_data
  where (
      normalized_query is null
      or lower(p.display_name) like '%' || normalized_query || '%'
      or lower(coalesce(p.username, '')) like '%' || normalized_query || '%'
      or p.user_id::text = normalized_query
    )
    and (
      membership_statuses is null
      or coalesce(cm.status, 'none') = any(membership_statuses)
    )
    and (
      role_slugs is null
      or exists (
        select 1
        from public.user_roles filtered_ur
        join public.roles filtered_r on filtered_r.id = filtered_ur.role_id
        where filtered_ur.user_id = p.user_id
          and filtered_r.slug = any(role_slugs)
          and filtered_r.is_active
          and (
            filtered_ur.expires_at is null
            or filtered_ur.expires_at > statement_timestamp()
          )
      )
    )
    and (
      before_registered_at is null
      or (p.registered_at, p.user_id) < (before_registered_at, before_user_id)
    )
  order by p.registered_at desc, p.user_id desc
  limit least(greatest(coalesce(page_size, 50), 1), 100);
end;
$$;

create or replace function private.list_community_access_roles()
returns table (
  id bigint,
  slug text,
  name text,
  description text,
  is_system boolean,
  is_active boolean,
  is_reserved boolean,
  permissions jsonb
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
begin
  if caller is null or not (
    private.user_has_permission(caller, 'roles.read')
    or private.user_has_permission(caller, 'roles.manage')
    or private.user_has_permission(caller, 'role_assignments.manage')
  ) then
    raise exception using errcode = '42501', message = 'PERMISSION_DENIED';
  end if;

  return query
  select
    r.id,
    r.slug,
    r.name,
    r.description,
    r.is_system,
    r.is_active,
    r.slug in ('admin', 'super_admin'),
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'key', p.permission_key,
          'description', p.description,
          'isSensitive', p.is_sensitive
        )
        order by p.permission_key
      ) filter (where p.id is not null),
      '[]'::jsonb
    )
  from public.roles r
  left join public.role_permissions rp on rp.role_id = r.id
  left join public.permissions p on p.id = rp.permission_id
  group by r.id, r.slug, r.name, r.description, r.is_system, r.is_active
  order by r.is_system desc, r.name, r.id;
end;
$$;

revoke all on function private.get_my_authorization_context()
  from public, anon, authenticated;
revoke all on function private.list_community_access_users(
  text, text[], text[], integer, timestamptz, uuid
) from public, anon, authenticated;
revoke all on function private.list_community_access_roles()
  from public, anon, authenticated;

grant execute on function private.get_my_authorization_context()
  to authenticated;
grant execute on function private.list_community_access_users(
  text, text[], text[], integer, timestamptz, uuid
) to authenticated;
grant execute on function private.list_community_access_roles()
  to authenticated;

create function public.get_my_authorization_context()
returns table (
  is_super_admin boolean,
  role_slugs text[]
)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from private.get_my_authorization_context();
$$;

create function public.list_community_access_users(
  search_query text default null,
  membership_statuses text[] default null,
  role_slugs text[] default null,
  page_size integer default 50,
  before_registered_at timestamptz default null,
  before_user_id uuid default null
)
returns table (
  user_id uuid,
  display_name text,
  username text,
  account_status text,
  registered_at timestamptz,
  membership_status text,
  member_since date,
  suspended_at timestamptz,
  suspension_reason text,
  role_assignments jsonb
)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from private.list_community_access_users(
    search_query,
    membership_statuses,
    role_slugs,
    page_size,
    before_registered_at,
    before_user_id
  );
$$;

create function public.list_community_access_roles()
returns table (
  id bigint,
  slug text,
  name text,
  description text,
  is_system boolean,
  is_active boolean,
  is_reserved boolean,
  permissions jsonb
)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from private.list_community_access_roles();
$$;

revoke all on function public.get_my_authorization_context()
  from public, anon;
revoke all on function public.list_community_access_users(
  text, text[], text[], integer, timestamptz, uuid
) from public, anon;
revoke all on function public.list_community_access_roles()
  from public, anon;

grant execute on function public.get_my_authorization_context()
  to authenticated;
grant execute on function public.list_community_access_users(
  text, text[], text[], integer, timestamptz, uuid
) to authenticated;
grant execute on function public.list_community_access_roles()
  to authenticated;

comment on function public.get_my_authorization_context() is
  'Current authenticated account active role slugs and strict super-admin state.';
comment on function public.list_community_access_users(
  text, text[], text[], integer, timestamptz, uuid
) is
  'Permission-checked, cursor-paginated Community account and role roster.';
comment on function public.list_community_access_roles() is
  'Permission-checked Community role catalog with aggregated permission metadata.';
