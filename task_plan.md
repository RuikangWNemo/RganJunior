# Task Plan

## Goal
Optimize the R'gan Junior / 阿柑少年 website so it reaches a top-tier education, youth growth, outdoor learning, and visual storytelling standard. The research should diagnose the current site, benchmark leading references, clarify brand positioning, propose homepage information architecture, define visual and interaction direction, strengthen SEO/conversion/parent trust, and produce a practical code implementation plan.

## Current Request
Implement the approved Community manual Guardian-review mode and configure managed Redis so every age band can register, under-14 membership remains blocked until staff-recorded Guardian confirmation, and collaborative editing works in Preview and Production.

## Current Phase
Database and server implementation in progress; write regression coverage, create the Supabase migration through the CLI, and implement the manual Guardian API boundary.

## 2026-08-09 Manual Guardian + Redis Rollout

- [x] Phase 1 — Confirm product, safety, legal, and infrastructure design.
- [x] Phase 2 — Write the exact implementation and verification plan.
- [ ] Phase 3 — Add the database workflow and server APIs for manual Guardian contact/confirmation. **Remote validation pending**
- [x] Phase 4 — Update applicant, status, and staff-review UI for the approved age behavior.
- [ ] Phase 5 — Provision isolated Redis, generate stable Guardian secrets, configure Vercel, and deploy Preview/Production. **Configuration complete; deploy pending**
- [ ] Phase 6 — Run database/app/browser verification, push GitHub, and document the release.

### Errors

- A combined planning-file patch expected stale Current Request text and the heading `# Findings & Decisions`, but the repository uses different text and `# Findings`; no files changed, so the update was split into exact per-file patches.
- A second combined patch still matched stale Current Request wording; verification failed before any write, and the next exact-context patch succeeded.
- API/service inspection referenced nonexistent `src/services/community-applications/index.ts`; use the actual membership service located from `rg --files src/services`.
- The first hosted legal-document probe tried the uninstalled `dotenv/config` preload; retry with Node's built-in `--env-file=.env.local` so no dependency or secret output is needed.
- The built-in env-file retry used the shell's default Node 20, which current `supabase-js` rejects because native WebSocket is unavailable; use the already-installed `/opt/homebrew/bin/node` 23 runtime.
- The first network-enabled legal-document query used nonexistent column `content_hash`; the migration defines `content_sha256`, so retry with the authoritative schema name.
- The first Upstash creation CLI timed out after its five-minute terms-acceptance window before the user confirmation arrived; verify the installation state and retry the same idempotent resource creation parameters.
- A second Free Upstash resource for Production was rejected because the installation exposes only paid plans after its first Free database. Do not select a paid plan; use the approved shared-resource/separate-namespace fallback after verifying the collaboration Redis prefix.
- The first combined implementation-plan patch matched the phase text in the wrong order and wrote nothing; split creation of the plan document from exact planning-status updates.
- The first generated workflow-override patch expected one exact onboarding guard string but found none after extraction; no migration content changed, so inspect literal whitespace and retry with bounded structural replacements.
- The structural retry validated eight overrides but found the profile-update guard uses a split-line condition; no workflow override was written, so add the alternate bounded pattern and rerun once.
- Linked `supabase db push --dry-run` could not authenticate because the CLI access token is no longer present. Continue local implementation/tests and restart device authorization before hosted rollback validation or migration apply.
- The first Redis runtime/test patch used a stale test title and wrote nothing; split runtime edits from insertion into the actual `collaboration server configuration` block.
- `npx ui-skills categories` and the narrow `forms` listing again returned no usable context. Follow the approved Community design system and existing accessible form/surface primitives.
- The first multi-page UI patch expected a nonexistent CommunityAuth import and wrote nothing; split the shared flag/basic routing edits from exact CommunityAuth and status copy patches.
- The first sandboxed move of Upstash-generated `.agents` content was denied, while `skills-lock.json` was already moved to the temporary backup. A narrowly authorized retry moved `.agents`; both artifacts remain recoverable under `/private/tmp/rgan-upstash-skills-auto-20260809`.
- Vercel `integration resource connect` did not accept the Marketplace `store_…` ID and made no change; list the resource's CLI identifier and retry by resource name.
- The first post-write env validation attempted to read Vercel Sensitive values, which correctly pull as non-recoverable placeholders. Validate the non-sensitive Redis source and local secret backup instead; keep secret values unreadable after creation.

