# Community Manual Guardian Review and Redis Design

**Date:** 2026-08-09  
**Status:** Approved  
**Scope:** Community age routing, manual guardian confirmation, collaboration Redis, and deployment configuration

## Objective

Keep Community registration open to every age band while preventing an under-14 applicant from receiving membership privileges before a staff member has contacted a parent or guardian and recorded explicit confirmation. Preserve the existing automated Guardian invite and OTP foundation for a later rollout. Restore production collaborative editing with managed TLS Redis.

## Approved Product Decisions

- Every age band can create an account, complete onboarding, and submit a Community application.
- Applicants aged 18 or older and applicants aged 14–17 enter the normal staff review queue without Guardian confirmation.
- Applicants under 14 enter `pending_guardian` after submission.
- An under-14 applicant may sign in and view the application state, but cannot enter member surfaces, publish, message, upload, or collaborate before both manual Guardian confirmation and membership approval.
- Staff contact the parent or guardian outside the product by phone or email, verify the relationship, communicate the applicable notice, and obtain explicit confirmation.
- Staff record only the minimum evidence needed to audit the confirmation. Identity-document bodies or full document numbers must never be copied into notes.
- Existing automated invite, OTP, consent, withdrawal, and audit structures remain in place but are hidden while the manual mode is active.
- Vercel Marketplace Upstash Redis is the preferred collaboration provider. Preview and Production must use isolated data, either through separate instances or separate key prefixes.

## Legal and Safety Boundary

Under-14 personal information is treated as sensitive. Staff approval is not a substitute for Guardian consent. The system must continue blocking membership approval until Guardian confirmation is recorded. This design is an implementation control and not a replacement for legal review of the notices, retention schedule, or operating procedure.

Relevant official references:

- Personal Information Protection Law, Articles 28 and 31: https://www.npc.gov.cn/WZWSREL25wYy9jMi9jMzA4MzQvMjAyMTA4L3QyMDIxMDgyMF8zMTMwODguaHRtbD9yZWY9aW1i
- Regulations on the Protection of Minors Online: https://www.cac.gov.cn/2023-10/24/c_1699806932316206.htm

## User Flows

### Adult and Age 14–17

1. The applicant selects the age band and creates an account.
2. The applicant completes onboarding and submits the Community application.
3. The application enters the normal review queue.
4. Staff approve, reject, or request changes through the existing review controls.

### Under 14

1. The applicant selects `under_14`, creates an account, and completes the same onboarding and application form.
2. Submission transitions the application to `pending_guardian`.
3. The application status page explains that staff will contact the parent or guardian; automated SMS or OTP controls are not shown.
4. Staff review the supplied Guardian contact, contact the Guardian, and record the result.
5. A successful manual confirmation marks Guardian consent as verified and moves the application into the normal review queue.
6. Staff separately approve membership. Guardian confirmation alone never grants membership.
7. A failed, withdrawn, or expired confirmation keeps the account outside all member-only capabilities.

## Staff Experience

The application review interface shows age band, Guardian state, and identity-verification state. For an under-14 application in `pending_guardian`, authorized staff receive a manual confirmation form containing:

- contact method: phone or email;
- relationship and Guardian name confirmation;
- confirmation timestamp;
- legal notice/version presented;
- three required affirmations equivalent to the automated flow;
- concise verification basis and internal notes;
- confirm or decline action.

The form must explicitly warn staff not to paste full identity-document information. Actions are locked while a request is in flight and are idempotent when repeated.

## Data and API Design

- Reuse the existing private Guardian request, consent, event, and legal-document structures wherever possible.
- Add an administrator-only RPC for recording manual Guardian confirmation. It must:
  - require an authenticated administrator capability;
  - verify the application belongs to an under-14 user;
  - require an active Guardian legal document;
  - require all affirmations and a non-empty verification basis;
  - write an immutable Guardian consent record and audit event;
  - mark `guardian_consent_status` as `verified`;
  - move `pending_guardian` applications into the normal submitted/review state;
  - remain idempotent for the same application and confirmation.
