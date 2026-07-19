# Homepage Seed Community Stage Redesign

## Goal

Replace the restrained invitation card with a memorable, energetic Seed Community entry led by the R'gan Junior mascot.

## Approved Direction

Turn the full homepage section into a deep forest-green community stage.

- Use the existing `mascot-wide.png` as the visual lead.
- Crop the mascot at an oversized scale from the lower-right edge so it feels as if R'gan is entering the page to invite the visitor.
- Restore the direct message: youth, parents, and partners can join.
- Arrange the three identities along one growing path with orange seed nodes instead of a table-like grid.
- Keep one clear CTA leading to `/join`.
- Preserve bilingual content and the existing route behavior.

## Composition

### Desktop

- Use a full-width forest-green section rather than a light card inside a light field.
- Place the kicker, headline, identity path, and CTA in the left portion of the section.
- Anchor the oversized orange mascot at the lower right. The crop should feel intentional and leave the face visible.
- Use cream text and quiet green tonal lines so the orange mascot remains the single dominant accent.
- Keep the CTA visually integrated with the stage, using text plus a circular arrow rather than a detached glowing button.

### Mobile

- Stack the invitation copy at the top.
- Place the identity path beneath it in a compact vertical or gently curved sequence.
- Let the mascot rise from the lower edge without covering the copy or CTA.
- Keep the `/join` target comfortably tappable and prevent horizontal overflow from the oversized artwork.

## Motion

- Run the entrance sequence once when the stage enters the viewport.
- Reveal the copy first, draw the identity path second, and let the mascot rise into place last.
- Animate only opacity and transforms for the copy and mascot; use SVG path length for the route.
- On CTA hover or keyboard focus, move the arrow slightly and let the mascot lean by only a few degrees.
- Do not add idle bobbing, looping glow, blur, or continuous background motion.
- Respect `prefers-reduced-motion` by rendering the final state immediately.

## Accessibility and Behavior

- Keep the CTA as a semantic React Router link to `/join`.
- Hide decorative path artwork from assistive technology while keeping the three audience labels readable.
- Preserve visible keyboard focus.
- Reuse the existing language context rather than introducing local state or new data flow.

## Verification

- Run TypeScript, tests, lint, and the production build.
- Inspect the homepage at 1440px desktop and 390px mobile widths after the splash animation completes.
- Confirm the stage is visually balanced, the mascot crop is intentional, the audience labels remain legible, and no horizontal overflow appears.
- Verify the CTA navigates to `/join`, reduced motion resolves to the final state, and no browser errors are introduced.
