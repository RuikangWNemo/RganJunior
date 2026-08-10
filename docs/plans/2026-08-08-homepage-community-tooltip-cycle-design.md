# Homepage Community Tooltip Cycle Design

## Goal

Keep the mascot's community prompt noticeable without leaving it permanently over the homepage hero.

## Approved behavior

- Start the tooltip schedule only after the splash animation has completed and the homepage hero is visible.
- Keep the tooltip hidden for the first 2 seconds.
- Show it for 3 seconds, hide it for 7 seconds, and repeat that 10-second visible/hidden cycle.
- Force the tooltip visible whenever the mascot link is hovered or keyboard-focused, regardless of the timer phase.
- After interaction ends, let the existing timer phase determine whether the tooltip remains visible.
- Keep the tooltip mounted and transition opacity and visibility so its position does not jump.
- Clear all pending timers when the component unmounts or the hero visibility state changes.
- Preserve the existing orange hover/focus palette and community link behavior.
- Under reduced motion, remove the fade transition while keeping the same timing and accessibility behavior.

## Implementation approach

Use React state and chained timeouts in `HeroMascotStage`. The first timeout waits 2 seconds, the visible timeout lasts 3 seconds, and subsequent hidden timeouts last 7 seconds. Expose the timer state through a stable data attribute or modifier class and let CSS handle opacity, visibility, hover, focus, and reduced-motion styling.

## Verification

- Use fake timers to verify initial hidden state, appearance at 2 seconds, disappearance after 3 seconds, and reappearance after 7 seconds.
- Confirm hover and keyboard focus override the hidden state.
- Run focused tests, ESLint, production build, browser timing checks, and console-error checks.
