# Join Page Primary CTA Design

## Goal

Give the Join Us page an unmistakable primary action that sends visitors directly to the existing application form.

## Considered approaches

1. Place the CTA in the lower-left of the green stage, to the left of the mascot. This makes the action part of the community scene without attaching it to one identity.
2. Attach the CTA to the youth identity on the path. This is visually compact, but could incorrectly imply that the application is youth-only.
3. Place the CTA above the mascot guide. This keeps related actions together, but would compete with the guide's prompts and panel.

## Approved design

Use the first approach. Remove the CTA from the light cover and place it in the green community stage. On desktop, anchor it in the open lower-left area to the left of the mascot. On mobile, keep it in document flow after the identity path and before the mascot so it remains visible without overlapping either element.

Reuse the homepage `Button`, `btn-apple` pill shape, and arrow icon. Use the Join page's orange accent as the fill so the CTA remains distinct on the green background. Label it “立即加入 / Join Now” and link it to `/join/apply`.

The existing role path and role-specific application links remain unchanged. Visiting the form without an audience query continues to use the form's existing default audience.

## Verification

- Assert that the Join Us page exposes a clearly named link to `/join/apply` inside the green community section rather than the cover.
- Run the focused Join Us test suite.
- Run a production build to catch type or styling integration failures.
