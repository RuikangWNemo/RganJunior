# Findings

## 2026-06-19 Home Hero Fine-Line Flow Background
- The first large flowing gradient/wave version of `HomeHeroFlow` was visually rejected by the user as too ugly. It has been removed from the implementation: no `.home-hero-flow__wash`, `.home-hero-flow__river`, `.home-hero-flow__threads`, `.home-hero-flow__veil`, or `.home-hero-flow__grain` elements remain.
- Web reference review shifted the direction toward cleaner design, soft motion, and relationship/thread metaphors rather than large color fields or tech/game-like effects.
- Final direction B uses SVG fine-line paths behind the homepage hero: three very light path lines, animated highlight segments, and small breathing nodes on desktop.
- The interaction is intentionally minor: pointer movement updates CSS drift variables for subtle parallax, scroll updates opacity, and reduced-motion disables ongoing animations.
- Browser verification at `http://127.0.0.1:5175/` found the homepage loaded with no error overlay and no console errors, 8 fine-line SVG paths, 3 animated pulse paths, 3 desktop nodes, no rejected old background elements, and pointer movement changing SVG drift.
- Mobile verification at 390px found no horizontal overflow, no error overlay, old background count 0, fine-line flow present, nodes hidden, and text still visible.

## 2026-06-19 Actions Three-Track Theatre
- The current `/actions` page is implemented in `src/pages/Actions.tsx` and draws all major content from `actionLayers` and `impactProof` in `src/content/siteContent.ts`.
- The current Actions layout is a sequence of alternating text/image sections. It explains the progression, but visually reads as stacked display content rather than a high-end parallel action system.
- The user wants the three action lines to feel more premium than a card matrix or timeline. The approved direction is a single spatial "three-track theatre": mountain, field, and urban-rural action shown as equal parallel tracks within one system.
- The redesign can be implemented without changing the shared content model by adding local action verbs, track metadata, and a new structural layout in `src/pages/Actions.tsx`.
- Final implementation keeps the page bilingual and turns the old vertical alternating display into a system-like layout: Action System hero, three equal action tracks, a convergence statement, and an evidence ledger.
- The previous `TargetCursor` idle state was visible in the middle of screenshots, so it now starts at `opacity: 0` and fades in only when hovering `.cursor-target` elements.
- CDP verification at 390px mobile and 1440px desktop found no horizontal overflow on `/actions`; Chinese mobile rendering is stable.

## 2026-06-19 Cursor Motion And Targeting
- The user-provided `BlobCursor` component depends on `gsap` and creates a trailing blob that follows pointer movement inside its container.
- The user-provided `TargetCursor` component also depends on `gsap` and targets elements matching `.cursor-target` by drawing animated corner brackets around them.
- `package.json` does not currently include `gsap`, so implementation will require adding that dependency.
- The best global mount point is `Layout`, because both cursor effects should be available across routed pages without duplicating setup.
- Suitable `TargetCursor` surfaces: desktop navbar links/language button, homepage hero CTA buttons, homepage `SeedCommunity` join cards, Actions page "Learn how to join" links, Join page identity tabs, contact email link, and the NotFound return link.
- Less suitable surfaces: long text, photo figures, already decorative mascot elements, and mobile menu interactions. Cursor effects should be desktop-only and disabled for reduced-motion users.
- Recommended direction: use `TargetCursor` globally for selected important controls and use `BlobCursor` only inside the homepage hero surface as a very soft orange paper-like pointer trail. Avoid using a global blob cursor across every page.
- Final implementation adds `gsap`, a shared `useCursorEffectsEnabled` hook, local `BlobCursor` and `TargetCursor` components, and desktop/reduced-motion gating for both effects.
- `TargetCursor` is mounted once in `Layout` and only responds to `.cursor-target` elements on important links/buttons. `BlobCursor` is limited to the homepage hero and rendered as a decorative pointer trail.
- Browser verification at `http://127.0.0.1:5173/` found homepage content loaded, no error overlay, `TargetCursor` and `BlobCursor` present on desktop, 12 `.cursor-target` elements, no non-interactive target elements, and responsive target-corner movement over the Join Us link.

## 2026-06-19 Relationship And Connection Strands
- The user-provided attachment contains the React Bits `Strands` component source and CSS. It depends on `ogl`.
- `package.json` currently does not list `ogl`, so implementation will require adding that dependency.
- The homepage renders `HeroMascotStage`, `HeroCopy`, `HomePhotoScroll`, the beliefs grid, `ActionLayerStory`, and `SeedCommunity`.
- The requested "关系与连接" area maps best to `src/components/home/SeedCommunity.tsx`, which currently presents "种子社群 / Not growing alone" and three join links.
- Prior planning already says the community visual should be restrained and express companionship rather than a tech-style network. This makes `Strands` a better fit as a subtle woven background than as a foreground animation.
- Final implementation adds `src/components/ui/Strands.tsx` and `src/components/ui/Strands.css`, installs `ogl`, and renders the effect behind `#seed-community` with orange/green/gray strands and reduced-motion hiding.
- Browser DOM verification found the homepage content loaded, no Vite/error overlay, no console errors, and one `1120 x 640` canvas inside the seed-community section.

