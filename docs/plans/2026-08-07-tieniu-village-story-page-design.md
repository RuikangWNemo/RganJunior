# Tieniu Village Story Page

## Goal

Give Tieniu Village a dedicated reading path from the About page without making the main About route longer. The story should explain why Tieniu is more than an activity location: it is the community and land practice from which R'gan Junior grew.

## Entry and route

- Add a clear `阅读铁牛村的故事 / Read the Story of Tieniu Village` link to the featured Tieniu Village card in the `Our Living Labs` chapter.
- The link opens the dedicated route `/about/tieniu` in the same tab.
- Do not add a new primary-navigation item. Tieniu remains a deeper layer of About.
- The story page provides a visible route back to `/about#places`.

## Story structure

The dedicated page follows one continuous editorial path:

1. A warm-paper introduction with the orange title `铁牛村的故事`, a short statement of why the place matters, and verified aerial photography.
2. The existing Chengdu–Xilai–Tieniu location story, with the static fallback map always available and the live AMap enhancement used only when keys are configured.
3. The existing land-regeneration narrative: the original soil problem, sustainable repair practices, ecological response, and the 9–40–9900 mu scale.
4. A closing statement connecting the repaired land, village life, and the origin of R'gan Junior, followed by a return link to the four living labs.

## Visual language

- Continue the approved About system: major display headings in brand orange `#ff6a1f`, structural labels and selected emphasis in deep forest green, and warm off-white paper as the main background.
- Treat the page as an editorial field story, not a collection of generic cards.
- Reuse verified Tieniu Village, soil, and regeneration assets already archived in the project.
- Preserve the current map controls and accessible fallback, but visually connect them to the newer About typography and spacing.
- Keep motion optional and respect reduced-motion preferences.

## Content and localization

- Reuse and refine the existing bilingual Tieniu map and regeneration copy rather than inventing unsupported claims.
- Preserve the existing sourced figures: 1.7% initial soil organic matter, 2.5% measured stage, and the 9/40/9900 mu scale.
- Keep all route labels, navigation, image alternatives, map controls, and story copy complete in Chinese and English.

## Accessibility and failure behavior

- Use semantic heading order and a single page-level `h1`.
- Preserve keyboard-operable map stage buttons and visible focus states.
- If AMap credentials are missing or loading fails, show the archived static location map without blocking the story.
- Avoid horizontal overflow at desktop and mobile widths.

## Verification

- Add route and content coverage for `/about/tieniu`.
- Update About tests to verify the new Tieniu story link and destination.
- Run focused tests, lint, and the production build.
- Verify Chinese and English layouts at desktop and mobile widths, including the CTA, route transition, return link, map fallback, and the absence of runtime errors or horizontal overflow.
