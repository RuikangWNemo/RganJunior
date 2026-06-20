# Task Plan

## Goal
Optimize the R'gan Junior / 阿柑少年 website so it reaches a top-tier education, youth growth, outdoor learning, and visual storytelling standard. The research should diagnose the current site, benchmark leading references, clarify brand positioning, propose homepage information architecture, define visual and interaction direction, strengthen SEO/conversion/parent trust, and produce a practical code implementation plan.

## Current Request
Optimize the Join page identity section with compressed mascot imagery, a hanging-card interaction inspired by React Bits Lanyard, and smooth magical gas transitions between youth, parent, and partner identities.

## Current Phase
Join identity implementation and verification

## 2026-06-20 Join Identity Hanging Card
### Phase 1: Discovery And Design
- [x] Read active brainstorming and planning instructions
- [x] Inspect current Join page, tests, CSS, content model, package setup, Vite config, and provided React Bits Lanyard instructions
- [x] Inspect provided youth/parent/partner background and card images
- [x] Present implementation approaches and get user approval for the full React Bits Lanyard option
- [x] Write approved design note
- **Status:** in_progress

### Phase 2: Implementation
- [x] Add compressed responsive Join identity image assets
- [x] Rebuild the Join identity section with a suspended card, identity selector, background art, and magical transition effect
- [x] Move the identity imagery out of the selector and into the full-width illustration stage
- [x] Move the hanging card to a fixed page-level layer, restyle the Lanyard elements for the 阿柑 mascot cards, and restore the identity selector to a three-parallel layout
- [x] Preserve `/join/apply?audience=...` links and bilingual content
- [x] Update tests for the new visual surface
- **Status:** complete

### Phase 3: Verification
- [x] Run type/test/lint/build checks
- [x] Start local dev server and browser-check desktop/mobile animation, fixed positioning, identity switching, no Vite overlay, and no overflow
- **Status:** complete

## 2026-06-19 Scroll Damping
### Phase 1: Design
- [x] Inspect current scroll behavior and app shell
- [x] Present damping approaches and get approval for desktop-only lightweight damping
- [x] Write approved design note
- **Status:** complete

### Phase 2: Implementation
- [x] Add global scroll damping provider
- [x] Mount it in the app shell
- [x] Preserve mobile, reduced-motion, form, and nested-scroll behavior
- **Status:** complete

### Phase 3: Verification
- [x] Run type/test/lint/build checks
- [x] Start local dev server and browser-check desktop/mobile/form behavior
- **Status:** complete

## 2026-06-19 Google Form Creation And Connection
### Phase 1: Setup
- [x] Confirm user approval to create a Google Form in the currently logged-in Chrome Google account
- [x] Review current `/api/join` Google Form mapping and frontend fields
- [x] Create or identify the target Google Form
- **Status:** complete

### Phase 2: Mapping
- [x] Extract the form action URL and `entry.*` field IDs
- [x] Store non-secret local configuration for testing without committing private values
- [x] Update templates/docs if field names differ from the actual form
- **Status:** complete

### Phase 3: Verification
- [x] Run a local API submission smoke test against the Google Form
- [ ] Verify the website form reports success when configured locally
- [x] Run TypeScript/tests/build as needed
- **Status:** in_progress

## 2026-06-19 Dedicated Join Apply Page
### Phase 1: Discovery And Design
- [x] Read active brainstorming and planning instructions
- [x] Inspect current Join page, route setup, tests, and existing form/API implementation
- [x] Present `/join` -> `/join/apply?audience=...` design and get user approval
- [x] Write approved design note
- **Status:** complete

### Phase 2: Implementation
- [x] Extract the form from `/join` into a reusable component
- [x] Add `/join/apply` page and route
- [x] Convert `/join` into identity selection plus apply buttons
- [x] Update route metadata and tests
- **Status:** complete

### Phase 3: Verification
- [x] Run TypeScript, tests, lint, and production build
- [x] Browser-check `/join` and `/join/apply`
- **Status:** complete

## 2026-06-19 Join Form To Google Form
### Phase 1: Discovery And Design
- [x] Read active brainstorming, planning, Vercel Functions, and Vercel env-var instructions
- [x] Inspect existing Join page, content model, tests, Vercel config, and package setup
- [x] Confirm user approval for Vercel -> Google Form flow
- [x] Write approved design note
- **Status:** complete

### Phase 2: Implementation
- [x] Add a Vercel API route that validates submissions and posts to Google Form
- [x] Add a bilingual application form to the Join page
- [x] Add environment-variable template documentation
- [x] Update tests for the new form surface
- **Status:** complete

### Phase 3: Verification
- [x] Run TypeScript, lint, tests, and production build
- [x] Start local dev server and visually verify the Join page
- **Status:** complete

