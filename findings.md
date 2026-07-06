# Findings

## 2026-07-06 About Story And Join Simplification
- New request: About page scroll, map, and story display do not feel bound together and have layout issues; Join mobile should be simplified; Join Apply should feel premium and minimal with excess information removed.
- Design read: targeted evolution of an existing education/editorial site for youth, parents, and partners. Preserve brand, route structure, desktop rhythm, and form submission behavior; remove mobile clutter and bind scroll storytelling visually.
- UI Skills CLI hung again with no output and was interrupted. Planning catchup returned no unsynced output.
- No `.codegraph/` directory exists, so direct file reads and `rg` were used.
- About page currently mounts `TieniuRegenerationStory`; the older `TieniuStoryMap` component exists but is not mounted on the About page.
- `TieniuRegenerationStory` currently drives its active scene through a window scroll listener and separates background imagery, copy shell, metrics, evidence, and footer. This makes mobile feel like the visual/map layer and story layer are adjacent rather than locked.
- Join mobile currently still shows a voices section, an identity illustration card, an identity label, a descriptive panel, multiple detail rows, and a CTA. This is too much for the mobile decision task.
- Join Apply form currently exposes identity, name, contact, age/grade/role, school/organization, city, interests, message, consent, submit, plus shared-channel aside. Tests only require identity selection, name, contact, message, and submit.
- Final About approach: desktop/tablet keeps a scroll-driven land-memory story, now with a shared map card, scene progress, evidence, and copy bound to one active scene. Phone view switches to stacked scene cards so each scroll stop contains the map, story, and evidence together without sticky blank space.
- Final Join mobile approach: hide the voices section on mobile, remove the mobile identity illustration card, hide the detail rows, shorten hero/panel copy, and make the apply CTA a small centered pill while preserving desktop content.
- Final Join Apply approach: visible form is reduced to audience, name, contact, message, consent, and submit. Removed visible age/grade/role, school/organization, city, and interests fields while keeping empty values in the submitted data shape.
- Verification passed: `npx tsc --noEmit`, `npm test`, `npm run lint`, `npm run build`, `git diff --check`, mobile screenshots for About story/Join/Join Apply, and 390px DOM overflow/clipped-text probe across `/`, `/about`, `/actions`, `/join`, `/join/apply`, and `/voices`.
- Chrome desktop screenshot verification for the About story was attempted but rejected by the approval system due usage limit, so desktop visual confidence is from code inspection, type checks, tests, and production build rather than a new desktop screenshot.

## 2026-07-06 Mobile Design Optimization Planning
- New request: use the appropriate skill first to plan a mobile design optimization. The mobile experience currently feels messy and not premium enough.
- Skills used: `ui-skills-root` for UI skill routing, `brainstorming` for approval-gated design planning, `design-taste-frontend` for redesign/audit heuristics, and `planning-with-files` for persistent planning.
- `npx ui-skills categories` produced no output after roughly one minute and was interrupted, likely due package/network resolution in the restricted environment. Local skill context was used instead.
- No `.codegraph/` directory exists at the repo root, so CodeGraph is not available for code lookup.
- Existing design history matters: `docs/plans/2026-06-20-mobile-visual-system-design.md` already called for a mobile-specific editorial upgrade, preserving routes/content, avoiding new dependencies, avoiding loud gradients, and verifying no horizontal overflow.
- Current 390px screenshots:
  - Homepage: `/private/tmp/rgan-mobile-home.png`
  - Actions: `/private/tmp/rgan-mobile-actions.png`
  - Join: `/private/tmp/rgan-mobile-join.png`
