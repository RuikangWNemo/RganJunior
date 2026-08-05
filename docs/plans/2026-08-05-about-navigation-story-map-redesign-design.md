# About Navigation and Story Map Redesign

## Goal

Reorganize the About experience around three clear chapters: Philosophy, Story, and Team. The redesign should make Tieniu Village easier to understand, remove scroll-coupled map zoom, and turn the land-repair material into readable editorial content.

## Information Architecture

The page remains a single `/about` route with three durable anchors:

- `#mission` — Mission, Vision, and Impact
- `#story` — Tieniu Village, its location, and the land-repair story
- `#team` — the initiating team and links to their personal stories

The project development timeline sits within the Story chapter because it explains how the initiative grew from the village and its regeneration work.

## Navigation

Desktop navigation exposes a secondary menu beneath About. The About page also contains a sticky in-page chapter menu. Mobile navigation expands the same three destinations beneath About. Every surface links to the same anchors, and the in-page menu indicates the currently visible chapter.

The in-page chapter menu uses one shared green indicator. It moves smoothly between Philosophy, Story, and Team after a click or active-section change, and becomes instant when reduced motion is requested.

Anchor navigation must work both from within `/about` and from other routes. Section headings receive adequate scroll margin so they are not hidden behind fixed navigation.

## Visual Direction

Use the homepage palette as the foundation: the homepage warm paper is the default page and reading surface, the existing primary forest green is the only accent, and deep green is reserved for a small number of immersive or evidence-led blocks.

The hero, chapter navigation, story copy, development timeline, and team remain on the homepage light theme. Deep green appears only in the Mission emphasis block, the interactive Tieniu map, and the land-response evidence block. Thin rules, restrained labels, large serif headings, and generous spacing provide hierarchy. Motion is limited to navigation feedback, section reveal, and user-triggered map transitions.

## Philosophy Chapter

Open with a concise page introduction and a three-part Mission / Vision / Impact composition. Each part has a direct statement and supporting copy. On larger screens the three ideas form a connected editorial grid; on mobile they become a clear vertical sequence.

Impact combines the initiative's observable outcomes and development milestones without overstating causal claims.

## Tieniu Story Map

Replace the scroll-driven map story with a bounded interactive map module. It opens on a regional view and marks the relevant locations, including Tieniu Village. A stage list lets the user choose the geographic scale or place; clicking a stage is the only action that changes the camera. Ordinary page scrolling never zooms or pans the map.

The active stage displays a short explanation beside or beneath the map. The module keeps a designed fallback for cases where the live map API is unavailable. Reduced-motion users receive immediate camera changes without animated transitions.

## Land Repair Story

Remove the separate land-repair map and replace it with a readable editorial section structured as:

1. What the land was facing
2. How regeneration was practiced
3. What changed and what remains ongoing
4. Why this work matters to R'gan Junior

Use short paragraphs, a small number of evidence-led figures, and concise process steps. Existing archive imagery may support the section, but imagery must not interrupt the reading order or become another map-like interface.

## Team Chapter

Keep both initiating members and their story links. Standardize portrait treatment, role hierarchy, focus lines, and body-copy width. The team section comes after the place and philosophy so readers understand the work before meeting the people behind it.

## Responsive and Accessible Behavior

- Desktop About dropdown supports pointer and keyboard focus.
- Mobile About submenu is visible within the main menu without requiring hover.
- Sticky chapter navigation can scroll horizontally on narrow screens without causing page overflow.
- Map stage controls are semantic buttons with an active state.
- Color contrast remains legible on both paper and forest surfaces.
- Reduced-motion preferences disable smooth camera and scroll animations where appropriate.

## Verification

Verify TypeScript, lint, tests, and production build. Review `/about` at desktop and phone widths, test each navigation entry from `/about` and another route, confirm ordinary scrolling never changes map zoom, and confirm no horizontal overflow or clipped text.
