# Join Seed Community Integration Design

## Goal

Rebuild `/join` around the homepage Seed Community composition so the join journey feels like a direct continuation of the homepage. Remove the Partner Voices entry from this page and integrate the existing youth, parent, and partner content into one interactive identity stage.

## Chosen Direction

Extract the homepage Seed Community visual structure into a reusable composition with two modes:

- The homepage keeps its current concise invitation and `/join` entry.
- The join page uses an interactive variant with identity selection, identity-specific details, and an application link.

This keeps both pages visually aligned without maintaining two copies of the same layout.

## Page Structure

The join page becomes one forest-green community invitation stage beneath the site navigation.

1. Seed Community kicker and join heading.
2. Connected youth, parent, and partner identity nodes.
3. A single detail area whose content changes with the active identity.
4. The existing identity lanyard in the upper-right visual area.
5. The homepage mascot illustration anchored toward the lower-right.
6. One identity-specific application action.

The existing Partner Voices section and its link are removed from `/join`.

## Identity Interaction

The existing `joinAudiences` data remains the source of truth for titles, introductions, explanatory rows, and closing actions.

- Desktop pointer hover temporarily previews an identity.
- Pointer exit restores the last identity selected by click.
- Click locks the identity as the current selection.
- Keyboard focus previews an identity; activation locks it.
- Mobile uses tap selection and never depends on hover.
- The active identity updates the detail copy, the application URL, and the lanyard artwork and label together.

The detail content stays in one stable area and uses a restrained fade and vertical transition between identities.

## Responsive Layout

### Desktop

- Copy, identity path, and the detail area occupy the left side.
- The lanyard occupies the upper-right visual zone.
- The mascot occupies the lower-right visual zone.
- The two visuals remain separated so neither obscures the content or the other.

### Mobile

- The heading is centered.
- Identity choices become compact, wrapping controls rather than relying on precise positions along the curve.
- The active detail follows directly below the choices.
- The lanyard is reduced and participates in normal layout flow.
- The mascot sits after the content near the bottom of the stage.

## Motion and Accessibility

- The overall composition receives one gentle entrance reveal.
- Identity details use short fade and slight upward movement.
- The mascot does not use a continuous idle animation.
- Existing lanyard behavior remains, with a static fallback where WebGL is unavailable or reduced motion is requested.
- `prefers-reduced-motion` disables nonessential displacement.
- Identity controls expose tab semantics, selected state, associated panels, visible keyboard focus, and touch-safe targets.

## Data and Failure Handling

- `joinAudiences` continues to provide all localized role content.
- The active role defaults to youth and can be initialized from the existing URL hash behavior.
- Unknown role values fall back to youth.
- The application URL remains `/join/apply?audience=<identity-id>`.
- Lanyard images keep the current preload and static fallback behavior.

## Verification

- Update the join-page tests to confirm Partner Voices content and links are absent.
- Verify all three identities can be selected and update the panel, lanyard, and application URL.
- Verify hover preview restores the clicked selection when the pointer leaves.
- Verify keyboard focus and activation behavior.
- Run targeted tests, the complete test suite, lint, TypeScript/build checks, and a production build.
- Inspect `/join` and the homepage at desktop and mobile widths for overlap, horizontal overflow, focus visibility, and layout regressions.

