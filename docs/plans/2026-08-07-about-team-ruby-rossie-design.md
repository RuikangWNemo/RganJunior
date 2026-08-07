# About Team Ruby and Rossie Addition

## Goal

Add Ruby (Ruoyin Huang) and Rossie (Ruorong Chen) to the About page team chapter while preserving the existing leadership and co-builder hierarchy.

## Team Structure

Keep the current vertical editorial list and display members in this order:

1. Nate — leadership and founder
2. Tianshi Zhang — project co-builder
3. Ruby (Ruoyin Huang) — project co-builder
4. Rossie (Ruorong Chen) — project co-builder

Nate retains the prominent leadership treatment. Tianshi, Ruby, and Rossie share the quieter co-builder treatment so the hierarchy remains clear without introducing a new card system.

## Member Content

Ruby focuses on tea, cooking, nature, and the texture of everyday life. Rossie focuses on tea culture, cross-cultural experience, and community connection. Each profile uses bilingual role, focus, biography, image-alt, and story-link copy.

The Chinese interface displays `Ruby（黄若音）` and `Rossie（陈若容）`. The English interface displays `Ruby Huang` and `Rossie Chen`.

Reuse the existing portrait-oriented photographs and growth-story routes:

- Ruby: `/stories/tea-kitchen-and-summer/images/image-001.webp` and `/voices/tea-kitchen-and-summer`
- Rossie: `/stories/tea-connects-an-american-girl/images/image-001.webp` and `/voices/tea-connects-an-american-girl`

Both images keep explicit dimensions and lazy loading to avoid layout shift.

## Implementation Boundary

Extend the existing `teamMembers` data in `src/pages/About.tsx`. Keep the current rendering loop, semantic structure, and responsive CSS unless visual verification reveals a concrete four-member layout issue.

Do not change the voice-story content, routes, navigation structure, other About chapters, or unrelated worktree changes.

## Verification

- Add focused About page coverage for both names and story links.
- Run the relevant tests, TypeScript checks, lint, and production build.
- Review `/about#team` at desktop and mobile widths for image cropping, hierarchy, spacing, overflow, and broken assets.
