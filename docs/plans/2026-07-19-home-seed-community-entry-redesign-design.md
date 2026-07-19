# Homepage Seed Community Entry Redesign

## Goal

Redesign the homepage Seed Community entry so it feels like one warm community invitation rather than a floating label, an unrelated glow effect, and a separate button.

## Approved Direction

Use an invitation-letter composition that belongs to the homepage's warm paper-and-nature visual language.

- Keep the existing information hierarchy: Seed Community, youth / parents / partners, and the entry to `/join`.
- Place the content inside one spacious, warm invitation panel.
- Present the three identities as one connected rhythm instead of three independent cards.
- Use restrained seed-dot and fine-line details to suggest connection.
- Remove the floating capsule, blurred CTA field, and perpetual vertical drift.
- Animate the section as one unit with a single gentle reveal when it enters the viewport.
- Limit hover motion to a subtle panel lift or tint and a short arrow translation.
- Respect `prefers-reduced-motion` and keep the mobile layout stacked, legible, and fully tappable.

## Structure

The section contains one linked visual composition:

1. A small bilingual Seed Community kicker.
2. A large invitation heading using the existing youth / parents / partners message.
3. Three lightweight identity labels connected by a quiet horizontal rule on larger screens and stacked naturally on mobile.
4. One clear CTA leading to `/join`, visually integrated into the bottom of the invitation panel.

The CTA remains the semantic link. Decorative lines and seed marks are hidden from assistive technology.

## Motion

- Use one scroll reveal for the complete invitation panel.
- Do not run continuous idle animation.
- On hover and keyboard focus, slightly warm the panel border/background and move the arrow a few pixels.
- Disable nonessential transforms for reduced-motion users.

## Verification

- Run TypeScript, tests, lint, and production build.
- Inspect the homepage at desktop and 390px mobile widths.
- Confirm the `/join` link works, focus styling is visible, no horizontal overflow appears, and no console error is introduced.
