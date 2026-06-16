# Brand Decoupling Design

## Goal
Remove all legacy generator coupling from the project and consolidate bilingual branding for `阿柑少年 / R'gan Junior` under a single source of truth.

## Scope
- Remove legacy runtime/build references
- Remove legacy repo artifacts and metadata
- Keep the existing mascot artwork as the logo image
- Make brand text, page titles, and head metadata switch with `zh/en`

## Approach
1. Create a centralized brand module for names, descriptions, taglines, mascot alt text, and route titles.
2. Add a lightweight head-sync component that reacts to language and route changes.
3. Refactor visible brand touchpoints to consume shared brand data instead of hardcoded strings.
4. Delete legacy config, metadata, and repository artifacts.
5. Rebuild and validate bilingual title/logo behavior locally.

## Tradeoffs
- The site remains client-rendered, so route and language metadata are updated after hydration rather than server-rendered.
- Social image metadata is removed instead of replaced with a new custom OG image because no branded share asset was provided.

## Validation
- `rg` confirms no legacy-platform references remain outside ignored artifacts
- `npm run build` succeeds
- Local dev server responds and brand text/head metadata switch with language
