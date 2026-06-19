# Seed Community Entry Simplification

## Goal

Simplify the homepage seed community section so it feels like one clear invitation instead of a dense set of choices.

## Approved Direction

Use one central join entry for three audiences:

- Becoming an R'gan Junior youth
- Becoming an R'gan Junior parent
- Becoming a partner

The three identities should appear as lightweight relationship labels near the main entry. The organic Strands animation should appear as one larger centered wave directly under the main heading, instead of splitting into separate waves under the left and right identity labels. The join button keeps only a subtle hover/focus response behind it.

## Implementation Notes

- Keep the section in `src/components/home/SeedCommunity.tsx`.
- Replace the three detailed cards with a concise title, identity labels, and one primary button linking to `/join`.
- Reuse `joinAudiences` for bilingual identity labels.
- Remove the explanatory paragraph under the heading.
- Keep the button motion centered behind the CTA and make hover/focus/press states feel interactive.
- Preserve reduced-motion behavior by keeping Strands hidden for users who prefer reduced motion.
- Verify the homepage still builds and the section remains readable on desktop and mobile.
