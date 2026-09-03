---
id: 326
type: task
title: "Move TreeView ArrowRight onto checkbox and item actions"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 treeview functional pass: from expanded Documents, React first ArrowRight focuses Select INPUT then back to the row; Solid first ArrowRight moves to Project, second to Weekly Report. buttonGroup: React Weekly Report → Select → Archive Weekly Report; Solid stays on the row. createTree onKeyDown preventDefault on ArrowRight and expands/moves to first child",
    }
---

S2 TreeView `keyboardNavigationBehavior` defaults to `"arrow"`:
Left/Right move focus among intra-row widgets (selection checkbox,
Archive, ActionMenu). Expand/collapse is a later press, not the first
ArrowRight on an already-expanded row.

Solid `createTreeItem` already merges
`mergeCollectionRowInteractionProps`, but `createTree` `onKeyDown`
`preventDefault`s ArrowRight/ArrowLeft and treats Right as
expand-or-first-child. The tree handler wins, so intra-row widgets
never receive focus.

## Evidence

`http://127.0.0.1:4341/components/treeview/`, islands mounted, one panel
at a time. Home lands on expanded Documents on both. Then:

| | React | Solid |
|---|---|---|
| ArrowRight | INPUT name Select | row Project |
| ArrowRight again | back on Documents | row Weekly Report |
| ArrowLeft from Documents | collapses Documents | from Weekly Report, moves to Project |

`?itemActionSlot=buttonGroup`, Tab to Weekly Report:

| | React | Solid |
|---|---|---|
| ArrowRight | INPUT Select | stays Weekly Report |
| ArrowRight again | button Archive Weekly Report | stays Weekly Report |

Analogous to #305 (ListView), TreeView-specific because the steal is
`createTree` not `createGridList`.

## Done when

From the focused expanded Documents row, ArrowRight focuses the Select
checkbox then returns to the row, and with `itemActionSlot=buttonGroup`
ArrowRight from Weekly Report reaches Archive Weekly Report, matching
React. A comparison-route keyboard walk fails if Solid moves to a child
row or stays on the row.

## Relationship

Child of #24. Found by #260. Handler conflict is
`packages/solidaria/src/tree/createTree.ts` vs
`createCollectionRowInteraction.ts`. Not #305. Do not start #254.
