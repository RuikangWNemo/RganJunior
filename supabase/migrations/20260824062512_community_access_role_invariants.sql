-- Keep account and membership lifecycle roles behind their dedicated workflows.

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

  if target_role.slug = 'registered_user' then
    raise exception using errcode = '42501', message = 'ROLE_MANAGED_BY_SYSTEM';
  end if;
  if target_role.slug = 'community_member' then
    raise exception using errcode = '42501', message = 'MEMBERSHIP_WORKFLOW_REQUIRED';
  end if;
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

  if target_slug = 'registered_user' then
    raise exception using errcode = '42501', message = 'ROLE_MANAGED_BY_SYSTEM';
  end if;
  if target_slug = 'community_member' then
    raise exception using errcode = '42501', message = 'MEMBERSHIP_WORKFLOW_REQUIRED';
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
