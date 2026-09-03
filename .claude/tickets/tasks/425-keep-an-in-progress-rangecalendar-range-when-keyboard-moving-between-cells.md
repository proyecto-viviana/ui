---
id: 425
type: task
title: "Keep an in-progress RangeCalendar range when keyboard-moving between cells"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 rangecalendar functional pass: Tab to Feb 4, Enter, ArrowRight commits Solid to 2025-02-04/2025-02-04 and drops the anchor so a later Enter starts a new range; React keeps the in-progress highlight and commits 4–7. DateRangePicker overlay (#282) still completes 4–6 on the second Enter",
    }
---

RAC `useRangeCalendar` commits an in-progress range on blur only when
focus has left the calendar (`relatedTarget` outside). Arrowing from
the range-start cell to the next day keeps the anchor, so a later
Enter/Space sets the end.

Solid `createRangeCalendar` does the same check
(`packages/solidaria/src/calendar/createRangeCalendar.ts` `onBlur` +
`commitBehavior=select` → `state.selectDate(state.focusedDate())`).
On this inline RangeCalendar, ArrowRight after the first Enter fires
that blur with a `relatedTarget` that is not contained (cell remount
leaves `relatedTarget` null), so the still-anchored start commits as
a single-day range. The next Enter then starts a **new** range.

DateRangePicker overlay on the same keys still completes a range on
the second Enter (`2025-02-04/2025-02-06` vs React `…/2025-02-07`) —
that remainder is only missing `focusNearestAvailableDate` (#282).
This ticket is the extra inline commit.

## Evidence

`http://127.0.0.1:4341/components/rangecalendar/`, islands mounted.
Isolate one panel. Tab to Tuesday 4, Enter, ArrowRight, ArrowRight,
Enter.

| step                   | React                                     | Solid                                                          |
| ---------------------- | ----------------------------------------- | -------------------------------------------------------------- |
| after Enter on 4       | value still 3–7, selected 4–5, focus 5    | value still 3–7, selected 4, focus 4 (#282)                    |
| after first ArrowRight | selected 4–6, value 3–7                   | **value `2025-02-04/2025-02-04`**, selected 4, focus 5         |
| after second Enter     | **`2025-02-04/2025-02-07`**, selected 4–7 | **still `2025-02-04/2025-02-04`**, selected **6** (new anchor) |

Space on 8 then two ArrowRight then Space: React `2025-02-08/2025-02-11`;
Solid `2025-02-08/2025-02-08` then selected 10. Escape after a
keyboard start restores 3–7 on both (React leftover focus 9, Solid 8
— #282).

## Done when

Keyboard-moving between cells during an in-progress RangeCalendar
selection does not commit a single-day range. A walk fails if
ArrowRight after Enter on the start writes `start/start` while React
still has an anchor. Auto-advance after the first Enter stays #282.
Do not start #254.

## Relationship

Child of #24. Found by #260. Wiring is
`createRangeCalendar` capture `blur` / `commitBehavior` when
`relatedTarget` is null because cells remount. Distinct from #282
(missing `focusNearestAvailableDate`; DateRangePicker still finishes
the range). Distinct from #416 (pointer focus). Do not start #254.
