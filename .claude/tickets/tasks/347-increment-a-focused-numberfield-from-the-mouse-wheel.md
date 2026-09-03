---
id: 347
type: task
title: "Increment a focused NumberField from the mouse wheel"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 numberfield functional pass: focused React input wheel deltaY +120 → 6 and -120 → 5 with live '6'/'5'; Solid stays 5 and does not announce. createNumberField has no onWheel; ColorField already ports useScrollWheel",
    }
---

A focused S2 NumberField increments on wheel `deltaY > 0` and
decrements on `deltaY < 0`. Solid ignores the wheel.

Upstream `useNumberField` attaches `useScrollWheel` while the field
has focus-within, unless `isWheelDisabled`, disabled, or read-only.
Solid `createColorField` already ports that `onWheel`.
`createNumberField` does not.

## Evidence

`http://127.0.0.1:4341/components/numberfield/`, islands mounted,
one panel at a time, click the input (value 5), `mouse.wheel(0, 120)`
then `mouse.wheel(0, -120)`.

| | React | Solid |
|---|---|---|
| after +120 | 6, live "6" | 5 |
| after -120 | 5, live "5" | 5 |

Disabled and read-only already ignore the wheel on React (not
re-driven here). ColorField is the in-tree wheel oracle.

## Done when

A focused comparison-route NumberField matches S2: wheel down
increments, wheel up decrements, disabled/read-only ignore the
wheel. A walk fails if Solid stays at 5.

## Relationship

Child of #24. Found by #260. Wiring is
`packages/solidaria/src/numberfield/createNumberField.ts`. Mirror
`packages/solidaria/src/color/createColorField.ts` `onWheel`.
Distinct from #348 (press-and-hold) and #350 (announce). Do not
start #254.
