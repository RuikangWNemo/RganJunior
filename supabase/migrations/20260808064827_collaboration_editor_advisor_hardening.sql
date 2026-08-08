-- Make the intentional server-only boundary explicit to the database linter.

create policy field_note_share_links_deny_authenticated
on public.field_note_share_links for all
to authenticated
using (false)
with check (false);

create policy field_note_comments_deny_authenticated
on public.field_note_comments for all
to authenticated
using (false)
with check (false);

create policy field_note_comment_events_deny_authenticated
on public.field_note_comment_events for all
to authenticated
using (false)
with check (false);

create policy field_note_collab_documents_deny_authenticated
on private.field_note_collab_documents for all
to authenticated
using (false)
with check (false);

-- Cover collaboration foreign keys used during account updates/deletions.
create index field_note_collaborators_invited_by_idx
  on public.field_note_collaborators (invited_by);
create index field_note_collaborators_revoked_by_idx
  on public.field_note_collaborators (revoked_by)
  where revoked_by is not null;
create index field_note_comments_created_by_idx
  on public.field_note_comments (created_by);
create index field_note_comments_resolved_by_idx
  on public.field_note_comments (resolved_by)
  where resolved_by is not null;
create index field_note_comment_events_note_idx
  on public.field_note_comment_events (field_note_id, created_at desc, id);
create index field_note_share_links_created_by_idx
  on public.field_note_share_links (created_by);
create index field_note_share_links_revoked_by_idx
  on public.field_note_share_links (revoked_by)
  where revoked_by is not null;
