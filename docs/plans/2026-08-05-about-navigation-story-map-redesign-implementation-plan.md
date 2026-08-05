# About Navigation and Story Map Redesign Implementation Plan

## 1. Rebuild the About information architecture

- Reorder `/about` into Philosophy, Story, and Team anchors.
- Add a concise Mission / Vision / Impact editorial composition.
- Move the project development timeline into the Story chapter.
- Preserve the existing team biographies and story links.

## 2. Add secondary navigation

- Add an accessible About dropdown to the desktop primary navigation.
- Add the three About destinations beneath About in the mobile navigation drawer.
- Add a sticky in-page chapter navigation with active-section feedback.
- Animate one shared green indicator between the three active chapter positions.
- Support hash navigation both from `/about` and from other routes.

## 3. Replace the scroll-driven story map

- Remove scroll progress, sticky-story height, and scroll-coupled camera updates.
- Keep the AMap integration and designed local fallback.
- Mark the regional path and Tieniu Village clearly.
- Change camera state only after a user clicks a geographic-stage control.
- Honor reduced-motion preferences.

## 4. Replace the land-repair map

- Remove the scroll-linked land-repair visualization.
- Recompose its verified copy and figures into readable editorial sections.
- Use the existing aerial photograph and archive diagram as supporting evidence.
- Keep the narrative structure: problem, practice, change, meaning.

## 5. Apply the visual system

- Use the homepage warm paper and foreground tokens across the About page.
- Use the existing primary green as the only accent and reserve deeper forest green for the Mission block, interactive map, and land-response evidence.
- Retain the brand typefaces and homepage text hierarchy.
- Use one restrained radius system, sparse borders, and no generic equal-card row.
- Define explicit desktop and mobile layouts.

## 6. Verify

- Run TypeScript, lint, tests, and production build.
- Review `/about` on desktop and 390px mobile.
- Test desktop dropdown, mobile submenu, sticky section nav, and cross-route hashes.
- Confirm normal page scrolling never changes the map camera.
- Probe for horizontal overflow and clipped text.
