# Findings

## 2026-08-09 Approved Manual Guardian + Redis Rollout

### Approved behavior

- Every age band may create an account, finish onboarding, and submit a membership application.
- Applicants aged 18+ and 14–17 enter ordinary staff review without Guardian confirmation.
- Applicants under 14 remain `pending_guardian` until staff has contacted a parent/guardian and recorded explicit confirmation.
- Under-14 applicants may sign in and view application status, but cannot enter member surfaces, post, message, upload, or collaborate until Guardian confirmation and membership approval are both complete.
- The existing automated Guardian invite/OTP schema and APIs stay available for a future mode, while the current UI uses staff-led manual confirmation.
- Guardian contact data remains encrypted; audit history is retained; staff must not paste complete identity documents into notes.
- The user approved Upstash Redis through Vercel Marketplace, with Preview and Production isolated by distinct resources or key prefixes.

### Existing implementation facts

- `CommunityAuth.tsx` already creates Supabase Auth accounts for all age bands.
- Membership submission currently sends both `under14` and `age14_17` to `pending_guardian`; only `under14` should do so in manual mode.
- The current review RPC blocks both minor bands without Guardian verification; it must be narrowed to `under14`.
- Private Guardian tables and automated invite/OTP functions already exist outside the public Data API.
- Production collaboration intentionally fails closed without `COMMUNITY_COLLAB_REDIS_URL`.
- Production Vercel environment variables do not yet include Redis, Guardian secrets, or a Guardian flow-mode flag.
- The current Supabase changelog adds no breaking change that affects this migration. The existing 2026 Data API explicit-exposure change still reinforces keeping Guardian detail in the private schema and granting public RPC execution intentionally.
- No Supabase MCP tools are available in this task, so schema iteration and verification must use the authenticated CLI/linked database paths already established by the repository.
- The active application-state implementation is overwritten by `20260807152919_idempotent_community_application_review.sql`; the new migration must replace the latest function signature, not only edit the original workflow migration.
- `CommunityOnboarding.tsx` currently diverts every unverified under-14 account to the Guardian page before onboarding, while `CommunityApply.tsx` sends `pending_guardian` applicants there after submission. Manual mode needs the Guardian page to collect a contact for staff follow-up without invoking OTP delivery.
- The current application status UI treats all non-adults as requiring safety review; this must change to under-14 only.
- The existing admin application view already exposes masked Guardian status and identity state, but has no manual-contact read or consent-recording control.
- Existing Guardian storage already has the fields needed for manual confirmation: encrypted contact, Guardian name/relationship, legal-document reference, three affirmations, confirmation timestamp, staff/event audit, and optional evidence hashes.
- `private.create_guardian_consent_request_server` is service-role only and already associates the latest application and legal document; manual mode can reuse it while skipping webhook delivery.
- The latest approval function separately requires both Guardian consent and identity verification for both minor bands. The new rule should narrow Guardian consent to under-14 and remove the special minor gate for 14–17 while preserving ordinary staff review.
- `private.get_my_guardian_consent_state` currently reports onboarding completion only after under-14 verification; manual mode must permit onboarding/application before verification while membership eligibility remains false.
- The Guardian request endpoint currently asserts webhook configuration before any write. A `GUARDIAN_FLOW_MODE=manual` branch can keep rate limiting, encryption, legal-document lookup, and request creation while omitting token delivery and returning a staff-follow-up result.
- `community-security.ts` implements AES-256-GCM encryption but no decryption helper; an admin-only API will need authenticated sensitive-review permission plus a strict decryption response contract.
- The public token/OTP page can remain compiled for future automated mode, while the signed-in setup view switches its copy and outcome according to the manual flow flag.
- Admin API authentication already has `requirePermission`; `memberships.review_sensitive` is the appropriate existing permission for reading decrypted Guardian contact and recording the sensitive confirmation.
- `listMembershipApplications()` does not include `pending_guardian` in its default database filter, so the staff screen must explicitly request that status or change the RPC default.
- `private.guardian_consents.otp_challenge_id` is currently mandatory. Manual confirmation needs provenance-aware schema changes: nullable OTP challenge for manual records plus method, staff actor, verification basis, and bounded notes with consistency checks.
- The clean state transition is one staff RPC that verifies the actor permission, closes the manual request, inserts the canonical consent record and guardian-attestation identity record, marks both safety states verified, moves `pending_guardian` to `submitted`, writes audit events, and notifies the applicant.
- Manual mode can reuse the existing `pending` Guardian request state and token hash without delivering the token. Only the consent evidence needs provenance extensions; this avoids altering the proven automated-request state machine.
- Approval and recovery functions must consistently enforce: under-14 = Guardian + identity; age 14–17 = identity only; adult = ordinary review. Updating only submission/review would leave restoration and profile routes inconsistent.
- Because server-role RPC calls do not carry the staff user's Supabase JWT, manual consent functions must persist the validated staff actor explicitly in `recorded_by` and `guardian_consent_events.actor_user_id`; relying on `auth.uid()` would produce a null actor.
- The staff API uses only authenticated POST actions (`read`, `confirm`, `decline`), requires `memberships.review_sensitive` before invoking service-role RPCs, decrypts exactly one contact in memory, and never returns ciphertext or lookup/token hashes.
- The original Guardian legal document migration inserts only a draft. The hosted state must be checked for an active reviewed document before request collection can be enabled; activating draft text without an approved legal basis is not acceptable.
- The hosted read-only check confirms exactly one Guardian document: `guardian-community-consent` v1, title marked draft, status `draft`, with no effective or published timestamp. There is no active legally reviewed document to present or record today.
- Current database regression coverage explicitly asserts that 14–17 applicants wait for Guardian confirmation and that under-14 onboarding is blocked. Those assertions must be replaced with the newly approved behavior while keeping automated OTP tests intact.

