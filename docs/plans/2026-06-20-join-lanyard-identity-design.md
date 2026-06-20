# Join Lanyard Identity Design

## Context
The Join page already works as an identity-selection page. Users choose youth, parent, or partner, then continue to `/join/apply?audience=...`. The new request is to make this selection area feel more polished and magical using the supplied 阿柑 mascot images and the React Bits Lanyard effect.

## Approved Direction
Use the full React Bits Lanyard implementation, not a CSS imitation. The user chose option 2 after seeing the trade-offs.

## Design
The Join identity section becomes a two-part stage:

- A visual stage with the React Bits suspended lanyard card. The default active identity is `join-youth`, so the first card is the 阿柑少年 card.
- A three-choice identity selector that keeps the current bilingual content, row details, and apply button behavior.

Each identity has two image roles:

- Background illustration: compressed from the provided 1448x1086 PNG files and used as the soft contextual scene for the selected identity.
- Lanyard card face: compressed from the provided 1080x1080 PNG files and mapped to the front/back face of the GLB card through the Lanyard `frontImage` and `backImage` props.

On identity switch, the section should show a short magic-gas burst before the card face and background settle into the new identity. The burst must be decorative only and must not block the tab or apply link interaction.

## Implementation Notes
- Add the React Bits `Lanyard` component under `src/components/ui/lanyard/`.
- Use the official React Bits `card.glb` and `lanyard.png` assets referenced by the live React Bits Lanyard bundle.
- Add `assetsInclude: ['**/*.glb']` to Vite.
- Add TypeScript declarations for `.glb`, `.png`, and `meshline` JSX intrinsic elements.
- Install `three`, `meshline`, `@react-three/fiber`, `@react-three/drei`, and `@react-three/rapier`.
- Keep the Three canvas inside the Join identity section only. Do not mount it globally.
- Preserve reduced-motion behavior by stopping the magic-gas animation and avoiding unnecessary decorative motion.

## Verification
- Type-check, test, lint, and build.
- Verify `/join` on desktop and mobile for no error overlay, no console errors, no horizontal overflow, visible identity artwork, and working `/join/apply?audience=...` links.
