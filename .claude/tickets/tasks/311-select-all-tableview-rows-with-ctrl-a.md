---
id: 311
type: task
title: "Select all TableView rows with Ctrl+A"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 tableview functional pass: isolated Tab onto the focused row then Ctrl+A selects all three rows on React and leaves project-brief on Solid",
    }
---

Multiple TableView Ctrl+A must select every enabled row. React does.
Solid `createTable` has `case "a"` → `selectAll()`, but isolated
Ctrl+A from the focused row does not change `selectedKeys`.

## Evidence

`http://127.0.0.1:4341/components/tableview/`, islands mounted, one
panel at a time. Tab from Before lands on Project brief on both
(`role=row`, `tabIndex=0`, `aria-selected=true`). Then Control+A:

| | React | Solid |
|---|---|---|
| selectedKeys | `project-brief,quarterly-report,budget` | `project-brief` |
| focus | stays Project brief row | stays Project brief row |

Not a cell-focus artifact: both panels still have DOM focus on the
row. Pointer Select All mixed→all→none still matches (#20). GridList
Ctrl+A already matches (not this bug).

## Done when

Ctrl+A from the focused body row selects all enabled rows, matching
React. A comparison-route keyboard walk fails if Solid stays on
`project-brief`.

## Relationship

Child of #24. Found by #260. Distinct from #20 (Select All mixed) and
from GridList (Ctrl+A matched there). Do not start #254.
