# Task Plan

## Goal
Redesign the homepage mascot behavior so it feels integrated into the hero, avoids covering text, and supports a higher-end interactive direction for the landing experience.

## Current Phase
Phase 1

## Phases
### Phase 1: Requirements & Discovery
- [x] Inspect homepage structure, mascot usage, and navigation behavior
- [x] Identify why the current mascot motion feels detached or intrusive
- [x] Capture current constraints and opportunities in findings.md
- [ ] Confirm desired interaction direction and intensity with the user
- **Status:** in_progress

### Phase 2: Concept Direction
- [ ] Define 2-3 viable homepage mascot interaction approaches
- [ ] Recommend one direction with rationale
- [ ] Validate the chosen direction with the user
- **Status:** pending

### Phase 3: Design Plan
- [ ] Break the chosen direction into layout, motion, layering, and responsive behavior
- [ ] Define implementation slices and risk points
- [ ] Save the approved design to `docs/plans/`
- **Status:** pending

### Phase 4: Implementation Planning
- [ ] Convert the design into an execution sequence
- [ ] Identify components/files to change
- [ ] Note verification steps
- **Status:** pending

### Phase 5: Delivery
- [ ] Deliver the design summary and implementation plan to the user
- [ ] Call out assumptions, risks, and next step
- **Status:** pending

## Key Questions
1. Should the mascot feel more like a narrative guide embedded in the hero, or more like a premium UI layer that responds to the user?
2. How bold should the homepage feel relative to the current calm editorial style?

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Use the nested `rgan-junior-roots-main` folder as the working project root | The top-level `Website` directory is just a container; source and planning files live in the nested app |
| Treat this turn as design and planning only | The user explicitly asked to review how to fix it and make a plan |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| `git status` failed in both `Website` and `rgan-junior-roots-main` | 1 | Confirmed this project directory is not a git repo and continued with direct file inspection |

## Notes
- Current homepage mascot is a viewport-fixed floating element, not part of the hero layout
- Current navbar logo reveal and homepage mascot use different assets and different motion logic
- Avoid implementation before the user approves a design direction