## 2026-08-08 Collaborative Editor Configuration

### Phase 1: Credential And Environment Audit
- [x] Verify current Supabase/Vercel guidance and inspect existing local/hosted variable names without exposing values
- [ ] Obtain the Supabase secret through an authorized surface and store it only in ignored/server-side configuration
- [x] Obtain the Supabase secret through an authorized surface and store it only in ignored/server-side configuration
- [x] Determine whether a managed Redis integration already exists (none exists; Upstash creation awaits explicit third-party terms approval)
- **Status:** in progress

### Phase 2: Local And Hosted Configuration
- [x] Configure `.env.local` without overwriting unrelated local values
- [x] Configure required Vercel Development, Preview, and Production variables (Development via `.env.local`; Preview/Production via Vercel sensitive variables)
- [ ] Configure Redis if an existing no-cost/in-scope resource is available; request confirmation before any paid provisioning
- **Status:** pending

### Phase 3: End-To-End Verification
- [x] Restart local services and verify JSON API, WebSocket, editor load, autosave, presence, and revisions (new draft/comments still require an intentional content mutation)
- [ ] Verify hosted environment/deployment when credentials and infrastructure are available
- [ ] Run focused tests, typecheck, lint, build, and credential-leak checks
- **Status:** pending

## 2026-08-08 Community Collaborative Editor

### Phase 1: Discovery And Approved Design
- [x] Inspect the existing article editor, field-note service, database content model, revision model, public renderer, and media path
- [x] Compare BlockNote, Tiptap, and Lexical using official technical sources
- [x] Confirm BlockNote Core + Yjs + self-hosted Hocuspocus
- [x] Confirm first-version real-time collaboration and the invited-member plus active-member-link permission model
- [x] Confirm editor UX, permissions/storage, recovery/mobile, and acceptance criteria section by section
- [x] Write and commit `docs/plans/2026-08-08-community-collaborative-editor-design.md`
- **Status:** complete

### Phase 2: Detailed Implementation Plan
- [x] Inspect exact frontend, API, database, test, and deployment integration points
- [x] Verify current Supabase and Vercel guidance relevant to Auth, RLS, WebSockets, and persistence
- [x] Create the detailed implementation plan
- **Status:** complete

### Phase 3: Data And Collaboration Foundation
- [x] Add schema, RLS, RPCs, generated types, and database tests
- [x] Add Hocuspocus authentication, persistence, materialization, presence, and local/production configuration
- [x] Add permission and share-link services
- **Status:** complete

### Phase 4: Editor And Collaboration UI
- [x] Replace the textarea editor with BlockNote and the approved document workspace
- [x] Add autosave, offline status, collaboration cursors, comments, sharing, and version history
- [x] Complete bilingual and responsive behavior
- **Status:** complete

### Phase 5: Publishing And Compatibility
- [x] Materialize safe JSON, plain-text, and HTML snapshots
- [x] Render published community notes without loading editor code
- [x] Add legacy plain-text conversion and recovery fallback
- **Status:** complete

### Phase 6: Verification
- [x] Run focused and full frontend/database tests, type checks, lint, build, and advisors
- [x] Verify permissions, reconnect/read-only boundaries, review locking, public rendering, and responsive layout with automated browser/service/database coverage
- [x] Record the remaining managed Redis and Vercel environment deployment gate
- **Status:** complete (manual two-account production smoke follows deployment)

### Errors Encountered

