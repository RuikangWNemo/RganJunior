# Horizontal Brand Wordmark Design

## Goal

Replace the homepage hero's typeset `阿柑少年` heading with the four custom
letterforms from the official logo, arranged horizontally as a true vector
wordmark.

## Design

- Trace the four Chinese letterforms from the archived official logo source.
- Exclude the logo's exclamation mark, English subtitle, and orange background.
- Store the result as SVG paths in a reusable React component.
- Use `currentColor` so the wordmark keeps the hero heading's existing dark
  foreground color and hover/theme behavior.
- Preserve the current hero heading's entrance animation, responsive position,
  and semantic `h1` structure.
- Keep a localized accessible name while treating the SVG paths as decorative.

## Verification

- Confirm the four glyphs render left-to-right without clipping.
- Check mobile and desktop hero layouts in the browser.
- Run the existing test suite and production build.
