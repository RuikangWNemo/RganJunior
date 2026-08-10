set lock_timeout = '5s';
set statement_timeout = '60s';

drop policy field_notes_select_owned_for_returning on public.field_notes;
drop policy field_notes_select_visible on public.field_notes;

create policy field_notes_select_visible
on public.field_notes for select
to anon, authenticated
using (
  (
    (select auth.uid()) is not null
    and created_by = (select auth.uid())
  )
  or private.can_read_field_note(id)
);

comment on policy field_notes_select_visible on public.field_notes is
  'Reads visible Field Notes and recognizes an owned row directly during INSERT ... RETURNING.';
