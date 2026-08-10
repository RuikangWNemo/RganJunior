# Community Website Analytics Design

**Date:** 2026-08-10
**Status:** Approved

## Goal

Add a real-data website analytics area to the community administration interface. Administrators should be able to understand current activity, traffic volume, effective time on site, popular public pages, and acquisition sources without identifying individual visitors.

The system starts collecting after the feature is deployed. It never invents or backfills historical data.

## Scope

The first release tracks public website routes only. It excludes all `/community/**` routes, administrator pages, URL query strings, account data, and private content.

The administrator experience lives at `/community/admin/analytics` and follows the existing bilingual Community Chrome visual system.

## Privacy Model

- Analytics are anonymous and aggregate-oriented.
- No name, email, community account ID, raw IP address, or full referrer URL is stored.
- The browser generates a short-lived random session ID and keeps it in `sessionStorage` only.
- Stored location data is limited to the normalized public path.
- Stored source data is limited to the referrer hostname and a derived source category.
- Only whitelisted, length-limited UTM fields may be recorded. All other query parameters are discarded.
- Device data is reduced to a broad category such as desktop, tablet, or mobile.
- Database timestamps are UTC; presentation uses the administrator's locale.

## Collection Architecture

A small client analytics module runs for public routes. It sends:

- a page-view event after a qualifying public route becomes active;
- an engagement heartbeat every 15 seconds while the page is visible and focused;
- a final best-effort engagement update through `sendBeacon` when the page is hidden or unloaded.

The public client posts to `/api/analytics/collect`. The endpoint validates the origin, event schema, route allowlist, field lengths, and engagement delta. It rejects community routes, malformed events, impossible durations, and events submitted too frequently. Obvious bot user agents are ignored. Collection failures never block navigation or surface errors to visitors.

The endpoint is the only public writer. The Supabase service role remains server-side and is never included in the browser bundle.

## Data Model

The database stores anonymous sessions and page visits with enough information to calculate:

- page views;
- anonymous sessions;
- currently active sessions;
- effective engaged time;
- landing pages and popular pages;
- direct, search, social, referral, and campaign sources;
- hourly and daily trends.

Raw anonymous records are retained for 90 days. Daily aggregate rows may be kept long-term. Cleanup and aggregation are idempotent so they can be run safely on a schedule.

## Reporting Start Date

Collection is always active after deployment. A configurable reporting start date controls the earliest data included in historical reports, but it does not pause collection or delete collected records.

- Administrators with `analytics.manage` can adjust the reporting start date.
- Metrics, trends, sources, and popular pages recalculate immediately from the selected date.
- The interface displays the earliest available collection date when the requested date predates available data.
- Current-online and recent-activity panels are not constrained by the reporting start date.
- Changes record the actor and timestamp in the existing audit system.

## Permissions and Security

Two permissions are introduced:

- `analytics.read` grants access to the analytics dashboard and aggregate read APIs.
- `analytics.manage` grants access to reporting-start-date settings.

Analytics tables use row-level security. Visitors, regular members, and browser clients cannot read raw analytics rows. Administrator APIs validate the authenticated Supabase session and required permission before returning a strict response schema. They never proxy service credentials or unrestricted database responses.

## Administrator Experience

The new “Website analytics / 网站统计” item appears in the Community administration navigation for users with `analytics.read`.

The dashboard includes:

1. **Live summary** — current sessions active within the last five minutes, today's page views, today's anonymous sessions, and average effective engagement time.
2. **Traffic trend** — page views and sessions over 24 hours, 7 days, 30 days, or 90 days.
3. **Popular pages** — normalized page, views, average engagement time, and share of total traffic.
4. **Traffic sources** — direct, search, social, referral, and campaign categories with source-host detail.
5. **Recent activity** — anonymous visit time, public page, and source category. It contains no personal identifiers.
6. **Analytics settings** — reporting start date, earliest available date, last change metadata, and an explanation that collection is continuous.

The live area refreshes every 15 seconds and shows the last successful update. Historical filters do not change the live panels. Empty states explicitly explain that data is available only after collection begins; mock numbers are never shown.

The layout uses the existing paper, forest, amber, and orange community palette. Desktop presents a compact KPI row and two-column analytical sections; mobile stacks all content in reading order. Charts have accessible text summaries, keyboard-reachable controls, and reduced-motion behavior.

## Query and Error Behavior

The dashboard queries a protected server endpoint that returns a validated, aggregate-only payload. Historical requests accept a bounded date range and interval. Live requests use a fixed five-minute window.

If a refresh fails, the page retains the last successful data, marks it as stale, and offers retry. A complete first-load failure uses the existing Community error state. Empty results are distinct from errors.

## Verification

Verification will cover:

- route normalization and exclusion of `/community/**`;
- referrer and UTM sanitization;
- visible-time engagement calculation and capped heartbeat deltas;
- collection endpoint validation and frequency limits;
- analytics RLS and read/manage permission boundaries;
- reporting start-date behavior and audit recording;
- dashboard loading, empty, stale, and error states;
- bilingual labels, date formatting, responsive layout, and accessible chart summaries;
- full application typecheck, relevant Vitest suites, and production build;
- browser verification at desktop and mobile sizes.

## Operational Notes

- No historical data exists before the deployment that introduces collection.
- The dashboard should communicate the earliest available collection timestamp.
- Data retention and collection volume should be reviewed after real traffic establishes a baseline.

