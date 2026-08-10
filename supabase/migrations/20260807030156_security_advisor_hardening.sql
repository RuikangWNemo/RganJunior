-- Remote migration version aligned with the project history.
-- Keep privilege-bearing implementations out of exposed schemas. Public RPCs
-- remain SECURITY INVOKER entry points and call private implementations that
-- perform their own auth.uid() and permission checks.

alter function public.create_role(text, text, text) set schema private;
alter function public.set_role_permissions(bigint, text[]) set schema private;
alter function public.assign_user_role(uuid, bigint, timestamptz) set schema private;
alter function public.revoke_user_role(uuid, bigint) set schema private;
alter function public.get_my_permissions() set schema private;
alter function public.get_audit_logs(integer, timestamptz) set schema private;
alter function public.request_subscription(text, text, text[]) set schema private;

revoke all on function private.create_role(text, text, text) from public, anon, authenticated;
revoke all on function private.set_role_permissions(bigint, text[]) from public, anon, authenticated;
revoke all on function private.assign_user_role(uuid, bigint, timestamptz) from public, anon, authenticated;
revoke all on function private.revoke_user_role(uuid, bigint) from public, anon, authenticated;
revoke all on function private.get_my_permissions() from public, anon, authenticated;
revoke all on function private.get_audit_logs(integer, timestamptz) from public, anon, authenticated;
revoke all on function private.request_subscription(text, text, text[]) from public, anon, authenticated;

grant execute on function private.create_role(text, text, text) to authenticated;
grant execute on function private.set_role_permissions(bigint, text[]) to authenticated;
grant execute on function private.assign_user_role(uuid, bigint, timestamptz) to authenticated;
grant execute on function private.revoke_user_role(uuid, bigint) to authenticated;
grant execute on function private.get_my_permissions() to authenticated;
grant execute on function private.get_audit_logs(integer, timestamptz) to authenticated;
grant execute on function private.request_subscription(text, text, text[]) to anon, authenticated;

create function public.create_role(
  role_slug text,
  role_name text,
  role_description text default null
)
returns bigint
language sql
security invoker
set search_path = ''
as $$
  select private.create_role(role_slug, role_name, role_description);
$$;

create function public.set_role_permissions(
  target_role_id bigint,
  permission_keys text[]
)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.set_role_permissions(target_role_id, permission_keys);
$$;

create function public.assign_user_role(
  target_user_id uuid,
  target_role_id bigint,
  role_expires_at timestamptz default null
)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.assign_user_role(target_user_id, target_role_id, role_expires_at);
$$;

create function public.revoke_user_role(
  target_user_id uuid,
  target_role_id bigint
)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.revoke_user_role(target_user_id, target_role_id);
$$;

create function public.get_my_permissions()
returns table (permission_key text)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from private.get_my_permissions();
$$;