### Legal/safety basis

- The rollout treats data about children under 14 as sensitive personal information and requires separate parent/guardian consent under China PIPL Articles 28 and 31.
- Internal staff approval does not substitute for Guardian consent; the confirmation record must precede membership approval for under-14 applicants.
- Implementation and Redis deployment may proceed, but the staff confirmation path must fail closed until an active Guardian document exists; publishing or rewriting legal terms is a separate authorization/review decision.

### Vercel execution constraints

- Upstash Redis should be provisioned through the linked Vercel Marketplace integration before adapting environment names; the integration controls the actual injected variables.
- Preview and Production resources must be connected with environment-specific scopes. Sensitive values must remain server-only and be added/updated through stdin or integration injection, never command text or source files.
- Preview verification should use `vercel curl` under deployment protection. The Production candidate should use `--prod --skip-domain`, then be promoted only after verification.
- Marketplace provisioning may require first-time terms acceptance in the browser; the CLI should remain running while the user accepts rather than being killed or replaced with a manual mock.
- Vercel Sensitive environment values are intentionally non-recoverable through `env pull`; successful write output plus name/scope checks are the hosted verification boundary. Format/length verification must happen before upload or against the local mode-600 backup.
- Live discovery found `upstash/upstash-kv`; its `free` plan is explicit, `autoUpgrade` defaults to true, and Tokyo `hnd1` is available. The rollout therefore sets `--plan free`, `autoUpgrade=false`, `prodPack=false`, and `eviction=false` explicitly.
- `rgan-community-collab-preview` is ready on the Free plan and connected only to Preview. Upstash does not offer a second Free database in this installation; Production must share it with a distinct namespace or require a separately approved paid plan.
- The current Hocuspocus Redis extension hardcodes the channel prefix `rgan:field-notes`; `COMMUNITY_COLLAB_INSTANCE_NAME` is used as the Redis message identifier, not as a namespace. Therefore the existing code does not safely isolate shared Preview/Production data.
- The current stable instance name is also reused as the Redis message identifier, which would cause separate Vercel instances in the same environment to ignore each other. The fix is a stable environment-derived prefix plus a unique per-process identifier.

### Design artifact

- `docs/plans/2026-08-09-community-manual-guardian-and-redis-design.md` was approved and committed as `fbd465e`.

## 2026-08-08 Community Collaborative Editor — Final State

- Supabase now has a dedicated `community_editor` server-only secret key for the collaborative editor; the dashboard exposes a unique `Copy API key` action on that row, so the value can be transferred without revealing it.
- Supabase secret values are one-time credentials: after the creation result closes, the key list retains only a short `sb_secret_…` prefix plus masking. The dashboard's later Copy/Reveal controls did not return the full value in this session.
- The controlled Chrome surface can click the dashboard copy action but does not receive a clipboard payload from this page; sanitized DOM inspection also found no long secret in attributes or fields. A CLI-authenticated key listing is the safer fallback.
- Supabase CLI `projects api-keys` returns modern secret keys as a short prefix plus U+00B7 mask after the one-time creation result. It does return the existing legacy `service_role` JWT in full, so `SUPABASE_SECRET_KEY` can safely use that server-only credential without changing application code.
- The Vercel project has existing join-form and AMap variables, but no `VITE_SUPABASE_*`, `SUPABASE_*`, or `COMMUNITY_*` variables. Its authenticated Add Environment Variable dialog supports multi-line `.env` paste, sensitive storage, and environment targeting.
- Vercel Storage contains no existing databases. Upstash for Redis is the preferred marketplace choice; the final action is labeled `Accept and Create` and includes new third-party terms/data sharing without displaying a price first.
- Local Node 20 cannot initialize current Supabase Realtime because it lacks the required native WebSocket. The already-installed Homebrew Node 23.7.0 starts both Vite and the collaboration server without code changes.
- End-to-end localhost verification succeeded: authenticated note 110 renders the advanced editor and its save indicator reaches `所有更改已保存`.
- The hosted schema now contains canonical private Yjs persistence, explicit checkpoints, collaborators, hashed share links, protected comment read models/events, and review-state edit freezing.
- Direct Yjs clients cannot mutate the protected comment map; comment writes use authenticated REST operations and BlockNote's per-author authorization rules.
- BlockNote/Hocuspocus is isolated in a lazy editor chunk, so public articles and ordinary community pages do not load the editor runtime.
- Automatic materialization/checkpoints do not create revision spam; explicit save and submit actions create traceable revisions.
- Published database articles render server-sanitized HTML. Public author fallback avoids reopening the privacy-protected raw People table.
- Production real-time collaboration intentionally fails closed without Redis; the code is complete, but deployment must provide `COMMUNITY_COLLAB_REDIS_URL` before a two-account live smoke test.
- The only remaining Security Advisor warning is the project-level Supabase leaked-password-protection setting, unrelated to this feature.

## 2026-08-08 Community Collaborative Editor

