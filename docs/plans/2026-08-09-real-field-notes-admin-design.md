# Real Field Notes and Editorial Workflow Design

## Goal

Make every article shown in Field Notes and the community Story Square a real article stored in Supabase. Give authorized editors a complete review and publishing workflow, including preview and featured selection. Let every user who can edit a story upload images into its body.

## Chosen approach

Extend the existing Field Notes workflow instead of introducing a second CMS. The database already models draft, review, approval, publication, visibility, featured state, authors, topics, revisions, and media ownership. The application will expose those capabilities through a focused editorial desk and remove the local-content fallback from public repositories.

Two smaller alternatives were rejected:

- Adding only a featured toggle would leave submitted articles without a usable review and publication path.
- Building a separate admin article store would duplicate the existing workflow and make public content provenance ambiguous.

## Public content

- `/field-notes`, `/field-notes/all`, individual Field Note pages, and the community Story Square use only Supabase records.
- A public article must have `status = published` and `visibility = public`.
- The local `src/content/fieldNotes` article array is no longer a production or test fallback.
- Public people and topic filters are derived from the real articles returned by the database.
- Empty, loading, and failed states remain explicit; a database failure never causes sample content to appear.
- The existing `featured` field drives the public Featured section. When no article is featured, the section explains that no selection is currently available rather than substituting samples.

## Editorial administration

Add an editorial desk guarded by the existing Field Notes permissions. It lists all visible workflow records, not only the current user's articles, and supports:

1. Submitted → start review.
2. In review → request changes or approve.
3. Approved → publish.
4. Published → toggle featured.
5. Any listed article → open a read-only preview using the real stored snapshot.

Controls are shown only when the current user has the corresponding permission. Database policies and transition triggers remain the source of truth. Each mutation locks the affected row in the UI, reports success or failure, and refreshes the queue.

## Inline images

BlockNote's upload handler is enabled whenever the article access object says the user can write, including owners and invited collaborators. Uploads are limited to supported images and reasonable size, create owned media metadata, and link the asset to the Field Note as inline media.

Stored documents must use a durable media reference rather than a short-lived signed URL. Article rendering resolves that reference to a fresh authorized URL, so an image does not break after the original upload URL expires. Published public stories expose their linked inline images through a stable public read path while drafts remain private.

## Error handling and safety

- Invalid file type, oversize files, upload failures, and relation failures produce actionable editor errors.
- Failed metadata creation removes the just-uploaded Storage object.
- Failed relation creation also removes the newly created asset and Storage object.
- Editorial transitions are never inferred client-side beyond enabling a button; Supabase validates every transition and permission.
- Existing user changes elsewhere in the worktree are preserved.

## Verification

- Repository tests prove mock content is never returned, including on database errors.
- Public page tests cover real data, empty states, featured filtering, people/topic filters, and article lookup.
- Editorial desk tests cover permission-aware controls, preview, transitions, featured toggling, and failures.
- Editor/media tests prove ordinary writable authors can upload images, invalid files are rejected, and cleanup runs after partial failures.
- App typecheck, focused Vitest suites, production build, and browser verification cover the final integration.
