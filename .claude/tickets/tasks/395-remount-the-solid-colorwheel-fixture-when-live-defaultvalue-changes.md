---
id: 395
type: task
title: "Remount the Solid ColorWheel fixture when live defaultValue changes"
created: 2026-09-03
parent: 26
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 colorwheel functional pass: live defaultValue hsl(200) leaves Solid at hue 0 while the fixture marker goes to 200; React remounts via renderKey and shows 200. URL ?defaultValue=hsl(180) remounts both. Live controlled valueSource=value already matches",
    }
---

The ColorWheel React fixture remounts when `defaultValue` /
`valueSource` change (`renderKey`). The Solid fixture updates
`demoProps` and its local `value` signal, but the wheel is
uncontrolled (`value` omitted when `valueSource=defaultValue`), so
the thumb stays at the mount-time hue. The wrapper
`data-comparison-value` still follows the signal, so the marker and
the input disagree.

URL `?defaultValue=` remounts the island and both stacks match.
Live `{valueSource:"value", value:"hsl(45, 100%, 50%)"}` is
controlled and matches.

## Evidence

`http://127.0.0.1:4341/components/colorwheel/`, islands mounted.
`comparison:controls-change` with
`{valueSource:"defaultValue", defaultValue:"hsl(200, 100%, 50%)"}`.

| | React | Solid |
|---|---|---|
| input hue | 200 | 0 |
| thumb | `17.066px, 67.27px` | `180px, 96px` |
| AX | slider `"Hue": "200"` | slider `"Hue": "0"` |
| fixture marker | `hsla(200, …)` | `hsl(200, …)` (marker only) |

`?defaultValue=hsl(180, 100%, 50%)` rest: both hue 180, thumb
`12px, 96px`. Live controlled `value` `hsl(45, …)`: both 45.

## Done when

Live `defaultValue` / `valueSource=defaultValue` on the comparison
route remounts (or otherwise resets) the Solid ColorWheel so the
thumb, input, and AX match S2. A walk fails if Solid stays on 0
while React shows 200. Do not start #254.

## Relationship

Child of #26. Found by #260. Wiring is
`apps/comparison/src/components/solid/fixtures/styled/colorwheel.tsx`
(no remount key; `value` only when controlled). React
`apps/comparison/src/components/react/fixtures/styled/colorwheel.js`
already keys on `defaultValue`. Uncontrolled `defaultValue` after
mount is spec-correct in the component; the harness is the gap.
Distinct from #393 (input remount during interaction). Do not start
#254.