- The current `CommunityStoryEditor` is a standard form with a textarea and persists `{ title, excerpt, content, visibility }` through the field-notes service.
- `field_notes.content` and `field_note_revisions.content_snapshot` are plain text. The approved design keeps these compatibility values while adding BlockNote JSON, sanitized HTML, schema versions, and a private Yjs binary document.
- The current public `FieldNoteArticle` reads a local structured-content repository rather than published community submissions, so public database-backed community notes need a separate repository path before later unification.
- BlockNote Core is the approved editor. Yjs is the collaboration state; Hocuspocus supplies WebSocket auth and persistence; Supabase Auth/Postgres supplies identity, permissions, durable state, revisions, and public snapshots; Redis is required for multi-instance collaboration fanout in production.
- The approved permission model combines author-invited active members with an optional “active community members with the link can edit” mode. A link never bypasses login, active Membership, article state, or server authorization.
- Drafts and requested changes are editable; submitted/in-review content is read-only to ordinary collaborators; published content is frozen until a new revision is opened.
- Real-time Yjs state is materialized at checkpoints into versioned BlockNote JSON, plain text, and sanitized HTML. Public pages render only approved snapshots and do not load the editor bundle.
- Offline editing uses local IndexedDB; reconnect revalidates authorization. Changes made after permission revocation must become a local recovery copy instead of being merged into the protected article.
- The final design was committed as `a8f4732` in `docs/plans/2026-08-08-community-collaborative-editor-design.md`.
- `npx ui-skills categories` again produced no usable output, matching prior repository history, so implementation will rely on the approved community visual system and BlockNote's documented editor interaction model.
- The app is Vite + React 18 with TypeScript and TanStack Query. BlockNote and Yjs/Hocuspocus are not yet installed; package versions must be pinned and the lockfile committed.
- `/community/stories/new` and `/community/stories/:noteId/edit` both render one eager-imported `CommunityStoryEditor`. The new editor should be route-lazy so BlockNote/Yjs code does not enter the public or ordinary community bundle.
- `CommunityStoryEditor` currently finds an existing note by fetching the full owner list, then performs direct table inserts/updates. The collaborative editor needs note-scoped load, checkpoint, permission, collaborator, comment, link, and revision service methods.
- Existing `private.enforce_field_note_write` already protects system fields, publication fields, body changes, and workflow transitions. New JSON/HTML/schema fields must be included in body-change enforcement, while Yjs persistence must live behind a separate server-only boundary.
- Existing revisions are trigger-created for every title/content update. Collaborative autosave cannot reuse that behavior unchanged or it would create excessive revisions; checkpoints need an explicit, atomic server operation and the old trigger must be narrowed or replaced.
- Existing `private.can_read_field_note` / `private.can_edit_field_note` know only owner and staff permissions. Their semantics need extension for invited collaborators without making link-token access a general RLS bypass.
- The public article route currently maps a local content type with people/topics/cover metadata. Database-backed BlockNote articles should use a distinct published-note view model and renderer, with local-repository fallback for existing sample slugs.
- The first API inspection guessed a nonexistent `api/community/member-search.js`; the repository's actual community API files are TypeScript and use shared helpers under `api/_lib`.
- Server APIs already have reusable `requireUser` / `requirePermission` helpers that validate bearer tokens with `supabase.auth.getUser`, plus user-scoped and secret Supabase clients. Hocuspocus auth should reuse the same token semantics, while privileged Yjs persistence uses only the server secret client.
- `AuthContext` exposes the active Supabase `session`, user, Membership-derived community state, and permission list, so the editor can source its WebSocket access token and react to auth refresh without adding a second auth store.
- Existing server endpoints are Vercel-style TypeScript handlers compiled by `tsconfig.api.json`; Hocuspocus requires a WebSocket-specific entry point rather than the normal request/response helper contract.
- `src/services/media/index.ts` already uploads owner-scoped assets and records `media_assets`. The editor should adapt BlockNote upload hooks to this service and then associate returned assets with the note instead of creating a second upload path.
- Server secrets are already isolated in `api/_lib/supabase.ts`; the browser receives only publishable configuration. New Redis/Hocuspocus credentials must follow the same server-only pattern and be documented in `.env.example`.
- Current Supabase docs confirm `auth.getUser(jwt)` performs a network request and returns authentic user data suitable for authorization; this matches the repository's existing API helper and is appropriate for Hocuspocus connection authentication.
- Current RLS docs require RLS on every exposed-schema table plus explicit role grants. The collaborative public tables will enable RLS and grant only required operations; the private Yjs table will remain outside browser Data API access.
- The 2026-04 Data API breaking change means new tables may not be exposed automatically and will be enforced for all projects on 2026-10-30. Migrations must include intentional `GRANT` statements rather than relying on dashboard defaults.
- The 2026-07 Supabase change locks the `realtime` schema against modifications. This design does not modify that schema because collaboration is Hocuspocus/Yjs, so the change is not a blocker.
- Supabase client libraries dropped Node 20 in June 2026; this repository already requires Node 22, so the collaborative server dependencies align with the supported runtime.
- No current Supabase breaking change invalidates the approved auth/RLS/persistence architecture.
- Current Vercel Functions guidance confirms native WebSocket support under Fluid Compute. A connection is pinned only for its lifetime, closes at function duration limits, and reconnects may land on another instance; clients must reconnect and durable rooms/presence cannot live only in memory.
- The Hocuspocus WebSocket endpoint therefore belongs in a full Node.js function, not Edge. It needs Redis pub/sub for multi-instance fanout and Supabase for durable Yjs state.
- `vercel.json` currently has only the Vite build/output and SPA catch-all rewrite. The implementation must add a narrowly scoped function configuration for the WebSocket endpoint while preserving existing HTTP APIs and SPA navigation.
- Local Vite development does not run Vercel functions. The implementation needs a separate local Hocuspocus command/port and a `VITE_COMMUNITY_COLLAB_URL` override, while production can use the same-origin WebSocket endpoint.
- Vercel connections end at the configured function duration even when healthy; the client connection-state model and exponential reconnect are required behavior, not only error recovery.
- Current BlockNote collaboration setup uses `withCollaboration`, a caller-owned `Y.Doc`, and a Yjs provider. The editor can pair `@hocuspocus/provider` with `y-indexeddb` without coupling document persistence to BlockNote UI state.
- BlockNote comments support a secure `RESTYjsThreadStore`: comment writes go through an authenticated REST API while reads synchronize from a Yjs map. This is preferred over direct `YjsThreadStore`, which cannot enforce server-side ownership of comment edits/deletes.
- Comment creation/editing will require a live connection in v1; document text remains offline-capable. This avoids pretending the REST-backed comment store is local-first.
- Hocuspocus v4 requires Node 22, uses web-standard `Request`/`Headers` in auth hooks, supports `connection.readOnly`, and debounces `onStoreDocument` for persistence. All fit the repository runtime and approved permission model.
- Hocuspocus Database must return the exact stored Yjs `Uint8Array`; reconstructing a fresh Y.Doc during each fetch can duplicate content/history. Legacy initialization happens only when no Yjs state exists.
- Hocuspocus Redis synchronizes document updates and awareness across instances but is explicitly non-durable; it must be paired with the database extension.
- `ServerBlockNoteEditor` can convert YDoc to blocks and blocks to full HTML. Snapshot materialization should share one schema definition between client and server.
- Hocuspocus v4 `openDirectConnection(documentName, context)` can transact against the live document while keeping hooks, Redis propagation, and persistence active. The authenticated REST comment endpoint can use this mechanism to update BlockNote's `threads` Y.Map even when the caller's WebSocket connection is read-only.
- The secure comment flow will use `RESTYjsThreadStore`: bearer-authenticated REST writes validate comment/thread ownership and article-comment permission, then mutate the live YDoc through a direct connection. Ordinary Yjs document updates never receive a general “comments-only” write bypass.
- `@hocuspocus/provider-react` is React 18/19 and StrictMode-safe, provides connection/sync/awareness hooks, and should manage provider lifecycles instead of bespoke effect cleanup.
- HocuspocusProvider already provides exponential reconnect with jitter and message timeouts; the UI should subscribe to its status rather than build a second reconnect loop.
- Registry compatibility check selected BlockNote packages `0.53.0`, Hocuspocus server/provider/extensions `4.5.0`, Yjs `13.6.32`, y-indexeddb `9.0.12`, and sanitize-html `2.17.6`.
- BlockNote React supports React 18; Hocuspocus v4.5 supports the repository's Node 22 runtime; provider-react requires a matching 4.5 provider. Mantine peer packages will be pinned to the compatible 8.3.11 line.
- The existing membership table is `public.community_memberships`, and `private.has_active_membership(uuid)` already checks membership status plus active profile/account state. New collaboration permission functions should reuse it instead of duplicating membership rules.
- The original field-note migration grants browser writes directly to `field_notes` under trigger/RLS control and already exposes `private.can_read_field_note` / `private.can_edit_field_note` only as narrowly granted helpers. The new migration must replace the latest function definitions in migration order, not only edit the old file.
- Existing field-note revisions are readable by owner or staff, but collaborators are not included. The new revision policy must add active collaborators while keeping public/anon excluded.
- Existing audit triggers call the generic `private.audit_row_change('<entity>')`; collaborator/link tables can reuse this for row-level changes, while comment events need a dedicated immutable audit payload.
- `private.has_active_membership` joins `community_memberships` to active `profiles`, and is already narrowly executable by browser roles for RLS use. Collaboration functions can safely call it in security-definer helpers with empty search paths.
- Existing community directory RPCs already expose minimal active-member identity through `people.user_id`, display/nature names, and avatar media id. Collaborator search and awareness identity should reuse this public-person shape rather than exposing auth emails.
- Link-based editors cannot be represented by ordinary row RLS because the raw link token must never become a persistent client claim. Note metadata and checkpoints for link editors should go through authenticated server APIs, while ordinary table RLS covers owners, named collaborators, staff, and published readers.
- Direct browser updates by collaborators would allow field-note rows to diverge from the Yjs source. Collaborators will receive read access to note metadata, but collaborative writes/checkpoints go through the server-only authorization/checkpoint boundary.
- The migration now adds versioned JSON/HTML snapshots, named collaborators, hashed links, comment audit rows, private Yjs binary storage, active-member permission helpers, service-only auth/storage/checkpoint/share/comment RPCs, and freezes ordinary edits after review approval/publication.
- Private Yjs persistence is exposed to the Node service only through service-role-only public RPCs because the `private` schema is intentionally absent from the Supabase Data API schema list.
- Supabase CLI 2.67.1 supports local `db lint` and pgTAP `test db`; both require a running local database. Whitespace/signature inspection currently passes, but SQL execution remains required before considering the migration valid.
- Hosted migration history currently ends at `20260807152919_idempotent_community_application_review`; the collaborative-editor migration has not been applied online.
- The hosted security advisor baseline has one unrelated warning: leaked-password protection is disabled. No pre-existing missing-RLS warning needs to be confused with this feature's later advisor result.
- Existing database tests run in explicit transactions with temporary assertion/auth helpers and stable UUID fixtures, so a collaborative-editor test can exercise service-role RPC grants and roll back all rows.
- `001_authorization_and_workflow.sql` currently expects trigger-created revisions after ordinary content updates. The collaborative model intentionally removes that write-amplifying behavior; the old assertion must change to initial-revision-only, while the new test proves explicit checkpoints create versions and automatic materialization does not.
- A controlled hosted `BEGIN ... ROLLBACK` execution proved the full migration parses and is compatible with the current production schema without persisting objects.
- The new collaborative-editor database test now passes in the same rollback transaction after correcting the final Membership fixture, direct SQL `smallint` casts, and the minimum helper EXECUTE grants required by RLS/security-invoker triggers.
- Legacy database test 001 cannot be replayed against the hosted project because it intentionally calls the one-time Super Admin bootstrap. This is environment-specific; the local empty-database test remains valid and must not be weakened for hosted convenience.
- Installed BlockNote defaults already include audio, video, file, image, table, divider, quote, code, toggle list, checklist, numbered/bullet lists, headings and paragraph blocks plus all approved inline styles. A dedicated callout remains the only requested content type requiring a custom spec or an intentionally styled quote variant.
- `ServerBlockNoteEditor` exposes typed `blocksToYDoc`, `yDocToBlocks`, and async `blocksToFullHTML`; the shared document module can use one schema and one named Yjs fragment across browser, server, tests, and public snapshot generation.
- All selected runtime/dev dependencies are now pinned in `package.json` and installed. The successful approach reused the warmed npm mirror cache in separate BlockNote and Hocuspocus groups.
- The shared field-note document module now centralizes schema version 1, fragment `field-note-content`, legacy conversion, safe plain-text extraction, YDoc conversion, HTML sanitization, and portable snapshots; its four focused tests pass.
- Hocuspocus v4's installed server exposes both the built-in `Server` and embeddable `Hocuspocus.handleConnection/openDirectConnection`. Provider React supplies StrictMode-safe room lifecycle plus connection, sync, awareness, and event hooks.
- Full app typecheck currently fails only in pre-existing HomePhotoScroll, Lanyard, and Strands files; backend/API typecheck passes and no field-note-document errors remain.
- The Hocuspocus server layer now validates stable `field-note:<id>` names, verifies Supabase sessions, hashes optional share tokens, enforces server authorization, persists exact bytea Yjs state, atomically seeds legacy documents, materializes safe snapshots, sanitizes awareness identity, and fails closed without production Redis.
- BlockNote `RESTYjsThreadStore` uses a fixed REST contract: create thread at the base URL; thread/document/comment/resolve/reaction operations at appended path segments. A Vercel catch-all comment API is needed so those appended paths reach one authenticated handler.
- `DefaultThreadStoreAuth` controls which UI actions appear, but the server must independently verify comment author/editor privileges before using a Hocuspocus direct connection to mutate the `threads` Y.Map.
- Existing `uploadOwnedMedia` returns the media metadata and storage path, not a browser URL. The BlockNote upload adapter needs an approved public/signed URL step after upload.

