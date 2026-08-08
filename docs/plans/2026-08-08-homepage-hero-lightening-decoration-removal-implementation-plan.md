# Homepage Hero Foreground Softening and Decoration Removal Implementation Plan

1. Remove the `HomeHeroFlow` import and render call from the homepage.
2. Preserve the original forest background token.
3. Set the primary Hero copy, secondary action, and navigation foreground treatments to 80% warm paper white.
4. Run focused tests, typechecking, and a production build.
5. Inspect the rendered desktop and mobile Hero for color, contrast, and removed decorations.
