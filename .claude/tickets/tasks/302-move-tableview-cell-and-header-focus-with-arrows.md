---
id: 302
type: task
title: "Move TableView cell and header focus with arrows"
created: 2026-09-03
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 tableview functional pass: ArrowRight/End/RTL arrows and ArrowUp+Enter into the header set focusedKey on Solid but do not move DOM focus, so the second cell press is tabIndex -1 and header Enter fires onAction on the body row",
    }
  - {
      state: merged,
      at: 2026-09-03,
      note: "Column headers expose data-key; createTable focuses via CSS.escape query and skips disabled keys so ArrowRight/ArrowUp+Enter move DOM focus.",
    }
---

S2 TableView cell navigation moves DOM focus to the target cell or
column header. Solid `createTable` updates `focusedKey` and does not
focus the matching element, so the roving `tabIndex` falls off the
old cell and header Enter activates the body row.

## Evidence

`http://127.0.0.1:4341/components/tableview/`, islands mounted, one
panel at a time. Tab onto Project brief, then:

| key               | React                     | Solid                          |
| ----------------- | ------------------------- | ------------------------------ |
| ArrowRight        | checkbox input "Select"   | empty `gridcell`, `tabIndex=0` |
| second ArrowRight | Name `rowheader`          | same empty cell, `tabIndex=-1` |
| End               | Status `gridcell` "Ready" | unnamed cell, `tabIndex=-1`    |

`?locale=ar-AE` ArrowRight from the row: React focuses Status
"Ready"; Solid stays on the row with `tabIndex=-1`.

`?sortColumn=name&sortDirection=ascending&selectionMode=none`: Tab,
ArrowUp, Enter. React toggles Name to `aria-sort=descending`. Solid
stays on Budget and writes `data-comparison-action-key=budget`
(Enter is onAction on the body row). Pointer header clicks still
match (Name desc, Type asc, same row order).

## Done when

ArrowRight from a focused row moves DOM focus across checkbox → Name
→ … → Status, RTL ArrowRight lands on Status, and ArrowUp+Enter from
the first body row toggles the Name header sort, matching React. A
comparison-route walk fails if the second ArrowRight leaves
`tabIndex=-1` on the old cell or if header Enter fires `onAction`.

## Relationship

Child of #24. Found by #260. Same `setFocusedKey`-without-DOM-focus
root as #312 (typeahead). Not #89 (tags). Do not start #254.
