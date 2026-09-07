---
id: 511
type: task
title: "Burn down button-family pressed D3 3D raster"
created: 2026-09-07
parent: 136
status: open
history:
  - {
      state: open,
      at: 2026-09-07,
      note: "filed from #500: host inline pressScale already matches S2 perspective+translate3d and is clone-visible; D3 pressed label-box raster remains at exactPairDiff",
    }
---

#500 held the 39 button-family D3 `pressed` titles at `exactPairDiff` and
diagnosed the named layer. Chromium (WSL, `--disable-software-rasterizer`)
on `0411f978` plus the mounted `pressScale` host test:

- Live host and D3 popover clone both have
  `transform: perspective(32px) translate3d(0px, 0px, -2px)` (Button
  accent-fill · light; `Math.max(height, width/3, 24)` from the unscaled
  32px control height).
- Computed `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, -0.03125, 0, 0, -2, 1.0625)`
  matches React. `transform-origin` is `31px 16px` on both. Text child has
  no transform. Same `data-rsp-slot="text"` markup and font.
- Popover-clone bounding boxes match (`x: 33.82352828979492`,
  `y: 32.94117736816406`). This is not clone-invisible style, not LSB,
  not a missing child transform, not ToggleButtonGroup `pressScale`.

D3 still fails inner state `pressed` in the label box (Button 0.0076–0.0091,
maxC 6–8; ActionButton 0.0030–0.0118; Toggle 1–105 px). Unpressed states
and `size-s` (24px floor) stay green. Variable-font glyphs under that 3D
press scale raster differently than React at `exactPairDiff`.

## Burn-down

**Re-measure by 2026-10-07.** Do not bump `exactPairDiff` or import
`currentButtonPairDiff`. `certified-waivers.json` stays `[]` until this
ticket owns a dated waiver. Related compositor x-phase work is #105;
D3 clones already share integer frame position, so #105 is not this
class by itself. Not #488, #484, or #505.

## Done when

The 39 titles are green at `exactPairDiff`, or this ticket owns a dated
`certified-waivers.json` / scenario `pixel.waivers` entry that names the
measured 3D-raster limit.

## Relationship

Remainder of #500. Sibling under #136 (scheme v1: a task cannot parent a
task). Triage class still of #493.
