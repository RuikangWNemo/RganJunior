# Homepage Hero Reference Orange Unification Design

## Goal

Unify the homepage Hero's main orange elements with the exact orange used by the “最近，我们一起生活了5天4夜” heading.

## Approved design

- Use the existing `--home-orange` value, `hsl(20 82% 54%)` (`#ea6a2a`), as the shared Hero orange.
- Apply it to the Hero “阿柑少年” wordmark, mascot Logo, “加入下一期” button, and navigation “进入社群” button.
- Keep hover surfaces in the same shared orange so these elements do not drift into a second orange family.
- Recolor the mascot through an SVG color matrix that preserves its white facial marks while mapping its dominant orange to the shared reference orange.
- Use a deeper forest foreground (`hsl(158 72% 10%)`) on orange buttons to maintain readable contrast.
- Preserve the current Hero background, navigation whites, layout, interaction, copy, and removed decoration layer.

## Verification

- Confirm the reference heading, Hero wordmark, both button backgrounds, and mascot dominant color resolve to `#ea6a2a`.
- Confirm orange button labels use the deeper forest foreground.
- Run the focused homepage and mascot tests, production build, and desktop/mobile browser checks.
