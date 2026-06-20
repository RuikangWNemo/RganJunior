# Progress

## 2026-06-20
- New request: optimize the Join page identity section with the provided 阿柑少年/家长/合作伙伴 images, compressed assets, a default hanging youth card, and a smooth magical gas transition when switching identities.
- Read the active `brainstorming` and `planning-with-files` skills.
- Recovered current planning context and confirmed the worktree already contains unrelated prior Join/homepage planning changes.
- Read the user-provided React Bits Lanyard attachment and confirmed the full component requires Three/Rapier/meshline dependencies plus `card.glb` and `lanyard.png` assets.
- Inspected `JoinUs.tsx`, `JoinUs.test.tsx`, `src/index.css`, `siteContent`, package dependencies, Vite config, and the six provided local PNG assets.
- Confirmed the existing Join page can be upgraded in-place around the identity selector without changing the dedicated `/join/apply` form route.
- User replied `2`, selecting the full React Bits Lanyard path instead of the lightweight imitation.
- Added the approved design note at `docs/plans/2026-06-20-join-lanyard-identity-design.md`.
- Downloaded official React Bits lanyard assets into `src/assets/lanyard/card.glb` and `src/assets/lanyard/lanyard.png`.
- Installed React 18-compatible Lanyard dependencies after the latest package line failed against React 18.
- Compressed the provided youth, parent, and partner background/card PNGs into WebP assets under `public/images/join`.
- Added the local `Lanyard` component, GLB typing/Vite asset support, and the redesigned Join identity stage with Lanyard, magic burst, background art, static reduced-motion/test fallback, and updated Join tests.
- Follow-up: user clarified that the Lanyard animation should feel attached to the whole page, the selector should not contain images, no Vite overlay/default elements should appear, and duplicated visual elements should be fixed.
- Moved the Join identity artwork below the selector into a full-width hanging illustration stage and removed selector thumbnail images/styles so the identity list is text-only.
- Added a WebGL capability guard so browsers or verification environments that cannot create a WebGL context fall back to the designed static hanging card instead of blanking the page.
- Follow-up correction: moved the Lanyard into a fixed page-level hanging layer, converted the three identity choices back into a parallel selector, turned the identity illustrations into semi-transparent animated section backdrops, and removed the visible original React Bits black strap/hardware styling from the Join usage.
- Follow-up correction after live-page comparison request: redrew the Lanyard card texture so React Bits' original card markings are no longer used, added identity labels directly onto the hanging card, switched the Join Lanyard to a vertical non-draggable layout so the strap connects from above and cannot be pulled out of bounds, enlarged the hanging card, and reduced/repositioned the section backdrop illustrations.

## 2026-06-19
- New request: add damping/weight to site scrolling so the website feels more premium.
- Inspected current scroll-related code and confirmed the site is not using a smooth-scroll dependency.
- Presented three approaches and user approved approach A: lightweight desktop-only damping.
- Added `docs/plans/2026-06-19-scroll-damping-design.md`.
- Added `src/components/SmoothScrollDamping.tsx` for desktop-only wheel damping with reduced-motion, mobile, interactive target, and nested-scroll safeguards.
- Mounted `SmoothScrollDamping` from `src/components/Layout.tsx` and synchronized it after route/hash scroll resets.

## 2026-06-19
- Follow-up request: "把提交表单路径打通" and then "请你来着手做这个表单".
- User confirmed permission to use the currently logged-in Chrome Google account to create a Google Form.
- Read the Chrome control skill, planning skill, current `/api/join`, `.env.example`, and form component.
- Added a new planning section for Google Form creation and connection.
- Created and published the Google Form "阿柑少年加入申请 / R'gan Junior Application" in the confirmed Google account.
- Added the 11 mapped questions matching the website payload and confirmed the public form metadata exposes the expected `entry.*` IDs.
- Wrote the live Google Form URL and entry mappings to ignored `.env.local`; updated `.env.example` with safer configuration guidance.
- Ran a real local API smoke test. A no-interest submission succeeded, while a with-interest submission exposed Google Forms' checkbox behavior.
- Fixed `api/join.js` so checkbox interest selections are sent as repeated `entry.*` values instead of one comma-joined string.
- Re-ran the with-interest smoke test successfully; Google Forms editor reports 2 total test responses.