| Error | Attempt | Resolution |
| --- | --- | --- |
| Git could not create `.git/index.lock` inside the workspace sandbox | 1 | Re-ran the narrowly scoped add/commit with approved elevated Git access; design commit `a8f4732` succeeded |
| Combined planning-file patch did not match the exact `findings.md` header context | 1 | Split the update into smaller file-specific patches with exact context |
| API inspection referenced nonexistent `api/community/member-search.js` | 1 | Use `rg --files api` output and inspect the actual TypeScript endpoint/helper files |
| Web browser safety layer rejected direct open of `https://supabase.com/changelog.md` | 1 | Fetched the same official Markdown file read-only with bounded `curl` and reviewed relevant breaking changes |
| Implementation-plan pre-commit check found trailing whitespace on the date line | 1 | Removed the two trailing spaces before staging; no file had been staged yet |
| `npm view` registry calls hung or returned empty output inside the default sandbox | 1 | Interrupted the hanging process and reused an approved, read-only `npm view` network scope for version checks |
| Dependency install through configured `registry.npmmirror.com` produced no output for two minutes | 1 | Npm debug log showed extremely slow metadata fetches (up to 156s); interrupted before manifest writes and switched the next attempt to official `registry.npmjs.org` |
| Dependency install through official `registry.npmjs.org` timed out on the first BlockNote manifest after four retries | 1 | Stop registry retries for now, continue the independent database slice, and revisit installation through cache/mirror after useful progress |
| Local Supabase validation could not use Docker Desktop because the app is not installed | 1 | Discovered installed Colima as the alternative container runtime |
| First Colima startup remained on base disk-image download with no progress for two minutes | 1 | Interrupted the non-destructive initialization and switched to the available authenticated Supabase connector for read-only inspection and later controlled validation |
| Combined command output appeared to duplicate a pgTAP named argument, and the removal patch did not match | 1 | Read exact numbered lines; the file contains one argument and needs no change—the apparent duplicate was output concatenation |
| First rollback database test violated the final Membership suspension constraint | 1 | Added the later-migration `suspension_source = 'administrator'` fixture field; the transaction rolled back fully |
| Second rollback test passed an `integer` literal to the `smallint` Yjs schema-version RPC | 1 | Added explicit `::smallint` casts to direct SQL test calls; application RPC types will remain generated from the database signature |
| Third rollback test found trigger/RLS helpers had been revoked from their invoking roles | 1 | Reviewed every private-helper call site and granted only the required `authenticated/service_role` EXECUTE privileges; private schema remains outside the Data API |
| Hosted rollback execution of legacy test 001 hit its one-time `SUPER_ADMIN_ALREADY_BOOTSTRAPPED` fixture | 1 | Keep the valid empty-database bootstrap test unchanged; use the independent Membership/Field Notes workflow test for hosted compatibility |
| New database test initially reused existing numeric prefix `007` | 1 | Renamed it to the next free prefix `010_community_collaborative_editor.sql` before handoff |
| First document-model Vitest could not resolve BlockNote peer `y-prosemirror` | 1 | Query and install the required `1.3.7` peer explicitly; `y-protocols 1.0.7` is already deduped across BlockNote/Hocuspocus |
| App typecheck found a Block-to-PartialBlock generic mismatch in the new snapshot serializer | 1 | Broaden the JSON normalization input to `readonly unknown[]` while retaining a strongly typed `FieldNoteBlocks` output; unrelated HomePhotoScroll/Lanyard/Strands errors remain separate |
| Explicit Vitest command still skipped the new TypeScript API test | 1 | Expanded the existing API include rule from `*.test.js` to TypeScript/JavaScript test and spec files, then rerun the service suite |
| Updated rollback test called `pg_temp.assert_true` without its label argument | 1 | Added the descriptive second argument; the failed transaction rolled back fully |
| `npx ui-skills categories` returned no usable category output | 1 | Use the approved community design system and BlockNote interaction conventions as the smallest available UI context |
| First official BlockNote demo `curl` used an unquoted URL containing `?` | 1 | Re-ran the bounded read-only request with a quoted URL and captured the official thread/mark implementation |
| First hosted migration rollback was rejected for unbounded DDL lock/statement risk | 1 | Added a 5-second lock timeout and 120-second statement timeout; both rollback suites then passed without persistent changes |
| Local `npm run supabase:types` lacked a CLI access token and shell redirection emptied the generated file | 1 | Regenerated the authoritative 69,694-character file through the connected Supabase tool and restored it atomically with `apply_patch` |
| Browser verification found the public article query attempted a privacy-blocked raw People join | 1 | Removed the raw People join, retained safe community-author fallback metadata, and reverified with no data-access warning |
| Full tests initially waited on live Supabase article queries in JSDOM | 1 | Kept production live-note merging enabled while making tests use the deterministic local article repository |
| Vercel connector could not list deployments because the available token lacks the project team scope | 1 | Use the linked CLI or authenticated dashboard/browser surface instead; do not repeat the connector call |
| In-app browser Supabase dashboard navigation timed out at the sign-in redirect | 1 | Inspected the resulting page, confirmed it is unauthenticated, and switched to checking another available browser session instead of retrying |
| Sandboxed Supabase CLI device authorization could not resolve `api.supabase.com` | 1 | Canceled the retry prompt and restarted only the official CLI login command with narrowly scoped network access |
| Local secret configurator rejected `community_editor` despite the CLI reporting a 41-character value | 1 | Metadata-only inspection found the value contains U+00B7 mask characters; use the complete legacy `service_role` key returned by the same authorized API instead |
| Vercel Environment Variables Add button did not hydrate an editable form in the controlled dashboard | 1 | Use the linked official CLI, which supports sensitive values from stdin and avoids browser clipboard exposure |
| Cached Vercel CLI token is invalid and the team scope cannot be accessed | 1 | Start a fresh official Vercel login flow from the authenticated local user context before changing hosted variables |
| New Chrome tab timed out before loading the Vercel GitHub CLI authorization URL | 1 | Reuse the already authenticated Vercel project tab for the same official authorization URL, then inspect the resulting page before any click |
| Old Vercel CLI rejected the out-of-band verification token after the browser completed GitHub login | 1 | Stop the deprecated CLI path; the reconnected dashboard Add dialog is working and supports bulk `.env` import directly |
| Node 20 could not start Supabase Realtime because native WebSocket is unavailable | 1 | Start Vite directly with installed Homebrew Node 23.7.0; ports 5173 and 1234 then listen successfully |
| Sandboxed `curl` could not reach the elevated local development server | 1 | Re-run only the localhost curl check with approved local network access; the correct endpoint returns JSON |
| First API check used `/field-note-editor/110`, which is not the endpoint shape | 1 | Use the actual query form `/field-note-editor?noteId=110`; it returns `401 application/json` rather than HTML/source |

