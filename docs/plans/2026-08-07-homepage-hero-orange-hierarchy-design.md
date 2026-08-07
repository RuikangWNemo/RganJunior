# Homepage Hero Orange Hierarchy Design

## Goal

Refine the green homepage hero with a brighter, more saturated orange hierarchy, a larger mascot, and clearer separation between primary and secondary actions.

## Approved design

- Move the complete mascot-and-copy composition farther right on desktop, targeting roughly 48–56 pixels depending on viewport width.
- Remove all horizontal composition offset on mobile.
- Increase the mascot's rendered size by 20% at desktop and mobile breakpoints while preserving its existing pointer and idle motion.
- Render the R'gan Junior wordmark in a vivid high-saturation tangerine that is bright without becoming pale or pink.
- Give the homepage `Join the next camp` CTA and the top-nav `Community` entry the same saturated orange background and deep forest-green text.
- Keep `Explore programs` as the secondary paper-colored outline action so its text treatment remains visibly distinct from the primary CTA.
- Change the mascot's community tooltip hover/focus state to the same orange-and-forest palette, including its border and pointer.
- Preserve the full-height green hero, hard transition to the next section, current content, accessibility focus states, and reduced-motion behavior.

## Verification

- Check desktop composition offset and mobile zero offset through computed styles.
- Confirm the mascot is approximately 20% larger at desktop and mobile breakpoints.
- Confirm the wordmark is bright and saturated and that both primary entry backgrounds match.
- Confirm the primary CTA text differs from the secondary action text treatment.
- Confirm the mascot tooltip hover/focus rule uses the orange palette.
- Run focused tests, lint, production build, desktop/mobile browser checks, and console-error checks.