## 2026-06-19
- Follow-up request: move the Join form to a separate page. The Join page should let users choose an identity, then click into the form and submit from there.
- Re-read the active `brainstorming` and `planning-with-files` instructions.
- Inspected current `JoinUs.tsx`, `App.tsx`, current Join tests, planning files, and current dirty worktree.
- Presented and received approval for `/join` as identity selection and `/join/apply?audience=...` as the dedicated form route.
- Added `docs/plans/2026-06-19-join-apply-page-design.md`.
- Extracted the application form into `src/components/join/JoinApplicationForm.tsx`.
- Added `src/pages/JoinApply.tsx` and routed `/join/apply` from `src/App.tsx`.
- Updated `/join` to remove the embedded form and use identity-specific apply links.
- Added `/join/apply` route metadata in `src/lib/brand.ts`.
- Updated Join tests and added `JoinApply.test.tsx`.
- Fixed 390px mobile overflow on `/join` by allowing long CTA text to wrap and adding `min-w-0` to the two contact/action columns.

## 2026-06-19
- New request: add a Join page form so visitors can fill it directly on the site, with submissions automatically uploaded by Vercel to Google Forms and sent to `contact@rganjunior.org`.
- User approved the Vercel -> Google Form -> Google Sheets/email-notification direction.
- Read the active `brainstorming`, `planning-with-files`, `vercel-functions`, and `env-vars` skills.
- Recovered current planning files and confirmed existing unrelated splash work is dirty in the working tree; this task will not revert it.
- Inspected `JoinUs.tsx`, shared join content, current Join tests, Vercel config, TypeScript config, env ignore rules, and form UI primitives.
- Wrote `docs/plans/2026-06-19-join-form-google-form-design.md`.
- Added `api/join.js` to validate form submissions and forward them to Google Form via Vercel environment-variable mappings.
- Added `.env.example` with Google Form action, field mapping, and optional notification webhook variables.
- Updated `vercel.json` SPA fallback destination from `/` to `/index.html`, matching Vercel's Vite SPA documentation.
- Rebuilt the Join contact section into a bilingual application form plus shared channel ledger.
- Updated join closing copy from "view contact details" to "submit the form".
- Updated Join page tests and added a `ResizeObserver` test mock for Radix checkbox support.

## 2026-06-19
- New request: upgrade the 阿柑少年 opening splash because the content background color is unattractive and the citrus smiling animation feels strange.
- Read the active `brainstorming` skill; it requires design approval before code edits.
- Read the active `planning-with-files` skill and recovered existing planning context.
- Updated root planning files with the splash upgrade phases before continuing discovery.
- Inspected `SplashAnimation.tsx`, `Layout.tsx`, global CSS tokens, Tailwind palette, and splash routing references.
- Identified likely causes: a muddy dark radial background and independent white arc facial overlays that do not belong to the mascot artwork.
- Captured the current splash in the in-app browser at `/private/tmp/rgan-splash-current-localhost.png`.
- Verified no error overlay; found the splash still renders three facial arc overlays and the navbar remains visible above the splash due equal `z-50` stacking.
- User approved direction A with the extra requirement that several lines of text appear after the mascot wakes.
- Added `docs/plans/2026-06-19-splash-paper-awakening-design.md`.
- Rebuilt `src/components/SplashAnimation.tsx` around the approved paper-awakening direction.
- Removed the extra facial arc overlays and kept the mascot artwork's original smile.
- Added post-awakening text lines, subtle fine-line background paths, softer paper/citrus/green color treatment, and a `data-splash-screen` marker for verification.
- Moved the splash overlay through a React portal so it is attached to `document.body` and can cover the navbar despite route transition stacking contexts.
- Bumped the homepage splash version to `brand-film-v8-paper-awakening` so the corrected intro appears once for returning browsers.
- Verified desktop and 390px mobile splash behavior in the browser: no error overlay, no old face arcs, nav not on top, text visible and fitting.

