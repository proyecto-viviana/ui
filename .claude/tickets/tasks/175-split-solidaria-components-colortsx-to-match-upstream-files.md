---
id: 175
type: task
title: "Split solidaria-components Color.tsx to match upstream files"
created: 2026-09-01
parent: 136
status: verified
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
  - {
      state: verified,
      at: 2026-10-06,
      note: "split Color.tsx into ColorArea, ColorField, ColorPicker, ColorSlider, ColorSwatch, ColorSwatchPicker, ColorThumb, and ColorWheel matching upstream RAC layout; all tests pass and package artifacts verified",
    }
---

## Cause

`Color.tsx` is 2,551 lines concatenating ColorArea, ColorField, ColorPicker,
ColorSlider, ColorSwatch, ColorSwatchPicker, ColorThumb, and ColorWheel.
Upstream still ships those as separate files.

## Work

Split to match upstream file layout. Keep tests green.

## Done when

Each color primitive lives in its own module matching the RAC filenames.

## Relationship

F-QUALITY-007.
