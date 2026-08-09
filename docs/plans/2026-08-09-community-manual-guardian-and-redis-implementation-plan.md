# Community Manual Guardian and Redis Implementation Plan

**Date:** 2026-08-09
**Design:** `docs/plans/2026-08-09-community-manual-guardian-and-redis-design.md`
**Release branch:** `agent/community-production-release`

## Release outcome

- All age bands can register, complete onboarding, and submit an application.
- Ages 18+ and 14–17 enter the normal review queue. Ages 14–17 require staff identity review but no Guardian confirmation.
- Under-14 applications remain `pending_guardian`; Guardian confirmation and membership approval remain separate atomic decisions.
- Manual mode collects encrypted Guardian contact details, exposes them only through a sensitive-review API, and records staff confirmation with immutable provenance.
- Existing Guardian link/OTP flows remain available for future `automated` mode.
- Preview and Production share the approved Free Upstash database but use separate application prefixes; Hocuspocus instances within one environment still synchronize.
- Manual confirmation remains fail-closed until an active, reviewed Guardian legal document exists. The current hosted draft is not activated by this change.

## 1. Database migration and tests

Create the migration through `supabase migration new manual_guardian_review`.

### Schema changes

- Extend `private.guardian_consent_requests` with a request mode and `manual_pending` status; replace its one-open-request index so automated and manual requests remain mutually exclusive.
- Make `private.guardian_consents.otp_challenge_id` nullable and add verification method, recording staff user, verification basis, and bounded staff note columns with provenance consistency checks.
- Keep all Guardian tables private, RLS-enabled, and revoked from browser roles.

### Server-only functions

- Add `private/public.create_manual_guardian_review_request_server` for service-role creation against an active Guardian document.
- Add `private/public.get_manual_guardian_review_server` for a minimal encrypted-contact projection used only by the server API.
- Add `private/public.record_manual_guardian_confirmation_server` and a manual decline function. Both require service role, validate the supplied staff actor still holds `memberships.review_sensitive`, operate only on under-14 applications, and are idempotent.
- Confirmation closes the request, writes the canonical Guardian consent plus guardian-attestation identity record, updates both safety states, moves `pending_guardian` to `submitted`, writes application/Guardian audit events, and notifies the applicant. It never approves Membership.

### Workflow overrides

- Replace the latest submission function so only `under_14` enters `pending_guardian`.
- Replace the latest idempotent review function so under-14 approval requires Guardian plus identity verification, age 14–17 requires identity verification only, and adults retain ordinary behavior.
- Replace onboarding and community-state functions so under-14 users can onboard before confirmation while still being routed to application/status and excluded from member capabilities.
- Replace Guardian-state eligibility and minor-identity review so 14–17 identity review no longer depends on Guardian confirmation.
- Preserve withdrawal/suspension behavior for already-approved under-14 members.

### Database verification

- Update `004_community_membership_workflow.sql` assertions for 14–17 submission.
- Add `011_manual_guardian_review.sql` for authorization, private-data denial, active-document gate, under-14 transition, idempotency, decline, audit events, and approval blocking.
- Keep `005_guardian_consent.sql` automated OTP coverage, changing only expectations superseded by the approved onboarding/14–17 policy.
- Execute migration plus focused tests inside a hosted rollback transaction before applying migration history.

## 2. Server APIs and security

- Add authenticated decryption to `api/_lib/community-security.ts`; never log or return ciphertext, hashes, tokens, secrets, or more contact data than the authorized staff UI needs.
- Add `api/_lib/guardian-flow.ts` with authoritative `manual|automated` parsing.
- Update `guardian-consent-request.ts`: manual mode accepts only under-14 accounts, keeps rate limits/encryption/active-document selection, creates a manual request, skips webhooks, and returns `manual_pending`. Automated mode retains current delivery.
- Add `api/community/guardian-manual-review.ts`:
  - `GET` requires `memberships.review_sensitive`, loads the server-only projection, decrypts one contact, and returns legal-document metadata plus request state.
  - `POST` requires the same permission and records confirm/decline with all three affirmations, method, verification basis, and bounded notes.
- Add API tests for authentication, permission denial, manual-mode webhook bypass, secret misconfiguration, validation, and sanitized responses.

## 3. Applicant and staff UI

- Read `VITE_GUARDIAN_FLOW_MODE` only as a display flag; database/API remain authoritative.
- Remove the under-14 pre-onboarding redirect and show Safety only for under-14 in progress steps.
- Ages 14–17 submit to application status directly.
- In manual mode, the Guardian setup page says staff will contact the Guardian, stores the contact without showing token/OTP controls, and shows a received/pending state.
- Application status copy explains staff follow-up and keeps the under-14 account outside member features.
- Admin application listing explicitly includes `pending_guardian`.
- Add a focused under-14 manual review panel with a deliberate reveal action, legal-document metadata, contact method, three required affirmations, verification basis, notes warning, confirm, and decline. Disable all actions in flight.
- For age 14–17, show the existing identity-review control without waiting for Guardian status.
- Update Vitest coverage for routing, copy, hidden OTP controls, pending listing, field validation, and double-submit locking.

## 4. Redis and environment configuration

- Change the Redis extension constructor to use a stable prefix `rgan:field-notes:<sanitized COMMUNITY_COLLAB_INSTANCE_NAME>` and a unique per-process identifier `<instance>-<random uuid>`.
- Add tests proving Preview/Production prefixes differ and same-environment processes do not share identifiers.
- Connect `rgan-community-collab-preview` to both Preview and Production after the prefix fix; retain Free plan, `autoUpgrade=false`, Tokyo `hnd1`.
- Pull each environment into temporary mode-600 files, then copy its injected TLS `KV_URL` into sensitive `COMMUNITY_COLLAB_REDIS_URL` without printing it.
- Set `COMMUNITY_COLLAB_INSTANCE_NAME=rgan-preview` and `rgan-production` respectively.
- Generate stable `GUARDIAN_HASH_SECRET` and 32-byte Base64 `GUARDIAN_DATA_ENCRYPTION_KEY` without stdout; store as Vercel sensitive variables for Preview and Production and in a local ignored mode-600 owner backup.
- Set `GUARDIAN_FLOW_MODE=manual` and `VITE_GUARDIAN_FLOW_MODE=manual` for Preview and Production. Do not configure webhook variables.

## 5. Verification and release

1. Run focused database/API/UI/Redis tests, full Vitest, API/backend type checks, targeted lint, and production build.
2. Apply the verified migration through the linked Supabase CLI and regenerate hosted TypeScript types.
3. Deploy Preview and verify page rendering, API auth/error boundaries, age routing, admin pending list, and Redis-backed WebSocket startup with `vercel curl` and runtime logs.
4. Deploy a Production candidate with `--prod --skip-domain`, repeat safe smoke checks, scan error logs, then promote it.
5. Confirm `www.rganjunior.org` serves the new build and collaboration no longer returns `COMMUNITY_COLLAB_REDIS_REQUIRED`.
6. Run secret-leak and git-diff checks, commit intentionally, push the branch, and update the existing draft PR.

## Explicit release gate

The hosted database contains only an inactive draft Guardian notice. Registration, onboarding, under-14 submission, Redis collaboration, and staff queue visibility can ship, but no staff confirmation may succeed until the owner supplies or activates a legally reviewed `guardian_informed_consent` document. This plan does not publish legal text.