## 2026-06-19
- New request: make the homepage opening screen more magical with flowing background motion and subtle interaction.
- First implementation used a large flowing gradient/wave `HomeHeroFlow` background; user rejected it as ugly.
- User requested web-reference-informed redesign and approved direction B: fine-line flow.
- Rebuilt `src/components/home/HomeHeroFlow.tsx` from large color fields into SVG fine-line paths, subtle moving highlight strokes, and small desktop nodes.
- Replaced the rejected `.home-hero-flow__wash`, `.home-hero-flow__river`, `.home-hero-flow__threads`, `.home-hero-flow__veil`, and `.home-hero-flow__grain` CSS with restrained line/path styles.
- Tuned mobile so the linework is lighter and nodes are hidden; verified no horizontal overflow at 390px.

## 2026-06-19
- New request: redesign the Actions page section for "山野、田野与城乡行动" because the current page mostly displays content and lacks stronger parallel feeling and premium website design.
- Inspected `src/pages/Actions.tsx`, `src/content/siteContent.ts`, `src/components/home/ActionLayerStory.tsx`, image assets, Tailwind tokens, and current planning files.
- Confirmed the existing page uses vertical alternating image/text sections; this is clear but does not express the three layers as a simultaneous action system.
- User rejected a simple three-column curatorial matrix and approved a stronger "three parallel action theatre / action system" direction.
- Added `docs/plans/2026-06-19-actions-three-track-theatre-design.md` as the approved design note before implementation.
- Rebuilt `src/pages/Actions.tsx` into four surfaces: Action System hero, Parallel Field three-track system, Convergence statement, and Impact Proof ledger.
- Preserved the shared `actionLayers` / `impactProof` data model and added only local track verbs/axes inside `Actions.tsx`.
- Adjusted `TargetCursor` so its corner marker is hidden by default and appears only over `.cursor-target`, preventing an idle green target from sitting in the middle of premium page compositions.
- Fixed mobile wrapping by reducing narrow-screen heading scale, stacking track metadata on small screens, and adding `min-w-0` / `break-words` guards.

## 2026-06-19
- New request: integrate React Bits `BlobCursor` and `TargetCursor` mouse movement/selection effects in appropriate places.
- Read the provided `BlobCursor` and `TargetCursor` attachments and confirmed both depend on `gsap`.
- Inspected `App`, `Layout`, `Navbar`, `HeroCopy`, `ActionLayerStory`, `SeedCommunity`, `Actions`, `JoinUs`, and interactive element search results.
- Confirmed `gsap` is not currently installed.
- Identified a restrained design direction: TargetCursor for important desktop controls and BlobCursor only inside the homepage hero area, with reduced-motion/mobile safeguards.
- User approved approach A.
- Installed `gsap`.
- Added `src/hooks/useCursorEffectsEnabled.ts`, `src/components/ui/BlobCursor.tsx`, `src/components/ui/BlobCursor.css`, `src/components/ui/TargetCursor.tsx`, and `src/components/ui/TargetCursor.css`.
- Mounted `TargetCursor` globally through `Layout` and `BlobCursor` only in the homepage hero.
- Added `.cursor-target` to selected interactive controls in the navbar, hero CTAs, seed-community join cards, Actions join links, Join tabs/contact links, footer email, and NotFound home link.
- Verified in the in-app browser at `http://127.0.0.1:5173/`: content loaded, no error overlay, desktop cursor effects present, target classes only on links/buttons, and the TargetCursor brackets responded over Join Us.

