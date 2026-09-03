---
id: 418
type: task
title: "Keep calendar visibleMonths reactive after mount"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 calendar functional pass: live visibleMonths=2 grows a second grid on both and sizes 472px; React names Event date, February to March 2025 with March days enabled; Solid keeps Event date, February 2025 and disables 36 of 42 March cells. URL ?visibleMonths=2 remounts and matches except #417",
    }
  - {
      state: open,
      at: 2026-09-03,
      note: "#260 rangecalendar live visibleMonths=2: both grow a March grid (height 278, 77 cells); React application+heading0 Trip dates, February to March 2025; Solid stays Trip dates, February 2025. createRangeCalendarState also snapshots visibleMonths at init (access once). URL remount already names February to March on both",
    }
---

S2 Calendar `visibleMonths` is read every render, so a live control
change expands `visibleRange`, the application name, and which cells
are in-range.

Solid `createCalendarState` snapshots it once:

```
const visibleMonths = props.visibleMonths ?? 1;
```

(`packages/solid-stately/src/calendar/createCalendarState.ts`). The
styled wrapper's `For` over `visibleMonths()` still mounts extra
`CalendarGrid`s, so the second month appears, but state
`visibleRange` stays one month: the title does not become
"February to March 2025", and every March cell is
`isCellDisabled` (outside the February range).

URL `?visibleMonths=2` remounts with the value at init and matches
aside from #417. Live `pageBehavior` is read inside
`focusNextPage` from `props` and already updates. Live
`firstDayOfWeek` / `isDisabled` already match.

## Evidence

`http://127.0.0.1:4341/components/calendar/?focusedValue=2025-02-15`,
islands mounted. `comparison:controls-change` with
`{visibleMonths:"2"}`.

| | React | Solid |
|---|---|---|
| app name | **Event date, February to March 2025** | **Event date, February 2025** |
| width | 472 | 472 |
| grids | 2 | 2 |
| March grid disabled cells | 11 | **36** |
| March 1 in March grid | enabled | **aria-disabled** |

`?visibleMonths=2&focusedValue=2025-02-15` rest: both named
February to March 2025, March in-range days enabled (outside-month
padding still #417).

## Done when

Live `visibleMonths` on the comparison Calendar updates
`visibleRange`, the application/grid names, and in-range cell
enablement to match S2. A walk fails if a second grid mounts with
every cell disabled while React shows March. URL remount must keep
working. Do not start #254.

## Relationship

Child of #24. Found by #260. Wiring is
`packages/solid-stately/src/calendar/createCalendarState.ts`
(`const visibleMonths = props.visibleMonths ?? 1`) and
`createRangeCalendarState.ts` (`access(props.visibleMonths)` once).
Distinct from #417 (outside-month disable when the range *is* two
months) and from #395 / #414 / #426 (uncontrolled remount). Do not
start #254.
