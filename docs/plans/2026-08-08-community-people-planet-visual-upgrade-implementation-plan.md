# Community People Planet Visual Upgrade — Implementation Plan

**Design:** `docs/plans/2026-08-08-community-people-planet-visual-upgrade-design.md`

## 1. Scene model and identity styling

- Add deterministic Avatar palette/initial helpers with unit coverage.
- Preserve stable Fibonacci-sphere placement and selection targeting.
- Reduce decorative links to a small, non-semantic subset.

## 2. Three.js social field

- Replace sphere dots with camera-facing Avatar medallions.
- Remove the grey globe and dense wireframe.
- Add a restrained atmospheric core, partial orbit rings, and sparse depth dust.
- Apply camera-depth scale/opacity and limit labels to near or selected members.
- Preserve drag, inertia, auto-rotate, reset, demand rendering, and reduced motion.

## 3. Page composition

- Move the toolbar into the dark stage.
- Convert the detail panel into a floating desktop card/mobile bottom sheet.
- Restyle loading and WebGL fallback states.
- Harmonize list and name-index modes with the forest-night palette.

## 4. Verification

- Update focused component/model tests.
- Run task-scoped ESLint and test suite.
- Run the production build and note unrelated typecheck failures if unchanged.
- Review edited TSX against React best practices and animation code against motion-performance rules.
- Start the dev server and verify desktop/mobile rendering, interactions, overflow, overlays, and console state in a browser.
