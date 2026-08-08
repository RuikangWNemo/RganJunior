# Navbar Menu Typography Design

## Goal

Make the desktop top-level navigation labels 14px and bold.

## Scope

- Apply only to the desktop top-level navigation links in `src/components/Navbar.tsx`.
- Keep dropdown items, the mobile drawer, the language switcher, and the Community button unchanged.
- Preserve the current active color, underline, hover, focus, and menu behavior.

## Design

The existing `text-sm` utility already renders the desktop labels at 14px. Add `font-bold` to the shared top-level link style and remove the active-only `font-medium` override so every label stays at the same bold weight in both active and inactive states.

## Verification

- Add a focused component assertion for the desktop link typography classes.
- Run the Navbar component tests and the application typecheck.

