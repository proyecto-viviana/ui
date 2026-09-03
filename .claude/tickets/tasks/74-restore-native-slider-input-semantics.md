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
  - {
      state: open,
      at: 2026-09-03,
      note: "#260 slider: rest AX omits Solid value (slider \"Volume\": \"40\" vs slider \"Volume\"); native input tabIndex 0 vs -1 + aria-hidden; Solid div[role=slider] tabIndex 0; group id leaked. Isolated Tab: React inner knob outline rgb(75,117,255) solid 2px (focus on input), Solid inner knob outline none + container native outline rgb(16,16,16) auto 1px (data-focused=true, data-focus-visible omitted). Tab order Before→slider→After both. Do not file a new id.",
    }
  - {
      state: open,
      at: 2026-09-03,
      note: "#260 rangeslider: two thumbs. Rest AX omits Solid values and concatenates the field label only on React (slider \"Minimum Range\":\"30\" / \"Maximum Range\":\"60\" vs slider \"Minimum\" / \"Maximum\"). React two native input[type=range] tabIndex 0 with labelledby; Solid two div[role=slider] tabIndex 0, no native range, aria-label only. Isolated Tab Before→start→end→After both. Inner-knob accent ring rgb(75,117,255) solid 2px matches; Solid container still native outline rgb(16,16,16) auto 1px. Group id leak false (Solid id=cl-258 is the output for). Do not file a new id.",
    }
  - {
      state: open,
      at: 2026-09-03,
      note: "#260 colorarea: not this inversion. Rest AX includes native range slider \"Color, Color picker\": \"155\"; two input[type=range] (x tabIndex 0, y aria-hidden tabIndex -1); no div[role=slider]. ColorArea pointer/vertical-key focus is #391. Hue valuetext digits are #392. Do not file a new id.",
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
