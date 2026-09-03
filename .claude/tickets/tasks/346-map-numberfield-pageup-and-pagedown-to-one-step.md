---
id: 346
type: task
title: "Map NumberField PageUp and PageDown to one step"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 numberfield functional pass: from value 5, React PageUp→6 PageDown→5; Solid PageUp→20 (max) PageDown→0 (min). Home/End already match min/max on both",
    }
---

NumberField `PageUp` / `PageDown` jump to max / min on Solid. S2
steps by `step`.

Upstream `useSpinButton` maps PageUp to `onIncrementPage` if present,
otherwise `onIncrement`. `useNumberField` does not pass
`onIncrementPage`, so PageUp is a single `increment()`. PageDown is
a single `decrement()`. Home / End are the min / max keys
(`onDecrementToMin` / `onIncrementToMax`).

Solid `createNumberField` sends PageUp to `incrementToMax()` and
PageDown to `decrementToMin()`. Home / End already match.

## Evidence

`http://127.0.0.1:4341/components/numberfield/`, islands mounted,
one panel at a time, input focused, default value 5, `maxValue=20`,
`minValue=0`, `step=1`.

|               | React     | Solid     |
| ------------- | --------- | --------- |
| PageUp        | 6         | 20        |
| PageDown      | 5         | 0         |
| End then Home | 20 then 0 | 20 then 0 |

## Done when

Focused NumberField PageUp increments by `step` and PageDown
decrements by `step`, matching S2. Home / End stay min / max. A
comparison-route keyboard walk fails if PageUp lands on max.

## Relationship

Child of #24. Found by #260. Wiring is
`packages/solidaria/src/numberfield/createNumberField.ts` keyboard
switch. Distinct from #348 (press-and-hold) and #347 (wheel). Do not
start #254.