## 2026-08-07 Super Admin And Application Recovery
### Phase 1: Diagnose Online State And Code Paths
- [x] Inspect the target account, active roles, application rows, membership, safety state, and application events online
- [x] Trace the submit/review RPC state transitions and frontend destination logic
- [x] Reproduce the exact `APPLICATION_STATE_CONFLICT` condition without mutating an application
- **Status:** complete

### Phase 2: Repair Authorization And Workflow
- [x] Promote the target account from Admin to Super Admin with an audit record
- [x] Confirm the affected application needs no data repair because approval and Membership creation already committed
- [x] Patch the durable SQL/frontend cause and add regression coverage if the conflict is systemic
- **Status:** complete

### Phase 3: Verify Dashboard Entry
- [x] Verify application approval creates an active Membership and community-member role
- [x] Verify `get_my_community_state` returns the `/community` dashboard destination after approval
- [x] Run focused tests, build/type checks, and Supabase security advisors when schema code changes
- **Status:** complete

## 2026-08-07 Community Onboarding Language Fix
### Phase 1: Diagnosis And Design
- [x] Trace the form, service input, generated RPC type, SQL validation, and profile constraint
- [x] Confirm canonical persisted values are `zh` and `en`
- [x] Compare frontend mapping, service compatibility, and database normalization approaches
- [x] Approve frontend/type alignment without a Supabase schema change
- [x] Write and commit the approved design document
- **Status:** complete

### Phase 2: Implementation
- [x] Change onboarding service input language type to `zh | en`
- [x] Submit the application language directly from CommunityOnboarding
- [x] Add Chinese and English regression tests for the RPC payload
- **Status:** complete

### Phase 3: Verification
- [x] Run focused tests and lint
- [x] Run production build and relevant full test suite
- [x] Verify no hosted Supabase migration or data mutation is required
- **Status:** complete

## 2026-08-07 Community Entry And Auth Redesign
### Phase 1: Discovery And Design
- [x] Inspect the current menu, Logo, mascot entry, community auth page, layout, routes, Vercel rewrite, and environment configuration
- [x] Confirm main-site entry behavior and compare three auth-portal visual directions
- [x] Confirm the modern editorial portal direction, orange headline/deep-green text hierarchy, and age-first registration flow
- [x] Confirm the same-domain transition strategy: `/community` now, configurable subdomain later
- [x] Write and commit the approved design document
- **Status:** complete

### Phase 2: Implementation
- [x] Add a centralized community entry URL helper with same-origin default and future override
- [x] Remove the ordinary community nav item, restore the Logo home link, and add standalone desktop/mobile launchers
- [x] Make the homepage mascot open the same community entry in a new window
- [x] Isolate `/community` routes from the public Navbar, Footer, mascot companion, and target cursor
- [x] Redesign CommunityAuth with an independent brand bar, editorial hierarchy, focused modes, and age-first registration
- [x] Update focused tests and environment documentation
- **Status:** complete

