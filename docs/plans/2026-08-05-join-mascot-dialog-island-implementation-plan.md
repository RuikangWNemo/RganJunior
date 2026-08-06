# Join Mascot Dialog Island Implementation Plan

## Scope

Replace the current always-visible join detail panel with a compact light introduction, a green mascot interaction scene, one continuous identity path, rotating mascot prompts, and an accessible role dialog.

## Steps

1. Add localized mascot prompts and dialog state to `JoinUs` while preserving `joinAudiences` as the role-content source.
2. Split the page into a light introduction section and a separate green interaction stage.
3. Replace the current interrupted role layout with one continuous desktop SVG path and one continuous mobile path.
4. Make the three path nodes open role details directly.
5. Add the large mascot speech bubble and click/keyboard entry into the role chooser.
6. Move role introductions, rows, and application actions into an accessible responsive Dialog.
7. Reposition and de-emphasize the retained lanyard inside the green interaction scene.
8. Update responsive styles and reduced-motion behavior.
9. Update tests for prompt behavior, dialog flow, direct role entry, removed inline details, and application links.
10. Run tests, lint, build, and desktop/mobile browser verification.
