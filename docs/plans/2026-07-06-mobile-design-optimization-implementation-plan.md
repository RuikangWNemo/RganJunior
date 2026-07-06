# Mobile Design Optimization Implementation Plan

## Objective

Implement the approved mobile editorial reflow while preserving the desktop visual language and existing routes/content behavior.

## Phase 1: Baseline And Guardrails

- Inspect current mobile screenshots and affected components again before edits.
- Confirm current dev server state and working tree.
- Identify exact CSS/TSX boundaries:
  - `src/pages/Index.tsx`
  - `src/components/home/HeroCopy.tsx`
  - `src/components/home/HeroMascotStage.tsx`
  - `src/components/home/ActionLayerStory.tsx`
  - `src/pages/Actions.tsx`
  - `src/pages/JoinUs.tsx`
  - `src/index.css`

Expected output: clear edit scope, no unrelated refactors.

## Phase 2: Shared Mobile Utilities

- Add a small set of mobile-specific CSS utilities or component classes for:
  - mobile section padding
  - mobile title scale
  - long-copy wrapping
  - mobile image plates
  - phone-safe action record layout
- Keep naming page-specific where behavior is page-specific.
- Avoid touching theme tokens unless necessary.

Expected output: safer foundations for page edits.

## Phase 3: Homepage Mobile Reflow

- Tune mobile hero rhythm:
  - reduce vertical dead space
  - tune mascot size and placement
  - keep CTA buttons visually consistent but less bulky
  - frame first real image more deliberately
- Preserve desktop hero behavior and current content.
- Confirm no first-screen overlap with navbar or splash behavior.

Expected output: homepage mobile feels like a designed cover and first scroll.

## Phase 4: Actions Mobile Records

- Keep the desktop three-track theatre.
- On mobile, replace the overview card presentation with stacked action records.
- Remove or disable mobile absolute-artwork behavior that causes clipping.
- Convert activity chips into a clean mobile list or compact record footer.
- Add wrap guards for English text and action labels.

Expected output: `/actions` mobile has no clipped copy and reads as three intentional field records.

## Phase 5: Join Mobile Identity

- Keep desktop lanyard behavior.
- Strengthen mobile selector layout and active state.
- Ensure long English headings wrap instead of clipping.
- Keep the inline mobile identity card as a supporting visual, not a competing layer.
- Preserve all apply links and query parameters.

Expected output: `/join` mobile is readable, tappable, and visually calm.

## Phase 6: Verification

- Run typecheck, tests, lint, and build.
- Start or reuse local Vite dev server.
- Capture mobile screenshots for `/`, `/actions`, and `/join`.
- Probe page width/overflow if browser automation is available.
- Fix any mobile clipping or Vite overlay before final handoff.

## Known Risks

- `src/index.css` is long and contains many page-specific mobile rules; edits must stay scoped.
- Long English strings are the main clipping risk.
- Decorative media inside cards can visually hide overflow until screenshot review.
- Headless Chrome sometimes leaves updater subprocesses running; screenshot commands may need manual interruption after image output.

