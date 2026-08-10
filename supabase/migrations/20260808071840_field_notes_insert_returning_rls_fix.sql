set lock_timeout = '5s';
set statement_timeout = '60s';

-- INSERT ... RETURNING checks SELECT policies before helper functions can
-- re-read the newly inserted row. Keep the existing visibility policy and add
-- the equivalent owner predicate directly so authors can receive their draft.
create policy field_notes_select_owned_for_returning
on public.field_notes for select
to authenticated
using (
  (select auth.uid()) is not null
  and created_by = (select auth.uid())
);

comment on policy field_notes_select_owned_for_returning on public.field_notes is
  'Allows an authenticated author to receive a newly inserted owned draft via RETURNING.';
