-- Prevent the Storage path predicate from becoming a person-ID existence oracle.
create or replace function private.valid_growth_storage_path(object_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    private.user_has_permission((select auth.uid()), 'impact.manage')
    and (storage.foldername(object_name))[1] = (select auth.uid())::text
    and (storage.foldername(object_name))[2] ~ '^[0-9]+$'
    and exists (
      select 1
      from public.people p
      where p.id::text = (storage.foldername(object_name))[2]
    );
$$;

revoke all on function private.valid_growth_storage_path(text)
  from public, anon, authenticated;
grant execute on function private.valid_growth_storage_path(text) to authenticated;