## 2026-08-07 Super Admin And Application Recovery

- The target account exists in the hosted `rganjunior` Supabase project, is email-confirmed and active, and currently has active `admin` plus `registered_user` roles.
- The application route `/community/admin/applications` is guarded directly by `memberships.review`, not by active Membership, so administrative review access does not require community-member status.
- The hosted `admin` role resolves `memberships.review`, `memberships.review_sensitive`, `memberships.manage`, and role-assignment permissions; the app-facing permission RPC was already verified for the target account.
- The reported `APPLICATION_STATE_CONFLICT` must be diagnosed against the target account's live application row and the function's allowed transition states before changing data.
- The current Supabase changelog has no relevant hosted PostgREST/Auth breaking change for this workflow. Official guidance continues to require RLS on exposed tables and tightly controlled execution of privileged RPC functions.
- Live application `#26` is already `approved`; it was decided by the target account, and an active Membership plus `community_member` role were created successfully.
- The live account-facing `get_my_community_state()` already returns `application_status = approved`, `membership_status = active`, and `destination = /community`. The hosted workflow data is internally consistent and the dashboard destination is correct.
- `APPLICATION_STATE_CONFLICT` is therefore a duplicate-review race/retry: the review function intentionally accepts only `submitted` or `under_review`, so a second approval after the first committed result fails.
- The admin page has no per-row pending state, does not await its reload, and leaves review buttons active while the request is running; this permits a double click or retry against an already approved row.
- The empty-queue message is accurate after approval, but the UI does not preserve a success result explaining that the application was approved and the member can enter the dashboard.
- The SQL approval path already atomically creates Membership, grants `community_member`, exposes the requested profile, sends a notification, and is covered by a database test asserting destination `/community`.
- `CommunityAdminApplications` does not call `refreshCommunity()` after approval. This matters when an administrator approves their own application: the database commits correctly, but that browser tab retains the pre-approval Membership state until a reload.
- `CommunityApplicationStatus` reads the latest application but does not refresh AuthContext after observing `approved`; its “进入社群” link can therefore be followed while the route guard still holds stale pre-approval state.
- Durable repair should combine same-decision idempotency in the review RPC, per-row pending/success feedback in the admin UI, and AuthContext refresh after an approval is observed.
- No active Super Admin existed online. The target account was eligible for the database's one-time `private.bootstrap_super_admin` path.
- Hosted verification now resolves `private.is_super_admin()` to true for the target account; active roles are `admin`, `community_member`, `registered_user`, and `super_admin`, and the bootstrap is present in the audit log.
- Supabase CLI 2.67.1 is available. `supabase migration new` only creates a migration file and does not start a local database, so it is compatible with the hosted-only constraint.
- Existing database test 004 proves the first approval creates Membership and the `/community` destination, but it does not retry the same approval or assert that an opposite terminal decision remains rejected.
- There are no focused component tests yet for the admin application queue or application-status page; new tests are needed for button locking, success feedback, and AuthContext refresh.
- The hosted migration `idempotent_community_application_review` applied successfully. Online verification proves a repeated identical approval is a no-op with unchanged event, notification, and Membership records, while an opposite rejection still raises `APPLICATION_STATE_CONFLICT`.
- The same online verification resolves the target account to active Membership and `/community` after the idempotent retry.
- Security Advisor reports no SQL/RLS finding from this change; the only warning remains the external Auth setting for leaked-password protection being disabled.
- The production build still emits only existing bundle-size, Browserslist-age, and PostCSS warnings; none block this workflow repair.
- Full hosted rollback test 004 reaches its final assertions and `rollback`; no test fixture data is retained online.
- Final hosted state: the target account is Super Admin, application `#26` is approved, Membership is active, destination is `/community`, and the pending queue count is zero.
- A zero pending count is now presented as a normal completed queue state rather than an error. Approved entries leave the pending queue by design.
- Post-migration Security Advisor still reports only leaked-password protection disabled. Performance Advisor adds one pre-existing unindexed `community_reports.message_id` foreign key and many INFO-level unused indexes on this low-traffic/new project; none is caused by the function-only migration.

