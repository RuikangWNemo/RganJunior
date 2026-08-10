-- Shared database primitives, versioned to match the remote migration history.
-- Application-facing tables live in public;
-- authorization internals and audit data live in the unexposed private schema.

create schema if not exists private;

revoke all on schema private from public;
revoke all on schema private from anon;
revoke all on schema private from authenticated;

alter default privileges in schema private revoke execute on functions from public;
alter default privileges in schema public revoke execute on functions from public;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = statement_timestamp();
  return new;
end;
$$;

revoke all on function private.set_updated_at() from public, anon, authenticated;

comment on schema private is
  'Unexposed authorization helpers, audit data, and internal database functions.';
