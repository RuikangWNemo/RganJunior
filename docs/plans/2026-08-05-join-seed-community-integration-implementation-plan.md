# Join Seed Community Integration Implementation Plan

## Scope

Implement the approved shared Seed Community composition on `/join`, remove Partner Voices from that page, and connect the three role nodes to the existing role content, lanyard, and application routes.

## Steps

1. Extract the forest stage, decorative circles, and mascot artwork from `SeedCommunity` into a reusable presentation component while preserving the homepage output.
2. Rebuild `JoinUs` inside the shared stage and keep the existing WebGL/static/mobile lanyard fallbacks.
3. Add temporary pointer/focus preview plus click/keyboard selection for the three identity controls.
4. Render one animated, localized detail panel and keep application URLs synchronized with the active identity.
5. Add join-stage responsive styles and stop the global companion mascot from duplicating the large stage mascot on `/join`.
6. Update automated tests for removed Partner Voices content, identity selection, preview restoration, and application links.
7. Run targeted tests, the complete test suite, lint, build, and desktop/mobile browser inspection.