## 2026-08-07 Community Onboarding Language Fix

- Current official Supabase JavaScript documentation confirms `.rpc(fn, args)` passes named arguments directly to the Postgres function; the client does not normalize locale strings.
- The current Supabase changelog contains no RPC parameter-language breaking change relevant to this issue. Recent PostgREST upgrades do not change this named text-argument contract.
- `CommunityOnboarding` currently maps the Chinese UI language to `zh-CN` before calling `completeCommunityOnboarding`.
- `CommunityOnboardingInput.language` incorrectly allows `'zh-CN' | 'en'`, so TypeScript currently validates the value that the hosted RPC rejects.
- Hosted migration `20260807054154_community_identity_foundation` validates `requested_language in ('zh', 'en')` and writes that value to `profiles.preferred_language`, whose check constraint also accepts only `zh` and `en`.
- The generated Supabase RPC type exposes `requested_language` as `string`, so the app service type is the important compile-time boundary.
- No existing frontend test covers `CommunityOnboarding` submission or the `requested_language` RPC payload.
- The new page test covers LanguageContext-to-service mapping, while the new service test independently verifies the final named Supabase RPC argument. Together they prevent a future normalization mismatch at either boundary.
- Approved repair: keep the strict hosted database contract, change the app contract to `'zh' | 'en'`, and submit the existing `LanguageContext.lang` value directly.
- Browser formatting locales such as `zh-CN` remain valid for `Intl` usage elsewhere; they must not be reused as persisted application language values.
- No migration or hosted data backfill is needed because invalid `zh-CN` requests were rejected before any onboarding transaction completed.
- Full-suite failures are isolated to unrelated program-page copy drift (old assertions versus current page content); the new onboarding page and RPC-boundary tests pass in the same run.


