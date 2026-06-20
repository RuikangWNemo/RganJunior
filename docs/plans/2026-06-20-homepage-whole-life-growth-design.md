# Homepage Whole-Life Growth Section

## Goal

Add the supplied homepage copy as a quiet editorial moment. The user later clarified that this part should be extremely minimal and text-only.

## Approved Direction

Use a minimal two-paragraph text section after the homepage scroll video and before the existing belief section.

The section should preserve the user's two Chinese paragraphs with bilingual equivalents, using generous spacing, restrained typography, and simple border rhythm. No map, cards, nodes, icons, extra imagery, or explanatory labels.

## Scope

1. Add a new `WholeLifeGrowth` homepage component.
2. Preserve the current hero, scroll video, belief cards, action-line links, seed community entry, routes, and bilingual language behavior.
3. Include only the final two supplied Chinese paragraphs, with English equivalents for the existing language toggle.
4. Use existing assets and dependencies only.
5. Keep the visual language restrained: paper background, centered serif text, light dividers, and mobile-first readability.

## Implementation Notes

- Place the section in `src/components/home/WholeLifeGrowth.tsx`.
- Mount it in `src/pages/Index.tsx` immediately after `HomeScrollVideo`.
- Add section-specific styles in `src/index.css`.
- Mobile should stack into a readable editorial flow with no horizontal overflow.

## Verification

Run TypeScript, Vitest, lint, and production build. Then start the local Vite dev server and browser-check the homepage at desktop and mobile widths for text fit, visual framing, console errors, and horizontal overflow.
