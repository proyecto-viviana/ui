---
id: 396
type: task
title: "Send ColorWheel End to hue 0 like S2"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 colorwheel functional pass: from hue 15, S2 End → 0 and onChangeEnd stays 15; Solid locator.press End → 359 and onChangeEnd 359. Home 0 both. Native max is 360; Solid createColorWheel setHue(359). Masked for a typing user by #393 (focus drops after PageUp) unless the input is focused again. Not #394 (ColorSlider End should stay 360 on a linear track)",
    }
---

ColorWheel `End` should land on the same hue as S2. From 15, S2 goes
to 0 (native max 360, then `mod(360, 360)`); Solid's keyboard switch
calls `setHue(359)` after `preventDefault`.

S2 does not fire `onChangeEnd` on that End (fixture final stays 15).
Solid's handler toggles `setDragging(true/false)` and commits 359.

Home already matches (`setHue(0)` / native min). PageUp is 15 both
on the first key. This is the circular wheel: 360 and 0 are the same
red, but AX / `aria-valuetext` is `0°, red` vs `359°, red`.

Not ColorSlider #394. That linear track wants End to **keep** 360 so
the thumb sits at `left: 192px`. ColorWheel S2 End is 0.

## Evidence

`http://127.0.0.1:4341/components/colorwheel/`, islands mounted.
Other `.s2-framework-panel` `visibility:hidden` + `inert`. Focus the
hue input, `PageUp` to 15, then `End` (Solid via `locator.press` so
the remounted input is focused; see #393).

| | React | Solid |
|---|---|---|
| PageUp | 15, `onChangeEnd` 15 | 15, `onChangeEnd` 15 |
| End | **0**, `onChangeEnd` still 15 | **359**, `onChangeEnd` 359 |
| Home | 0 | 0 |
| End again | 0 | 359 |

AX / `aria-valuetext` after End: React `0°, red`; Solid `359°, red`.

## Done when

Focused ColorWheel `End` sets hue 0 like S2 (and does not announce
359). Home stays 0. A comparison-route walk from 15 fails if Solid
End is 359. #393 (keep the input mounted) is separate; this mapping
is wrong even when the new input is focused. Do not start #254.

## Relationship

Child of #24. Found by #260. Wiring is
`packages/solidaria/src/color/createColorWheel.ts` `case "End":
s.setHue(359)`. Distinct from #393 (remount / focus), #394
(ColorSlider keep 360), and #366 (ColorField PageUp min/max). Do
not start #254.
