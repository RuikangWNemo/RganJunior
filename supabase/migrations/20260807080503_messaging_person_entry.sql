-- Start a direct conversation from the safe People projection without exposing Auth UUIDs.

create or replace function private.create_direct_conversation_with_person(
  target_person_id bigint
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_user_id uuid;
begin
  select pe.user_id into target_user_id
  from public.people pe
  where pe.id = target_person_id
    and pe.status = 'active';
  if target_user_id is null then
    raise exception using errcode = '22023', message = 'MESSAGE_CONTACT_NOT_ALLOWED';
  end if;
  return private.create_direct_conversation(target_user_id);
end;
$$;

revoke all on function private.create_direct_conversation_with_person(bigint)
  from public, anon, authenticated;
grant execute on function private.create_direct_conversation_with_person(bigint)
  to authenticated;

create function public.create_direct_conversation_with_person(target_person_id bigint)
returns uuid
language sql
security invoker
set search_path = ''
as $$
  select private.create_direct_conversation_with_person(target_person_id);
$$;

revoke all on function public.create_direct_conversation_with_person(bigint)
  from public, anon;
grant execute on function public.create_direct_conversation_with_person(bigint)
  to authenticated;

comment on function public.create_direct_conversation_with_person(bigint) is
  'Creates an authorized member conversation from a safe directory Person id.';
