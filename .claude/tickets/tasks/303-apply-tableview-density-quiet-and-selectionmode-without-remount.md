---
id: 303
type: task
title: "Apply TableView density, quiet, and selectionMode without remount"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 tableview functional pass: live comparison:controls-change to selectionMode none + compact + quiet updates Solid data-comparison-control-props but leaves 4 checkboxes and 40px rows; URL remount applies both stacks. React remounts via renderKey",
    }
---

S2 TableView applies `selectionMode`, `density`, and `isQuiet` when
those props change on a live instance. Solid TableView shows the new
values on `data-comparison-control-props` and keeps the previous
checkbox column and row height until the island remounts.

## Evidence

`http://127.0.0.1:4341/components/tableview/`, islands mounted. Live
`comparison:controls-change` to
`{selectionMode:"none", isQuiet:true, density:"compact"}`:

|               | React                  | Solid |
| ------------- | ---------------------- | ----- |
| control-props | none / compact / quiet | same  |
| checkboxes    | 0                      | 4     |
| row heights   | 32px                   | 40px  |

URL remount already matches: `?density=compact` is 32px on both,
`?selectionMode=none` is 0 checkboxes on both, `?isQuiet=true` rest
AX matches. Live `selectionMode=single` also matches (3 checkboxes).
The React fixture remounts the TableView through `renderKey`; Solid
updates `demoProps` in place through getters.

## Done when

A live `selectionMode` / `density` / `isQuiet` change on an already
mounted TableView drops the checkbox column and compact row height
without remounting, matching the URL path. A comparison-route live
control walk fails if Solid keeps 4 checkboxes or 40px rows.

## Relationship

Child of #24. Found by #260. Not #169 (SelectBox `children()`
snapshot) and not a harness-only remount — a Solid consumer changing
those props in place hits the same gap. Do not start #254.
