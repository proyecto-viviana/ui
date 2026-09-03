---
id: 350
type: task
title: "Announce NumberField value changes"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 numberfield functional pass: focused React wheel/hold writes an assertive live region with the new number; Solid createNumberField never calls announce(). #180 is D6 driver coverage, not this port",
    }
---

S2 NumberField announces the formatted value assertively when it
changes while focused (upstream `useSpinButton` `announce(ariaTextValue,
'assertive')`). Solid never announces.

`createNumberField` has no live-announcer call. `announce()` already
exists in `@proyecto-viviana/solidaria`. The comparison route's
global live region shows React `"6"` / `"13"` after wheel / hold
and stays empty for Solid-only gestures.

## Evidence

`http://127.0.0.1:4341/components/numberfield/`, islands mounted,
one panel at a time, input focused at 5.

|                     | React                 | Solid                |
| ------------------- | --------------------- | -------------------- |
| wheel +120          | value 6, live `"6"`   | value 5, no new live |
| hold Increase 800ms | value 13, live `"13"` | value 6, no new live |

## Done when

Focused NumberField value changes (arrows, steppers, wheel) announce
the new number assertively, matching S2. A comparison-route walk
fails if Solid leaves the live region empty.

## Relationship

Child of #24. Found by #260. Wiring is
`packages/solidaria/src/numberfield/createNumberField.ts` (missing
`useSpinButton` announce). #180 registers D6 announce triggers; it
does not implement this port. Distinct from #347 (wheel behavior)
and #348 (hold repeat). Do not start #254.
