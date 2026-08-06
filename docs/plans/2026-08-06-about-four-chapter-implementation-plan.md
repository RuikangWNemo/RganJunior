# About Four-Chapter Implementation Plan

## 1. Update the chapter model

- Replace the old Mission / Story / Team identifiers with Team / Belief / Method / Places.
- Update hash parsing, desktop dropdown entries, mobile submenu entries, and active chapter synchronization.

## 2. Recompose the About page

- Build the shortened split hero.
- Lead with the two-level Team chapter.
- Turn the supplied belief statement into a photographic manifesto.
- Present the four methods as editorial bands.
- Move the existing project milestones under Method.
- Build a four-place atlas and keep the Tieniu map and regeneration content as the Tieniu deep dive.

## 3. Add the visual system

- Add page-scoped CSS using the existing paper, forest, and handwriting tokens.
- Use distinct layout families per chapter and one consistent radius scale.
- Add explicit desktop, tablet, mobile, and reduced-motion behavior.

## 4. Update tests

- Replace old submenu labels and hashes in navigation tests.
- Add coverage for all four About destinations and active-state events.

## 5. Verify

- Run type checking, lint, tests, and production build.
- Verify the running page with a browser at desktop and mobile widths.
- Check content, navigation, images, console output, and horizontal overflow.
