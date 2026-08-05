# Mobile Drawer Menu Implementation Plan

## Objective

Implement the approved right-side mobile drawer while leaving desktop navigation and unrelated work unchanged.

## Tasks

1. Inspect and reuse the existing Radix sheet/dialog primitive.
2. Replace the mobile dropdown content with a controlled right-side drawer.
3. Add the paper surface, light scrim, safe-area spacing, active state, and transform-only motion.
4. Preserve bilingual labels and the close-before-navigation behavior.
5. Update focused tests for dialog semantics, close control, `Escape`, outside dismissal, active state, and navigation.
6. Run typecheck, all tests, lint, and production build.
7. Verify 360px, 390px, and 430px in a real browser and inspect the 390px open state visually.

## Scope Guard

Only `src/components/Navbar.tsx`, its focused test, and these drawer planning documents may be changed for this revision.