### Phase 3: Verification
- [x] Run focused tests, the full relevant test suite, lint/type checks, and production build
- [x] Browser-check `/`, main navigation, `/community/auth`, registration steps, desktop, and mobile
- [x] Record any unrelated existing failures separately
- **Status:** complete

## 2026-08-07 Community Platform
### Phase 1: Discovery
- [x] Read the supplied long-term “content + identity + community + practice” product proposal
- [x] Read brainstorming, Supabase, Postgres, UI routing, and file-planning instructions
- [x] Inspect current routes, navigation, auth/profile/content services, database migrations, permissions, and recent commits
- [x] Verify current Supabase Auth and Realtime capabilities against official documentation
- **Status:** complete

### Phase 2: Product And Architecture Decisions
- [x] Confirm delivery boundary: complete architecture, implemented continuously in verified phases
- [x] Confirm minor-member consent and communication boundary
- [x] Present 2–3 implementation approaches and recommend unified extension of the existing backend
- [ ] Validate architecture, data model, navigation/UI, security, moderation, error handling, and tests section by section
  - [x] Overall architecture, routes, role semantics, and mascot/navbar entry behavior
  - [x] Identity data, membership application state machine, and review administration
  - [x] Publishing, People, Practice, messaging, moderation, notifications, and activity
  - [x] Error handling, rollout, and test strategy
- **Status:** complete

### Phase 3: Approved Design And Plan
- [x] Write and commit the approved community-platform design document
- [x] Produce a detailed phased implementation plan
- **Status:** complete

### Phase 4: Implementation
- [x] Begin only after design approval
- [x] Implement Phase 1A identity, role, membership, and guardian-consent database foundations
- [x] Implement Phase 1B–1D services, routes, entry interactions, People, Stories, and Admin
- [x] Complete Phase 1E online and browser verification
- [x] Implement and verify Phase 2 Practice
- [x] Implement and verify Phase 3 Messages, Moderation, and Realtime
- **Status:** complete

### Phase 5: Production Configuration Handoff
- [ ] Activate a legally reviewed guardian informed-consent document
- [ ] Configure Vercel `SUPABASE_SECRET_KEY`, guardian encryption/HMAC secrets, and invite/OTP delivery webhooks
- [ ] Enable Supabase Auth leaked-password protection and production SMTP/redirect allowlist
- [ ] Assign the first admin/super-admin and Facilitator roles through the audited workflow
- **Status:** blocked on external credentials, legal review, and named operators; code and database intentionally fail closed until configured

## 2026-07-06 About Story And Join Simplification
### Phase 1: Discovery
- [x] Read UI, brainstorming, baseline-ui, design-taste, and planning-with-files skill instructions
- [x] Attempt UI Skills CLI category inspection; CLI hung again and was interrupted
- [x] Attempt planning session catchup; no unsynced output was returned
- [x] Confirm no `.codegraph/` index exists
- [x] Inspect About story components, Join mobile surface, Join Apply page, application form, related CSS, and tests
- **Status:** complete

### Phase 2: Implementation
- [x] Bind About land-memory story, map/progress state, evidence, and copy into one coherent scroll composition
- [x] Simplify Join mobile by hiding nonessential mobile-only narrative layers and shortening the mobile decision path
- [x] Simplify Join Apply form into a premium minimal visible field set while preserving submission behavior
- **Status:** complete

### Phase 3: Verification
- [x] Run type/test/lint/build
- [x] Run mobile screenshots/probes for `/about`, `/join`, and `/join/apply`
- [x] Note desktop screenshot limitation after Chrome debugging approval was rejected due usage limit
- **Status:** complete

## 2026-07-06 Mobile Design Optimization Planning
### Phase 1: Skill-Guided Discovery
- [x] Read `ui-skills-root`, `brainstorming`, `design-taste-frontend`, and `planning-with-files` instructions
- [x] Attempt UI Skills CLI category inspection; CLI hung with no output and was interrupted
- [x] Confirm no `.codegraph/` index exists
- [x] Review existing mobile plan, recent commits, homepage, Actions, Join, layout, nav, and global CSS
- [x] Capture current 390px mobile screenshots for `/`, `/actions`, and `/join`
- [x] Record current findings in planning files
- **Status:** complete

