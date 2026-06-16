# Join Us Segmented Editorial Design

## Goal
Rebuild `/join` as a high-restraint, identity-driven page that feels more like an editorial entry point than a typical contact or enrollment page.

The page should let visitors choose one of three identities:
- become R'gan Junior youth
- become an R'gan Junior parent
- become a partner

Each identity should reveal different copy in the same content stage, while all three ultimately lead to one shared reserved contact ledger.

## Core Diagnosis
The earlier version of the page felt crowded because it tried to do too many things at once:
- audience entry cards
- contact cards
- consultation topic cards
- project gallery blocks

This created too many equal-weight modules and diluted the page's main action.

## Chosen Direction
Use a `Segmented Editorial` structure:

1. **Identity Stage**
   - one title
   - one short explanation
   - one restrained identity selector

2. **Single Narrative Panel**
   - a fixed layout
   - identity-specific heading
   - one core paragraph
   - a short ledger-style set of explanatory rows
   - one representative image only

3. **Shared Contact Ledger**
   - one global status statement
   - a vertical list for email, WeChat, phone, address, and social channels
   - no card grid
   - no repeated TBD messaging

## Visual Rules
- No audience cards
- No feature-card wall
- No multi-image collage
- Minimal icon use
- Strong reliance on spacing, typography, and alignment
- Only one main interactive gesture: switching identity

## Interaction Rules
- The `/join` page itself is the destination after clicking “Join”
- Visitors switch identity within the same page
- Switching identity updates only the narrative panel and image
- The contact ledger remains shared and fixed below
- Motion should stay subtle: light fade and slight vertical movement only

## Content Rules
- Copy must stay short and precise
- Each identity gets a different introduction
- Shared contact status appears once as a general statement
- Contact rows act as a ledger, not as mini feature blocks

## Implementation Scope
- Refactor `src/pages/JoinUs.tsx`
- Update the page test to reflect the selector-based interaction
- Keep the route `/join` unchanged
