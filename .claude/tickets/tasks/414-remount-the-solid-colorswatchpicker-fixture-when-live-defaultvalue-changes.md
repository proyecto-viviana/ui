---
id: 414
type: task
title: "Remount the Solid ColorSwatchPicker fixture when live defaultValue changes"
created: 2026-09-03
parent: 26
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 colorswatchpicker functional pass: live defaultValue #3b82f6 leaves Solid selected on Rose while the fixture marker goes to #3b82f6; React remounts via renderKey and selects Blue. URL ?defaultValue=#3b82f6 remounts both. Live controlled valueSource=value already matches (Pink). Same harness shape as ColorWheel #395. Numbered 414 to stay past ProgressCircle #410",
    }
---

The ColorSwatchPicker React fixture remounts when `defaultValue` /
`valueSource` change (`renderKey`). The Solid fixture updates
`demoProps` and its local `value` signal, but the picker is
uncontrolled (`value` omitted when `valueSource=defaultValue`), so
the selected overlay stays on the mount-time Rose swatch. The wrapper
`data-comparison-value` still follows the signal, so the marker and
the selected option disagree.

URL `?defaultValue=` remounts the island and both stacks match.
Live `{valueSource:"value", value:"#ec4899"}` is controlled and
matches.

Uncontrolled `defaultValue` after mount is spec-correct in the
component; the harness is the gap.

## Evidence

`http://127.0.0.1:4341/components/colorswatchpicker/`, islands
mounted. `comparison:controls-change` with
`{valueSource:"defaultValue", defaultValue:"#3b82f6"}`.

|                | React                    | Solid                    |
| -------------- | ------------------------ | ------------------------ |
| selected       | **Blue**                 | **Rose**                 |
| overlay        | Blue                     | Rose                     |
| fixture marker | `#3b82f6`                | `#3b82f6` (marker only)  |
| AX             | option Blue `[selected]` | option Rose `[selected]` |

`?defaultValue=%233b82f6` rest: both Blue. Live controlled
`value` `#ec4899`: both Pink.

## Done when

Live `defaultValue` / `valueSource=defaultValue` on the comparison
route remounts (or otherwise resets) the Solid ColorSwatchPicker so
the selected option, overlay, and AX match S2. A walk fails if Solid
stays on Rose while React shows Blue. Do not start #254.

## Relationship

Child of #26. Found by #260. Wiring is
`apps/comparison/src/components/solid/fixtures/styled/colorswatchpicker.tsx`
(no remount key; `value` only when controlled). React
`apps/comparison/src/components/react/fixtures/styled/colorswatchpicker.js`
already keys on `defaultValue`. Same class as ColorWheel #395.
Distinct from #412 / #413 (those props are received and ignored by
the component). Do not start #254.