### Phase 2: Design Direction
- [x] Ask one clarifying question about whether this should preserve the current brand language or push into a stronger visual reset
- [x] Clarified direction: keep visual unity with desktop, but rebuild mobile rhythm and presentation so sections are phone-native rather than stacked desktop modules
- [x] Propose 2-3 mobile optimization approaches with trade-offs
- [x] Recommend one direction and define page-by-page scope
- [x] Get user approval before product-code edits
- **Status:** complete

### Phase 3: Approved Design Note
- [x] Write approved design to `docs/plans/2026-07-06-mobile-design-optimization-design.md`
- [x] Create implementation plan at `docs/plans/2026-07-06-mobile-design-optimization-implementation-plan.md`
- [x] Implement approved mobile editorial reflow
- [x] Verify type/test/lint/build and mobile screenshots
- **Status:** complete

### Phase 4: Implementation Summary
- [x] Reflow homepage hero for mobile with tighter typography, phone-native CTA rhythm, safer mascot framing, and an earlier real-field image anchor
- [x] Replace compressed mobile Actions theatre cards with mobile-only editorial action records while keeping the desktop theatre intact from `md` upward
- [x] Tighten Join mobile hierarchy with wrapped heading/copy safeguards, stacked identity selector cards, and smaller mobile identity surfaces
- [x] Add mobile text and overflow guards for long English copy on `/actions` and `/join`
- [x] Run CDP mobile emulation at 390px for `/`, `/actions`, and `/join`; all pages reported `docWidth === bodyWidth === 390` with no clipped visible text
- **Status:** complete

### Phase 5: Cross-Page Mobile Centering
- [x] User requested the other mobile pages also be centered and optimized because they still look bad
- [x] Read UI, brainstorming, baseline, design-taste, and planning-with-files skill instructions
- [x] Attempt UI Skills CLI category inspection; CLI timed out again with no output
- [x] Attempt planning session catchup; script was killed with exit code 137 again
- [x] Confirm no `.codegraph/` index exists
- [x] Inspect About, Actions, Join, Join Apply, and shared mobile CSS
- [x] Apply centered mobile rhythm to About, Actions, Join, Join Apply, and Voices page heroes, intro copy, CTAs, records, forms, and repeated sections
- [x] Verify type/test/lint/build and 390px mobile screenshots/probes
- **Status:** complete

## 2026-06-20 Homepage Whole-Life Growth Section
### Phase 1: Discovery And Design
- [x] Read active brainstorming and planning instructions
- [x] Recover existing planning context and current worktree status
- [x] Inspect homepage structure, shared content, and global homepage CSS
- [x] Identify the best location and design approach for the supplied copy
- [x] Present 2-3 approaches and get user approval before code edits
- [x] Write approved design note
- **Status:** complete

### Phase 2: Implementation
- [x] Add the approved homepage section/component
- [x] Preserve existing hero, scroll video, action links, language behavior, and responsive layout
- [x] Add/tune CSS for desktop and mobile polish
- **Status:** complete

### Phase 3: Verification
- [x] Run type/test/lint/build checks
- [x] Start local dev server and confirm homepage responds locally
- [ ] Browser-check homepage desktop/mobile if agent-browser or Chrome verification is available
- **Status:** complete with noted limitation

## 2026-06-20 Mobile Visual System Upgrade
### Phase 1: Discovery And Design
- [x] Read active brainstorming and planning instructions
- [x] Recover existing planning context and current worktree status
- [x] Inspect mobile-critical page/component/CSS structure
- [x] Capture current mobile screenshots and identify visual defects
- [x] Propose 2-3 upgrade approaches with recommendation
- [x] Get user approval before code edits
- [x] Write approved design note
- **Status:** complete

### Phase 2: Implementation
- [x] Apply approved mobile visual system changes
- [x] Keep desktop behavior stable and preserve existing content/routes
- [x] Update tests if UI surface changes require it
- **Status:** complete

