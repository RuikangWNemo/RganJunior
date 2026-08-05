# Mobile Compact Menu Implementation Plan

## Objective

Implement the approved top-right compact mobile navigation without changing desktop navigation or unrelated page behavior.

## Tasks

1. Refactor `src/components/Navbar.tsx` so the mobile trigger and dropdown share a positioned container.
2. Replace the full-screen overlay with a bounded right-aligned menu card and remove body-scroll locking.
3. Add outside-pointer and `Escape` dismissal, accessible trigger/menu attributes, focus treatment, and reduced-motion-aware transitions.
4. Preserve route highlighting, bilingual labels, route-change dismissal, and the existing close-before-navigation behavior.
5. Add focused component tests for opening, dismissal, active state, and navigation.
6. Run typecheck, focused/full tests, lint, and production build.
7. Start the local site and inspect 360px, 390px, and 430px mobile viewports for position, overflow, motion, and page visibility.

## Scope Guard

Only navigation-related files and these planning documents should be changed. Existing uncommitted homepage, animation, font, and global-style work must remain untouched.
