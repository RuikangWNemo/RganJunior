# Join Mascot Dialog Island Design

## Goal

Simplify `/join` into two clear scenes: a quiet, light-paper introduction followed by a playful green identity and mascot interaction. Move all detailed “who this is for” content out of the persistent page and into an accessible dialog.

## Chosen Direction

Use a two-scene Mascot Dialog Island:

1. A light-paper introduction containing only the Seed Community kicker, the main join heading, and one short invitation.
2. A forest-green interactive scene containing one continuous identity path, the large mascot, rotating prompts, the retained identity lanyard, and dialog entry points.

This preserves the homepage palette while reducing the amount of text visible at once.

## Light Introduction Scene

The introduction uses the same warm light-paper tone as the homepage.

- Kicker: `种子社群 · 加入我们`
- Heading: `成为阿柑少年、家长或伙伴。`
- Supporting line: `从一个身份开始，和阿柑聊聊。`

No role details, explanatory rows, or application button remain visible in this scene.

## Green Interaction Scene

The interaction scene uses the brand forest green.

- A single orange SVG path runs continuously from left to right.
- Youth, parent, and partner nodes all sit on this same unbroken path.
- Each node is an interactive control and opens its corresponding role details directly.
- The large mascot sits in the lower-right visual field.
- A speech bubble near the mascot displays rotating prompts.
- The existing identity lanyard remains, but becomes smaller and visually secondary inside the green scene. It updates after a role is selected.

## Mascot Prompts

Provide roughly 12–16 localized prompts covering curiosity, uncertainty, parent participation, field collaboration, research, nature, and long-term action.

Examples:

- `如果你想把好奇心带进山野，就来找我。`
- `不知道自己适合哪一种？先聊聊也可以。`
- `家长也可以先来听听我们的边界。`
- `有一片土地、一个问题或一种能力？也许我们能一起行动。`

Prompts rotate about every 4.5 seconds without immediately repeating. Rotation pauses while the mascot or bubble is hovered or keyboard-focused, and while the dialog is open. Reduced-motion users see a stable prompt without automatic rotation.

## Dialog Flow

Clicking the mascot or its speech bubble opens a light-paper dialog.

1. The first view asks: `你想以什么身份了解？`
2. The visitor chooses youth, parent, or partner.
3. The dialog switches to the selected role’s existing introduction, explanatory rows, and application action.
4. A back action returns to role selection.

Clicking a role node on the green path skips the chooser and opens that role’s details directly.

Desktop uses a centered dialog. Mobile uses a near-full-height bottom sheet. Both use the same content and state.

## Data and State

- `joinAudiences` remains the source of truth for role titles, descriptions, rows, and application labels.
- A new localized prompt collection supplies mascot speech.
- `selectedId` stores the latest committed role and continues to update the lanyard.
- Dialog state tracks closed, role chooser, or role detail.
- Unknown URL role values fall back to youth.
- Application URLs remain `/join/apply?audience=<identity-id>`.

## Accessibility and Motion

- Use the existing accessible Dialog primitives for focus trapping, close behavior, Esc handling, and labeling.
- Role nodes are buttons with clear accessible names and touch-safe targets.
- The mascot entry is keyboard operable and does not rely on image-only meaning.
- Prompt changes use a restrained fade; the complete identity path draws once on entrance.
- `prefers-reduced-motion` disables prompt auto-rotation and nonessential displacement.

## Responsive Behavior

### Desktop

- The light scene is compact and centered.
- The identity path spans the left and center of the green scene.
- The mascot, speech bubble, and smaller lanyard occupy the right visual field without covering the path labels.

### Mobile

- The three role nodes remain connected by one continuous vertical or gently curved path rather than becoming disconnected cards.
- The mascot sits below the path with a compact speech bubble.
- The lanyard uses its existing static mobile representation.
- The dialog becomes a near-full-height bottom sheet with comfortable scrolling.

## Verification

- Confirm the persistent page no longer renders role detail copy or application actions.
- Confirm the SVG identity path is visually continuous and all three nodes are connected.
- Confirm prompt rotation, pause behavior, and reduced-motion fallback.
- Confirm mascot/bubble entry opens the chooser and role nodes open details directly.
- Confirm each role updates the dialog, lanyard, and application URL.
- Run targeted tests, the complete suite, lint, and production build.
- Inspect desktop and mobile layouts for overlap, focus visibility, dialog scrolling, and horizontal overflow.

