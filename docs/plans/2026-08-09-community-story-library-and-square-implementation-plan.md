# Community Story Library and Square Implementation Plan

**Date:** 2026-08-09
**Design:** `docs/plans/2026-08-09-community-story-library-and-square-design.md`
**Branch:** `agent/community-production-release`

## Release outcome

- Members can search and filter their own stories across draft, review, published, and trash states.
- Draft owners can archive, restore, and permanently delete stories through database-enforced rules.
- Stories have one optional draft category, one required submission category, and multiple tags.
- Administrators manage categories; eligible authors can create and reuse tags.
- The community story square shows only published public stories and links to the public reader.
- Desktop and mobile layouts retain the existing community design language.

## 1. Database model and authorization

Create a new migration after `20260809024325_community_three_planets_identity.sql`.

### Categories and field notes

- Add `public.article_categories` with localized names, slug, active state, sort order, creator, timestamps, normalized uniqueness, update timestamp trigger, and audit trigger.
- Seed People Stories, Local Practice, Youth Action, Nature Observation, and Program Notes in deterministic order.
- Add nullable `field_notes.category_id` with an index and `on delete restrict` foreign key.
- Extend protected field-note writes so owners can change category and visibility only while a note is `draft` or `changes_requested`.
- Reject transitions to `submitted` when `category_id` is null or references an inactive category.

### Tags

- Treat active `topics` as tags in the community author UI.
- Allow authenticated members with `field_notes.create` to create tags while preserving administrator-only update/archive operations.
- Normalize client-created tag names and slugs, and safely reuse a row when a concurrent or duplicate create wins.
- Keep `field_note_topics` replacement restricted by `private.can_edit_field_note`.

### Trash lifecycle

- Permit owners with `field_notes.edit_own` to transition only their own drafts to `archived`.
- Permit those owners to restore only their own archived articles to `draft`.
- Add a delete policy and grant that permit permanent deletion only when the caller owns the archived article.
- Preserve administrator archive capability and existing workflow transitions.

### Authors and public reads

- Add an insert trigger that links a newly created field note to the creator's `people` row when available.
- Backfill the primary author link for existing owner-created notes without authors.
- Verify that public and member reads expose only author data allowed by existing People policies.

### Database tests

Add a focused SQL test covering category management authorization, seed rows, category-required submission, author visibility changes, tag creation permissions, owner archive/restore/delete, non-owner denial, cascade deletion, and public-square visibility.

## 2. Generated types and services

- Update `src/lib/supabase/database.types.ts` for `article_categories`, `field_notes.category_id`, relationships, and any new RPCs.
- Expand `src/services/field-notes/index.ts` with typed management records and operations:
  - list owned stories with categories and tags;
  - list and manage categories;
  - list/create tags;
  - save article category, tags, and visibility;
  - archive, restore, and permanently delete an article;
  - list public square stories.
- Explicitly filter My stories by the authenticated user so published stories owned by other members never leak into the management list.
- Keep square filtering at query level with `status = published` and `visibility = public`.
- Update the public repository relation selection and mapping so category, tags, author, and cover data remain compatible with the existing public reader.
- Add service tests with Supabase query-chain mocks for privacy predicates, mutations, duplicate-tag fallback, and error handling.

## 3. My Stories editorial workspace

Replace the current simple story list in `CommunityStories.tsx` with:

- overview counts for all non-trash, drafts, review-stage, and published stories;
- status navigation for All, Drafts, In review, Published, and Trash;
- keyword search, category filtering, and updated-time sorting;
- accessible editorial rows with category, tags, status, date, and contextual actions;
- distinct new-author, filter-empty, status-empty, and trash-empty states;
- archive, restore, and permanent-delete confirmations with loading locks and toast feedback;
- an administrator-only category-management dialog.

Create small community-specific components only where they reduce page complexity, likely:

- `CommunityStoryRow`
- `StoryDeleteDialog`
- `StoryCategoryManager`

Add page tests for filter combinations, counts, admin visibility, archive/restore/delete calls, confirmation behavior, and action links.

## 4. Editor publishing settings

- Load categories and tags alongside the existing collaboration bundle.
- Add category, tag, and visibility state to `CommunityStoryEditor`.
- Upgrade the details sidebar into a publishing-settings section with a single category selector, multi-tag picker, inline tag creation, visibility choices, and the existing excerpt.
- Persist metadata during manual save and before submission; persist metadata-only changes on autosave without rewriting tag relations on unrelated body edits.
- Block submission client-side when no category is selected and rely on the database rule as the final guard.
- Preserve current read-only and collaboration behavior for non-editable statuses.
- Extend editor tests for initial metadata, tag creation, metadata persistence, missing-category validation, and unchanged review-state behavior.

## 5. Community story square

- Add `CommunityStorySquare.tsx` at `/community/stories/square` inside the member shell.
- Build an image-led feature story followed by an editorial feed with category, tag, and keyword filters.
- Use the existing public article route `/field-notes/:slug` for reading.
- Provide cover fallbacks and resilient author/category metadata.
- Add square tests proving only service-provided public stories render, filters work together, empty and error states are clear, and public links use canonical slugs.

## 6. Navigation and design integration

- Add Story Square route metadata and routing.
- Add a Square destination in desktop community navigation; keep My stories reachable from the square header and authoring flows.
- Preserve a five-item mobile bottom navigation by using Square as the story discovery destination and exposing My stories from the square itself.
- Add localized navigation copy in `communityUi` and route metadata in `communityNavigation`.
- Add scoped CSS in `src/index.css` for the editorial workspace, responsive filters, feature story, feed rhythm, tag picker, and category manager.
- Reuse existing community semantic colors and Lucide icons; avoid new hard-coded palette values or uniform card grids.

## 7. Verification

1. Run focused story service, management page, editor, square, navigation, and SQL tests.
2. Run application and API/backend type checks.
3. Run targeted ESLint on touched TypeScript and TSX files.
4. Run the production Vite build.
5. Start the local development server and verify authenticated routes where fixture access permits.
6. Capture desktop and mobile screenshots of reachable story surfaces; inspect hierarchy, clipping, focus states, empty states, and destructive dialogs.
7. Review the final diff for unrelated workspace changes and confirm no existing community identity or Guardian work was overwritten.
