---
id: 374
type: task
title: "Increment a horizontal Slider on ArrowUp"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 slider functional pass: isolated focus then ArrowUp×2 from 40 → React 42, Solid 38; ArrowDown×2 → React 38, Solid 42. ArrowLeft/Right, PageUp/PageDown, Home/End already match. createSlider onThumbKeyDown decrements on ArrowUp when orientation is horizontal; native range and WAI-ARIA increment. The package test encodes the inversion",
    }
---

S2 Slider (native `input[type=range]`) increments on ArrowUp and
decrements on ArrowDown for a horizontal slider, same as ArrowRight
/ ArrowLeft in LTR. Solid does the opposite.

`createSlider` `onThumbKeyDown` treats ArrowUp as decrement when
`orientation !== "vertical"`. WAI-ARIA and Chromium's range input
both increment on ArrowUp for horizontal sliders. Vertical already
matches (ArrowUp increments).

`packages/solidaria/test/createSlider.test.tsx` names the case
"should increment on ArrowUp for horizontal slider" and then expects
49 from 50.

## Evidence

`http://127.0.0.1:4341/components/slider/`, islands mounted. Other
`.s2-framework-panel` `visibility:hidden` + `inert`. Focus the
slider (React native range, Solid `div[role=slider]`) at 40.

| | React | Solid |
|---|---|---|
| ArrowUp ×2 | 42 | 38 |
| ArrowDown ×2 | 38 | 42 |
| ArrowRight ×2 | 42 | 42 |
| ArrowLeft ×2 | 38 | 38 |
| PageUp / PageDown | 50 / 40 | 50 / 40 |
| End / Home | 100 / 0 | 100 / 0 |

`?step=3&minValue=2&maxValue=20&value=2` ArrowRight ×2 then PageUp
is 2→5→8→11 on both. Uncontrolled `defaultValue=25` ArrowRight
matches.

`packages/solidaria/src/slider/createSlider.ts` `onThumbKeyDown`.

## Done when

A focused horizontal comparison-route Slider increments on ArrowUp
and decrements on ArrowDown, matching S2. The package test expects
the increment. A walk fails if Solid moves the opposite way of
React.

## Relationship

Child of #24. Found by #260. Distinct from #74 (native input is the
focusable slider; restoring that would hide this mapping because the
browser handles the keys, but the handler is still inverted on the
div). Do not start #254.
