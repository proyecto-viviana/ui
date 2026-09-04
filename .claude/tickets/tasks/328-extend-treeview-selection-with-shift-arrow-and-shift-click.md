---
id: 328
type: task
title: "Extend TreeView selection with Shift+Arrow and Shift+click"
created: 2026-09-03
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 treeview functional pass: Shift+ArrowDown from Weekly Report extends React to weekly-report,budget then +client-notes; Solid only moves focus, selection stays weekly-report. Shift-click Budget then Archive: both first add budget; React keeps weekly-report+budget…archive (skips project); Solid replaces with budget…archive and drops weekly-report. createTree ArrowDown preventDefault without extendSelection",
    }
  - {
      state: merged,
      at: 2026-09-03,
      note: "createTree Shift+Arrow calls extendSelection; Tree/Grid state falls back to focusedKey when the selection anchor is unset.",
    }
---

S2 TreeView multiple selection extends the range with Shift+Arrow and
Shift+click from the anchor. Solid `createTree` ArrowDown/ArrowUp
always `preventDefault` and `setFocusedKey` without
`extendSelection`, so Shift+Arrow only moves focus. Shift+click
replaces the range from the newly clicked row instead of keeping the
original anchor.

## Evidence

`http://127.0.0.1:4341/components/treeview/`, islands mounted, one panel
at a time. Tab lands on Weekly Report (`selectedKeys=weekly-report`) on
both.

Shift+ArrowDown:

|        | React                                                       | Solid                                   |
| ------ | ----------------------------------------------------------- | --------------------------------------- |
| first  | sel `weekly-report,budget`, focus Budget                    | sel `weekly-report`, focus Budget       |
| second | sel `weekly-report,budget,client-notes`, focus Client Notes | sel `weekly-report`, focus Client Notes |

Shift-click Budget, then Shift-click Archive:

|         | React                                                                | Solid                                                      |
| ------- | -------------------------------------------------------------------- | ---------------------------------------------------------- |
| Budget  | `weekly-report,budget`                                               | `weekly-report,budget`                                     |
| Archive | `weekly-report,budget,client-notes,photos,archive` (project omitted) | `budget,client-notes,photos,archive` (drops weekly-report) |

Unmodified click/Space still toggle on both. Ctrl+A and Escape match.

## Done when

Shift+ArrowDown from Weekly Report extends selection through Budget
then Client Notes, and Shift-click Archive from a Budget range keeps
the weekly-report anchor, matching React. A comparison-route walk
fails if Solid only moves focus or replaces the range.

## Relationship

Child of #24. Found by #260. Tree-level ArrowDown is
`packages/solidaria/src/tree/createTree.ts`. Not #296 (GridList
click/Space replace). Do not start #254.
