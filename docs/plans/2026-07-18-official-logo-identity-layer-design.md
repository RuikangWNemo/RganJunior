# Official Logo Identity Layer Design

## Goal

Archive the supplied official `阿柑少年 / R-Gan Junior` logo without altering the source artwork, then use it as the website's formal identity layer while preserving the existing orange mascot as the site's friendly navigation, motion, and favicon identity.

## Brand roles

- **Official logo:** source archive, footer identity, organization structured data, and social sharing.
- **Mascot:** navigation, splash and hero motion, companion interactions, and small favicon surfaces.
- The official lettering, proportions, and colors must not be redrawn or edited.

## Assets

1. Store a byte-for-byte copy of the supplied 732 × 732 JPEG under the public branding archive with a descriptive filename.
2. Record the source format, dimensions, archive date, and SHA-256 checksum beside the master.
3. Produce a browser-oriented square derivative for visible and machine-readable logo use.
4. Produce a 1200 × 630 social card by extending the logo's orange background horizontally. Keep the official square artwork centered and unchanged apart from proportional scaling.

## Website integration

- Replace the footer's small mascot image with the official square logo; retain the localized brand name and tagline beside it.
- Add centralized public URLs for the official logo and social card in the brand module.
- Point Open Graph and Twitter image metadata to the new 1200 × 630 social card.
- Point Organization/EducationalOrganization structured-data `logo` to the official square logo.
- Keep the existing mascot favicon, navbar logo treatment, hero, splash, and companion unchanged.

## Accessibility and behavior

- Add localized official-logo alternative text distinct from mascot alternative text.
- Give the footer logo a stable square size so it stays legible without shifting the layout.
- Treat image-generation failures as build-time work only; the checked-in output files remain static and require no runtime fallback.

## Verification

- Verify the archived source checksum matches the supplied file.
- Verify derivative dimensions and formats.
- Run tests and a production build.
- Check footer presentation on desktop and mobile.
- Check the final document metadata and structured data reference the new public assets.