## 2026-06-19 Splash Opening Upgrade
### Phase 1: Discovery And Design
- [x] Read active brainstorming and planning instructions
- [x] Recover current planning context and recent relevant homepage/splash work
- [x] Inspect splash component, mascot animation, app mount flow, and visual tokens
- [x] Capture current splash in browser and identify visual defects
- [x] Present 2-3 redesign approaches with a recommendation
- [x] Get user approval before code edits
- [x] Write approved design note
- **Status:** complete

### Phase 2: Implementation
- [x] Upgrade splash background and visual hierarchy
- [x] Fix citrus smiling animation so it feels natural and premium
- [x] Add post-awakening text lines
- [x] Preserve reduced-motion and fast-loading behavior
- **Status:** complete

### Phase 3: Verification
- [x] Run type/build/test checks
- [x] Start local dev server and visually verify desktop/mobile splash
- **Status:** complete

## 2026-06-19 Home Hero Fine-Line Flow Background
### Phase 1: Discovery And Design
- [x] Inspect homepage hero structure, mascot motion, cursor effects, and existing hero CSS
- [x] Present three visual directions and get user approval for an initial flowing background
- [x] User rejected the first large-gradient execution as ugly
- [x] Search web references and confirm direction B: fine-line flow
- **Status:** complete

### Phase 2: Implementation
- [x] Remove the rejected large gradient/wave background treatment
- [x] Rebuild the hero background as SVG fine-line paths with subtle moving highlights
- [x] Add pointer and scroll variable updates without new dependencies
- [x] Preserve mobile/reduced-motion safeguards
- **Status:** complete

### Phase 3: Verification
- [x] Run type/build checks
- [x] Start local dev server and browser-check homepage hero on desktop/mobile
- **Status:** complete

## 2026-06-19 Actions Three-Track Theatre
### Phase 1: Discovery And Design
- [x] Inspect the current Actions page and shared action-layer content
- [x] Identify the current weakness: vertical alternating display weakens parallel structure
- [x] Present high-end three-track action theatre concept
- [x] Get user approval for the concept
- **Status:** complete

### Phase 2: Implementation
- [x] Rebuild `/actions` around a parallel track system
- [x] Convert impact proof into a restrained evidence ledger
- [x] Preserve bilingual content and existing shared data model
- **Status:** complete

### Phase 3: Verification
- [x] Run type/build checks
- [x] Start local dev server and visually inspect desktop/mobile layout
- **Status:** complete

## 2026-06-19 Cursor Motion And Targeting
### Phase 1: Discovery
- [x] Read the React Bits `BlobCursor` instructions and component source
- [x] Read the React Bits `TargetCursor` instructions and component source
- [x] Inspect current app layout, navigation, homepage CTAs, action links, seed-community links, and Join tabs/contact links
- [x] Confirm `gsap` is not yet installed
- **Status:** complete

### Phase 2: Design Approval
- [x] Present restrained placement approaches and get user approval before code edits
- **Status:** complete

### Phase 3: Implementation
- [x] Add `gsap`
- [x] Add local cursor components and CSS
- [x] Mount cursor effects only on desktop/reduced-motion-safe surfaces
- [x] Mark appropriate interactive elements with target classes
- **Status:** complete

### Phase 4: Verification
- [x] Run TypeScript, build, tests, and lint
- [x] Start dev server and browser-check cursor behavior
- **Status:** complete

## 2026-06-19 Relationship And Connection Strands
### Phase 1: Discovery
- [x] Read the React Bits `Strands` integration instructions from the provided attachment
- [x] Inspect the homepage structure and identify `SeedCommunity` as the relationship/connection area
- [x] Check current dependencies and confirm `ogl` is not yet installed
- **Status:** complete

### Phase 2: Design Approval
- [x] Present restrained visual approaches and get user approval before code edits
- **Status:** complete

### Phase 3: Implementation
- [x] Add `ogl`
- [x] Add a local `Strands` component and CSS
- [x] Integrate it into `SeedCommunity` as a quiet background effect
- **Status:** complete

### Phase 4: Verification
- [x] Run TypeScript/build checks
- [x] Start or reuse the dev server and visually inspect the homepage
- **Status:** complete

## 2026-06-19 Homepage Tone Correction
### Phase 1: Restore Mascot Hero
- [x] Bring back the previous `HeroMascotStage + HeroCopy` first viewport
- [x] Return the navbar to the light hero color treatment
- **Status:** complete

### Phase 2: Remove Proof Rail And Reduce Promotional Tone
- [x] Remove Top 3.6 / CTB / YSA / Claremont / Campus CSA proof rail from homepage
- [x] Rework hero, field-photo, action-logic, beliefs, and seed-community copy into quieter real-place language
- **Status:** complete

