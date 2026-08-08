# Homepage Hero Foreground Softening and Decoration Removal Design

## Goal

Soften the homepage Hero's light foregrounds while simplifying its background, without changing its content, layout, mascot interaction, orange brand accents, or established forest background.

## Approved design

- Preserve the established Hero forest background (`hsl(160 100% 20%)`).
- Keep the orange wordmark and primary action colors unchanged.
- Render the subtitle, body, secondary action label, and main navigation foregrounds in 80% warm paper white.
- Remove the independent `HomeHeroFlow` layer, including its flowing lines, nodes, and paper overlays.
- Preserve the mascot, mascot link and tooltip, responsive layout, copy, and existing motion behavior.

## Approaches considered

1. **80% warm-paper foregrounds (selected):** keeps the approved forest surface while softening the Hero's white elements predictably.
2. **Lightened background:** changed the identity of the established forest Hero too strongly.
3. **Global translucent overlay:** would also wash out the mascot and orange accents.

## Verification

- Confirm the Hero background remains the established `#006644` forest green.
- Confirm primary light foregrounds render at 80% warm paper white.
- Confirm the flow decoration layer is absent from the homepage DOM.
- Check desktop and mobile text/control contrast and focus states.
- Run the focused homepage test, application typecheck, production build, and a browser smoke test.
