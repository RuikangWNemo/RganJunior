# Findings

## Homepage Structure
- `src/components/home/HeroCopy.tsx` contains the hero headline, philosophical subtitle, and paragraph. This is the right place to add the requested one-sentence elevator pitch.
- `src/pages/Index.tsx` contains the two requested deletion targets: the "我们如何行动 / How We Learn & Act" phase cards and the "你可以如何加入 / How You Can Join" youth/parent cards.
- The homepage currently flows through hero, photo scroll, why section, origin section, action phases, beliefs, and join. The user wants this simplified and made more compelling.

## Reusable Project Content
- `src/pages/Actions.tsx` already defines three action layers: nature healing, behavioral economics field study, and youth advocacy/community action.
- Current project images already exist in `public/archive/elements/...`, including the youth rural practice camp, campus CSA visual, and CTB forum booth.
- `NetworkAnimation` is currently embedded under the deleted join section. It can be preserved as a community-power visual in a shorter section if it supports the new story.

## Content Direction
- The new homepage should make clear that R'gan Youth/Junior is not a one-off activity, but a long-term whole-person growth plan in real rural and urban communities.
- The central explanatory frame should combine exploration, healing, learning, and action.
- The interdisciplinary frame should name politics, sociology, economics, and ecology while explaining that real life reconnects fields split apart by industrial-era specialization.
- Community power should be stated through youth learning and growing together, not through long conversion copy.

## Premium Visual Refresh
- Current homepage screenshot shows too much empty hero space and an abrupt fade into a heavy dark-green photo section.
- `HomePhotoScroll` is the main weak point: it uses a long horizontal row of equally weighted photos without captions, hierarchy, or editorial focus.
- Stronger candidate images for a premium photo section include `s20-regenerative-design-eco-camp-group.jpg`, `s11-orchard-field-practice.jpg`, `s02-orchard-spraying-scene.jpg`, `s09-regenerative-farming-practice.jpg`, and `s06-linpan-aerial-overview.jpg`.
- The approved direction is a minimal editorial composition: one dominant field image, supporting smaller moments, restrained captions, and lighter page transition instead of a dark full-screen strip.
