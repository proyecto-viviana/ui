---
id: 417
type: task
title: "Disable outside-month calendar cells the way RAC does"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 calendar functional pass: visibleMonths=2 February grid hides March 1 with display:none on both; React marks that cell aria-disabled and keeps one tabIndex 0 after ArrowRight from Feb 28; Solid leaves it enabled and puts tabIndex 0 on both March 1 copies",
    }
---

RAC `useCalendarCell` folds `isOutsideMonth` into disabled:

```
isDisabled = isDisabled || state.isCellDisabled(date) || !!props.isOutsideMonth;
```

(`react-aria/src/calendar/useCalendarCell.ts`). That is what disables
the leading/trailing days that belong to another *visible* month when
`visibleMonths > 1` (those dates are inside `visibleRange`, so
`isCellDisabled` is false). S2 then `display:none`s them; the remaining
copy in the in-month grid is the only tabbable cell for that date.

Solid `createCalendarCell` uses only
`props.isDisabled || state.isCellDisabled(date)`. The February grid's
March 1 stays `aria-disabled=null` with `display:none`. After ArrowRight
from February 28, **both** March 1 buttons get `tabIndex=0` (roving
tabindex is keyed on `isSameDay(date, focusedDate)` without the
outside-month gate). AX lists an extra enabled March 1 in the February
grid.

Single-month padding days already match (they are outside `visibleRange`,
so `isCellDisabled` is true on both).

## Evidence

`http://127.0.0.1:4341/components/calendar/?focusedValue=2025-02-15&visibleMonths=2`
— isolate one panel.

February grid March 1: both `display:none` / 0×0. React
`aria-disabled=true` `tabIndex=-1`. Solid `aria-disabled=null`
`tabIndex=-1`. Disabled cell counts 7 vs 6 (Feb) and 11 vs 5 (March).

`?focusedValue=2025-02-28&visibleMonths=2`, Tab to Feb 28, ArrowRight:

| | React | Solid |
|---|---|---|
| focusedValue | `2025-03-01` | same |
| Feb-grid March 1 | disabled, tab -1 | **enabled, tab 0** (still `display:none`) |
| March-grid March 1 | tab 0, focused | tab 0, focused |

## Done when

Outside-month cells on comparison Calendar (one and many months) match
S2: `aria-disabled`, not in the tab order, one `tabIndex=0` cell per
focused date. A walk fails if ArrowRight from Feb 28 under
`visibleMonths=2` leaves two tabbable March 1 buttons. Do not start
#254.

## Relationship

Child of #24. Found by #260. Wiring is
`packages/solidaria/src/calendar/createCalendarCell.ts` (`isDisabled`
omits `props.isOutsideMonth`). Distinct from #279 (grid name / Next
focus) and from #418 (live `visibleMonths` snapshot). RangeCalendar
shares the cell hook. Do not start #254.
