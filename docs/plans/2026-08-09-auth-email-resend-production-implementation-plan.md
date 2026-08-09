# Auth Email Resend Production Implementation Plan

> Approved design: `docs/plans/2026-08-09-auth-email-resend-production-design.md`

## Task 1: Pin the email toolchain

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`

**Steps:**

1. Install exact runtime versions: `resend@6.18.1`, `@react-email/components@1.0.12`, `standardwebhooks@1.0.0`.
2. Install exact dev version: `react-email@6.9.2`.
3. Add an `email:dev` script without changing existing framework versions.
4. Confirm React 18 and Node 24 satisfy peer and engine requirements.

## Task 2: Build and test the trusted hook boundary

**Files:**

- Create: `api/_lib/auth-email/config.ts`
- Create: `api/_lib/auth-email/schema.ts`
- Create: `api/_lib/auth-email/supabase-hook.ts`
- Create: `api/_lib/auth-email/urls.ts`
- Create: `api/_lib/auth-email/logging.ts`
- Test: `api/_lib/auth-email/*.test.ts`

**Steps:**

1. Write failing tests for hook secret normalization and valid/invalid/missing/modified signatures.
2. Implement raw-body Standard Webhooks verification.
3. Write failing tests for payload validation, known actions, unknown actions, recipient derivation and locale selection.
4. Implement a strict-but-forward-compatible schema that never sends an unknown action.
5. Write failing redirect tests for canonical domains, malicious domains, `javascript:` and preview behavior.
6. Implement confirmation URL construction with a production allowlist.
7. Write failing log redaction tests and implement masked operational logs.

## Task 3: Build the branded email system

**Files:**

- Create: `emails/types.ts`
- Create: `emails/copy.ts`
- Create: `emails/components/EmailLayout.tsx`
- Create: `emails/components/EmailLogo.tsx`
- Create: `emails/components/VerificationCode.tsx`
- Create: `emails/components/EmailButton.tsx`
- Create: `emails/components/EmailFooter.tsx`
- Create: `emails/auth/*.tsx`
- Create: `emails/previews/*.tsx`
- Create: a compatible official email logo derivative under `public/brand/`
- Test: `tests/auth-email/templates.test.tsx`

**Steps:**

1. Write failing render tests for Chinese and English, action-specific titles, CTA, copyable OTP, logo fallback and plain text.
2. Implement the shared email-safe layout with inline styles, warm paper colors and minimal citrus/leaf decoration.
3. Implement authentication templates for signup, sign-in code, Magic Link, recovery, invite, email change and reauthentication.
4. Implement shared security notification rendering.
5. Add local React Email previews for the mandatory flows.
6. Verify rendered HTML has no tracking pixels or user-controlled arbitrary HTML.

## Task 4: Implement deterministic dispatch and Resend delivery

**Files:**

- Create: `api/_lib/auth-email/dispatch.tsx`
- Create: `api/auth/send-email.tsx`
- Test: `api/_lib/auth-email/dispatch.test.tsx`
- Test: `tests/api/auth-send-email.test.ts`

**Steps:**

1. Write failing dispatch tests for every supported action.
2. Add mandatory Secure Email Change tests for current and new address token/hash pairs.
3. Implement server-controlled subjects, recipients, props, HTML and text.
4. Write endpoint tests for method rejection, signature failure, payload failure, successful send and provider failure.
5. Add stable non-secret idempotency keys based on Webhook ID, action and recipient role.
6. Implement the Vercel Function using raw request bytes and fast explicit Hook error responses.
7. Ensure Resend errors propagate and successful responses return `200 {}`.

## Task 5: Integrate with the existing repository

**Files:**

- Modify: `.env.example`
- Modify: `src/pages/community/CommunityAuth.tsx`
- Modify: relevant auth UI tests
- Modify: TypeScript/Vitest config only if required
- Create: `docs/auth-email.md`

**Steps:**

1. Add only secret names and safe placeholders to `.env.example`.
2. Change the email OTP resend countdown from 30 to 60 seconds without touching unrelated auth behavior.
3. Document architecture, local preview, environment variables, Resend, Cloudflare, Supabase Hook, testing, troubleshooting, security and rollback.
4. Keep existing SMTP/provider configuration intact for rollback.

## Task 6: Verify the code release

**Commands:**

1. Run targeted auth-email tests during development.
2. Run `npm test`.
3. Run `npm run typecheck`.
4. Run `npm run typecheck:app`.
5. Run `npm run lint`.
6. Run `npm run build`.
7. Start React Email preview and verify mandatory templates compile.
8. Review `git diff --check`, the changed-file list and secret scanning results.

## Task 7: Production rollout and evidence

**Steps:**

1. Deploy the code while the Supabase Send Email Hook remains disabled.
2. Add and verify `auth.rganjunior.org` in Resend.
3. Copy only the actual Resend-generated DNS records into Cloudflare and configure DMARC deliberately.
4. Configure Vercel Production secrets; keep the production API key out of Preview unless explicitly required.
5. Exercise a signed endpoint test.
6. Keep the Email Provider enabled and then enable the Supabase HTTP Send Email Hook.
7. Run Signup, OTP, wrong OTP, recovery, Magic Link and Secure Email Change E2E tests.
8. Verify Gmail plus one mainland-China mailbox and inspect SPF, DKIM and DMARC headers.
9. Report every external status as verified, failed or a precise remaining manual action; never infer dashboard success.
