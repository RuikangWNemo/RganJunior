# About Full-Bleed Hero Design

## Goal

Turn the About page's opening split layout into an immersive, full-bleed photographic hero while preserving the approved copy, brand wordmark, image caption, and accessible document structure.

## Approved direction

Use the existing Tieniu Village aerial photograph as a full-viewport background below the 80px site navigation. Place the complete hero copy over the image in a left-aligned editorial composition.

The hero uses a layered scrim: a stronger horizontal gradient behind the copy, a light full-frame tonal wash, and a darker lower edge. This keeps the photograph visible while maintaining readable text across landscape and portrait crops. Text becomes warm white, with the short growth statement and body copy visually subordinate to the title.

The caption remains attached to the image at the lower right in a restrained translucent treatment. The layout stays static, with no parallax or decorative motion.

## Responsive behavior

- Desktop and wide screens: hero height is the viewport minus the 80px navigation; content sits left of center with a controlled line length.
- Tablet: retain the overlay composition, rebalance the copy width, and shift the image focal point to preserve the village landscape.
- Mobile: keep text on the image, move it lower in the frame, reduce title sizing, and use a portrait-safe crop without horizontal overflow.
- Short viewports: allow the hero to grow beyond the viewport when needed so content and caption never collide or clip.

## Accessibility and verification

- Preserve the existing `h1`, accessible label, image alternative text, and eager image loading.
- Keep sufficient text/background contrast through the scrim rather than a separate card.
- Verify 390, 768, 820, 1024, and 1440px widths, with particular attention to crop, text wrapping, caption placement, and horizontal overflow.
- Run the About page tests, application typecheck/build, and browser-based visual checks.