## 2026-06-18 Research Sprint: Codebase Observations
- Stack: Vite + React + TypeScript + Tailwind + shadcn/radix primitives, with Framer Motion already available. This supports a premium editorial/motion refresh without changing frameworks.
- Routes: `/`, `/about`, `/actions`, `/join` are the main live surfaces; old `/journey`, `/field-research`, and `/voices` redirect.
- Brand constants live in `src/lib/brand.ts`; metadata is runtime-managed in `src/components/BrandHead.tsx`, but current descriptions are generic and not yet optimized per page.
- Homepage already uses the strongest conceptual spine: exploration, healing, learning, action. It needs sharper hierarchy, trust proof, parent conversion logic, and a more explicit program pathway.
- Existing proof assets are valuable: CTB Top 3.6%, Harvard/global English forum, YSA Journal, Claremont Eco-Forum, Yale faculty visit, Campus CSA, Tieniu Village, behavioral economics field study, and rural ecological practice.
- Current visual system is warm paper + forest green + serif editorial. It is appropriate, but risks becoming one-note and overly earnest without higher contrast, stronger image sequencing, clearer data/proof modules, and more deliberate motion.
- Join page has identity-based tabs for youth/parents/partners and a contact ledger, but many contact fields are "coming soon"; this weakens conversion and parent confidence.
- SEO basics exist in `index.html` and `BrandHead`, but there is no route-level keyword strategy, canonical URL, structured data, sitemap reference, or robust social preview image strategy visible in the inspected files.

## 2026-06-18 Benchmark Findings
- Education/outdoor leaders such as Outward Bound and NOLS pair inspiring language with practical entry points: course search, audience segmentation, safety/risk pages, scholarships, impact data, and clear program paths.
- Green School Bali and Teton Science Schools make place part of the educational method, not just a backdrop. This is directly relevant to Tieniu Village.
- Where There Be Dragons shows that immersive youth programs need parent-facing infrastructure: wellness, health/safety, enrollment steps, tuition assistance, FAQs, and testimonials.
- Visual storytelling leaders such as Emergence Magazine, Patagonia Stories, National Geographic, The Pudding, and Distill all make each visual/story unit carry a clear editorial job: reveal a question, explain a system, show evidence, or invite action.

## 2026-06-18 Current Site Diagnosis
- Live HTML is a thin SPA shell with `#root`; key body content is not present in static HTML.
- `https://rganjunior.org` redirects to `https://www.rganjunior.org/`, but no canonical tag was visible in the returned HTML.
- `/sitemap.xml` currently returns the homepage HTML instead of a real sitemap.
- The first viewport is memorable because of the mascot, but it does not yet show real youth, real field work, project status, or trust proof.
- The homepage photo section is more premium than the old strip, but it functions mostly as a gallery. It should carry stronger narrative and conversion work.
- The strongest brand position is not generic outdoor learning, but "a real-world learning and ecological action platform for young people, rooted in Tieniu Village."

## 2026-06-18 Meeting Calibration
- Meeting notes should override the earlier "homepage as full trust/conversion page" tendency. The homepage should be a concise, powerful attraction page, not a complete program detail page.
- The clearest brand position is "真实社区中的整全生命成长", supported by exploration, healing, learning, and action.
- The "山野-田野-城乡" three-layer action logic is the best public-facing structure for the project: mountain/wilderness exploration, field investigation, and urban-rural action.
- About should absorb Journey/history content; Actions should absorb field activities/action records; Join should absorb partner voices and conversion.
- The seed community concept should appear as a core emotional/relational idea: young people with similar cognition supporting each other over the long term.
- Materials collection is now a first-class prerequisite: imagery, audio/voice, accounts, domain email, contact channels, and public-ready proof assets.
- `docs/research/2026-06-18-rganjunior-site-optimization-research.md` is now the primary next-action document, integrating benchmark research, meeting decisions, site architecture, materials collection, SEO/conversion work, and code implementation phases.

## 2026-06-18 Implementation Findings
- The first implementation slice should keep content centralized. `src/content/siteContent.ts` now carries the shared beliefs, action layers, proof, join identities, and partner voices so homepage, Actions, and Join can stay aligned.
- The homepage now matches the meeting decision better: one real field-image first viewport, concise brand proposition, proof rail, beliefs, three-layer story, and seed community instead of a long program-detail page.
- Actions now has a clearer public-facing job: explain the "山野-田野-城乡" progression with evidence and imagery, rather than mixing many separate action records.
- Join now has a stronger trust/conversion job: partner voices, youth/parent/partner identity tabs, current stage, and unified contact information.
- SEO foundations were missing or generic; route metadata, canonical URL, social preview metadata, JSON-LD, sitemap, and robots sitemap reference are now in place.
- Remaining improvement areas: real audio/video assets for Partner Voices, completed public contact channels, About/Journey merge, stronger mobile screenshot verification, and possible bundle code-splitting.

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
