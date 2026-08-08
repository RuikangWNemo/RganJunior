# About Four-Chapter Redesign

## Goal

Rebuild `/about` around the four questions a new visitor needs answered: who is doing the work, what the project believes, how it works, and where it happens. Preserve the useful material already on the page, but move it into a shorter and clearer reading path.

## Information architecture

The page remains a single route with four durable anchors:

- `#team` - Nate as leadership and Tianshi Zhang as a project co-builder
- `#belief` - the belief that growth happens in nature, daily life, and real relationships
- `#method` - real life, real communities, real issues, and youth-led participation
- `#places` - Tieniu Village, Nanbaoshan, Jinyuxi, and Mount Gongga

The desktop About dropdown, mobile drawer submenu, and sticky in-page navigation all expose these same four destinations and share their active state.

## Content integration

- The existing Nate and Tianshi biographies and story links move into the Team chapter.
- The existing mission, vision, and impact language is edited into the Belief and Method chapters.
- The existing 1.0-3.0 project milestones become a compact path within Method.
- The existing Tieniu map and regeneration story remain available within Places as a deeper Tieniu Village feature.
- The page opening is shortened to one clear proposition: growth belongs in real life.

## Visual direction

Treat the page as a contemporary field guide built from the site's existing warm paper, forest green, handwriting display type, and real project photography. Use one light page theme with forest-tinted sections rather than switching the whole page into dark mode. Use a consistent 16px container radius and pill treatment only for navigation controls.

Each chapter uses a different layout family:

- Team: one prominent leadership profile followed by a quieter co-builder profile
- Belief: a full-width photographic manifesto with six lived settings
- Method: four staggered editorial bands followed by a compact project path
- Places: an asymmetric four-place atlas followed by the existing Tieniu deep dive

Avoid equal feature-card rows, decorative section numbers, generic badges, and scroll-driven spectacle. Motion is limited to the shared navigation indicator and reduced-motion-aware content reveals.

## Responsive and accessible behavior

- The chapter menu scrolls horizontally on narrow screens without page overflow.
- All four sections have stable hash targets and adequate scroll margin.
- Desktop dropdown and mobile submenu remain keyboard accessible.
- Team images keep explicit dimensions to avoid layout shift.
- Asymmetric desktop layouts collapse to a single reading column below 768px.
- Reduced-motion users receive instant scrolling and static content.

## Verification

Run TypeScript, lint, tests, and production build. Review `/about` at desktop and 390px widths. Check the four navigation destinations from both `/about` and another route, confirm the active chapter stays synchronized, and check for overflow, clipped copy, broken images, and console errors.
