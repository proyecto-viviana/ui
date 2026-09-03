---
id: 283
type: task
title: "Append First/Last available date to min/max calendar cell names"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 daterangepicker functional pass: constrainRange names React Feb 3/20 as First/Last available date and Solid as the bare weekday date; disabled day counts already match",
    }
  - {
      state: open,
      at: 2026-09-03,
      note: "#260 calendar functional pass: standalone Calendar ?constrainRange=true&focusedValue=2025-02-15 names React Monday, February 3, 2025, First available date / Thursday, February 20, 2025, Last available date and Solid the bare weekday dates. Disabled counts 17 both. Prev/Next disable stays #277.",
    }
  - {
      state: open,
      at: 2026-09-03,
      note: "#260 rangecalendar URL/live constrainRange: Previous/Next disabled on both (not #277); React cell names include First/Last available date; Solid omits. Same strings already in solidaria calendar intl",
    }
---

RAC `useCalendarCell` appends the localized min/max hint to the cell
name:

```
if (state.minValue && isSameDay(date, state.minValue)) {
  label += ', ' + stringFormatter.format('minimumDate');
} else if (state.maxValue && isSameDay(date, state.maxValue)) {
  label += ', ' + stringFormatter.format('maximumDate');
}
```

(`react-aria/src/calendar/useCalendarCell.ts:164-168`). en-US is
"First available date" / "Last available date".

Solid `createCalendarCell` and `createRangeCalendarCell` build the
selected/today suffix and stop. The strings already live in
`packages/solidaria/src/calendar/intl` (`minimumDate` / `maximumDate`,
including `fr-FR` "Première/Dernière date disponible") and are never
read.

## Evidence

`http://127.0.0.1:4341/components/daterangepicker/?value=2025-02-03/2025-02-14&constrainRange=true`
— isolate one panel, open Calendar, opacity 1.

Both: heading February 2025, Previous/Next `disabled=true`,
`disabledCount=17` (Jan 26–31, Feb 1–2, Feb 21–28, Mar 1).

- React focused `Thursday, February 20, 2025, Last available date`.
  Cells named `Monday, February 3, 2025, First available date` and
  `Thursday, February 20, 2025, Last available date`.
- Solid focused `Thursday, February 20, 2025`. Those two cells have no
  First/Last suffix (`lastAvailable=[]`).

Standalone Calendar
`http://127.0.0.1:4341/components/calendar/?focusedValue=2025-02-15&constrainRange=true`
— same names, `disabledCount=17` both. No overlay.

## Done when

Min and max cells on comparison DateRangePicker / DatePicker / Calendar /
RangeCalendar match React's accessible name, localized. A test fails if
a min/max cell name omits the catalog string. Previous/Next disable is
already correct on DateRangePicker and RangeCalendar (DatePicker-only
miss is #277).

## Relationship

Child of #24. Found by #260. Distinct from #277 (DatePicker prev/next
enabled under the same constrain). Distinct from #198 (S2 catalog).
