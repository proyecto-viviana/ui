---
id: 366
type: task
title: "Map ColorField PageUp and PageDown to one step"
created: 2026-09-03
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 colorfield functional pass: hex from #336699 React PageUp→#33669A PageDown back; Solid PageUp→#ffffff PageDown→#000000. Channel red 51 React PageUp→52 PageDown→51; Solid 255 then 0. Hue PageUp React 212° Solid 0°. Home/End already match min/max on both",
    }
  - {
      state: merged,
      at: 2026-09-03,
      note: "createColorField PageUp/PageDown call increment/decrement. ColorField test fails if PageUp jumps to #FFFFFF.",
    }
---

ColorField `PageUp` / `PageDown` jump to max / min on Solid. S2
steps by one increment, matching NumberField.

Upstream hex `useColorField` uses `useSpinButton` without
`onIncrementPage`, so PageUp is a single `increment()` and PageDown
a single `decrement()`. Channel mode goes through `useNumberField`,
which does the same. Home / End are the min / max keys.

Solid `createColorField` sends PageUp to `incrementToMax()` and
PageDown to `decrementToMin()` for both hex and channel.

## Evidence

`http://127.0.0.1:4341/components/colorfield/`, islands mounted,
one panel at a time, input focused.

Hex default `#336699`:

|               | React                    | Solid                    |
| ------------- | ------------------------ | ------------------------ |
| PageUp        | `#33669A`                | `#ffffff`                |
| PageDown      | `#336699`                | `#000000`                |
| End then Home | `#FFFFFF` then `#000000` | `#ffffff` then `#000000` |

Channel `?channel=red&colorSpace=rgb` from 51:

|          | React | Solid |
| -------- | ----- | ----- |
| PageUp   | 52    | 255   |
| PageDown | 51    | 0     |

Hue `?channel=hue&colorSpace=hsl` from 210°: React PageUp → 212°;
Solid → 0°.

## Done when

Focused ColorField PageUp increments by one step and PageDown
decrements by one step in hex and channel modes, matching S2.
Home / End stay min / max. A comparison-route keyboard walk fails
if hex PageUp lands on white.

## Relationship

Child of #24. Found by #260. Wiring is
`packages/solidaria/src/color/createColorField.ts` keyboard switch.
Same `useSpinButton` PageUp mapping as #346 (NumberField), different
hook. Distinct from #367 (wheel). Do not start #254.
