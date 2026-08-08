# Homepage Hero White Navigation and Background Tune Design

## Goal

Improve the opening Hero navigation contrast and make the forest background slightly brighter without changing its green identity or reintroducing the removed decoration layer.

## Approved design

- Change the Hero background from `hsl(160 100% 20%)` to `hsl(160 100% 22%)`, a 10% relative lightness increase.
- Keep saturation at the HSL gamut maximum of 100%; the requested additional 10% cannot exceed that limit.
- Render all Hero-state navigation text and icons in the existing warm white foreground at full opacity.
- Keep orange for navigation underlines, community actions, the Hero wordmark, and primary actions.
- Preserve the removed flow decoration layer, layout, content, mascot interaction, and responsive behavior.

## Verification

- Confirm the Hero background computes to `rgb(0, 112, 75)` (`#00704b`).
- Confirm active, inactive, and mobile Hero navigation foregrounds compute to warm white.
- Confirm the removed `.home-hero-flow` layer remains absent.
- Run the focused homepage test, production build, and browser computed-style checks.
