---
id: 74
type: task
title: "Restore native Slider input semantics"
created: 2026-08-20
parent: 31
status: open
history:
  - {
      state: open,
      at: 2026-08-20,
      note: "migrated from legacy task slider-thumb-native-input-semantics",
    }
---

Realign the shared Slider spine so the visually hidden native
`input[type=range]` is the focusable, value-bearing slider and the visible
thumb div has no slider role.

The port currently reverses this structure. Chromium therefore omits the value
from the port's accessibility tree, and focus and interaction targets differ.
The divergence affects Slider, RangeSlider, ColorSlider, and ColorArea. Remove
the input ID leaked onto the group during the same realignment.

## Done when

The shared implementation mirrors `useSliderThumb`; D5, D6, and D8 pass for
Slider and the dependent range/color components; and the Slider accessibility
known divergence is removed.

## Relationship

Replaces `slider-thumb-native-input-semantics` from
`.claude/current/tech-debt.md`. Do not patch individual widgets.