- Homepage mobile is not broken, but it still reads like a desktop hero stacked vertically: large mascot, big English headline, separated keyword stack, large pill buttons, then a field-note image. It feels friendly, but not yet as curated or premium as the desktop direction.
- `/actions` is the clearest layout failure. The current mobile overview cards preserve desktop theatre-card mechanics: large minimum heights, absolute artwork, inner panels, and activity chips. At 390px, English body text is visibly clipped on the right, and the card composition feels compressed rather than intentionally mobile.
- `/join` has the same mobile overflow symptom. The identity heading `Become R'gan Junior Youth` is cut at the right edge in the screenshot. The stacked selector and inline identity card are understandable, but the page still lacks strong mobile width/line-length guards for English labels and headings.
- Global CSS has many mobile-specific rules inside a very long `src/index.css`. This makes mobile behavior hard to reason about and increases the risk of page-specific fixes fighting each other.
- Likely root causes: desktop-first typography scales, `max-w` values that cap sections without enforcing mobile wrapping, long English strings without consistent `overflow-wrap`/`min-w-0`, desktop cards reused on mobile, and too much decorative/layered media inside narrow cards.
- Design-taste read: this should be treated as a targeted mobile redesign/evolution, not a full brand rewrite. Preserve the paper/forest/citrus identity and routes, but rebuild mobile hierarchy and card mechanics where they fail.
- User clarified the desired boundary: mobile should stay visually unified with desktop, but the rhythm and display should be designed for phone screens rather than stacked desktop modules.
- Implementation implication: preserve brand tokens, imagery, copy voice, routes, and desktop layouts; add or refactor mobile-specific composition rules for hero rhythm, action tracks, identity selector, typography line length, and card/media behavior.
- User approved the recommended option: mobile editorial reflow. The approved design is documented in `docs/plans/2026-07-06-mobile-design-optimization-design.md`.
- Because no dedicated writing-plans skill is available in this session, the implementation plan was written directly at `docs/plans/2026-07-06-mobile-design-optimization-implementation-plan.md` using the planning-with-files workflow.
- Final implementation keeps the desktop visual system intact and uses mobile-specific class hooks and media rules for the changed surfaces.
- Homepage mobile now has a tighter first-screen sequence: safer mascot scale/framing, constrained title/body line lengths, vertically comfortable CTA rhythm, and a real field-note image before the scroll-video story begins.
- Actions mobile now uses dedicated editorial action records with real scene imagery, numbered axes, action verbs, readable wrapping copy, and simplified activity lists. The previous theatrical card composition remains for desktop/tablet at `md` and above.
- Join mobile now has stronger width and wrap guards for long English text, a less crowded selector rhythm, smaller identity surfaces, and page-level overflow protection.
- Verification after implementation passed: `npx tsc --noEmit`, `npm test`, `npm run lint`, and `npm run build`.
- Existing non-blocking warnings remain unchanged: 8 React Fast Refresh lint warnings in shared UI/context files, React Router future-flag test warnings, Browserslist age warning, and Vite large chunk warnings.
- CDP mobile emulation at 390px passed on `/`, `/actions`, and `/join`: each page reported `docWidth === bodyWidth === 390`, no overlay, and no clipped visible text. `/join` only reports the expected `sr-only` heading as clipped because it is intentionally visually hidden.
- The homepage CDP probe still lists decorative SVG paths and the scroll video media slightly outside the viewport, but the page document width remains 390px and visible text is not clipped.
- Post-implementation mobile screenshots are available at `/private/tmp/rgan-cdp-home-20260706.png`, `/private/tmp/rgan-cdp-actions-20260706.png`, and `/private/tmp/rgan-cdp-join-20260706.png`.
- Follow-up request: the mobile centering/premium rhythm should extend to the other pages because the remaining mobile pages still feel poor.
- Design read: targeted cross-page mobile redesign for youth/parent/partner audiences, preserving the existing paper/forest/citrus brand and desktop layout while adding a shared centered editorial mobile rhythm.
- UI Skills CLI timed out again with no output. Planning catchup also failed again with exit code 137, so existing planning files are the source of continuity.
- No `.codegraph/` directory exists, so code lookup continues through direct file reads.
- Pages needing the strongest pass: `/about`, `/actions`, `/join`, and `/join/apply`. The earlier homepage correction already established the target center-line rhythm.
- About mobile still has a desktop-like left flow: hero, founder profile, evidence rows, team cards, and development timeline need narrower centered text columns and more generous spacing.
- Actions mobile improved for action records, but the hero, overview header, metadata, and proof/convergence sections need the same centered rhythm so the page no longer shifts between left editorial and centered cards.
- Join mobile has some wrap guards, but hero, voices entry, identity panel, CTA, and stage copy still need shared centered mobile alignment.
- Join Apply mobile is especially utilitarian: the back button, apply hero, form column, and shared-channel aside should be centered and given calmer spacing without changing form fields or submission behavior.
- Voices is also a live supporting page from `/join`, so it received the same centered mobile hero/archive treatment rather than staying as a left-heavy placeholder.
- Final cross-page implementation added page-specific hooks plus shared mobile CSS for About, Actions, Join, Join Apply, and Voices. Desktop layouts and routes were preserved.
- About now uses centered, narrower mobile columns for the founder, evidence, team background, development timeline, and land-regeneration story sections. Curly apostrophes in English brand/possessive copy were normalized where they caused awkward mobile breaks.
- Actions now has a centered mobile hero, cleaner three-line metadata, centered overview/action/proof sections, and simplified mobile action records.
- Join and Join Apply now have centered mobile heroes, voices/identity/application surroundings with calmer spacing, and form shells centered while field labels remain left-aligned for usability.
- Final verification passed: `npx tsc --noEmit`, `npm test`, `npm run lint`, `npm run build`, 390px CDP screenshots, and a 390px DOM overflow/clipped-text probe across `/`, `/about`, `/actions`, `/join`, `/join/apply`, and `/voices`.
- A transient CSS minification warning was traced to custom selectors targeting Tailwind's `.container` class; it was fixed by adding page-specific hero shell classes. The final production build no longer reports the CSS syntax warning.
- Remaining warnings are non-blocking and pre-existing or dependency-level: 8 Fast Refresh lint warnings, React Router future-flag test warnings, Browserslist age warning, and Vite chunk-size warning.

