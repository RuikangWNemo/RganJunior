# Homepage Mascot Cinematic Stage Implementation Plan

## Objective
Implement the approved homepage mascot redesign without shipping noisy motion, layout regressions, or overlapping mascot systems.

## Phase 1: Hero Structure Refactor
- Replace the current homepage fixed mascot overlay with a split-layout hero
- Extract left-side copy into `src/components/home/HeroCopy.tsx`
- Extract the right-side mascot stage into `src/components/home/HeroMascotStage.tsx`
- Remove the spacer-based mascot layout workaround from the homepage

## Phase 2: Motion State Architecture
- Add `src/hooks/useHeroMotion.ts` to centralize:
  - scroll progress
  - phase state: entry, expansion, handoff
  - pointer offset
  - pointer tilt
  - idle intensity
- Separate transforms by layer:
  - stage wrapper handles scroll progression
  - mascot layer handles pointer and touch response
  - inner mascot layer handles idle motion
- Respect reduced-motion preferences where practical

## Phase 3: Cinematic Stage Rendering
- Build the stage with the mascot asset plus restrained environment layers
- Add low-amplitude light, line, and particle treatments in CSS
- Keep stage boundaries explicit so the mascot never crosses into the copy area
- Tune z-indexes so copy stays visually dominant for readability

## Phase 4: Navbar and Global Mascot Coordination
- Update the homepage/navbar relationship so the navbar logo fades in as the hero hands off
- Remove the need for literal docking math from the homepage
- Disable `MascotCompanion` on the homepage
- Evaluate whether inner-page `MascotCompanion` should be toned down after homepage work lands

## Phase 5: Responsive Behavior
- Desktop: preserve the stage/copy split with strong composition
- Tablet: reduce amplitude and simplify environmental layers
- Mobile: stack stage above copy and convert touch response to a single smooth directional reaction
- Verify there is no hover dependency for core behavior

## Phase 6: Verification
- Manual desktop verification:
  - hero copy is never covered
  - pointer response is subtle and smooth
  - scroll handoff to navbar feels natural
- Manual mobile verification:
  - stage and copy order is clear
  - touch response is calm and non-jittery
  - layout remains readable at small widths
- Performance verification:
  - keep animation on `transform` and `opacity` where possible
  - inspect for scroll jank

## File-Level Change Outline
- `src/pages/Index.tsx`
  - replace the current fixed mascot implementation
  - compose the new hero sections
- `src/components/home/HeroCopy.tsx`
  - render home title, supporting copy, and CTA layout
- `src/components/home/HeroMascotStage.tsx`
  - render mascot stage, environment layers, and motion-driven transforms
- `src/hooks/useHeroMotion.ts`
  - own the interaction state and priority rules
- `src/components/Navbar.tsx`
  - adjust homepage handoff logic
- `src/components/Layout.tsx`
  - suppress `MascotCompanion` on the homepage
- `src/components/MascotCompanion.tsx`
  - optionally tone down inner-page behavior after homepage integration
- `src/index.css`
  - add cinematic-stage utilities, revised idle motion, and environmental animation styles

## Guardrails
- Do not reintroduce viewport-fixed free-flight mascot motion
- Do not let pointer response exceed the small-amplitude budget
- Do not add multiple equally prominent mascot behaviors on the homepage
- Do not let environment effects outrank the copy or mascot silhouette

## Notes
- The project directory does not currently contain git metadata, so no design commit can be created from this workspace
- The `writing-plans` skill referenced by the brainstorming workflow is not available in this session, so this implementation plan is written manually as the fallback deliverable
