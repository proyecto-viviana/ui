---
id: 426
type: task
title: "Remount the Solid RangeCalendar fixture when live focusedValue clears"
created: 2026-09-03
parent: 26
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 rangecalendar functional pass: live focusedValue April 1 pages both to April; the next live locale/calendarSystem/error/reset that omits focusedValue returns React to February and leaves Solid on April 1. URL remounts match. Same harness shape as ColorWheel #395 / ColorSwatchPicker #414",
    }
---

The RangeCalendar Solid fixture keeps a local `focusedValue` signal
and only passes it through while the demo prop is non-empty:

```
get focusedValue() {
  return demoProps().focusedValue ? (focusedValue() ?? undefined) : undefined;
}
```

(`apps/comparison/src/components/solid/fixtures/styled/rangecalendar.tsx`).
A live control that **clears** `focusedValue` therefore drops the
prop (controlled → uncontrolled). The calendar keeps the last
`focusedDate` (April). The local signal is reset to `startValue`, so
`data-comparison-focused-value` can disagree with the visible month.

React remounts (or keeps a value-driven focused date) and returns to
February. URL `?focusedValue=2025-02-15` remounts both and matches.
Live `{focusedValue:"2025-04-01"}` itself matches (both April).

Uncontrolled focused date after dropping the prop is spec-correct in
the component; the harness is the gap.

## Evidence

`http://127.0.0.1:4341/components/rangecalendar/`, islands mounted.
`comparison:controls-change` `{focusedValue:"2025-04-01"}` then
`{focusedValue:"", locale:"fr-FR"}` (or live `calendarSystem`,
`errorMessage`, or reset-to-defaults).

After April then live locale fr-FR:

|              | React                   | Solid                           |
| ------------ | ----------------------- | ------------------------------- |
| heading      | **février 2025**        | **avril 2025**                  |
| focused cell | Monday 3 selected       | Tuesday 1 April                 |
| selectedDays | 3–7                     | **[]** (April has no Feb range) |
| value marker | `2025-02-03/2025-02-07` | same                            |

`?focusedValue=2025-02-15` rest: both February 15. Live April 1:
both April.

## Done when

Live clearing `focusedValue` on the comparison route remounts (or
otherwise keeps) the Solid RangeCalendar so the visible month matches
S2 / the selected value. A walk fails if Solid stays on April while
React shows February. URL remount and live _set_ of `focusedValue`
can stay. Do not start #254.

## Relationship

Child of #26. Found by #260. Wiring is the Solid fixture omitting
`focusedValue` when the demo string is empty. Same class as
ColorWheel #395 and ColorSwatchPicker #414. Distinct from #418 (live
`visibleMonths` is a state snapshot, not a harness remount). Do not
start #254.