- Add an administrator-only decline path if the existing decline RPC cannot represent manual contact cleanly.
- Do not expose private Guardian tables through the Data API. Public wrappers must grant execution only to the roles that need them and perform their own authorization checks.
- Keep the existing automated provider endpoints and OTP RPCs unchanged unless a compatibility adjustment is necessary.

## Feature Mode

Introduce a server-side Guardian mode with a corresponding safe client indicator:

- `GUARDIAN_FLOW_MODE=manual` controls server behavior.
- `VITE_GUARDIAN_FLOW_MODE=manual` controls which UI is shown and contains no secret.
- `manual` hides invite and OTP controls and shows the staff-contact status.
- A future `automated` value restores the existing invite/OTP experience without discarding stored consent history.

The server remains authoritative. Client flags must never weaken database or API authorization.

## Permission Gating

- Account creation and public-site access remain available to every age band.
- Existing Community entry state must keep under-14 users outside member routes until `guardian_consent_status = 'verified'` and membership is approved.
- Publishing, messaging, uploads, collaboration, and other member RPCs must enforce the same server-side state rather than relying on route redirects.
- Ages 14–17 no longer require Guardian verification for membership approval in manual mode, but remain subject to ordinary identity and staff-review requirements.
- Withdrawing Guardian consent after approval re-suspends under-14 membership through the existing safety controls.

## Secret Management

- Generate independent high-entropy values for `GUARDIAN_HASH_SECRET` and `GUARDIAN_DATA_ENCRYPTION_KEY`.
- The encryption value must be 32 random bytes encoded in Base64.
- Store secrets only in Vercel Preview and Production environment variables and in the owner's durable secret backup. Never expose them through `VITE_` variables, logs, PR text, or source control.
- Automated delivery webhook variables are not required while manual mode is active.
- Rotation must account for encrypted Guardian contact data and existing lookup hashes; these values must not be replaced casually.

## Collaboration Redis

- Provision managed Redis through Vercel Marketplace using Upstash.
- Use a TLS `rediss://` connection string for `COMMUNITY_COLLAB_REDIS_URL`.
- Scope Redis credentials to Preview and Production without exposing them to the browser.
- Use distinct `COMMUNITY_COLLAB_INSTANCE_NAME` values and isolated Redis data for each environment.
- Keep the collaboration server's fail-closed production behavior when Redis is absent or invalid.

## Error Handling

- Missing Guardian secrets in manual confirmation returns a structured configuration error and does not partially update an application.
- Duplicate confirmation returns the existing confirmed result rather than creating another consent.
- Declined contact records the reason and leaves the application blocked.
- Redis connection or synchronization failures prevent collaborative mode from silently falling back to unsafe per-instance state.
- All provider, confirmation, and collaboration errors are logged without contact values, tokens, OTPs, or secrets.

## Verification

### Automated

- Database tests for adult, age 14–17, and under-14 submission transitions.
- Database tests proving staff cannot approve an under-14 application before Guardian confirmation.
- Authorization tests for the manual confirmation RPC and private tables.
- Idempotency, decline, withdrawal, and audit-event tests.
- UI tests for age routing, manual-mode copy, hidden OTP controls, and staff action locking.
- Existing unit, type, lint, and production-build checks.

### Deployment

1. Apply and verify the Supabase migration in a transaction-safe sequence.
2. Configure Guardian mode and stable secrets in Vercel Preview.
3. Provision isolated Preview Redis and deploy.
4. Verify registration and approval with adult, age 14–17, and under-14 test accounts.
5. Verify two-account collaborative editing and cross-instance presence.
6. Configure Production variables and Redis, deploy a production candidate without changing the domain, and repeat smoke tests.
7. Promote the verified candidate and scan runtime errors.

## Non-Goals

- Sending Guardian SMS or OTP in this rollout.
- Removing the existing automated Guardian schema or APIs.
- Storing identity-document images or full document numbers.
- Letting manual Guardian confirmation automatically approve Community membership.
- Allowing Redis-free collaboration in Production.
