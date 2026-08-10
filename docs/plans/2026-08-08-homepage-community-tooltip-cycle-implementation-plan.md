# Homepage Community Tooltip Cycle Implementation Plan

1. Add chained tooltip visibility timers to `HeroMascotStage` that begin when the splash completes.
2. Expose the timer state through an accessibility-neutral data attribute while keeping the tooltip mounted.
3. Update the tooltip CSS for hidden, timed-visible, hover, focus, and reduced-motion states.
4. Add a focused `HeroMascotStage` test using fake timers for the 2-second, 3-second, and 7-second phases, plus hover/focus overrides.
5. Run focused tests, ESLint, production build, diff checks, browser timing verification, and console checks.