create function public.get_audit_logs(
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
language sql
stable
security invoker
set search_path = ''
as $$
  select * from private.get_audit_logs(page_size, before_created_at);
$$;

create function public.request_subscription(
  subscriber_email text,
  subscriber_language text default 'zh',
  requested_categories text[] default array['field_notes']::text[]
)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.request_subscription(
    subscriber_email,
    subscriber_language,
    requested_categories
  );
$$;

revoke all on function public.create_role(text, text, text) from public, anon;
revoke all on function public.set_role_permissions(bigint, text[]) from public, anon;
revoke all on function public.assign_user_role(uuid, bigint, timestamptz) from public, anon;
revoke all on function public.revoke_user_role(uuid, bigint) from public, anon;
revoke all on function public.get_my_permissions() from public, anon;
revoke all on function public.get_audit_logs(integer, timestamptz) from public, anon;
revoke all on function public.request_subscription(text, text, text[]) from public;

grant execute on function public.create_role(text, text, text) to authenticated;
grant execute on function public.set_role_permissions(bigint, text[]) to authenticated;
grant execute on function public.assign_user_role(uuid, bigint, timestamptz) to authenticated;
grant execute on function public.revoke_user_role(uuid, bigint) to authenticated;
grant execute on function public.get_my_permissions() to authenticated;
grant execute on function public.get_audit_logs(integer, timestamptz) to authenticated;
grant execute on function public.request_subscription(text, text, text[]) to anon, authenticated;

-- Combine same-action permissive policies so each row evaluates one SELECT or
-- UPDATE expression per role.

drop policy profiles_select_own on public.profiles;
drop policy profiles_select_admin on public.profiles;
create policy profiles_select_authenticated
on public.profiles for select
to authenticated
using (
  user_id = (select auth.uid())
  or private.has_permission('users.read')
  or private.has_permission('users.manage')
);

drop policy profiles_update_own on public.profiles;
drop policy profiles_update_admin on public.profiles;
create policy profiles_update_authenticated
on public.profiles for update
to authenticated
using (
  user_id = (select auth.uid())
  or private.has_permission('users.manage')
)
with check (
  user_id = (select auth.uid())
  or private.has_permission('users.manage')
);

drop policy people_select_public on public.people;
drop policy people_select_linked_account on public.people;
drop policy people_select_private_authorized on public.people;
create policy people_select_anon
on public.people for select
to anon
using (is_public and status = 'active');
create policy people_select_authenticated
on public.people for select
to authenticated
using (
  (is_public and status = 'active')
  or user_id = (select auth.uid())
  or private.has_permission('people.read_private')
  or private.has_permission('people.manage')
);

drop policy identity_labels_select_public on public.identity_labels;
drop policy identity_labels_select_authorized on public.identity_labels;
create policy identity_labels_select_anon
on public.identity_labels for select
to anon
using (is_public and is_active and archived_at is null);
create policy identity_labels_select_authenticated
on public.identity_labels for select
to authenticated
using (
  (is_public and is_active and archived_at is null)
  or private.has_permission('identity_labels.manage')
);

drop policy person_identity_labels_select_public on public.person_identity_labels;
drop policy person_identity_labels_select_linked_account on public.person_identity_labels;
drop policy person_identity_labels_select_authorized on public.person_identity_labels;
create policy person_identity_labels_select_anon
on public.person_identity_labels for select
to anon
using (
  visibility = 'public'
  and (valid_from is null or valid_from <= current_date)
  and (valid_until is null or valid_until >= current_date)
  and exists (
    select 1 from public.people p
    where p.id = person_id and p.is_public and p.status = 'active'
  )
  and exists (
    select 1 from public.identity_labels il
    where il.id = identity_label_id
      and il.is_public and il.is_active and il.archived_at is null
  )
);
create policy person_identity_labels_select_authenticated
on public.person_identity_labels for select
to authenticated
using (
  (
    visibility = 'public'
    and (valid_from is null or valid_from <= current_date)
    and (valid_until is null or valid_until >= current_date)
    and exists (
      select 1 from public.people p
      where p.id = person_id and p.is_public and p.status = 'active'
    )
    and exists (
      select 1 from public.identity_labels il
      where il.id = identity_label_id
        and il.is_public and il.is_active and il.archived_at is null
    )
  )
  or exists (
    select 1 from public.people p
    where p.id = person_id and p.user_id = (select auth.uid())
  )
  or private.has_permission('identity_assignments.manage')
  or private.has_permission('people.read_private')
  or private.has_permission('people.manage')
);

drop policy topics_select_active on public.topics;
drop policy topics_select_authorized on public.topics;
create policy topics_select_anon
on public.topics for select
to anon
using (is_active and archived_at is null);
create policy topics_select_authenticated
on public.topics for select
to authenticated
using (
  (is_active and archived_at is null)
  or private.has_permission('topics.manage')
);

create policy audit_logs_deny_data_api
on private.audit_logs
as restrictive
for all
to anon, authenticated
using (false)
with check (false);
