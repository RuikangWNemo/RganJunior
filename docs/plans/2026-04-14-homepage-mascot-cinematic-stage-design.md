# Homepage Mascot Cinematic Stage Design

## Goal
Redesign the homepage mascot experience so it feels like an intentional part of the hero composition, never covers the copy, and delivers a stronger premium interactive feel through scroll-led storytelling with subtle pointer and touch response.

## Confirmed Direction
- Use a cinematic stage concept for the homepage hero
- Make scroll the primary motion timeline
- Add subtle pointer and touch response that leans the mascot toward interaction direction
- Keep a gentle idle sway when the user is not interacting
- Remove the current floating overlay crossing the viewport behavior

## Problems in the Current Implementation
- The homepage mascot is rendered as a viewport-fixed layer instead of part of the hero layout
- The motion path is driven by hardcoded viewport math, which makes placement fragile across screen sizes
- The mascot visually competes with the headline because it is not constrained to a dedicated stage area
- The homepage mascot, navbar logo, and floating helper mascot form three competing mascot systems
- The current motion language is limited to simple floating and translation, which reads as decorative rather than cinematic

## Hero Composition
- Desktop layout: split hero into left copy and right mascot stage
- Mobile layout: stack mascot stage above copy while keeping the stage visually isolated from the text area
- The mascot lives entirely inside the stage container and never crosses into the copy column
- The stage includes restrained environmental layers:
  - soft glow
  - light topographic or ecological lines
  - low-opacity particles or air texture
  - paper-grain continuity with the existing site language
- Navbar logo does not need a literal physical dock animation; it should visually take over as the hero exits

## Motion System
The motion hierarchy must be:

`scroll > pointer/touch > idle`

This prevents animation sources from fighting each other.

### 1. Entry
- On initial load, the mascot is already established inside the right-side stage
- Motion is limited to a slow breath and mild weight shift
- Background layers move less than the mascot and should feel atmospheric rather than animated

### 2. Expansion
- As the user scrolls through the hero, the environment reacts first
- The mascot then adds a controlled response:
  - slight body shift
  - slight orientation change toward the content
  - restrained scale or depth change if needed
- Supporting stage elements can reveal progressively, such as arcs, line-work, or small badges

### 3. Handoff
- Near the end of the hero, the stage compresses or softens instead of sending the mascot flying to the navbar
- The mascot reduces prominence through opacity, scale, or contrast
- The navbar brand mark becomes visible and takes over the page identity

## Pointer and Touch Behavior
- Pointer response is only active inside the mascot stage
- The mascot should subtly lean or drift toward the pointer direction
- The movement budget should stay small:
  - position offset: about 6px to 14px
  - rotation: about 3deg to 6deg
- Touch devices should not continuously chase the finger
- A touch should create one smooth directional response, then the mascot should settle back
- Copy and CTA zones should not trigger aggressive mascot reactions

## Idle Behavior
- Idle motion keeps the mascot alive when there is no active input
- Recommended motion vocabulary:
  - slow breath
  - slight weight transfer
  - minimal settling rotation
- Recommended cadence: about 4s to 7s
- Idle motion should feel like presence, not floating decoration

## Visual Language
- Prioritize depth, atmosphere, and compositional restraint
- Use soft earth and forest tones already established in the design system
- Avoid bright glow, neon treatment, or exaggerated path lines
- Replace cartoon bounce energy with:
  - center-of-gravity shifts
  - layered parallax
  - soft fade and reveal transitions

## Mascot System Unification
- Homepage hero mascot becomes the primary mascot moment
- Navbar mascot is a brand mark, not a second animated character system
- The floating helper mascot should be disabled on the homepage
- The floating helper mascot should likely be reduced or simplified on inner pages so it does not compete with the homepage hero identity

## Responsive Behavior
- Desktop: left copy and right stage with clear breathing room
- Tablet: maintain separation while reducing stage amplitude and environmental detail
- Mobile: stage above copy, smaller interaction amplitude, no hover-only logic
- Motion should degrade gracefully when pointer precision is unavailable

## Risks
- Excessive pointer chasing will make the mascot feel childish
- Mixing scroll and pointer on the same transform layer can introduce jitter
- Too many stage effects will shift the homepage from premium brand site to campaign page
- Mobile interaction can feel awkward if desktop hover behavior is copied directly

## Validation
- The mascot never overlaps headline, subheading, or CTA regions
- The hero reads as one composition instead of a floating overlay plus text
- Scroll progression feels cinematic and calm rather than gimmicky
- Pointer and touch response add life without pulling attention away from the copy
- Navbar takeover feels like a brand handoff, not a teleport animation

## Files Likely Involved
- `src/pages/Index.tsx`
- `src/components/Navbar.tsx`
- `src/components/Layout.tsx`
- `src/components/MascotCompanion.tsx`
- `src/index.css`
- new: `src/components/home/HeroCopy.tsx`
- new: `src/components/home/HeroMascotStage.tsx`
- new: `src/hooks/useHeroMotion.ts`
