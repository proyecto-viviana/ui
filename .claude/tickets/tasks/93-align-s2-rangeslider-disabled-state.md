---
id: 93
type: task
title: "Align the S2 RangeSlider disabled state"
created: 2026-08-20
parent: 24
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from the remaining-work hygiene census" }
---

The Viviana RangeSlider stamps `data-disabled="true"` on its group. The S2
RangeSlider does not. This changes how route-wide contrast checks classify the
disabled label and output.

## Scope

- Read the pinned S2 RangeSlider source and current Solid wrapper.
- Determine whether the missing attribute is an S2 port gap or a local Viviana
  addition.
- Implement the result at the correct layer.
- Add paired computed and accessibility evidence for the disabled branch.

## Done when

The attribute contract matches the selected upstream or explicit local source,
and a regression test holds the disabled branch.
