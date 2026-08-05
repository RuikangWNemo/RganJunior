# Mobile Compact Menu Design

## Goal

Replace the mobile full-screen navigation overlay with a compact menu anchored to the right side of the navbar. The menu should keep the current page visible, feel quick and playful, and remain easy to use on narrow phones.

## Approved Direction

Use a top-right compact dropdown card rather than a full-screen overlay or a side drawer.

This direction matches the site's warm editorial character: navigation stays present but does not overpower the page content. A paper-like surface, restrained brand accents, and a short organic entrance provide personality without making the site feel like a utility dashboard.

## Interaction

- Anchor the menu below and to the right of the mobile menu trigger.
- Keep the panel within 12–16px of the viewport edge and cap its width for 360–430px screens.
- Keep the underlying page visible and do not lock body scrolling.
- Close on trigger toggle, outside pointer interaction, `Escape`, route changes, and link selection.
- Expose `aria-expanded`, `aria-controls`, an accessible menu label, and clear focus states.
- Preserve the existing delayed route transition only where it supports the close animation.

## Visual Language

- Use the existing paper background color with a subtle blur, fine border, rounded corners, and restrained shadow.
- Keep labels easy to scan with generous 48px-or-larger tap rows.
- Mark the active route with the existing forest green and a small citrus-colored dot or organic indicator.
- Keep the panel right-aligned while labels remain readable and consistently aligned.

## Motion

- Enter from the top-right with a small downward translation and subtle scale change.
- Reveal rows with very short staggered timing.
- Exit faster than entry so navigation remains responsive.
- Animate transform and opacity only; avoid layout-heavy motion.
- Respect `prefers-reduced-motion` through Framer Motion's reduced-motion support.

## Constraints

- Preserve desktop navigation and bilingual labels.
- Do not introduce dependencies or change routes/content models.
- Avoid full-screen backdrops and horizontal overflow.
- Keep changes scoped to the navigation component and focused tests/styles.

## Verification

- Test opening, trigger toggling, outside-click close, `Escape`, route selection, and active state.
- Verify keyboard focus visibility and accessibility attributes.
- Run typecheck, focused tests, lint, and production build.
- Inspect the menu at 360px, 390px, and 430px widths, including English labels and reduced motion.
