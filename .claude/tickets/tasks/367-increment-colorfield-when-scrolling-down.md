---
id: 367
type: task
title: "Increment ColorField when scrolling down"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 colorfield functional pass: focused hex React wheel deltaY +120 → #33669A and -120 back to #336699; Solid +120 → #336698 (decrement) then -120 back. Channel red Solid +120 51→50; React channel stayed 51 in this driver. RAC useColorField increments on deltaY > 0; createColorField inverts the sign. isWheelDisabled already no-ops both",
    }
---

A focused S2 ColorField increments on wheel `deltaY > 0` and
decrements on `deltaY < 0`. Solid does the opposite.

Upstream `useColorField` `onWheel` (and `useNumberField` for channel)
calls `increment()` when `deltaY > 0`. Solid `createColorField`
increments when `deltaY < 0` and decrements when `deltaY > 0`.

## Evidence

`http://127.0.0.1:4341/components/colorfield/`, islands mounted,
one panel at a time, click the input (value `#336699`),
`mouse.wheel(0, 120)` then `mouse.wheel(0, -120)`.

|            | React     | Solid     |
| ---------- | --------- | --------- |
| after +120 | `#33669A` | `#336698` |
| after -120 | `#336699` | `#336699` |

Channel `?channel=red&colorSpace=rgb` from 51: Solid +120 → 50;
React stayed 51 in this Playwright wheel (keyboard ArrowUp still
51→52). `?isWheelDisabled=true` ignores the wheel on both.

## Done when

A focused comparison-route ColorField matches S2: wheel down
increments, wheel up decrements, disabled/read-only/`isWheelDisabled`
ignore the wheel. A walk fails if Solid decrements on `deltaY +120`.

## Relationship

Child of #24. Found by #260. Wiring is
`packages/solidaria/src/color/createColorField.ts` `onWheel` sign.
NumberField missing wheel entirely is #347. Do not start #254.
