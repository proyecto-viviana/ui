---
id: 423
type: task
title: "Extend a RangeCalendar drag across hovered cells"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 rangecalendar functional pass: pointerdown on Feb 8 then drag to Feb 12 commits 8–12 on React and leaves Solid at 3–7 with only day 8 selected; two-click 8 then 14 already matches",
    }
---

RAC range cells merge `usePress` / drag `onPointerEnter` with
`useHover` through `mergeProps`, so a pointerdown that sets
`isDragging` still receives later `pointerenter` on each cell and
calls `setFocusedDate`. That extends the in-progress range while the
pointer is down.

Solid `createRangeCalendarCell` does set `isDragging` on the first
`selectDate` and exposes `onPointerEnter` that calls
`state.setFocusedDate` while dragging
(`packages/solidaria/src/calendar/createRangeCalendarCell.ts`). The
headless cell then spreads hover second:

```
{...cellAria.buttonProps}
{...hoverProps}
```

(`packages/solidaria-components/src/RangeCalendar.tsx`). `createHover`
`onPointerEnter` replaces the drag handler instead of chaining it, so
the highlight never leaves the press cell. Pointer **up** is not the
gap — two discrete clicks already commit the same range on both
stacks.

## Evidence

`http://127.0.0.1:4341/components/rangecalendar/`, islands mounted.
Other `.s2-framework-panel` `visibility:hidden` + `inert`. Pointer
down on Saturday 8, move to Wednesday 12, pointer up.

|              | React                   | Solid                       |
| ------------ | ----------------------- | --------------------------- |
| value        | `2025-02-08/2025-02-12` | **`2025-02-03/2025-02-07`** |
| selected     | 8–12                    | **8 only**                  |
| focusedValue | `2025-02-12`            | `2025-02-08`                |
| focus        | cell Wednesday 12       | BODY (`#416`)               |

Click 8 then click 14 (no drag): both `2025-02-08/2025-02-14`,
selected 8–14.

## Done when

A press-and-drag on the comparison RangeCalendar extends the
in-progress range through the hovered cells the way S2 does, and
pointer-up commits that range. A walk fails if Solid stays on the
press-day (or the previous value) while React shows 8–12. Two-click
must keep matching. Do not start #254.

## Relationship

Child of #24. Found by #260. Wiring is
`packages/solidaria-components/src/RangeCalendar.tsx` cell
`{...buttonProps}{...hoverProps}` (needs `mergeProps`) plus the drag
`onPointerEnter` in `createRangeCalendarCell`. Distinct from #416
(pointerdown `preventDefault` drops focus; two-click still commits).
Do not start #254.
