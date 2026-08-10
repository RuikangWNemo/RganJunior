# Community People Planet Visual Upgrade

**Date:** 2026-08-08  
**Status:** Approved  
**Chosen direction:** A — Forest-night Avatar planet

## Goal

Turn the Community People view from a technical globe demo into an emotionally legible social square. People, names, and presence should be the visual protagonists; the planet should create depth and discovery without exposing a literal grey mesh.

## Experience principles

1. **People before geometry.** Replace anonymous dots with distinctive Avatar medallions and selectively visible names.
2. **Forest night, not outer-space chrome.** Use R-Gan's deep forest, warm orange, moon-paper, mint, coral, and gold palette.
3. **Depth through scale and light.** Near people appear larger, brighter, and more legible; far people become smaller and quieter.
4. **One calm focal point.** Selecting a person brings them smoothly to the foreground and reveals their profile in a floating card.
5. **Atmosphere without noise.** Use restrained star dust, halo layers, and a few orbit paths instead of a dense triangulated wireframe.

## Visual system

### Stage

- The People explorer becomes a near-black forest-night stage with a radial green atmosphere and warm central glow.
- The stage may be substantially darker than the surrounding Community shell; this contrast is intentional and was approved.
- Large continuous blur animations are prohibited. Atmosphere is rendered as static gradients, transparent geometry, or slowly transformed layers.

### Avatar stars

- Each visible member receives a deterministic identity medallion derived from the member id and display name.
- The medallion combines an organic color palette, an initial, a soft rim, and a small highlight. It is designed so a real avatar texture can replace it later without changing layout or interaction.
- Nearby members show names; distant members remain visual presences without label clutter.
- The current member is always orange and marked as “Me”.
- The selected member grows, gains a warm halo, and becomes the clearest object in the scene while other members recede.

### Orbit and atmosphere

- Remove the visible grey sphere and dense link mesh.
- Keep only a subtle atmospheric core, two or three incomplete orbit rings, sparse dust, and short decorative traces.
- Orbit lines are decorative only and never imply actual social relationships.

### Profile presentation

- On desktop, the selected profile appears as a translucent floating card over the lower-right of the stage instead of occupying a separate rigid column.
- On mobile, it becomes a compact bottom sheet within the stage.
- Empty state copy invites the user to rotate or select a person without competing with the planet.

### Controls and list view

- View mode, pause, and reset controls become dark translucent pills inside the stage header.
- List mode remains available as the accessible and WebGL-safe fallback, restyled to visually belong to the same forest-night experience.
- The name index remains keyboard-accessible and can select/focus the same person on the planet.

## Interaction

- Drag rotates the social field with inertia.
- Auto-rotation is slow and stops when a person is selected.
- Selecting a member rotates them toward the camera using quaternion interpolation; no page layout is measured or animated.
- Reset clears selection and restores the calm rotation.
- The page must not hijack scrolling or add zoom gestures.
- `prefers-reduced-motion` disables auto-rotation and snaps orientation changes while preserving all information.

## Responsive behavior

- Desktop: immersive wide stage, floating detail card, labels limited to the closest members.
- Tablet: reduced label count and smaller detail overlay.
- Mobile: taller stage, compact controls, fewer labels, and bottom-sheet profile; no horizontal overflow.

## Performance and accessibility

- Keep the existing lazy-loaded WebGL chunk and error boundary.
- Cap device pixel ratio and use demand-driven rendering.
- Cache generated Avatar textures and dispose Three.js resources.
- Animate scene transforms, material opacity, and scale only; avoid layout reads in the render loop.
- Every member remains reachable through the semantic name index and list fallback.
- Ensure all text and controls meet readable contrast on the dark stage.

## Data and scope

- No database or API changes.
- Existing `CommunityPerson` data remains the source of truth.
- Current `avatar_media_id` does not provide a public renderable URL in this surface, so the first version uses deterministic identity medallions. A future media resolver can swap in real images.
- Messaging behavior and privacy rules remain unchanged.

## Acceptance criteria

- No visible grey globe or dense triangulated network remains.
- People read immediately as colorful identities, not points.
- Selection creates a clear foreground focal state.
- Desktop and mobile screenshots feel intentional and branded.
- Drag, selection, reset, reduced motion, list fallback, and messaging still work.
- Relevant tests, lint, build, React review, and browser verification pass or report only documented pre-existing failures.
