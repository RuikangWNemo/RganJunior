# Splash Paper Awakening Design

## Goal
Upgrade the 阿柑少年 opening splash so it feels premium, warm, and aligned with the current homepage. The user approved direction A: a paper-like morning-light opening, with the citrus mascot waking before several lines of text appear.

## Design
- Replace the muddy dark brown background with a warm paper field, soft citrus light, muted green depth, and fine path lines.
- Remove the extra white facial-arc overlays. The mascot artwork already contains a gentle smile, so the animation should use breathing, floating, and light rather than drawing a second face.
- Let the mascot wake first, then reveal a short stack of bilingual brand lines.
- Place the splash above the navbar so the opening feels complete.
- Keep reduced-motion behavior: show a shortened, readable version without continuous animation.

## Implementation Boundary
- Main file: `src/components/SplashAnimation.tsx`.
- Version bump: `src/components/home/HeroMascotStage.tsx`, so returning visitors see the corrected splash once.
- No dependency changes.

## Verification
- TypeScript, lint, tests, and production build should pass.
- Browser check should confirm the splash appears, no extra facial arc overlays remain, no error overlay appears, and the nav no longer sits above the splash.
