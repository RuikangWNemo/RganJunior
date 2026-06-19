# Actions Three-Track Theatre Design

## Goal
Redesign the Actions page so mountain, field, and urban-rural action feel like three parallel action lines inside one high-end system, not three repeated display blocks.

## Approved Direction
Use a "Three Parallel Action System" for `/actions`.

The page should feel closer to a top-tier cultural, education, or research website:

- one conceptual scene rather than separated cards
- three equal visual tracks shown in parallel on desktop
- large whitespace, thin structural lines, and restrained typography
- real field imagery embedded as curated plates
- short decisive copy instead of explanatory density
- a final convergence statement that explains how the three lines form one growth path

## Structure
1. Action System hero
   - A concise title frames the page as a system of three action lines.
   - A compact right-side index names the three tracks.

2. Parallel Field
   - Mountain, Field, and Urban-Rural appear as equal-height tracks.
   - Each track includes an order number, action verb, image plate, title, signals, description, and evidence points.
   - The tracks share one border and line system instead of individual card frames.

3. Convergence
   - Three lines visually resolve into one closing statement:
     "在山野恢复感知，在田野理解问题，在城乡形成行动。"

4. Evidence
   - Impact proof remains, but becomes a restrained ledger/grid instead of separate cards.

## Implementation Notes
- Keep the shared `actionLayers` content model.
- Implement the redesign in `src/pages/Actions.tsx`.
- Avoid new dependencies.
- Preserve bilingual content.
- Verify build and visual layout on desktop and mobile.