## 2026-06-20 Homepage Whole-Life Growth Section
- New request: the homepage should include the supplied Chinese copy about an anxious and uncertain era, returning to nature and community, whole-life growth, and the four movements of exploration, healing, learning, and action. The page should have design sense and cleverness.
- The repo is a Vite + React + TypeScript + Tailwind site. The homepage is `src/pages/Index.tsx`, with hero copy in `src/components/home/HeroCopy.tsx`, scroll video in `HomeScrollVideo`, action-line story in `ActionLayerStory`, and global homepage styling in `src/index.css`.
- The current homepage already has a mascot hero, scroll-driven video, belief cards, three action lines, and seed community CTA. The new copy should not be forced entirely into the hero because that would overload the first viewport.
- Best fit: add a new homepage section after `HomeScrollVideo` and before the existing beliefs/action sections. This gives the copy a deliberate editorial moment and lets it bridge cinematic place imagery into the program philosophy.
- The user clarified that this section should be extremely minimal text only, using just two paragraphs. The earlier compass/map concept was superseded.
- The implementation can stay local to a new `src/components/home/WholeLifeGrowth.tsx` component plus CSS in `src/index.css`, preserving existing shared content models and routes.
- Final section is text-only: two bilingual paragraphs, light horizontal dividers, centered serif typography on desktop, and left-aligned readable text on mobile.