## 2026-06-19
- New request: add the React Bits `Strands` effect to the homepage relationship/connection area.
- Read the active `brainstorming` and `planning-with-files` skills.
- Read the provided React Bits `Strands` attachment and confirmed the component uses `ogl`.
- Inspected `package.json`, `src/pages/Index.tsx`, `src/components/home/SeedCommunity.tsx`, `src/components/home/NetworkAnimation.tsx`, `src/components/home/ActionLayerStory.tsx`, `src/index.css`, and `tailwind.config.ts`.
- Identified `SeedCommunity` as the most likely target for "关系与连接" because it carries the seed-community / not-growing-alone story.
- Proposed a restrained background integration direction and paused for design approval before code edits, per the brainstorming skill.
- User approved approach A.
- Installed `ogl`.
- Added `src/components/ui/Strands.tsx` and `src/components/ui/Strands.css`.
- Integrated `Strands` into `src/components/home/SeedCommunity.tsx` as a decorative, non-interactive, reduced-motion-hidden background and added `id="seed-community"`.
- Tuned the effect from very subtle to moderately visible while keeping text readable.
- Verified with `tsc --noEmit`, `npm run build`, `npm test`, and `npm run lint`.
- Started Vite at `http://127.0.0.1:5173/`; in-app browser verification found content loaded, no error overlay, no console errors, and one visible Strands canvas in the seed-community section.

## 2026-06-18
- New request: comprehensive research and optimization plan for rganjunior.org across benchmarks, current diagnosis, brand positioning, homepage IA, visual system, motion/interactions, SEO/conversion/parent trust, and next code implementation plan.
- Read active `brainstorming` and `planning-with-files` skills.
- Recovered existing planning files and confirmed prior homepage visual refresh work was completed on 2026-05-12.
- Inspected the React/Vite codebase, including brand constants, route metadata, homepage, photo section, navigation, About, Actions, Join, and Tailwind design tokens.
- Benchmarked education/outdoor/youth growth sites: Outward Bound, NOLS, Where There Be Dragons, Green School Bali, Teton Science Schools, and The Ecology School.
- Benchmarked visual/editorial storytelling references: Emergence Magazine, Patagonia Stories, National Geographic Magazine, The Pudding, and Distill.
- Checked the live site headers and HTML with `curl`; confirmed `rganjunior.org` redirects to `www.rganjunior.org`, the returned HTML is a SPA shell, and `/sitemap.xml` returns homepage HTML.
- Reviewed local homepage screenshots at `/private/tmp/rgan-home-verify.png` and `/private/tmp/rgan-home-before-tall.png`.
- Created `docs/research/2026-06-18-rganjunior-site-optimization-research.md`.
- New follow-up: incorporate meeting notes from Wang Ruikang and Guoping Nono into a sharper optimization planning document.
- Created `docs/plans/2026-06-18-rganjunior-meeting-calibrated-optimization-plan.md` with brand positioning, three-layer action logic, simplified homepage IA, inner-page responsibilities, material collection plan, implementation phases, and verification checklist.
- Consolidated the meeting-calibrated plan back into `docs/research/2026-06-18-rganjunior-site-optimization-research.md`, making that file the main next-action document for the website optimization.
- New implementation request: start optimizing the website based on the plan.
- Added a shared content model for the three-layer action logic, beliefs, impact proof, join identities, and partner voices.
- Updated brand metadata, route descriptions, canonical/OG/Twitter metadata, JSON-LD, sitemap, and robots sitemap reference.
- Rebuilt the homepage as a concise attraction page: real field-image hero, proof rail, belief section, mountain-field-urban/rural action story, and seed community entry.
- Reworked Actions around the three-layer action logic and Join around partner voices, identity tabs, contact ledger, and small-scale deep exploration stage.
- Ran the React best-practices review for edited TSX files and fixed the Join contact ledger narrow-screen wrapping risk.
- Follow-up homepage correction on 2026-06-19: restored the previous mascot-based hero and light decorative system, removed the homepage proof rail, and rewrote homepage copy to be quieter and less promotional.
- Tuned homepage field-photo, three-layer action, beliefs, and seed community copy toward real-place language rather than pitch-style language.

