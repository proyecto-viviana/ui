---
id: 314
type: task
title: "Skip a disabled TableView row on ArrowDown"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 tableview functional pass: disabledItem=quarterly-report, Tab then ArrowDown lands Budget on React; Solid first press leaves Project brief at tabIndex -1 and the second press lands Budget. createTable ArrowDown uses getKeyAfter without skipping disabled",
    }
---

S2 TableView arrow navigation skips disabled rows. Solid
`createTable` ArrowDown/ArrowUp uses `collection.getKeyAfter` /
`getKeyBefore` with no disabled skip, so the first ArrowDown onto a
disabled row drops roving `tabIndex` and a second press is needed to
reach the next enabled row.

## Evidence

`http://127.0.0.1:4341/components/tableview/?disabledItem=quarterly-report`,
islands mounted, one panel at a time. Default AX matches (Quarterly
`aria-disabled=true`). Pointer click on Quarterly is ignored on both;
click Budget adds it on both. Tab lands on Project brief, then
ArrowDown:

| | React | Solid |
|---|---|---|
| first ArrowDown | focus Budget, `tabIndex=0` | focus stays Project brief, `tabIndex=-1`, no row is tabbable |
| second ArrowDown | stays Budget | focus Budget, `tabIndex=0` |

`?disabledKeys=budget` rest AX/disabled flags match; this ticket is
the arrow skip, not the disabled paint.

## Done when

ArrowDown from Project brief with Quarterly disabled lands on Budget
on the first press, matching React. A comparison-route keyboard walk
fails if the first press leaves no row at `tabIndex=0`.

## Relationship

Child of #24. Found by #260. Distinct from #290 (SelectBox
`isDisabled`) and from pointer skip (already matches). Do not start
#254.