### Phase 3: Verification
- [x] Run TypeScript, tests, lint, and production build
- [x] Start dev server and review desktop screenshot
- [x] Confirm the unwanted proof terms no longer appear in homepage files
- **Status:** complete

## 2026-06-18 Implementation Sprint
### Phase 1: Content System And SEO
- [x] Add shared content source for beliefs, impact proof, three-layer action logic, join audiences, and partner voices
- [x] Update brand positioning, route descriptions, canonical URLs, social metadata, and structured data
- [x] Add real sitemap and robots sitemap reference
- **Status:** complete

### Phase 2: Core Page Rebuild
- [x] Rebuild homepage as concise attraction page with real field imagery, proof, belief, action logic, and seed community modules
- [x] Rework Actions around the mountain-field-urban/rural progression
- [x] Rework Join around partner voices, identity-based tabs, and contact/trust clarity
- **Status:** complete

### Phase 3: Verification
- [x] Run TypeScript, tests, lint, and production build
- [x] Review desktop screenshot
- [ ] Complete mobile screenshot verification once local browser capture is stable
- **Status:** mostly complete; mobile screenshot tooling failed locally, but narrow-screen wrapping risk was manually reduced

## 2026-06-18 Meeting-Calibrated Planning
### Phase 1: Inputs
- [x] Read the meeting summary from Wang Ruikang and Guoping Nono
- [x] Re-read existing research and planning files
- [x] Identify where the previous research should be calibrated
- **Status:** complete

### Phase 2: Planning Document
- [x] Create a concise internal execution plan
- [x] Center the plan on simplified homepage, three-layer action logic, and differentiated inner pages
- [x] Include materials/account/domain-email collection plan
- [x] Include code implementation phases and verification checklist
- **Status:** complete

## Phases
### Phase 1: Discovery
- [x] Read the requested homepage changes
- [x] Inspect the current homepage and hero copy
- [x] Identify the sections to remove
- [x] Review current Action page content for project summaries
- **Status:** complete

### Phase 2: Design
- [x] Draft a streamlined homepage structure
- [x] Get user approval before code edits
- **Status:** complete

### Phase 3: Implementation
- [x] Add a functional elevator pitch below the philosophical hero copy
- [x] Replace the removed "How We Learn & Act" and complex "How You Can Join" blocks
- [x] Add a compact interdisciplinary whole-growth section
- [x] Add a prominent Current Projects section linked to Action
- [x] Keep bilingual Chinese and English content aligned
- **Status:** complete

### Phase 4: Verification
- [x] Run focused tests or typecheck
- [x] Run production build if scope warrants
- [x] Start or confirm local dev server if needed
- **Status:** complete

### Phase 5: Premium Visual Refresh
- [x] Inspect current homepage screenshot and photo assets
- [x] Present visual direction and get approval
- [x] Rework `HomePhotoScroll` into a minimal editorial photo section
- [x] Tune hero spacing, hierarchy, and transition into the photo section
- [x] Run build and screenshot checks across desktop/mobile
- **Status:** complete

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Keep the homepage focused on attraction and orientation | The user said the page is currently cluttered and should make visitors want to learn more |
| Use the existing Action page as the source for Current Projects | It already contains the three current action layers and supporting imagery |
| Remove long phase history from the homepage | The user explicitly requested deleting the "我们如何行动" section |
| Remove the complex youth/parent join copy from the homepage | The user explicitly requested deleting that copy and the Join page can hold detailed conversion content |
| Replace the dark horizontal photo strip with an editorial photo composition | The user called the homepage photos especially ugly and approved a premium/minimal redesign |

## Risks
- The requested English name says "R'gan Youth" while the current brand system says "R'gan Junior"; implementation should either use the requested wording in the elevator pitch or keep the existing site brand elsewhere.
- "Current Projects" needs concise labels that feel concrete without duplicating the full Action page.
- Visual polish depends on selecting strong, authentic photos and avoiding decorative clutter.

## 2026-06-18 Research Sprint
### Phase 1: Context Recovery
- [x] Read existing planning files
- [x] Inspect project code and brand/content structure
- [x] Inspect current live site
- **Status:** complete

### Phase 2: Benchmark Research
- [x] Education / youth growth / outdoor learning benchmarks
- [x] Visual storytelling / editorial interaction benchmarks
- [x] Extract reusable patterns, not surface-level mimicry
- **Status:** complete

### Phase 3: Diagnosis And Strategy
- [x] Diagnose rganjunior.org positioning, IA, content, visuals, trust, SEO, conversion
- [x] Recommend 阿柑少年 main brand positioning
- [x] Draft homepage IA and visual/motion system
- **Status:** complete

### Phase 4: Implementation Plan
- [x] Translate strategy into code phases
- [x] Identify likely files/components to edit
- [x] Define verification checklist
- **Status:** complete