### Phase 3: Verification
- [x] Run type/test/lint/build checks
- [x] Browser-check mobile viewports for visual polish and obvious overlay/overflow issues
- [ ] Complete CDP DOM overflow probe when local approval/usage limit allows it
- **Status:** complete with noted limitation

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

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| Full app TypeScript check still exits with existing unrelated errors | Ran `npm run typecheck:app` after the final React refinement | Confirmed every error remains in HomePhotoScroll, Lanyard, or Strands; no changed community file appears, while targeted lint/tests and production build pass |
| React-review refinement patch contained an invalid hunk boundary | Tried to patch two TSX files and progress in one malformed patch | Rebuilt the update with valid per-file hunks and recorded the review adjustment |
| Hosted migration version differs from the locally generated empty-file timestamp | `apply_migration` recorded online version `20260807152919`, while `supabase migration new` had created local version `20260807152158` | Rename the local migration to the authoritative hosted version so future migration lists remain aligned |
| Planning update patch contained an invalid hunk boundary | Tried to update the error table and progress in one malformed patch | Rebuilt the patch with valid per-file hunks before continuing |
| Linked remote database test cannot find a project ref | Ran `supabase test db ... --linked`; this workspace has no persisted CLI link metadata | Do not create/use a local Supabase instance; apply the reviewed migration through the authenticated Supabase connector and verify with an equivalent transaction test query online |
| New admin UI regression test cannot find a disabled “正在处理…” button | Ran focused tests before the production UI change | Expected red-phase failure; add per-row pending state, disable actions, then rerun |
| New application-status regression test observes zero community refresh calls | Ran focused tests before the production status-page change | Expected red-phase failure; refresh AuthContext after an approved application is loaded |
| Combined Supabase docs and live-state output omitted the live-state result | Requested verbose docs and the target state in one parallel call | Keep the docs finding, then rerun only the bounded live-state query before deciding on any repair |
| Expanded community/navigation batch reports 4 Navbar failures | Included `Navbar.test.tsx` while checking the surrounding entry flow; its assertions still expect superseded product labels and anchors such as `/programs#life-camp` | Treat as the same unrelated program-navigation test drift, and keep final regression evidence scoped to onboarding, auth, and the RPC boundary |
| Full Vitest suite reports 5 failing files / 11 tests in existing program-page copy assertions | Ran `npm test` after the language fix; examples expect old copy such as “生活共创营” and “两种进入共同生活的方式”, while the current pages render newer content | Keep those unrelated content/test changes out of this scoped fix; verify the onboarding and community path with focused suites, build, lint, and type checks |
| New onboarding regression test fails for Chinese with `language: 'zh-CN'` | Ran the test before the production fix to prove the failure | Change the page payload and service type to the canonical `zh | en` contract, then rerun |
| Second headless Chrome launch reported an existing profile lock | Tried to start another process while the original CDP browser was still reachable | Reused the healthy browser already listening on port 9222; final probe completed successfully |
| CDP probe timed out checking the visually hidden age radio | Playwright tried to pointer-click the `sr-only` input and the visible label text intercepted it | Keep the accessible radio implementation; make the browser probe click the visible label text like a real user |
| `agent-browser` is unavailable | Browser-verification skill preflight found no executable | Use the previously proven headless Chrome/CDP workflow for screenshots, DOM assertions, responsive metrics, overlays, and console errors |
| Full app TypeScript check exits with existing errors | Ran `npm run typecheck:app` after the redesign | Confirmed all errors remain outside this scope in HomePhotoScroll, Lanyard, and Strands; focused lint, tests, backend/API typecheck, and production build pass |
| Parallel full-suite commands yielded before returning final exit codes | Started tests, build, and two typechecks concurrently; the wrapper printed partial logs with undefined exits | Re-run each verification independently and capture its explicit completion result |
| Sandbox denied `ps` while checking those yielded processes | Tried a read-only process listing | Avoid process inspection and use independent bounded verification commands instead |
| CommunityAuth focused test could not find the exact signup password label | First focused run passed 22/23 tests; helper copy inside the label changed the accessible name | Moved the helper to a described element via `aria-describedby`, preserving a clean input label |
| A multi-file planning patch had an invalid hunk separator | Tried to update findings and the error table in one malformed patch | Rebuilt the patch with valid per-file hunks before continuing |
| `rg` treated the theme-token pattern as an option | Ran a pattern beginning with `--primary` without the option terminator | Re-run with `rg -n -- '<pattern>'` before editing theme-dependent styles |
| `npx ui-skills categories` stalled with no output | Started the required UI skill-category inspection and polled once | Interrupted the idle process and selected the specific local `design-taste-frontend` skill as the narrow fallback |
| Planning patch could not find an older `Errors Encountered` section | Tried one combined patch against the historical planning-file structure | Split the update around headings that exist and recorded the mismatch here |
| `.git/index.lock` operation not permitted | Tried to stage the approved design doc in the default sandbox | Re-ran the scoped `git add` with approved elevated Git access, then committed only the design document |

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
