---
id: 279
type: task
title: "Keep focus on the DatePicker next/previous button and update the grid name after paging"
created: 2026-09-03
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 datepicker functional pass: Next pages both calendars to March 2025; React keeps focus on Next and names the grid March, Solid moves focus to March 14 and leaves the grid aria-label February",
    }
  - {
      state: open,
      at: 2026-09-03,
      note: "#260 calendar functional pass: standalone Calendar PageDown/PageUp/Shift+PageDown/pointer Next/Prev/live focusedValue leave Solid grid aria-label on the first-render month while heading/app/cells update. Pointer Next/Prev leave Solid focus BODY (DatePicker steals to a cell because the overlay calendar is already focused). Distinct from pointer-select BODY (#416).",
    }
  - {
      state: open,
      at: 2026-09-03,
      note: "#260 rangecalendar: click Next pages heading to March 2025 and focusedValue 2025-03-03 on both; React grid name Trip dates, March 2025 and focus nav:Next; Solid grid name still Trip dates, February 2025 and focus BODY. Same stale names after Previous, visibleMonths=2 Next (April/May vs Feb/March), pageBehavior single/visible Next, and live focusedValue April",
    }
  - {
      state: merged,
      at: 2026-09-03,
      note: "CalendarGrid start/end are getters; heading For keys by offset so Next/Previous stay mounted; paging clears calendar-level focus.",
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

Standalone Calendar
`http://127.0.0.1:4341/components/calendar/?focusedValue=2025-02-15`
— isolate, click Next (or PageDown). Heading becomes March 2025 on
both; Solid grid `aria-label` stays `Event date, February 2025`.
Pointer Next/Prev leave Solid focus BODY rather than a cell (the
standalone grid is not already focused). Live `focusedValue=2025-05-15`
has the same stale grid name.

## Done when

Clicking Next/Previous on the comparison DatePicker, Calendar, or
RangeCalendar keeps focus on that button and sets the grid accessible
name to the new month, same as React. A test fails if focus is on a cell
or BODY, or the grid name stays on the previous month after a successful
page.

## Relationship

Child of #24. Found by #260. Distinct from #277 (whether Next is disabled
under min/max). Distinct from #416 (pointer-select focus drop). The
heading already pages; this is grid name + focus. Standalone Calendar
hits the same grid-name freeze; Next focus lands on BODY there.
RangeCalendar is the same BODY + stale grid name.
