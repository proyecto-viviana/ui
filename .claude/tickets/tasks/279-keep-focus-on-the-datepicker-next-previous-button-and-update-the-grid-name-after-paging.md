---
id: 279
type: task
title: "Keep focus on the DatePicker next/previous button and update the grid name after paging"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 datepicker functional pass: Next pages both calendars to March 2025; React keeps focus on Next and names the grid March, Solid moves focus to March 14 and leaves the grid aria-label February",
    }
---

Paging the DatePicker calendar with Next/Previous must keep DOM focus on
that button and rename the grid to the new month. RAC `useCalendar`
next/prev use `onPress` (Button `preventFocusOnPress`).
`useCalendarGrid` names the grid from the grid's own `startDate`/`endDate`,
which update with the visible range.

Solid `CalendarGrid` calls `createCalendarGrid` once with
`startDate: startDate()` / `endDate: endOfMonth(startDate())` as plain
dates (`packages/solidaria-components/src/Calendar.tsx`). The grid
`aria-label` memo then stays on the month from first render. Heading
uses `state.title()` and does update. `CalendarButton` uses native
`onClick` from `createCalendar.ts`; `focusNextPage` moves
`focusedDate`, and the cell focus effect steals focus off Next.

## Evidence

`http://127.0.0.1:4341/components/datepicker/?value=2025-02-14`
— isolate one panel, open Calendar, click Next, wait until opacity 1.

Both: heading `March 2025`, overlay 304×326, opacity 1, value stays
`2025-02-14`.

- React: focus `button` name `Next`; grid `aria-label` `March 2025`; no
  focused cell.
- Solid: focus `div` role=button name `Friday, March 14, 2025`; grid
  `aria-label` still `February 2025`; focused cell `14`.

The March cell content is real on both; only the grid name and focus
target diverge.

## Done when

Clicking Next/Previous on the comparison DatePicker calendar keeps focus
on that button and sets the grid accessible name to the new month, same
as React. A test fails if focus is on a cell or the grid name stays on
the previous month after a successful page.

## Relationship

Child of #24. Found by #260. Distinct from #277 (whether Next is disabled
under min/max). The heading already pages; this is grid name + focus.
