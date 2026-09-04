---
id: 278
type: task
title: "Keep DatePicker field segments in the locale calendar when createCalendar is set"
created: 2026-09-03
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 datepicker functional pass: calendarSystem=custom454 keeps React field 2/14/2025 and turns Solid field into 1/13/2025 while both calendars stay on Friday, February 14, 2025",
    }
  - {
      state: merged,
      at: 2026-09-03,
      note: "createCalendar is split off DatePicker field props and passed only to the popover Calendar.",
    }
---

S2 DatePicker picks `createCalendar` off the DateField rest props and
passes it only to the popover Calendar
(`react-spectrum/packages/@react-spectrum/s2/src/DatePicker.tsx`:
`createCalendar` is destructured next to `maxVisibleMonths`, then
`<Calendar createCalendar={createCalendar} />`). The segmented field
stays on the locale/Gregorian calendar.

Solid DatePicker `splitProps` puts `createCalendar` in `calendarProps`
and spreads that object onto `HeadlessDatePicker`
(`packages/solid-spectrum/src/calendar/DatePicker.tsx`). Headless
`createDateFieldState({ ...stateProps })` therefore receives
`createCalendar`, so the field formats in the custom calendar.

## Evidence

`http://127.0.0.1:4341/components/datepicker/?value=2025-02-14&calendarSystem=custom454`
— isolate one panel, `data-islands-mounted`.

Both: `comparisonValue` `2025-02-14`. Open calendar: heading
`February 2025`, overlay 304×262, grid 224×158, focus
`Friday, February 14, 2025 selected`. Description still
`Selected Date: February 14, 2025`.

Field segments:

- React: `2` / `14` / `2025`, month valuetext `2 – February`, canvas
  `Due date 2/14/2025`.
- Solid: `1` / `13` / `2025`, month valuetext `1 – February`, canvas
  `Due date 1/13/2025`.

## Done when

`calendarSystem=custom454` (and any `createCalendar`) on the comparison
DatePicker leaves field segments on `2/14/2025` like React, while the
popover Calendar still uses the custom calendar. A test fails if the
month/day spinbuttons show 1/13 for Gregorian 2025-02-14.

## Relationship

Child of #24. Found by #260. The Calendar overlay already matches; this
is the field-only leak of `createCalendar` onto DateField state.
