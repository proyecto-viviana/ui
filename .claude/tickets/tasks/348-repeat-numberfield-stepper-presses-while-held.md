---
id: 348
type: task
title: "Repeat NumberField stepper presses while held"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 numberfield functional pass: mouse-down Increase 800ms from 5, React 5→7 at 400ms →13 at 800ms; Solid 5→6 and stays. Single click still matches (both +1, focus stays on the input)",
    }
---

S2 NumberField steppers repeat while the pointer is held. Solid
increments once on press start and never spins.

Upstream `useSpinButton` starts a 400ms mouse delay then repeats
every 60ms (`onIncrementPressStart` / `stepUp`). Solid
`createNumberField` `onIncrementPressStart` calls `state.increment()`
once. Headless strips `onClick` so a single click is not doubled;
only the hold path is missing.

## Evidence

`http://127.0.0.1:4341/components/numberfield/`, islands mounted,
one panel at a time, focus the input (value 5), mouse-down Increase
for 800ms.

|                      | React          | Solid          |
| -------------------- | -------------- | -------------- |
| press (single click) | 6, focus input | 6, focus input |
| hold 400ms           | 7              | 6              |
| hold 800ms           | 13             | 6              |

Focus stays on the input on both stacks (no transient blur).
Disabled steppers at min/max already match.

## Done when

Holding Increase on the comparison route repeats like S2 (~400ms
then ~60ms). A walk fails if Solid stays at +1 after 800ms.

## Relationship

Child of #24. Found by #260. Wiring is
`packages/solidaria/src/numberfield/createNumberField.ts` (missing
`useSpinButton` press-repeat). Distinct from #346 (PageUp) and
#347 (wheel). Do not start #254.