## 2026-06-20 Mobile Visual System Upgrade
- New request: the current mobile version feels visually weak and needs a systematic upgrade.
- Active constraints from project history: avoid loud one-note gradients, avoid the previously rejected large wave/gradient treatment, keep the brand in a premium real-place/paper/field visual language, and preserve mobile readability/no horizontal overflow.
- Existing planning files show recent major surfaces touched: homepage hero/splash/photo/story sections, Actions three-track theatre, Join identity/lanyard, global scroll damping, and cursor effects.
- The repository is a Vite + React + TypeScript + Tailwind site with route pages under `src/pages`, shared homepage components under `src/components/home`, and global styling in `src/index.css`.
- Mobile screenshots captured at `/private/tmp/rgan-mobile-home-before.png`, `/private/tmp/rgan-mobile-actions-before.png`, and `/private/tmp/rgan-mobile-join-before.png`.
- 390px mobile probe found `scrollWidth === viewportWidth` for `/`, `/actions`, `/join`, and `/about`, so the browser is clipping overflow rather than creating a full horizontal-scroll page.
- The homepage first screen reads weak on mobile because it is mostly enlarged mascot plus text on paper; the scroll video begins below a large blank-looking area, and the paragraph is visually clipped in the screenshot even though global `scrollWidth` is 0.
- The homepage first viewport offenders are mostly decorative SVG paths and the scroll video media extending slightly past the viewport while clipped.
- `/actions` has stronger imagery on mobile, but the overview cards feel like desktop theatrical cards compressed into a narrow column; large absolute mascot artwork extends beyond the card and is clipped.
- `/join` is the weakest mobile surface: the fixed hanging lanyard sits off the right edge, the intro copy is visually cut by that layer, and the tab row shows offscreen options without enough mobile affordance.
- `/about` mobile does not show page-level overflow, but land-memory images intentionally extend slightly beyond the viewport; this is lower priority than homepage and Join.
- Recommended design direction: treat mobile as its own editorial system, not just scaled desktop. Prioritize a redesigned mobile home hero, mobile-specific section rhythm, visible real-image anchors, and a simplified mobile Join identity surface.
- Final implementation kept desktop routes/data intact and focused on mobile-only or responsive presentation changes.
- The homepage now adds a mobile field-note image inside the hero and reveals the scroll-video image sooner on compact viewports instead of starting with a fully blank veil.
- The homepage action-line rows now show thumbnails on mobile, restoring image rhythm in a section that previously became mostly text and borders.
- The Actions hero now uses a real field photo, and mobile overview cards reduce oversized contained artwork, card height, chip density, and display scale.
- Join mobile now hides the fixed page-level lanyard layer and replaces it with an inline decorative identity card plus a stacked tab selector, preventing the hanging card from cutting into text.
- The mobile identity card is `aria-hidden` because the same identity text and image meaning are already represented by tabs, panel copy, and the desktop/static lanyard image; this also avoids duplicate image names in tests.
- Visual screenshots after implementation: `/private/tmp/rgan-mobile-home-after2.png`, `/private/tmp/rgan-mobile-actions-after.png`, and `/private/tmp/rgan-mobile-join-after2.png`.
- The final CDP DOM overflow probe could not be rerun because the approval system rejected the local 9222 probe due usage limits. Earlier before/after screenshots showed the main mobile clipping problems corrected; full type/test/lint/build checks passed.

## 2026-06-20 Join Identity Hanging Card
- The current `/join` page is already an identity-selection surface: it renders three tabs from `joinAudiences`, one active narrative panel, and a button linking to `/join/apply?audience=...`.
- The existing Join tests currently assert that the page has no `img` elements, so they need to be updated when adding the requested mascot artwork.
- The provided React Bits `Lanyard` source depends on `three`, `meshline`, `@react-three/fiber`, `@react-three/drei`, and `@react-three/rapier`, plus `card.glb` and `lanyard.png`.
- `package.json` does not currently include those Lanyard dependencies, and no `card.glb` / lanyard texture assets were found in the project.
- Provided background images are 1448x1086 PNG RGB files: `Rganjunior.png`, `Rganjunior_parents.png`, and `Rganjunior_friends.png`.
- Provided card images are 1080x1080 PNG RGBA files: `Rganjunior_card.png`, `Rganjunior_parents_card.png`, and `Rganjunior_friends_card.png`.
- The visual content maps cleanly to the identities: hiking mascot for youth, parent/child mascot for parents, and three cooperative mascots for partners.
- A lightweight CSS/Framer suspended-card implementation can deliver the requested default youth card, magical "poof" switch, compressed assets, and smooth motion without adding heavy 3D physics dependencies.
- User chose the full React Bits Lanyard option, accepting the heavier dependency and asset requirements.
- The live React Bits Lanyard chunk references official assets at `https://www.reactbits.dev/assets/card-BP4TWJmK.glb` and `https://www.reactbits.dev/assets/lanyard-BQfo1yFS.png`.
- Installed React 18-compatible package versions instead of latest `@react-three/fiber@9`: `@react-three/fiber@8.18.0`, `@react-three/drei@9.122.0`, `@react-three/rapier@1.5.0`, `meshline@3.3.1`, and `three@0.184.0`.
- Compressed the six provided Join images to WebP in `public/images/join`; the outputs are 38-66KB each while preserving transparent card art.