## 2026-05-12
- New request: make the homepage, especially the photo section, feel premium, minimal, and top-tier.
- Captured current homepage screenshots and confirmed the hero has excessive empty space with an abrupt transition into a heavy dark-green photo section.
- Built a local photo contact sheet and selected stronger field/photo candidates for an editorial redesign.
- Read the active `brainstorming` skill and confirmed code edits require design approval first.
- Read the active `planning-with-files` skill and refreshed the root planning files for this homepage optimization task.
- Inspected the homepage implementation in `src/pages/Index.tsx` and hero copy in `src/components/home/HeroCopy.tsx`.
- Confirmed the requested deletion targets are present on the homepage.
- Reviewed `src/pages/Actions.tsx` for reusable current-project content and imagery.
- Added the bilingual elevator pitch to `src/components/home/HeroCopy.tsx`.
- Reworked `src/pages/Index.tsx` around whole-person growth, interdisciplinary field learning, community power, and Current Projects.
- Removed the old homepage "How We Learn & Act" phase section and the complex youth/parent join copy.
- Rebuilt `src/components/home/HomePhotoScroll.tsx` as a minimal editorial photo section with one featured field image, four supporting images, and restrained captions.
- Tuned the homepage hero spacing, mascot scale, typography rhythm, and transition into the photo section.
- Added horizontal overflow protection and mobile wrapping fixes after screenshot review.

