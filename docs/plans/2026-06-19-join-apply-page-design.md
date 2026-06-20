# Join Apply Page Design

Date: 2026-06-19

## Approved Direction

Split joining into two steps:

1. `/join` explains the three identities and lets visitors choose who they are.
2. `/join/apply?audience=...` is a focused form page for filling and submitting the application.

## Experience

- Keep `/join` as the orientation page with youth, parent, and partner tabs.
- Replace the embedded form on `/join` with clear buttons that pass the selected identity to the form page.
- Add `/join/apply` as a dedicated page with the form and a small back link to `/join`.
- The form page reads `audience` from the URL and preselects the matching identity.
- Visitors can still change identity from the form page if they arrived with the wrong option.

## Data Flow

- Keep the existing `/api/join` Vercel Function and Google Form environment-variable mapping.
- The apply page submits the same payload, with `page` set from the current pathname.
- No Google Form configuration is exposed in the browser.

## Verification

- Update tests so `/join` no longer expects form fields.
- Add coverage for the dedicated apply page.
- Run TypeScript, tests, lint, build, and browser checks for `/join` and `/join/apply`.
