# Mobile Design Optimization Design

## Goal

Upgrade the mobile experience so it feels unified with the desktop site while being composed specifically for phone screens. The mobile site should no longer read as desktop sections stacked together.

## Approved Direction

Use a mobile editorial reflow.

Keep the desktop visual language: paper background, forest green accent, citrus mascot, restrained serif typography, real field imagery, thin lines, and quiet motion. Rebuild mobile rhythm and presentation so the homepage, Actions page, and Join page feel intentionally designed for narrow viewports.

## Design Read

This is a targeted mobile redesign/evolution for a youth-growth education brand. It should preserve the existing brand system and desktop IA, but recompose phone layouts around short readable sections, image anchors, and mobile-safe type.

Design dials:

- `DESIGN_VARIANCE: 6`
- `MOTION_INTENSITY: 3-4`
- `VISUAL_DENSITY: 4`

This means composed and editorial, but restrained enough for readability and performance on mobile.

## Scope

### 1. Homepage Mobile Rhythm

The homepage should feel like a phone-native brand cover, not a long vertical dump of hero assets.

Planned changes:

- Tighten the hero stack on mobile so mascot, brand name, subtitle, body, and CTAs fit with less dead space.
- Keep the mascot as a first-viewport brand signal, but reduce its dominance on narrow screens.
- Bring real field imagery into the first scroll with clearer framing.
- Keep desktop hero scale and layout stable.
- Use mobile-specific title, subtitle, CTA, and image spacing tokens.

### 2. Actions Mobile Reflow

The Actions page is the highest-risk mobile surface. Current cards preserve desktop theatre-card mechanics and show right-edge clipping.

Planned changes:

- Replace the mobile version of the large overview cards with phone-native action records.
- Each record should have a real image plate, number, action verb, short axis, one concise description, and activity points.
- Avoid oversized absolute artwork and stacked chip rows on mobile.
- Preserve the desktop three-track system.
- Ensure all English and Chinese strings wrap cleanly at 360-430px widths.

### 3. Join Mobile Identity Surface

The Join page should remain visually related to the desktop lanyard concept, but mobile should not let decorative identity art compete with the text.

Planned changes:

- Keep the mobile identity card inline and lightweight.
- Rework the identity selector so options are readable, tappable, and clearly active.
- Add strong wrapping rules for long English identity headings.
- Keep `/join/apply?audience=...` behavior unchanged.
- Avoid fixed decorative layers on phone widths.

### 4. Shared Mobile System

Create a small shared mobile polish layer rather than scattering one-off fixes.

Planned changes:

- Standardize mobile heading scales for hero, section, card, and panel contexts.
- Standardize mobile section padding and image aspect ratios.
- Add consistent `min-w-0`, `overflow-wrap`, and width guards for long English copy.
- Keep cards at the existing radius scale, with no nested-card clutter.
- Reduce phone motion to subtle reveal and button feedback only.

## Constraints

- Do not change routes, public content models, form/API behavior, or desktop IA.
- Do not introduce new dependencies.
- Preserve bilingual content.
- Preserve desktop layout unless a desktop bug is discovered while making mobile fixes.
- Avoid loud gradients, large wave backgrounds, heavy glass effects, and generic card grids.
- No horizontal overflow at 360px, 390px, or 430px.
- Respect reduced motion.

## Success Criteria

- Homepage mobile feels composed and intentional within the first 1.5 screens.
- `/actions` mobile no longer clips text or feels like compressed desktop cards.
- `/join` mobile headings and identity selector do not cut off at the right edge.
- The phone experience shares the same brand language as desktop.
- Dev verification passes: typecheck, tests, lint, build, and browser screenshots for `/`, `/actions`, and `/join`.

## Verification Plan

1. Run `npx tsc --noEmit`.
2. Run `npm test`.
3. Run `npm run lint`.
4. Run `npm run build`.
5. Use local dev server and mobile screenshots at 390px for `/`, `/actions`, and `/join`.
6. Check for Vite overlay, visible console errors, and horizontal overflow.

