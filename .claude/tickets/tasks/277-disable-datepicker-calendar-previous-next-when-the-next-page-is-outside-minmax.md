---
id: 277
type: task
title: "Disable DatePicker calendar previous/next when the next page is outside min/max"
created: 2026-09-03
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 datepicker functional pass: constrainRange min Feb 3 / max Feb 20 leaves React Previous/Next disabled and Solid Previous/Next enabled",
    }
  - {
      state: merged,
      at: 2026-09-03,
      note: "createCalendarState exposes isPrevious/NextVisibleRangeInvalid; createCalendar and CalendarButton honor them.",
    }
---

When the visible month is the only page inside `minValue`/`maxValue`, S2
DatePicker's calendar Previous and Next are native-disabled.
`useCalendarState` exposes `isPreviousVisibleRangeInvalid` /
`isNextVisibleRangeInvalid` (prev = startDate−1 invalid; next = endDate+1
invalid). `useCalendar` sets `isDisabled` on those buttons from those
methods (`react-aria/src/calendar/useCalendarBase.ts`).

Solid range calendar already has both methods and wires them in
`createRangeCalendar.ts`. Single `createCalendarState` does not expose
them. `createCalendar.ts` prev/next only checks `props.isDisabled ||
state.isDisabled()`, so the buttons stay enabled.

## Evidence

`http://127.0.0.1:4341/components/datepicker/?value=2025-02-14&constrainRange=true`
— isolate one panel, open Calendar, wait until opacity 1.

Both: heading `February 2025`, overlay 304×294, opacity 1, grid
`February 2025`, same disabled days (1–2 and 21–28), focus
`Friday, February 14, 2025 selected`.

- React Previous / Next: `disabled=true`.
- Solid Previous / Next: `disabled=false`.

Standalone Calendar
`http://127.0.0.1:4341/components/calendar/?focusedValue=2025-02-15&constrainRange=true`
is the same miss (no overlay): React Previous/Next `disabled=true`,
Solid `disabled=false`. Click Solid Next focuses `2025-02-20`.

`packages/solid-stately/src/calendar/createCalendarState.ts` has no
`isPreviousVisibleRangeInvalid` / `isNextVisibleRangeInvalid`.
`packages/solidaria/src/calendar/createCalendar.ts` prev/next omit them.
Range copies live in `createRangeCalendarState.ts:736-746` and
`createRangeCalendar.ts:138,154`.

## Done when

Constrained DatePicker and standalone Calendar Previous/Next match
React: native disabled when the next page is outside min/max. A
package or comparison test fails if those buttons stay enabled on
February 2025 with min Feb 3 / max Feb 20.

## Relationship

Child of #24. Found by #260. Distinct from #236 (selecting a date outside
the visible range when `isDateUnavailable` is set).
