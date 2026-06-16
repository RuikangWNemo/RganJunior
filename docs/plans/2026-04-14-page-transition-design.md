# Page Transition Design

## Goal
Introduce silky menu-driven page transitions with calm fade-and-slide motion and layered text reveals.

## Approved Direction
- Use a route-shell transition around page content
- Keep `Navbar` and `Footer` visually stable
- Let mobile menu close and page entry overlap slightly
- Animate text by content tier: title, lead, then actions/content blocks

## Motion Rules
- Outgoing page: fade out with a subtle lift or slight lateral drift
- Incoming page: fade in and settle from a small downward offset
- Motion should feel editorial and smooth, not theatrical
- Title enters first, lead text second, actions or content groups last

## Implementation Slices
1. Route shell in app layout
2. Menu overlay exit and navigation handoff
3. Text reveal markers for inner pages
4. Verification on desktop and mobile navigation flows

## Validation
- Menu navigation no longer hard-cuts between pages
- Text enters in calm layers
- Home hero motion does not fight route transitions
- Rapid navigation does not leave the menu or page shell in a broken state
