---
id: 313
type: task
title: "Keep TableView row checkboxes out of the tab order"
created: 2026-09-03
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 tableview functional pass: React Tab is Before → focused row → After; Solid then visits three native Select checkbox inputs before After",
    }
  - {
      state: merged,
      at: 2026-09-03,
      note: "TableSelectionCheckbox is always tabIndex=-1 so Tab skips the native Select inputs.",
    }
---

S2 TableView uses roving tabindex on the grid: Tab enters the focused
row and the next Tab leaves. Solid renders native checkbox inputs
without `tabIndex=-1`, so they stay in the page tab order.

## Evidence

`http://127.0.0.1:4341/components/tableview/`, islands mounted, one
panel at a time. Tab from Before:

|     | React             | Solid             |
| --- | ----------------- | ----------------- |
| 1   | Project brief row | Project brief row |
| 2   | After             | Select (input)    |
| 3   |                   | Select (input)    |
| 4   |                   | Select (input)    |
| 5   |                   | After             |

Default rest AX still matches (checkboxes are named). Pointer
checkbox clicks still match. Native `<table>` (#89) does not require
these inputs to be tabbable.

## Done when

Tab from Before lands on the focused row and the next Tab lands on
After, matching React. A comparison-route tab trail fails if a
`Select` checkbox input is visited.

## Relationship

Child of #24. Found by #260. Related to #89 (native table) but not
owned by it — the inputs can be `tabIndex=-1` without changing the
table tag. Do not start #254.
