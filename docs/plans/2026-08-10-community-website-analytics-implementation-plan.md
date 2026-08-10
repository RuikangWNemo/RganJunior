# Community Website Analytics Implementation Plan

**Date:** 2026-08-10
**Design:** `docs/plans/2026-08-10-community-website-analytics-design.md`

## Objective

Implement continuous anonymous analytics for public routes and expose aggregate-only real-time and historical reporting inside the Community administrator interface. Preserve all existing uncommitted website work and avoid new runtime dependencies.

## Phase 1 — Database and authorization foundation

### Files

- Create migration through `supabase migration new website_analytics`.
- Add `supabase/tests/database/014_website_analytics.sql`.
- Update `supabase/seed.sql`.
- Update `src/lib/supabase/database.types.ts` with the generated/verified public RPC contracts if hosted generation is unavailable.

### Schema

Create private-schema tables with RLS enabled and no browser grants:

- `private.website_analytics_settings`: singleton reporting start date, collection start timestamp, last cleanup date, update actor, and update timestamp.
- `private.website_analytics_sessions`: anonymous UUID, first/last activity, landing/last public path, source/referrer summary, device category, language, page-view count, and accumulated effective engagement seconds.
- `private.website_analytics_page_views`: client-generated UUID, anonymous session UUID, normalized public path, occurrence timestamp, sanitized source/UTM dimensions, device/language, and effective engagement seconds.

Add bounded checks and indexes for time-range, active-session, path, source, and session queries. Raw sessions and page views older than 90 days are removed opportunistically once per UTC day by the service-role record path, avoiding a hidden dependency on a hosted Cron module.

### Permissions

- Add `analytics.read` and `analytics.manage` idempotently.
- Assign both to Admin and Super Admin in the migration and seed.
- Keep all tables inaccessible to `anon` and `authenticated`.

### Functions

- A private service-role-only record function inserts idempotent page views, updates sessions, applies capped engagement deltas, and runs bounded daily retention cleanup.
- A private permission-checked aggregate function returns one JSON payload for `24h`, `7d`, `30d`, or `90d` ranges.
- A private permission-checked settings function changes only the reporting start date and writes through the existing audit helper.
- Public-schema security-invoker wrappers expose only the exact record/query/settings functions to their intended roles.
- Revoke default `PUBLIC` function execution and grant explicitly.

### Database verification

The rollback test will prove:

- raw tables are unreadable to anonymous and ordinary authenticated roles;
- service-role recording is idempotent and ignores invalid/cross-session engagement;
- engagement and active-session calculations use capped visible time;
- reporting dates clamp historical results but do not affect live counts;
- read/manage permissions are distinct;
- setting changes retain the prior data and create an audit row;
- retention removes only records older than 90 days.

## Phase 2 — Shared analytics model and public tracker

### Files

- Add `src/lib/websiteAnalytics.ts` and focused unit tests.
- Add `src/services/website-analytics/index.ts` and focused service tests.
- Add `src/components/WebsiteAnalyticsTracker.tsx` and focused lifecycle tests.
- Mount the tracker in `src/components/Layout.tsx` for non-Community routes.

### Browser behavior

- Normalize pathname only; reject `/community` and malformed/private paths.
- Create a session UUID in `sessionStorage`; create a new page-view UUID per routed page view.
- Capture only referrer hostname, broad source category, broad device class, UI language, and bounded `utm_source`, `utm_medium`, and `utm_campaign` fields.
- Send a page-view event after a qualifying route is active.
- Accumulate effective time only while `document.visibilityState === 'visible'` and the window has focus.
- Flush deltas at 15-second intervals and on page hide/unload. Use ordinary fetch during the session and `sendBeacon` for final best-effort delivery.
- Do not throw into the public UI when analytics is unavailable.

## Phase 3 — Server APIs

### Files

- Add `api/analytics/collect.ts` with API tests.
- Add `api/community/website-analytics.ts` with API tests.

### Public collection endpoint

- Accept POST only and return no-store responses.
- Validate same-origin browser requests where an Origin header is present.
- Reject Community routes and invalid UUIDs/fields before creating a secret Supabase client.
- Hash the request IP in memory with a domain-separated HMAC based on the existing server-only Supabase secret, then reuse the persistent private rate limiter. Never store or return the raw IP.
- Ignore obvious automated user agents.
- Call only the service-role record RPC and return a minimal `{ ok: true }` response.

### Administrator endpoint

- Require `analytics.read` before the dashboard action.
- Accept only the four bounded range identifiers.
- Return a validated aggregate payload containing generation time, settings, summary, trend, popular pages, sources, and recent anonymous activity.
- Require `analytics.manage` separately for the settings action.
- Validate an ISO calendar date and call the user-scoped settings RPC so the existing audit helper receives the authenticated actor.
- Map authentication/validation/database failures to stable no-store JSON codes without leaking database details.

## Phase 4 — Administrator route and dashboard

### Files

- Add `src/pages/community/CommunityAdminAnalytics.tsx` and tests.
- Update `src/App.tsx`.
- Update `src/components/community/CommunityShell.tsx` and tests.
- Update `src/components/community/CommunityChrome.tsx` and tests.
- Update `src/lib/communityNavigation.ts`.
- Update `src/lib/communityUi.ts`.
- Add narrowly scoped analytics styles to `src/index.css`.

### UI behavior

- Add `/community/admin/analytics` under `CommunityRequirePermission permission="analytics.read"`.
- Add the bilingual “网站统计 / Website analytics” admin link using the existing Lucide `ChartLine` icon selected through Better Icons.
- Load the dashboard immediately and refresh live data every 15 seconds.
- Keep the last successful payload visible on refresh errors and mark it stale.
- Show four KPI cards: active now, today's page views, today's sessions, and average effective engagement.
- Show the selected-range traffic trend with an accessible text summary and Recharts line/area treatment.
- Show popular-page and source panels plus recent anonymous activity.
- Add a reporting-start-date form only for users with `analytics.manage`, with earliest-available-data and continuous-collection explanations.
- Use the existing Community loading/error/empty states, bilingual formatting, responsive grids, reduced-motion handling, and keyboard-visible controls.

## Phase 5 — Verification and rollout notes

### Automated checks

Run:

- focused tracker/helper/service/API/page/navigation tests;
- backend/API TypeScript;
- app TypeScript;
- targeted ESLint for changed TypeScript/TSX files;
- full relevant Vitest suite;
- production build;
- `git diff --check`.

Run the new SQL regression in a rollback transaction against an available Supabase database. Run Supabase advisors when the required CLI/tool access is available.

### Browser checks

- Public navigation records one view per route and never sends Community paths.
- Background tabs do not accrue engagement time.
- Desktop and mobile analytics pages have no overflow, overlays, or unreadable chart/table content.
- Range controls, live refresh, stale state, empty state, and reporting-date save behave correctly.
- A user with read-only analytics permission cannot change settings.

### Rollout boundary

- Code deployment starts collection; pre-deployment traffic cannot be backfilled.
- The local migration must be applied to the linked Supabase project before deploying the client tracker and administrator route.
- After deployment, verify the first real page view and heartbeat, then confirm the administrator dashboard reads aggregate values only.
