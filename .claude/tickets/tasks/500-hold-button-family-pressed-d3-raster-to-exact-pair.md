---
id: 500
type: task
title: "Hold button-family pressed D3 raster to exact pair"
created: 2026-09-07
parent: 136
status: merged
history:
  - {
      state: open,
      at: 2026-09-07,
      note: "filed from #493 inventory of Certification Gates run 34155176389 on 0d84b016 (1998 passed / 165 failed / 4 skipped / 0 waived)",
    }
  - {
      state: in-progress,
      at: 2026-09-07,
      note: "implement button-family-pressed-d3: host inline pressScale, keep exactPairDiff",
    }
  - {
      state: merged,
      at: 2026-09-07,
      note: "host inline pressScale already matches S2 perspective+translate3d and is clone-visible; mounted Button.test pressScale assertion; 39 D3 pressed titles stay red at exactPairDiff; child #511 names 2026-10-07 burn-down. No currentButtonPairDiff. certified-waivers.json stays [].",
    }
---

Certification Gates run 34155176389 on `0d84b016`: **39** unwaived D3 titles, all inner state `pressed`.

Ticket #493 guessed “Button/ActionButton D3 pressed-state deltas near one percent.” HTML attachments confirm **pressed** for every Button (6) and ActionButton (6) failure. The ~1% figure is **not** uniform:

| slug         | cases                                               | mismatchRatio | maxChannelDelta |
| ------------ | --------------------------------------------------- | ------------- | --------------: |
| button       | accent-fill, primary-outline, negative-fill × theme | 0.0076–0.0091 |             6–8 |
| actionbutton | default, quiet, size-xl × theme                     | 0.0030–0.0118 |            1–10 |

ToggleButton (12) and ToggleButtonGroup (15) fail the same `pressed` state. Some Toggle rows are `maxChannelDelta` 1 with 1–105 mismatched pixels; bounds are the label box under press, not scattered LSB noise. Button/ActionButton **D1 passed**, so computed styles (including transform) match; D3 still rasters the pressed scale differently.

`1af6eb71` said pressed transform geometry is untouched — that is commit intent, not this run’s evidence. LSB is retired for this class. Do not silently promote D3 to `currentButtonPairDiff` (`0.001`).

## Work

Identify why the pressed raster diverges while D1 matches (scale interpolation, text AA, missing Solid press transform on a child). Fix in `solid-spectrum` style macro if a token/structure miss; do not hand-tune comparison CSS (ADR 0001). Prove with focused D3 on button, actionbutton, togglebutton, togglebuttongroup. Keep D3 at `exactPairDiff`.

## Done when

Those 39 titles are green at `exactPairDiff`, or a child waiver names a dated burn-down. No threshold bump on this ticket alone.

## Relationship

Triage class of #493. Sibling under #136. Distinct from #488 (Toggle reduced-motion D2). #484 is merged and does not own these D3 reds. Child **#511** owns the remaining 3D pressed raster burn-down (2026-10-07) after host inline `pressScale` was shown to match S2.
