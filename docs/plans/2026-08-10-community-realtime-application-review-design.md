# Community realtime application review design

## Goal

Keep community clients current after relevant data changes, make new membership applications appear automatically for administrators, and show the applicant's stated reason in the review interface.

## Chosen approach

Use Supabase Realtime database-change subscriptions for low-latency updates, with focus and network-recovery refreshes as a reliability fallback. This avoids constant polling while still recovering if a realtime event is missed or the browser sleeps.

## Data model and access

- Extend the permission-gated `list_membership_applications` RPC result with `motivation`, `hopes`, `contribution`, and `additional_info`.
- Keep application content behind the existing `memberships.review` permission check in the private security-definer function; do not add a broad client-side `SELECT` policy for application bodies.
- Allow authorized reviewers to receive only the change signal needed to trigger the permission-gated RPC reload. If direct Postgres Changes cannot preserve that boundary, use a narrowly scoped database broadcast trigger instead.

## Client data flow

- The administrator application page loads the pending queue as it does today.
- While mounted, it subscribes to application change notifications. Any insert or update schedules a deduplicated, silent reload of the queue.
- The initial load keeps its current loading state. Background reloads retain the rendered list so the page does not flash or discard in-progress review text.
- On window focus and browser `online`, the page reloads as a fallback.
- The authenticated community state listens for changes relevant to the current user and calls the existing `refreshCommunity()` path. Profile settings also refresh that state immediately after a successful save.

## Review interface

- Each application card contains a clearly labeled application-information section.
- “Why would you like to join?” is always shown as the primary reason.
- Optional hopes, contribution, and additional information appear only when supplied.
- User-entered text is rendered as plain React text with preserved line breaks, never as HTML.

## Failure handling

- Realtime connection failures do not block reading or reviewing applications.
- Focus and network-recovery refreshes repair missed updates.
- Background refresh errors preserve the current list and surface the existing retryable error state.
- Subscriptions, event listeners, and queued reloads are cleaned up when their owner unmounts.

## Verification

- Database tests prove reviewers receive application reasons and unauthorized users cannot call the review RPC.
- Component tests prove application text is visible and realtime/focus events reload the queue without a manual refresh.
- Auth/settings tests prove saved or remotely changed community information refreshes client state.
- Run focused Vitest suites, application/backend type checks, and the production build.
