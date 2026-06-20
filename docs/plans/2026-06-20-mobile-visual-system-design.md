# Mobile Visual System Upgrade Design

## Context

The mobile site currently feels weaker than the desktop experience because several surfaces are desktop-first compositions scaled down to a narrow viewport. The issue is not only polish: screenshots show clipped decorative layers, a homepage first screen with too little real-place imagery, Actions cards that feel over-compressed, and a Join lanyard layer that competes with text.

## Approved Direction

Use a mobile-specific editorial upgrade rather than a full desktop redesign. Keep routes, content models, and desktop behavior stable while adding narrow-screen structure, image rhythm, and overflow guards.

## Scope

1. Homepage mobile hierarchy
   - Rebalance the first viewport so the mascot, title, copy, and calls to action fit with less empty paper space.
   - Bring real field/video imagery into mobile sooner so the first scroll feels like a place, not only a poster.
   - Tighten mobile typography and spacing without changing desktop scale.

2. Mobile section rhythm
   - Add mobile-only visual scaffolding where the current page relies on text and border lines.
   - Make belief/action/community modules read as editorial sections on phones, with clearer image anchors and less passive whitespace.

3. Actions mobile cards
   - Convert the narrow layout from large desktop theatre cards into cleaner stacked field records.
   - Keep imagery visible, but reduce oversized absolute artwork and dense chip rows on small screens.

4. Join mobile identity
   - Prevent the hanging lanyard from covering or visually cutting into the intro copy.
   - Keep the identity selector understandable on phone widths.
   - Preserve the dedicated `/join/apply?audience=...` flow and existing bilingual content.

## Constraints

- Do not introduce new dependencies.
- Do not change routes, public content data, or form/API behavior.
- Avoid loud gradients or the previously rejected large wave background style.
- Preserve reduced-motion behavior.
- Verify no Vite overlay, no console errors, and no horizontal overflow at mobile widths.

## Verification

Run type, tests, lint, and production build. Then start the local dev server and capture/check mobile viewports for `/`, `/actions`, and `/join`, focusing on visual framing, clipped layers, and overflow.