## 2026-08-07 Community Entry And Auth Redesign

- Design read: trust-first community-entry redesign for youth, guardians, and approved members; preserve the existing brand and Tailwind/Radix stack. Chosen dials are variance 6, motion 3, density 4.
- The existing mascot files provide a real brand visual for the portal, so the redesign does not need generated or stock imagery.
- `/community` already passes through `CommunityRequireAuth` and `CommunityRequireMember`: signed-out users reach `/community/auth`, non-members resolve to their stored destination, and members reach the community home. It can be the public launcher URL without adding a new route.
- Existing community form utilities use a pill/button plus 2rem-card radius system. The auth portal will use its own restrained 12-16px surface/input radius while leaving internal community forms unchanged.
- Removing the Logo speech bubble also removes one state variable and one interval/timeout effect from Navbar; the scroll-based Logo visibility behavior remains.
- The desktop launcher can occupy the same overall navigation capacity as the removed community item, while its placement after the language control makes the product boundary explicit.
- The project already standardizes on `lucide-react`; retaining that existing icon family avoids adding or mixing icon dependencies.
- `CommunityAuth` has no existing focused component tests or AuthContext mock pattern, so the redesign needs a local mock around `useAuth` and the auth service module.
- The current semantic `primary` is the approved deep forest green. `accent` is a muted earth tone rather than the requested headline orange, so the auth portal needs one scoped brand-orange token instead of repurposing every global accent surface.
- Visual inspection of `mascot-full.png` confirms a saturated citrus orange as the signature brand visual. The portal can derive its large-title orange from that asset while keeping all smaller body text in high-contrast forest/foreground colors.
- The codebase already uses the shared handwriting font variables for brand/editorial headings and sans body copy; no font dependency or remote font load is needed.
- `LanguageContext` exposes both `lang` and `setLang`, so the independent community brand bar can own its language switch without depending on the public Navbar.
- React best-practices review found no new data waterfalls, heavy conditional imports, global listener duplication, inline component definitions, or expensive render work. The entry URL computation and three-item localized content list are intentionally trivial.
- The auth portal passes the visible-copy dash audit and uses exactly one uppercase tracking label, keeping the approved editorial hierarchy out of the repeated-eyebrow pattern.
- Screenshot review confirms the desktop portal has the intended orange/forest hierarchy and independent product shell. The first mobile composition placed all three principles before the form, delaying the primary action; the mobile order should be hero, auth panel, then principles.
- Final CDP verification reports meaningful content, no framework overlay, no console/page errors, and no horizontal overflow on the desktop homepage, desktop community auth, and 390px community auth.
- The final homepage has two new-window community entry anchors (standalone Navbar CTA and hero mascot), zero ordinary community menu entries, and a Logo href of `/`.
- The final community auth route has no public Navbar or Footer. Registration starts with three age radios and no email/password fields, then reveals account fields only after an age is selected.
- The current public `navItems` array contains `/community`, so “进入社群” renders as an ordinary desktop and mobile menu item.
- The Navbar Logo currently routes to `/community/enter` and owns a periodic community speech bubble. This conflicts with the newly confirmed standalone-CTA model; the Logo should return to `/`.
- The homepage mascot currently uses a React Router `Link` to `/community/enter`. It should become a safe new-window anchor sharing the centralized community entry URL.
- `CommunityAuth` currently combines four equal pill tabs with a large green/white split card. Age selection sits below credentials. The approved redesign reduces mode competition and moves age selection to registration step one.
- `Layout` already suppresses `MascotCompanion` on community paths but still mounts the public Navbar, Footer, SmoothScrollDamping, and TargetCursor for every community route. The community route branch needs an independent shell.
- `vercel.json` already rewrites all paths to `index.html`, so `/community` works as a direct same-domain SPA entry without a deployment rewrite change.
- Current auth callback construction uses `window.location.origin`, which is compatible with both the present same-domain route and a future community subdomain.
- Final domain strategy for this phase: use the same deployment and `https://rganjunior.org/community`; keep one configurable public community origin for a future move to `https://community.rganjunior.org`.
- The approved visual direction uses warm ivory surfaces, orange large headings, deep-green supporting text, restrained rules/spacing, and no giant two-tone split card.

