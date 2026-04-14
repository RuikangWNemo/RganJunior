# Whole-Site Archive Content Implementation Plan

## Objective
Implement the approved full-site archive content pass without disturbing the existing page routing, bilingual structure, or restrained visual language.

## Phase 1: Planning and Asset Preparation
- Write and save the approved design and implementation documents.
- Copy selected `Elements` materials into the project so Vite can serve them reliably.
- Keep imported materials grouped under a dedicated archive path.

## Phase 2: Shared Content Layer
- Create a centralized content module for:
  - homepage highlights
  - about archive materials
  - journey phase evidence
  - field research bands
  - actions gallery
  - voices notes
  - join page entry cards and supporting documents
- Store only descriptive caption data.

## Phase 3: Reusable Archive Components
- Add a small set of shared components for consistent display:
  - figure card
  - document card
  - horizontal archive strip
  - gallery block
- Keep framing and caption behavior aligned across the site.

## Phase 4: Page Implementation
- `src/pages/Index.tsx`
  - replace placeholder archive blocks with curated real materials
- `src/pages/About.tsx`
  - convert the page from placeholder copy to origin archive layout
- `src/pages/Journey.tsx`
  - preserve phase structure and attach evidence strips
- `src/pages/FieldResearch.tsx`
  - replace empty cards with topic-based archive bands
- `src/pages/Actions.tsx`
  - replace placeholders with restrained mixed-aspect gallery
- `src/pages/Voices.tsx`
  - turn quotations layout into field notes image-led layout
- `src/pages/JoinUs.tsx`
  - convert cards to image-backed entry points plus evidence strip
- supporting components such as `Footer` and `NotFound`
  - only adjust if needed for consistency

## Phase 5: Verification
- Run a production build.
- Confirm all archive assets resolve correctly.
- Check that placeholders are removed from the target pages.
- Confirm captions remain descriptive and short.
- Review that page density stays calm on both desktop and mobile.

## Guardrails
- Do not add new storytelling paragraphs beyond descriptive captions.
- Do not overuse media on the homepage.
- Do not let documents and infographics read like pasted presentation slides.
- Do not disturb unrelated in-progress files outside the whole-site content pass.

## Expected Files
- new: `src/content/archiveContent.ts`
- new: `src/components/archive/*`
- modified:
  - `src/pages/Index.tsx`
  - `src/pages/About.tsx`
  - `src/pages/Journey.tsx`
  - `src/pages/FieldResearch.tsx`
  - `src/pages/Actions.tsx`
  - `src/pages/Voices.tsx`
  - `src/pages/JoinUs.tsx`
  - optional supporting files as needed