## 2026-06-19 Scroll Damping
- The site currently uses native document scrolling plus targeted `scrollTo` / `scrollIntoView` calls and several scroll-driven visual effects.
- No smooth-scroll library is installed, so a small in-house provider is lower risk than adding a dependency.
- The damping should be desktop-only and skip `prefers-reduced-motion`, form fields, overlays, and nested scroll containers so it does not damage usability.
- Final implementation adds `SmoothScrollDamping`, mounted globally in `Layout`, with a custom sync event after route and hash scroll resets.
- Browser verification confirmed the effect is active on desktop, inactive at 390px width, and the Join application form remains usable.

## 2026-06-19 Google Form Creation And Connection
- User approved using the current Chrome Google account to create a real Google Form named "阿柑少年加入申请 / R'gan Junior Application".
- Current website/API fields already map to the needed Google Form structure: audience, name, contact, age/grade/role, organization, city, interests, message, language, page, and submittedAt.
- The current API requires `JOIN_GOOGLE_FORM_ACTION_URL`, `JOIN_GOOGLE_FORM_ENTRY_AUDIENCE`, `JOIN_GOOGLE_FORM_ENTRY_NAME`, `JOIN_GOOGLE_FORM_ENTRY_CONTACT`, `JOIN_GOOGLE_FORM_ENTRY_MESSAGE`, and `JOIN_GOOGLE_FORM_ENTRY_SUBMITTED_AT` to accept a real submission. Optional fields are appended when configured.
- Created and published the target Google Form in the confirmed Chrome Google account. Public form data confirms 11 questions and the expected required fields: audience, name, contact, and message.
- Extracted the published `/viewform` URL and all `entry.*` IDs from the form's public metadata. Live values are stored in ignored `.env.local`; committed docs/examples keep placeholders only.
- Local API smoke testing first exposed a real Google Forms checkbox issue: Google rejects checkbox submissions if multiple selections are joined into one comma-separated string. `api/join.js` now appends one `entry.*` value per selected interest.
- After the checkbox fix, the local API handler successfully posted a test submission with interest selections to Google Form; the form editor shows 2 total test responses.
- A full browser-to-API local submit needs a Vercel dev/deployment server because plain Vite does not serve `/api/join`. This machine does not currently have the Vercel CLI installed.

## 2026-06-19 Dedicated Join Apply Page
- The user wants the form as a separate page: choose identity first, click a button, then fill and submit.
- Current `JoinUs.tsx` contains both the identity tab content and the full application form. The cleanest implementation is to extract the form into a shared component and mount it from a new `JoinApply` route.
- `src/App.tsx` currently only routes `/join` to `JoinUs`, so `/join/apply` needs a new route before the catch-all.
- Route metadata in `src/lib/brand.ts` should include `/join/apply` so document title and descriptions do not fall back to generic brand values.
- Existing Vercel API and Google Form mapping can stay unchanged.
- Final implementation moves the form into `src/components/join/JoinApplicationForm.tsx`, keeps `/join` as the identity-selection/orientation page, and adds `src/pages/JoinApply.tsx` at `/join/apply`.
- `/join/apply?audience=join-parents` correctly preselects the parent identity while still allowing users to change identity in the form.
- Browser verification found `/join` no longer contains `#join-name`, `/join/apply` contains the form and selected identity, and both pages have no error overlay or console errors.
- A mobile overflow issue on `/join` came from long English CTA text inheriting `whitespace-nowrap` from the Button component. The fix allows wrapping and adds `min-w-0`; 390px verification then reported `scrollWidth === clientWidth`.