## 2026-08-07 community application-layer security
- `public.people` still has table-wide `SELECT` for `anon`/`authenticated`; RLS protects rows but cannot hide `full_name_private` or real-name columns when `show_real_name = false`. Before the live People directory is wired, replace direct reads with security-definer safe projection RPCs and revoke table-wide reads from browser roles.
- The current production UI still uses local Field Notes people fixtures, so revoking browser `SELECT` on `people` will not regress the public editorial pages. `src/services/people/index.ts` exists but has no current callers and can be migrated to projection RPCs safely.
- Username login needs a secret-backed user-id-to-email lookup plus persistent hashed rate limiting; native Supabase password Auth still signs in by email, not username.
- Revoking raw People reads requires updating legacy RLS tests that query `public.people` as browser roles; internal/postgres fixture assertions remain valid. New tests should use the safe projection and own-profile RPCs instead of relaxing column privacy.

## 2026-08-07 Community Platform Discovery
- Existing members-only Field Notes currently allow any authenticated account. The Membership migration must replace that condition with `private.has_active_membership(auth.uid())` so ordinary registered users cannot read member-only content.
- Post-migration online verification passed all three authorization suites. Security Advisor remains empty; Performance Advisor only reports expected unused indexes in the zero-data project.
- The hosted project remains clean after tests: 0 Auth users, Profiles, People, safety rows, settings, and user-role assignments; roles are now `registered_user`, `community_member`, `editor`, `admin`, `super_admin`, `facilitator`; permission count is 41.
- Hosted migration `20260807054154_community_identity_foundation` is now applied. The local migration filename is aligned to the remote history.
- Existing registration tests must now supply `age_band`; both earlier authorization/growth suites were updated without changing their business assertions.
- The first identity migration SQL is syntactically compatible with the live hosted schema and completed a full transaction dry-run with rollback.
- Phase 1 identity foundation keeps `people.is_public` false during self-onboarding even if the user requests future public visibility; Membership approval will be the only operation that activates directory exposure.
- Existing role protection allows migration-owner updates to system role slug/name while preserving immutable IDs/system flags. Renaming the two roles keeps all foreign-key references stable.
- Existing consolidated People policies rely on `is_public`; the community migration will keep it as the public-directory projection while storing the user's requested visibility separately and only activating public exposure during Membership approval.
- Role slug references are limited to the seed, registration trigger history, and authorization test. The active trigger implementation is the growth migration version and will be replaced to grant `registered_user`; historical migrations remain immutable.
- Phase 1 preflight confirms the hosted project remains empty of real users/profiles/people/user_roles. It has 5 system roles and 26 permission keys, so `member`/`contributor` can be renamed without backfilling user assignments while migration logic still remains data-safe.
- The current hardening migration already consolidates Profile/People RLS and moves privileged RPC implementations into private schema. Community migrations must extend the consolidated policies, not recreate the older pre-hardening policies.
- Existing `handle_new_user()` creates Profile and baseline `member`; it must be replaced after role rename. Existing profile trigger makes `registered_at` immutable and must be preserved when adding onboarding fields.
- Phase 1 implementation will follow the selected Supabase/Postgres rules: explicit check constraints, indexes for every foreign key/RLS lookup, partial indexes for active/pending subsets, least-privilege grants, `(select auth.uid())` in RLS, short approval transactions, and keyset pagination for admin/member lists.
- The full design is approved and documented at `docs/plans/2026-08-07-community-platform-design.md`; commit `b6c5922` contains only that design document.
- No `writing-plans` skill is available in this session. The required implementation transition was completed with an equivalent detailed plan at `docs/plans/2026-08-07-community-platform-implementation-plan.md`.
- User approved the Identity/application/review and core-module designs with one messaging correction: every approved community member may use private messaging, including minors whose required consent and review are complete. Adults outside the approved community must not be able to initiate contact.
- Messaging authorization boundary is therefore active `community_memberships`, not age alone. Ordinary registered users and rejected/pending applicants have no messaging access. In-community message opt-out, block, report, rate limits, evidence preservation, and moderation remain required.
- User refined the age gate into three bands: under 14, 14–17, and 18+. Ages 14–17 require guardian informed confirmation as an internal safety policy; under-14 accounts must obtain guardian consent before collecting the full profile.
- The guardian flow must include a versioned informed agreement describing personal profiles, publishing, People directory, Practice, and member messaging; guardian declaration; explicit acknowledgement of youth privacy/community terms; explicit consent; and one phone OTP verification.
- Official sources confirm that personal information of children under 14 is sensitive personal information and requires parent/guardian consent plus dedicated processing rules. The children's-data rules require clear notice of purpose/scope/method, storage location and retention, security, refusal consequences, complaint channels, correction/deletion paths, and renewed consent after material changes.
- The Minor Online Protection Regulations require real identity information from a minor or guardian before providing publishing or instant-messaging services. A phone OTP proves control of a number, not legal guardianship or real identity by itself; the product should record the declaration and OTP evidence, while keeping a separate verification status and allowing admin escalation/manual verification.
- Recommended under-14 minimization: before consent store only the Auth account, age band, guardian name/relation/contact, consent challenge, and operational audit data. Username, real/display names, avatar, nature name, bio, location, public profile, publishing, People, Practice, and messaging remain locked.
- User approved design section 1: unified extension of the existing backend; dedicated `/community` and `/admin` route families; smart destination routing; explicit registered-user versus approved-member roles; and animated homepage/navbar mascot entry behavior.
- User confirmed minors may apply; applications for people under 18 must include guardian consent.
- User specified two animated community entry points: the large homepage mascot says “点我进入阿柑少年社群吧！” and opens login; after scrolling, the top brand/mascot occasionally speaks similar copy, has a hover/focus effect, and is clickable.
- The existing homepage mascot already has splash lifecycle, pointer-follow motion, reduced-motion handling, and idle animation, so the entry can be added without replacing the mascot system.
- The current navbar brand cluster is a link to `/`, while “首页” also exists in navigation. It can become a smart community entry without removing access to Home, but the design must clearly signal the changed behavior and support keyboard/focus/mobile interaction.
- Recommended interaction: a single shared destination resolver sends signed-out users to login, registered users to profile/application status, approved members to the community home, and privileged users to the same community home with an admin entry. Speech timing and copy also follow this state.
- User selected approach A for delivery: keep the complete long-term architecture, but implement and verify it in consecutive stages rather than releasing every subsystem in one risky batch.
- The current changelog has three directly relevant constraints: the hosted `realtime` schema is locked against structural changes but policies on `realtime.messages` remain supported; new public tables are moving to explicit Data API opt-in, matching this repo's explicit GRANT pattern; custom Auth email templates on new Free projects require custom SMTP.
- Supabase's password sign-in API accepts email/password or phone/password, not username/password. Username login therefore needs a trusted server endpoint that privately resolves username to email and returns only a generic authentication failure.
- Password recovery uses `resetPasswordForEmail()` followed by `updateUser({ password })` after the `PASSWORD_RECOVERY` event.
- Realtime private Broadcast/Presence requires RLS policies on `realtime.messages`, private channels in the client, and disabling “Allow public access” in Realtime settings. Authorization is evaluated when joining a channel, and complex RLS increases join latency.
- Current Supabase Auth documentation confirms Magic Links use `signInWithOtp`; login-only links should set `shouldCreateUser: false` so an attempted login does not silently create a new account. Magic Links are one-time-use and require configured redirect URLs.
- Supabase provides a dedicated `reauthenticate()` flow for sensitive account changes; password recovery, email-change confirmation, Magic Link, and reauthentication have separate configurable email templates.
- The changelog index was requested as required by the Supabase skill; the browser tool returned no rendered content, so relevant breaking changes still need a targeted follow-up check before implementation.
- UI Skills CLI category discovery hung again and was interrupted after producing no output; the local UI routing instructions remain the available design context.
- No `.codegraph/` directory exists, so repository discovery uses `rg` and direct file reads.
- The site is Vite + React Router, not Next.js. Current public routes include homepage, About, Programs, Stories/Voices, and `/join`; there are no account or community routes yet.
- The existing top navigation contains `/join` as “加入我们”. “进入社群” should be a distinct top-level route rather than replacing the existing recruitment/partnership flow.
- Recent commits are primarily design documents; the working tree already contains the uncommitted Supabase/backend implementation from the preceding task, so future edits must preserve unrelated user work.
- The requested platform is a two-level product: registered users can build a profile, read public content, browse public people, and apply; approved community members gain creation, people, practice, and messaging capabilities.
- The supplied proposal frames the long-term product as “content + identity + community + practice,” with People / Stories / Practice as the durable core rather than unrelated website add-ons.
- Required account fields include username, Chinese/English names, avatar, nature name, biography, and region. Account entry includes email/password, Magic Link or recovery, username sign-in, and account settings.
- Membership is a separate reviewed state from Auth registration: registered → applied/pending → approved member, while rejection preserves the ordinary account.
- Administrative scope includes users, membership review, identity labels, roles/permissions, articles, reports, moderation, practice, audit, and privilege elevation.
- Member scope includes publishing, people, practice, and messaging. Youth safety requires message opt-out, blocking, reporting, and moderation from the first messaging release.
- The existing repository already has hosted Supabase Auth foundations, profiles/people separation, RBAC, Field Notes publishing workflow, Storage buckets, audit logs, private growth records, generated types, and typed services. The community design should extend these rather than introduce parallel identity/content systems.
- Brainstorming imposes a hard gate: inspect context, ask one question at a time, compare approaches, present the design, and obtain approval before code or online schema changes.
- Planning update initially failed because the multi-file patch context did not match; it was split into individual file patches.

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
# 2026-08-08 Collaborative Editor Configuration

