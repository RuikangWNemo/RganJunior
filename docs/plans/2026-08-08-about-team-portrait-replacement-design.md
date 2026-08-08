# About Team Portrait Replacement Design

## Goal

Replace the four portraits in the About page's core team section with the supplied photographs while preserving the existing layout, copy, links, and story imagery.

## Approved mapping

- Nate: supplied image 3
- ZHANG Tianshi: supplied image 4
- Rossie Chen / 陈若容: supplied image 1
- Ruby Huang / 黄若音: supplied image 2

## Asset treatment

Create dedicated WebP assets for the About team section. Keep the source photographs untouched and do not overwrite any images used by long-form stories. Limit the exported dimensions to an appropriate web size while retaining enough resolution for high-density displays.

## Presentation

Keep the existing 4:5 portrait frames. Use `object-fit: cover` and per-person focal positions where necessary so faces remain comfortably inside the crop on desktop and mobile. No layout or copy changes are included.

## Verification

Check `/about#team` at desktop and mobile widths, run the focused About page test, run the application typecheck, and create a production build.
