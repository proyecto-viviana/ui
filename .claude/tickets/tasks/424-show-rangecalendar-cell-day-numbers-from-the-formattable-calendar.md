---
id: 424
type: task
title: "Show RangeCalendar cell day numbers from the formattable calendar"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 rangecalendar functional pass: ?calendarSystem=custom454 paints React cell texts 2/3/4/5/6/7/8 and Solid 1/2/3/4/5/6/7 while both AX names stay Monday February 3–Friday February 7; Calendar slug already matches (createCalendarCell uses formatToParts)",
    }
---

RAC / S2 `useCalendarCell` paints the visible day from
`DateFormatter.formatToParts(...).find(part => part.type === 'day')`
so a `createCalendar` whose `date.day` is not the formattable
Gregorian day (Adobe 454) still shows 2, 3, 4 on the first week of
February 2025.

Solid `createCalendarCell` already does that
(`packages/solidaria/src/calendar/createCalendarCell.ts`). Range cells
do not:

```
const formattedDate = createMemo(() => {
  return date().day.toString();
});
```

(`packages/solidaria/src/calendar/createRangeCalendarCell.ts`). In
custom454 that is 1..7 for the same Sunday–Saturday row whose
accessible names are still Gregorian February 2–8. The selected-range
description and `comparisonValue` stay `2025-02-03/2025-02-07` on
both; only the painted number is wrong.

## Evidence

`http://127.0.0.1:4341/components/rangecalendar/?calendarSystem=custom454`,
islands mounted. Isolate one panel.

Both: heading `Trip dates, February 2025`, 28 cells, height 214,
selected AX names Monday Feb 3 – Friday Feb 7, value
`2025-02-03/2025-02-07`.

First-row button text:

- React: `2` `3` `4` `5` `6` `7` `8`
- Solid: **`1` `2` `3` `4` `5` `6` `7`**

Gregorian default (no `calendarSystem`) already matches `1`–`28`.
Calendar `?calendarSystem=custom454` already matches (not this
ticket).

## Done when

RangeCalendar cell text on the comparison route under
`calendarSystem=custom454` matches S2's formattable day numbers. A
walk fails if Monday 3 February paints `2` on Solid and `3` on React.
Accessible names must stay the Gregorian weekday date. Do not start
#254.

## Relationship

Child of #24. Found by #260. Wiring is
`createRangeCalendarCell` `formattedDate` (copy the
`createCalendarCell` `formatToParts` path). Distinct from #278
(DatePicker **field** segments in the custom calendar). Distinct from
#198 (catalog strings). Do not start #254.
