# Founder Story Homepage-Style Migration

## Scope

Migrate the complete `/story` page into the visual language already established on the homepage. Preserve all existing copy, localization, imagery, image order, routes, links, section order, IDs, and behavior.

## Chosen direction

Use a content-preserving editorial migration rather than a cosmetic reskin or a broad shared-component refactor.

- Reuse the homepage paper, forest, orange, typography, spacing, border, image, and interaction language through a page-scoped root class.
- Keep `FounderStory.tsx` as the owning page component so the change remains local and does not disturb the homepage.
- Recompose existing content into photography-led editorial sections with controlled asymmetry, generous spacing, and clear chapter transitions.

## Page composition

### 1. Hero

Use a two-column editorial cover on paper: Nate's portrait is the primary element; the page title and lead are secondary; the origin note and caption are supporting information. The title uses the homepage handwriting display role and brand orange. On small screens the copy comes first and the portrait follows.

### 2. Five-part journey

Present the existing five moments as an editorial timeline rather than a uniform card list. Each moment keeps its date, phase, title, body, and image. Desktop alternates the visual emphasis while retaining DOM reading order. Dividers and whitespace provide structure; images receive the same restrained radius, saturation, and hover treatment as the homepage. Mobile collapses to a single readable flow.

### 3. Community support

Retain the dark narrative turn, using the homepage deep forest surface with on-dark paper text and orange metadata. The community photo receives enough scale to act as primary content rather than a thumbnail.

### 4. Action continuation

Use a warm paper/peach transition and three divider-led editorial columns. Avoid cards, shadows, and decorative icon repetition. The section heading remains the primary element and the numbered actions stay easy to scan.

### 5. Closing CTA

End with a low-density deep-forest CTA consistent with the homepage closing language. Keep both existing destinations, treating the full story link as the primary action and the programmes link as the secondary text action.

## Visual system

- Paper: homepage warm paper background.
- Forest: deep chapter/CTA surface and readable ink.
- Orange: handwriting display titles, dates, and action emphasis.
- Typography: homepage handwriting font for short display titles; body sans for paragraphs, metadata, buttons, and longer English headings.
- Images: photography-led, restrained rounding, no decorative shadows except interactive focus treatment.
- Motion: the current reveal behavior remains subtle and respects reduced-motion preferences.

## Responsive behavior

- 1440px: full editorial grid, large portrait and alternating timeline compositions.
- 820px: intentional tablet stacking with images kept large and text measures constrained.
- 390px: single-column flow, copy-first hero, readable 16px minimum body text, compact but generous spacing.

## Accessibility and regression requirements

- Preserve heading hierarchy and all labelled sections.
- Preserve meaningful image alt text, links, and keyboard focus visibility.
- Preserve Chinese and English content and account for longer English headings without forcing unsafe one-line layouts.
- Respect `prefers-reduced-motion`.
- Update page tests only where new structure merits explicit regression coverage.
- Verify the targeted page test, application typecheck/build, and browser renders at 390px, 820px, and 1440px.

## Implementation boundary

Expected implementation files are `src/pages/FounderStory.tsx`, `src/pages/FounderStory.test.tsx`, and page-scoped additions in `src/index.css`. Existing unrelated working-tree changes must remain untouched.
