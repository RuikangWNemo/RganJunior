# Bilingual Brand Wordmark Design

## Goal

Use the official logo artwork as the source of truth for both language variants of the brand wordmark. Chinese surfaces display `阿柑少年`; English surfaces display `R-Gan Junior`.

## Wordmark component

Extend the existing `BrandWordmark` component with a language prop. Keep the current traced Chinese paths unchanged and add an English path traced from the English line in the archived official logo. Each language variant keeps its own view box so it scales without distortion.

Hero and Navbar pass the active site language into the shared component. Their existing accessible names continue to come from `BRAND.name`, while the decorative SVG remains hidden from assistive technology.

## Brand language normalization

Set the canonical English brand name to `R-Gan Junior`. Replace user-facing legacy forms such as `R'gan Junior`, `R’gan Junior`, `Rgan Junior`, and brand-related `R'gan Youth` across page copy, article content, metadata, structured data, accessible labels, and tests.

Do not rewrite URLs, route identifiers, filenames, email addresses, or standalone uses of `R'gan` that name citrus products rather than the youth brand.

## Verification

Add component and integration assertions for both SVG variants, update copy expectations, run the focused and full test suites, lint and build the app, then visually inspect Chinese and English Hero/Navbar layouts at desktop and narrow widths.
