# Homepage Hero Balance and Hard Transition Design

## Goal

Refine the approved green homepage hero so it fills the opening viewport, reads more clearly, and hands off to the next section with a deliberate hard boundary.

## Approved design

- Make the hero and its layout fill at least `100svh`.
- Remove the bottom color fade; the green hero ends at a clean horizontal edge before the paper-colored next section.
- Brighten the orange R'gan Junior wordmark so it remains vivid on the green background.
- Shift the mascot and copy together slightly to the right on desktop, with only a small shift on mobile to avoid clipping.
- Change the homepage Community entry hover state to a warm paper background with forest-green text instead of another orange/green collision.
- Keep the next-camp CTA orange, deepen the orange enough for contrast, and render its label and arrow in white.
- Preserve all existing content, motion behavior, responsive order, and accessibility focus states.

## Verification

- Check desktop and mobile viewport height and overflow.
- Confirm the hard green-to-paper boundary contains no gradient.
- Confirm wordmark, CTA text, and Community hover colors through computed styles.
- Run focused tests, lint, production build, and browser console checks.
