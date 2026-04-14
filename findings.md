# Findings

## Requirements
- The homepage mascot motion path should feel more premium and less crude.
- The mascot should not cover hero copy.
- The mascot should feel like an intentional part of the homepage instead of a floating overlay.
- The user wants a high-end interaction concept with stronger interactivity.
- This turn should produce a repair direction and plan, not jump straight into code changes.

## Research Findings
- The project is a Vite + React + Tailwind site with the homepage in `src/pages/Index.tsx`.
- The hero mascot is rendered as a `fixed` element at `z-[55]`, positioned from viewport center and animated with manual `scrollY` interpolation.
- The hero reserves a blank spacer block for the mascot, but the real mascot is not inside that layout block; it floats above the page instead.
- The mascot path is calculated with hardcoded viewport math (`top: 35vh`, `left: 50%`, `endX`, `endY`), so it is brittle across screen sizes and likely to drift over text.
- The navbar uses a separate mascot asset (`mascot-wide.png`) and reveals only after scroll on the homepage.
- A second floating mascot (`src/components/MascotCompanion.tsx`) appears on all pages after scrolling, which risks making the overall mascot system feel repetitive or gimmicky.
- `App.css` appears unused because `src/main.tsx` imports only `index.css`.

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
| Focus the redesign around layout integration first, then motion polish | Motion quality will not feel premium if the mascot is still layered as a detached overlay |
| Treat navbar docking as optional, not mandatory | The current forced “hero center to navbar logo” flight is the main source of awkwardness |

## Issues Encountered
| Issue | Resolution |
|-------|------------|
| Existing planning files belonged to an older branding/Lovable task | Rewrote planning files for the homepage mascot redesign task |
| Project root was ambiguous at first because the user gave the parent folder | Confirmed the actual app root is `rgan-junior-roots-main` |

## Resources
- `src/pages/Index.tsx`
- `src/components/Navbar.tsx`
- `src/components/MascotCompanion.tsx`
- `src/index.css`
- `src/assets/mascot-full.png`
- `src/assets/mascot-wide.png`

## Visual/Browser Findings
- The hero currently creates the illusion of mascot placement with an empty spacer, but the visible mascot sits in a separate fixed layer.
- Because the mascot is centered in the viewport rather than anchored in the composition, the headline and subcopy visually compete with it.
- The current motion vocabulary is limited to floating, shrinking, and translating; it lacks depth cues, parallax relationships, or section-aware choreography.
- The mascot asset sizes are large enough for higher-fidelity placement and crop treatment:
  - `mascot-full.png`: 1557 x 1629
  - `mascot-wide.png`: 1125 x 705
