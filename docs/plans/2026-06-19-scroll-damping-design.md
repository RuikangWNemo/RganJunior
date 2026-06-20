# Scroll Damping Design

## Goal
Give the site a more premium, weighted scrolling feel without making it sluggish, breaking native mobile scrolling, or interfering with forms and interactive panels.

## Approved Direction
Use a lightweight, desktop-only smooth scroll damping provider.

## Behavior
- Intercept wheel input on desktop devices only.
- Animate the document toward a target scroll position with a short inertial easing loop.
- Keep touch and mobile scrolling native.
- Disable the effect when `prefers-reduced-motion: reduce` is enabled.
- Avoid intercepting wheel events from form fields, dialogs, menus, and nested scroll containers.
- Preserve route resets and hash navigation by listening for programmatic scroll changes.

## Implementation
- Add a `SmoothScrollDamping` component that mounts an effect and renders nothing.
- Mount it inside `Layout` so it applies globally.
- Keep the damping constants conservative: enough weight to feel smoother, but not enough latency to distract.

## Verification
- Run type checks, tests, lint, and build.
- Verify the homepage scrolls with damped motion on desktop.
- Verify mobile-sized viewports keep native scrolling.
- Verify the Join application form inputs remain usable.
