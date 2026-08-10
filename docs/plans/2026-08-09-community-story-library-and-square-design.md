# Community Story Library and Square Design

**Date:** 2026-08-09
**Status:** Approved

## Outcome

The community story area becomes a complete writing and discovery system:

- Members manage drafts, review-stage stories, published stories, and a recoverable trash view from one editorial workspace.
- Every story can have one primary category and multiple author-created tags.
- Administrators maintain the category catalogue; authors select categories but cannot manage it.
- Published public stories appear in a community story square where members can browse by category, tag, and keyword.
- Privacy is enforced by database queries and row-level policies, not by client-side hiding.

## Product model

### Categories

Categories are the stable, primary browsing structure. A story can select at most one category and must have one before submission for review.

The initial categories are:

1. 人物故事 / People Stories
2. 在地实践 / Local Practice
3. 青年行动 / Youth Action
4. 自然观察 / Nature Observation
5. 项目记录 / Program Notes

Administrators can create, rename, reorder, and deactivate categories. Deactivation removes a category from new selections without changing existing stories.

### Tags

Tags are flexible, cross-cutting descriptors. Authors can select multiple tags or create a tag while editing a story. Normalized duplicate names reuse the existing tag. The existing `topics` and `field_note_topics` relations become the tag catalogue and article-tag relationship.

### Trash

Only drafts are removable through the normal article-management UI. Removing a draft changes it to the existing `archived` state and records `archived_at`. Trash items can be restored to `draft` or permanently deleted after a destructive confirmation. Only the owner can permanently delete an owned, archived article.

### Story square eligibility

A story appears in the square only when both conditions are true:

- `status = published`
- `visibility = public`

Member-only and private stories never enter the square query.

## Information architecture

### My stories

`/community/stories` remains the author workspace. It includes:

- a compact overview of all, draft, in-review, and published counts;
- status views for All, Drafts, In review, Published, and Trash;
- keyword search, category filtering, and updated-time sorting;
- editorial list rows showing title, summary, category, tags, status, update time, and contextual actions;
- a create-story action and, for authorized administrators, a Manage categories action.

Draft rows offer Edit and Move to trash. Published rows offer View published story and metadata actions. Trash rows offer Restore and Permanently delete.

### Story editor

The existing collaborative editor remains the writing surface. Its details sidebar becomes a publishing-settings area with:

- one primary category selector;
- a multiple tag picker with inline tag creation;
- visibility selection for Private, Members, or Public;
- the existing summary field and version information.

An article may remain an uncategorized draft. Submission is blocked until a category is selected. Existing body read-only rules for review-stage articles remain unchanged.

### Story square

The square is a separate community-navigation destination. It presents:

- one visually prominent recent story when available;
- a short invitation explaining the public community archive;
- category navigation, tag and keyword filtering;
- an editorial feed with varied image rhythm rather than a uniform card grid;
- cover image or a branded fallback, title, excerpt, author, category, tags, and publication date.

Selecting a story opens the existing public Field Note reading page.

### Category management

Authorized administrators open a focused category-management dialog or drawer from My stories. It supports creating, renaming, reordering, and deactivating categories. Categories currently assigned to stories cannot be hard-deleted through this interface.

## Visual direction

The feature follows the established community paper, forest, and orange palette. The management workspace uses dividers, typography, and horizontal rows instead of a dense SaaS table. The story square follows an editorial composition: a dominant feature, restrained metadata, generous image scale, and an asymmetric but grid-aligned feed.

Mobile layouts preserve the same hierarchy:

- overview counts become a horizontal scroll or compact two-column arrangement;
- filters collapse into an accessible filter control;
- story rows stack metadata beneath the title while keeping destructive actions explicit;
- the square feature becomes a single-column image-first story.

Color never acts as the only status indicator. Focus states, labels, dialogs, and tap targets follow the existing community accessibility conventions.

## Data and authorization

Add an `article_categories` table with localized names, slug, sort order, active state, creator, and timestamps. Add a nullable `category_id` foreign key to `field_notes`.

Database behavior must guarantee:

- authenticated readers can list active categories;
- administrators with the existing topic-management capability can maintain categories;
- authorized community authors can create normalized tags;
- article owners can replace their article-tag relations only while the article is editable;
- submission rejects an article without a category;
- only an owner can archive, restore, or permanently delete an eligible article;
- all related article records are removed by existing foreign-key cascades after permanent deletion;
- square reads return only published public articles.

Client services expose category listing and management, tag search/create, article metadata update, archive/restore/delete operations, management queries, and public-square queries. Mutations wait for a confirmed server response before updating the durable view.

## Errors and feedback

- Failed initial loads show the existing retry state.
- Failed category or tag saves retain the user's local selection and show an actionable message.
- Duplicate tag creation resolves to the canonical existing tag.
- Archive, restore, and permanent-delete success refresh list counts and provide a toast.
- Permanent deletion uses a dedicated confirmation dialog naming the article and explaining that versions and collaboration history will also be removed.
- Empty states are distinct for a new author, a filtered result, each status view, and Trash.

## Verification

Automated coverage includes:

- category administration authorization and inactive-category behavior;
- one-category-per-story and category-required-on-submit rules;
- tag creation, normalization, reuse, and article assignment;
- draft archive, restore, owner-only permanent deletion, and cascade behavior;
- public-square privacy filtering;
- management filters, counts, destructive confirmations, and empty states;
- editor metadata validation and persistence;
- desktop and mobile rendering of the workspace and square.

The final implementation must pass focused Vitest coverage, application type checking, production build, and browser verification at representative desktop and mobile widths.
