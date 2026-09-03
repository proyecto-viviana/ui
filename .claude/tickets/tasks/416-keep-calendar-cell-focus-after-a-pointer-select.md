---
id: 416
type: task
title: "Keep calendar cell focus after a pointer select"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 calendar functional pass: click February 12 selects both; React keeps DOM focus on the cell so ArrowRight moves to the 13th; Solid preventDefault on pointerdown leaves focus on BODY and ArrowRight is a no-op",
    }
---

Pointer-selecting a date on S2 Calendar leaves DOM focus on that cell
and the next arrow key moves from there. RAC `useCalendarCell` selects
on `onPress` (press up), calls `setFocusedDate` / `setFocused(true)`,
and does not `preventDefault` on pointerdown (it only
`releasePointerCapture` for drag).

Solid `createCalendarCell` `handlePointerDown` selects on pointerdown
and `preventDefault()` so the `role="button"` div never receives
focus. `isFocused` stays false, so the cell `focusSafely` effect does
not run. After a click, ArrowRight/ArrowLeft are no-ops because
keyboard is handled on the grid while it is focused.

Read-only click has the same focus drop (value stays put on both).

## Evidence

`http://127.0.0.1:4341/components/calendar/?focusedValue=2025-02-15`
— isolate one panel, click `Wednesday, February 12, 2025`, then
ArrowRight.

| | React | Solid |
|---|---|---|
| value | `2025-02-12` | same |
| focus after click | cell `Wednesday, February 12, 2025 selected` | **BODY** |
| ArrowRight | `2025-02-13`, focus Thursday 13 | **stays `2025-02-12`, focus BODY** |

Keyboard-only Enter/Space from Tab onto the cell still match (focus
stays, value updates). No overlay. No form.

## Done when

A pointer select on the comparison Calendar leaves DOM focus on the
selected cell the way S2 does, and a following ArrowRight moves to the
next day. A walk fails if focus is BODY after click. Do not start #254.

## Relationship

Child of #24. Found by #260. Wiring is
`packages/solidaria/src/calendar/createCalendarCell.ts`
(`handlePointerDown` `preventDefault`). Distinct from #279 (Next/Previous
paging focus + stale grid name). Distinct from #282 (range-start
advance). Do not start #254.