## Verification Log
- 2026-06-20 Join Lanyard identity section: `tsc --noEmit`, `vitest run`, `eslint .`, and `vite build` passed. Lint still reports the existing 8 Fast Refresh warnings; build still reports Browserslist and chunk-size warnings.
- 2026-06-20 Join Lanyard identity section: browser CDP verification passed on desktop and 390px mobile with Chinese content, no Vite overlay, no console errors, one WebGL Lanyard canvas when WebGL is available, static fallback when WebGL is unavailable, fixed hanging-card position preserved after scrolling, zero selector images, three parallel identity choices, 0.22-opacity section backdrop image, successful switch to the parent identity, magic burst present, and no horizontal overflow.
- 2026-06-20 Join Lanyard follow-up: `tsc --noEmit`, `vitest run`, `eslint .`, and `vite build` passed after the strap/card/background corrections. Browser CDP verification passed on desktop and 390px mobile for the partner identity with one WebGL canvas, fixed hanging position after scrolling, no selector images, `/join/apply?audience=join-partners`, partner backdrop image, partner text present, magic burst present, no console errors, and no horizontal overflow.
- 2026-06-19 Scroll damping: `npx tsc --noEmit`, `npm test`, `npm run lint`, and `npm run build` passed. Lint still reports the existing 8 Fast Refresh warnings; build still reports existing Browserslist/chunk-size warnings.
- 2026-06-19 Scroll damping: local Vite ran at `http://127.0.0.1:5177/`; browser verification on `/actions` found no error overlay, no console errors, and `data-scroll-damping="active"` at desktop width.
- 2026-06-19 Scroll damping: desktop wheel sampling showed scroll continuing from 182px to 699px after one wheel input, confirming damped movement.
- 2026-06-19 Scroll damping: 390px mobile viewport had no `data-scroll-damping` flag and remained scrollable with native page scrolling.
- 2026-06-19 Scroll damping: `/join/apply?audience=join-youth` rendered the application form with damping active on desktop, accepted input in `#join-name`, and showed no console errors.
- 2026-06-19 Google Form connection: local handler smoke test initially failed in sandbox DNS, then succeeded with network access against the real Google Form.
- 2026-06-19 Google Form connection: a with-interest smoke test caught a Google checkbox mapping bug; after fixing array field submission, the handler returned `{ ok: true }` for a test payload with two interests.
- 2026-06-19 Google Form connection: Google Forms editor showed `Responses 2`, confirming successful test submissions reached the real form.
- 2026-06-19 Google Form connection: `node --check api/join.js`, `npx tsc --noEmit`, `npm test`, `npm run lint`, and `npm run build` all passed. Lint still reports the existing 8 Fast Refresh warnings; build still reports existing Browserslist/chunk-size warnings.
- 2026-06-19 dedicated Join apply page: `npx tsc --noEmit` passed.
- 2026-06-19 dedicated Join apply page: `npm test` passed: 4 tests across 3 files. React Router future-flag warnings remain non-blocking.
- 2026-06-19 dedicated Join apply page: `npm run lint` passed with 0 errors and the existing 8 Fast Refresh warnings.
- 2026-06-19 dedicated Join apply page: `npm run build` passed. Vite reported existing Browserslist age and chunk-size warnings.
- 2026-06-19 dedicated Join apply page: browser checks passed for `/join` and `/join/apply?audience=join-parents` on desktop; `/join` had no form input and `/join/apply` had the selected parent identity and form fields.
- 2026-06-19 dedicated Join apply page: browser checks passed at 390px mobile for `/join` and `/join/apply`, with no error overlay, no console errors, and no horizontal overflow after CTA wrapping fix.
- 2026-06-19 Join form integration: `npx tsc --noEmit` passed.
- 2026-06-19 Join form integration: `npm test` passed: 3 tests across 2 files. React Router future-flag warnings remain non-blocking.
- 2026-06-19 Join form integration: `npm run lint` passed with 0 errors and the existing 8 Fast Refresh warnings.
- 2026-06-19 Join form integration: `npm run build` passed. Vite reported existing Browserslist age and chunk-size warnings.
- 2026-06-19 Join form integration: `node --check api/join.js` passed.
- 2026-06-19 Join form integration: local handler smoke test returned 400 for invalid data and 500 with `MISSING_GOOGLE_FORM_CONFIG` for valid data when env vars are absent.
- 2026-06-19 Join form integration: dev server started at `http://127.0.0.1:5175/`; browser DOM/viewport checks passed for `/join` on desktop and 390px mobile with no console errors and no horizontal overflow.
- 2026-06-19 splash opening upgrade: `tsc --noEmit` passed using bundled Node.
- 2026-06-19 splash opening upgrade: Vitest passed via `node node_modules/vitest/vitest.mjs run`: 3 tests across 2 files.
- 2026-06-19 splash opening upgrade: lint passed via `node node_modules/eslint/bin/eslint.js .` with 0 errors and the existing 8 Fast Refresh warnings.
- 2026-06-19 splash opening upgrade: `vite build` passed via bundled Node. Vite reported existing Browserslist age and chunk-size warnings.
- 2026-06-19 splash opening upgrade: local Vite ran at `http://127.0.0.1:5173/`; browser verification passed on desktop and 390px mobile.
- 2026-06-19 home hero fine-line flow: `tsc --noEmit` passed.
- 2026-06-19 home hero fine-line flow: `npm run lint` passed with 0 errors and 8 existing Fast Refresh warnings.
- 2026-06-19 home hero fine-line flow: `npm test` passed: 3 tests across 2 files.
- 2026-06-19 home hero fine-line flow: `npm run build` passed. Vite reported existing Browserslist age and chunk-size warnings.
- 2026-06-19 home hero fine-line flow: local Vite ran at `http://127.0.0.1:5175/`; browser verification passed on desktop and 390px mobile with old rejected background element count 0 and no console errors.
- 2026-06-19 Actions redesign: `npx tsc --noEmit` passed.
- 2026-06-19 Actions redesign: `npm run build` passed. Vite reported existing Browserslist age and chunk-size warnings.
- 2026-06-19 Actions redesign: `npm run lint` passed with 0 errors and 8 existing Fast Refresh warnings.
- 2026-06-19 Actions redesign: `npm test` passed: 3 tests across 2 files.
- 2026-06-19 Actions redesign: local Vite ran at `http://127.0.0.1:5175/`; CDP verification for `/actions` passed at 1440px desktop and 390px mobile with `scrollWidth === viewportWidth` and no overflow offenders. Chinese mobile screenshot also passed.
- 2026-06-19 Strands integration: `tsc --noEmit` passed.
- 2026-06-19 Strands integration: `npm run build` passed. Vite reported existing Browserslist age and chunk-size warnings.
- 2026-06-19 Strands integration: `npm test` passed: 3 tests across 2 files.
- 2026-06-19 Strands integration: `npm run lint` passed with 0 errors and 8 existing Fast Refresh warnings.
- 2026-06-19 Strands integration: dev server started at `http://127.0.0.1:5173/`; browser DOM/console verification passed for the homepage and seed-community canvas.
- 2026-06-19 cursor integration: `tsc --noEmit` passed.
- 2026-06-19 cursor integration: `npm run lint` passed with 0 errors and 8 existing Fast Refresh warnings.
- 2026-06-19 cursor integration: `npm run build` passed. Vite reported existing Browserslist age and chunk-size warnings.
- 2026-06-19 cursor integration: `npm test` passed: 3 tests across 2 files.
- 2026-06-19 cursor integration: dev server started at `http://127.0.0.1:5173/`; in-app browser DOM/interaction verification passed for desktop TargetCursor and homepage BlobCursor placement.
- Current implementation, 2026-06-18: `npx tsc --noEmit` passed.
- Current implementation, 2026-06-18: `npm test` passed: 3 tests across 2 files.
- Current implementation, 2026-06-18: `npm run lint` passed with 0 errors and 8 existing Fast Refresh warnings.
- Current implementation, 2026-06-18: `npm run build` passed. Vite reported non-blocking Browserslist and chunk-size warnings.
- Current implementation, 2026-06-18: `curl -I http://localhost:5173/` returned 200 OK.
- Current implementation, 2026-06-18: desktop screenshot review passed at `/private/tmp/rgan-home-before-tall.png`.
- 2026-06-19 homepage correction: `npx tsc --noEmit`, `npm test`, `npm run lint`, and `npm run build` passed.
- 2026-06-19 homepage correction: dev server started at `http://localhost:5173/`; desktop screenshot review passed at `/private/tmp/rgan-home-before-tall.png`.
- 2026-06-19 homepage correction: homepage search confirmed no `Top 3.6`, `CTB`, `YSA`, `Claremont`, or `Campus CSA` proof text remains in `src/pages/Index.tsx` or `src/components/home`.
- `npx tsc --noEmit` passed.
- `npm run build` passed. Vite reported non-blocking Browserslist and chunk-size warnings.
- `npm test` passed: 3 tests across 2 files.
- Local dev server started at `http://127.0.0.1:5175/`.
- `curl -I http://127.0.0.1:5175/` returned 200 OK.
- Local dev server for this visual refresh is running at `http://localhost:5173/`.
- Desktop screenshot check passed for the revised hero and editorial photo section.
- Chrome DevTools mobile viewport check passed with `innerWidth`, `clientWidth`, `scrollWidth`, and `bodyScrollWidth` all equal to 390.

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| `agent-browser` command unavailable | Tried to use the Vercel agent-browser verification flow | Fell back to `curl`, build/test/lint, and headless Chrome screenshot |
| Mobile screenshot capture crashed with local Chrome/Playwright SIGABRT | Tried Chrome CLI mobile window and Playwright with system Chrome | Not fully resolved in this run; desktop visual was verified and code was adjusted for narrow contact-row wrapping |
| `agent-browser` command unavailable for Strands verification | Tried to use the Vercel agent-browser verification flow | Used the in-app browser API, localhost curl, and build/test/lint checks instead |
| Chrome headless screenshots of `#seed-community` returned an empty SPA shell | Tried Chrome CLI and a CDP script after the in-app screenshot became inconsistent | Relied on in-app browser DOM/console verification and a successful earlier viewport screenshot of the section |
| In-app browser viewport setter unavailable for cursor verification | Tried `tab.playwright.setViewportSize` | Verified at the available desktop viewport and relied on the shared reduced-motion/mobile gating hook plus build/type checks |
| Chrome CLI narrow screenshot appeared horizontally clipped | Captured `/actions` with `--window-size=390,2600` | Used CDP device metrics and screenshot instead; CDP reported `scrollWidth === viewportWidth` and the Chinese mobile screenshot rendered correctly |
| In-app browser screenshot timed out for Join form verification | Tried full-page and viewport screenshots after DOM checks passed | Treated as a tool limitation; DOM, console, and viewport metrics passed on desktop and mobile |
