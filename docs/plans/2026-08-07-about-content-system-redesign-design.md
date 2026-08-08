# About Content System Redesign

## Goal

Replace the current fixed-profile About page with the approved four-chapter editorial structure supplied by the project owner. The page should explain who builds R'gan Junior, what it believes, how it works, and where its real-world learning happens.

The visual language stays rooted in the existing warm-paper brand system. Major headings use brand orange. Deep forest green carries chapter numbers, English subtitles, role labels, keywords, and selected emphasis text.

## Information architecture

Keep `/about` as one page with four durable anchors:

1. `#team` — 我们的团队 / Initiator & Youth Co-Creation Partners
2. `#belief` — 我们相信这些简单的事 / What We Believe
3. `#method` — 我们如何做 / Four Realities
4. `#places` — 我们的真实场域 / Our Living Labs

The existing desktop, mobile, and sticky in-page About navigation continue to target these anchors.

## Team model

The team chapter no longer renders Nate, Tianshi, Ruby, and Rossie as a fixed four-person profile list. It presents three layers:

- Nate as initiator, with a prominent narrative profile and link to the founder story.
- Youth Co-Creation Partners as the continuing youth-led layer of the project.
- Maquinta Education as the adult support team and incubation platform.

Youth profiles must be data-driven and optional. The initial page explains the collective role without inventing identities or biographies. Confirmed partners can later be added with fields such as name, preferred identity, city, interests, role, portrait, and story link. Missing optional fields must not leave empty visual placeholders.

The five youth co-creation directions — project and activity design, community connection, documentation and communication, field research, and life-experience design — sit beneath the team layers as a compact capability map.

## Belief chapter

Use the supplied introductory paragraphs followed by three numbered editorial beliefs:

1. Nature is the best teacher.
2. The real world is the deepest classroom.
3. Young people are a force already in motion.

The section should alternate quiet text and real photography instead of turning every belief into an equal generic card. Orange carries the main chapter title; forest green carries numbers, short emphasis lines, and structural labels.

## Method chapter

Introduce the method with the phrase “四个真实” and present four clear elements:

- 真实生活
- 真实社区
- 真实议题
- 青少年主理

Use a responsive four-part editorial grid on larger screens and a readable vertical sequence on mobile. Each item has a concise title, concrete examples, and a body paragraph. The previous project-version timeline is removed from this chapter because it is not part of the supplied About narrative.

## Living Labs chapter

Present “一座社区大本营，三片生态试验田” as a field atlas:

- 铁牛村 — community home base
- 南宝山 — forest and organic tea base
- 金鱼溪 — Tea-Forest-Life community
- 黎波黑茶部落 — highland ecological agriculture base beneath Mount Gongga

Tieniu Village receives the largest visual treatment. The other three sites form supporting field entries with location context, experience description, and keyword lists. Reuse verified project imagery where available; do not imply that a photo depicts a specific site unless its source is clear.

The existing deep Tieniu Village map and land-regeneration material may remain after the four-site overview as an optional deeper read, provided it does not interrupt the supplied chapter hierarchy.

## Visual system

- Warm off-white paper remains the primary page background.
- Brand orange is reserved for large display headings and active navigation accents.
- Deep forest green is used for chapter numbers, English eyebrows, role labels, keywords, and selected important sentences.
- Body copy uses the existing foreground and muted-foreground tokens for sustained readability.
- Display type remains expressive; body type remains restrained and highly legible.
- Cards use editorial borders, whitespace, and asymmetry rather than repeated floating tiles.
- Motion is limited to subtle entrance and navigation feedback and respects reduced-motion preferences.

## Localization and accessibility

Provide complete Chinese and English content through the current language system. Preserve semantic heading order, meaningful image alternatives, keyboard-operable navigation, visible focus states, and reduced-motion behavior. Long Chinese passages must remain comfortable on mobile without forced narrow columns or decorative text overlaps.

## Verification

- Update focused About tests for the new headings, team hierarchy, co-creation directions, four beliefs/method elements, and all living-lab names.
- Run type checking, the About test suite, and the production build.
- Verify the page at desktop and mobile widths, including both languages, sticky chapter navigation, anchor scrolling, heading colors, text contrast, and the absence of horizontal overflow.
