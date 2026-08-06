# Mobile Drawer Menu Design

## Goal

Replace the compact mobile dropdown with a right-side drawer that feels spacious, direct, and playful while preserving a visible strip of the current page.

This design supersedes the previously approved compact dropdown direction.

## Approved Direction

Use a modal drawer that slides in from the right and occupies roughly three quarters of the phone viewport, capped at 320px.

The drawer should feel like a paper page pulled over the site rather than a generic application sidebar. Keep the existing warm paper surface, forest-green active state, handwriting typography, restrained border, and quiet motion.

## Structure

- Keep the language switch and menu trigger in the existing mobile navbar.
- Render the drawer through the project's existing Radix dialog/sheet primitive.
- Use a full-height right panel with safe-area-aware padding.
- Keep a narrow strip of the current page visible behind a light, dismissible scrim.
- Place a small navigation label and close control at the top, with the primary links in a spacious vertical stack below.

## Interaction

- Open from the navbar trigger.
- Close from the close control, the background scrim, `Escape`, route changes, or link selection.
- Trap keyboard focus inside while open and restore focus to the trigger on close.
- Lock background scrolling while the modal drawer is open.
- Preserve bilingual labels, active-route semantics, and the close-before-navigation transition.

## Visual Language

- Drawer width: `75vw`, capped at `20rem` and kept usable down to 320px screens.
- Solid paper background with a subtle left border and restrained shadow.
- Large, readable navigation labels with at least 52px tap rows.
- Active route uses forest green and a small round marker.
- Background scrim stays light enough to retain page context without reducing menu contrast.

## Motion

- Slide the panel from the right using transform only.
- Fade the scrim with opacity only.
- Keep open/close feedback at or below 200ms.
- Reveal navigation copy with a short transform-and-opacity stagger contained within the same response window.
- Disable non-essential transitions when reduced motion is requested.

## Constraints

- Preserve desktop navigation, routes, content models, and language behavior.
- Do not introduce dependencies.
- Do not animate width, position, blur, or other layout/paint-heavy properties.
- Do not touch unrelated homepage, Join, font, or animation work in the shared worktree.

## Verification

- Test open, close control, `Escape`, outside dismissal, active state, focus semantics, and route navigation.
- Run typecheck, focused/full tests, lint, and production build.
- Inspect 360px, 390px, and 430px mobile widths for drawer size, safe areas, overflow, background locking, and console errors.
