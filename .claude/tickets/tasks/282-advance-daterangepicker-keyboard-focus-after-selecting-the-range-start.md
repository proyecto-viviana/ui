---
id: 282
type: task
title: "Advance DateRangePicker keyboard focus after selecting the range start"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 daterangepicker functional pass: Enter on the range start leaves Solid on that cell (highlight 4–4) while React moves to the next day (highlight 4–5); the same extra ArrowRights then commit 4–6 vs 4–7",
    }
---

RAC range cells, on keyboard press with no anchor yet, select the date
and then auto-advance focus by one day so the highlight shows a range in
progress:

```
} else if (e.pointerType === 'keyboard' && !state.anchorDate) {
  state.selectDate(date);
  state.focusNearestAvailableDate(date);
}
```

(`react-aria/src/calendar/useCalendarCell.ts:300-306`).
`focusNearestAvailableDate` prefers `anchorDate + 1 day`, else −1, and
skips invalid dates
(`react-stately/src/calendar/useRangeCalendarState.ts:261-273`). Pointer
does not advance — hover already paints the in-progress range.

Solid `createRangeCalendarCell` keyboard `onClick` only calls
`state.selectDate(date())`
(`packages/solidaria/src/calendar/createRangeCalendarCell.ts:146-149`).
`createRangeCalendarState` has no `focusNearestAvailableDate`. Grid
Enter (`createCalendarGrid.ts:134-137`) also only `selectFocusedDate()`.

## Evidence

`http://127.0.0.1:4341/components/daterangepicker/?value=2025-02-03/2025-02-14`
— isolate one panel, open Calendar, ArrowRight to Tuesday 4, Enter, then
ArrowRight twice, Enter.

After first Enter:

- React focus `Wednesday, February 5, 2025 selected`; selected 4 and 5.
- Solid focus `Tuesday, February 4, 2025 selected`; selected 4 only.

After two more ArrowRight + Enter: React commits `2025-02-04/2025-02-07`;
Solid commits `2025-02-04/2025-02-06`. Overlay closes on both.

Pointer two-click on the same route commits the same dates on both
(no auto-advance). From an empty value, Enter on today shows the same
extra-advance on React only.

## Done when

Keyboard-selecting the range start on the comparison DateRangePicker
moves focus to the next available day and highlights the in-progress
range the way React does. A test fails if Enter on the start leaves
focus on that cell. Pointer must not auto-advance.

## Relationship

Child of #24. Found by #260. Lowest layer: `createRangeCalendarCell`
keyboard press + `focusNearestAvailableDate` on range state.