- The local Vite server now returns JSON for Community editor API routes, but `.env.local` has no `SUPABASE_SECRET_KEY`, so the development middleware intentionally returns `COMMUNITY_EDITOR_SERVER_NOT_CONFIGURED`.
- `SUPABASE_SECRET_KEY` is genuinely required: the collaboration authorization, persistence, comment, and revision RPCs are server-only and cannot safely be replaced with a publishable browser key.
- The project is linked to Vercel project `rgan-junior-roots-main`, but the available Vercel connector token lacks access to the owning team scope; use the linked CLI or authenticated dashboard instead.
- `COMMUNITY_COLLAB_REDIS_URL` is absent locally. Production collaboration requires a managed Redis-compatible URL so separate function instances share Yjs updates and presence.
- Never reveal, print, or commit secret values. Write them only to ignored `.env.local` and encrypted Vercel environment-variable storage.
- Current Supabase guidance recommends the new `sb_secret_...` key for server-side operations; it is available under Project Settings → API Keys and must never enter browser-prefixed variables.
- Current Vercel guidance supports sensitive variables for Preview/Production and development-variable pulls for local use. Existing `.env.local` must be preserved rather than overwritten wholesale.
- The selected in-app browser is not authenticated to Supabase and redirects the API Keys URL to the sign-in screen. Because the user did not require a specific browser, try an available Chrome session before requesting manual sign-in.
- An available Chrome extension session exists for the user's last-used `Ruikang` profile. Use it next because it may already hold the Supabase and Vercel dashboard sessions.