## 2026-06-19 Join Form To Google Form
- The current Join page already has the right conversion surface: `src/pages/JoinUs.tsx` contains identity tabs for youth, parents, and partners, plus a contact ledger with "微信 / 表单" still marked as "待发布".
- The project is a Vite + React SPA deployed on Vercel. Vercel documentation confirms non-Next projects can add root `api/` functions using `export default function handler(request, response)`.
- `vercel.json` currently uses a catch-all SPA rewrite. Vercel's Vite SPA documentation shows the destination as `/index.html`; updating the destination improves clarity.
- The frontend TypeScript config includes only `src`, so a root `api/join.js` function avoids adding Node globals to the browser lint/type setup.
- Google Forms can receive server-side submissions through the form's `formResponse` URL and `entry.*` field IDs. Those IDs should stay in Vercel environment variables because they are deployment configuration, not frontend code.
- Google Form response notification can be configured to email `contact@rganjunior.org`; if stronger control is needed, the API can also call an optional notification webhook.
- Final implementation uses `api/join.js`, with server-side required-field validation, a honeypot, no-store JSON responses, Google Form URL normalization from `/viewform` to `/formResponse`, human-readable interest labels, and optional `JOIN_NOTIFICATION_WEBHOOK_URL` support.
- The Join page now has a bilingual form in the contact section with audience, name, contact, age/grade/role, school/organization, city, interests, message, consent, loading/success/error states, and direct email fallback.
- Browser DOM/viewport verification at `http://127.0.0.1:5175/join` passed on desktop and 390px mobile: no error overlay, no console errors, all form fields present, and no horizontal overflow. The browser screenshot command timed out twice, so verification relied on DOM, console, and layout metrics.

## 2026-06-19 Splash Opening Upgrade
- The user reports the current opening splash content background color feels ugly and the citrus smiling animation feels strange.
- Prior work has repeatedly pushed the homepage toward a premium, restrained, real-place visual language; the splash should align with that instead of using loud color fields or gimmicky expression motion.
- Existing planning context says rejected large gradient/wave backgrounds should be avoided; successful direction uses fine, restrained movement and clear readability.
- `src/components/SplashAnimation.tsx` uses a very dark brown/black full-screen base with orange/green radial gradients. This likely reads muddy against the warmer brand palette.
- The strange smiling effect is created by overlaying white border arcs for two eyes and one mouth on top of `mascot-full.png`, after the image has already appeared. Because those arcs are independent from the mascot artwork, the expression can feel pasted-on and unnatural.
- The splash currently appears through `HeroMascotStage` only on the homepage when `localStorage.hasSeenSplashAnimation` does not match `brand-film-v3`.
- `HeroMascotStage` owns splash visibility and then hands off to the normal homepage mascot. The likely code boundary is therefore the splash component plus, if needed, a splash version bump so returning visitors see the upgraded intro once.
- The original splash plan asked for a dark/cool opening and an added expression moment, but the current brand direction has since moved toward quieter real-world/paper/field warmth. The upgrade should favor that newer direction.
- Browser capture at `http://localhost:5173/` showed the current splash rendering with no Vite error overlay and `arcOverlayCount: 3`, confirming the extra expression arcs are mounted during the visible opening.
- The screenshot shows the navbar above the splash because both navbar and splash use `z-50`; source order lets the navbar sit on top. The splash should use a higher z-index or the nav should be suppressed while the splash is active.
- Current screenshot path for reference: `/private/tmp/rgan-splash-current-localhost.png`.
- User approved direction A and added that several lines of text should appear after the mascot wakes.
- Approved implementation note created at `docs/plans/2026-06-19-splash-paper-awakening-design.md`.
- Final implementation uses a paper-like morning background, subtle linework, and the original mascot expression without extra facial arc overlays.
- The splash now renders through a React portal into `document.body`, with `z-index: 1000`, so it covers the navbar and is not trapped by the route transition stacking context.
- Post-awakening text includes the brand, subtitle, and four short bilingual lines.
- Browser verification on desktop found the splash parent is `BODY`, old facial arc count is 0, no error overlay appears, nav is not on top, and all four lines are visible.
- Browser verification at 390px found all text fits the viewport, `scrollWidth` equals `390`, nav is not on top, old facial arc count is 0, and no error overlay appears.

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
