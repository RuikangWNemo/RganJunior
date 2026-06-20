# Join Form To Google Form Design

Date: 2026-06-19

## Approved Direction

Add a real application form to the Join page. Visitors submit from the website; a Vercel Function receives the payload and forwards it to a configured Google Form `formResponse` endpoint. Google Form responses can then feed Google Sheets for statistics, and Google Forms can notify `contact@rganjunior.org`.

## Frontend

- Place the form in the existing Join contact section, replacing the "form to be published" state.
- Keep the three existing join audiences: youth, parents, and partners.
- Include practical fields for follow-up and statistics: audience, name, age/grade or role, school/organization, city, contact method, interests, message, and consent.
- Use bilingual labels through the current language context.
- Submit with `fetch('/api/join')`, showing loading, success, and error states.
- Include a hidden honeypot field to reduce bot submissions.

## Vercel Function

- Add `api/join.js` as a Node.js Vercel Function.
- Accept POST JSON only.
- Validate required fields server-side.
- Map payload fields to Google Form `entry.*` IDs from environment variables.
- Return clear JSON responses for success, validation failure, and configuration/server errors.
- Do not expose Google Form action URLs or entry IDs in the browser bundle.

## Configuration

Required Vercel environment variable:

- `JOIN_GOOGLE_FORM_ACTION_URL`

Recommended field mapping variables:

- `JOIN_GOOGLE_FORM_ENTRY_AUDIENCE`
- `JOIN_GOOGLE_FORM_ENTRY_NAME`
- `JOIN_GOOGLE_FORM_ENTRY_AGE_GRADE`
- `JOIN_GOOGLE_FORM_ENTRY_ORGANIZATION`
- `JOIN_GOOGLE_FORM_ENTRY_CITY`
- `JOIN_GOOGLE_FORM_ENTRY_CONTACT`
- `JOIN_GOOGLE_FORM_ENTRY_INTERESTS`
- `JOIN_GOOGLE_FORM_ENTRY_MESSAGE`
- `JOIN_GOOGLE_FORM_ENTRY_LANGUAGE`
- `JOIN_GOOGLE_FORM_ENTRY_SUBMITTED_AT`
- `JOIN_GOOGLE_FORM_ENTRY_PAGE`

Optional notification webhook:

- `JOIN_NOTIFICATION_WEBHOOK_URL`

This can point to a Google Apps Script, Zapier, Make, or other service if email notification needs to be handled outside Google Forms.

## Notes

Google Form field IDs are tied to the exact form fields. If the Google Form is edited later, the `entry.*` mappings may need to be updated in Vercel.
