---
id: 318
type: task
title: "Tab only the focused tag's Remove button then exit"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 taggroup functional pass: isolated Tab from Before is Landscape then that tag's Remove then After on React, and Landscape then every Remove on Solid; Shift+Tab from After lands Landscape on React and Night's Remove on Solid",
    }
---

S2 TagGroup Tab order is Before → focused tag → that tag's Remove →
After. Other Remove buttons report `tabIndex=0` but are skipped. Solid
walks every Remove. Shift+Tab from After trampolines onto the focused
tag on React and onto the last Remove on Solid.

`allowsRemoving=false` Tab/Shift+Tab already match (Landscape then
After; Shift+Tab from After → Night).

## Evidence

`http://127.0.0.1:4341/components/taggroup/`, islands mounted, one panel
at a time (`visibility:hidden` + `inert` on the other
`.s2-framework-panel`). Focus Before, then Tab:

|       | React                | Solid                |
| ----- | -------------------- | -------------------- |
| Tab 1 | Landscape `role=row` | Landscape `role=row` |
| Tab 2 | Remove Landscape     | Remove Landscape     |
| Tab 3 | After                | Remove Portrait      |
| Tab 4 | (out)                | Remove Travel        |

Shift+Tab from After with removes:

|       | React                                         | Solid                                                    |
| ----- | --------------------------------------------- | -------------------------------------------------------- |
| focus | Landscape row, `data-focus-visible`, 2px ring | Night's Remove; `focusedKey` null; all rows `tabIndex=0` |

## Done when

Tab from Before with removable tags is Landscape → that tag's Remove →
After, and Shift+Tab from After lands on the focused tag, matching
React. A comparison-route isolated Tab walk fails if the third Tab is
Remove Portrait.

## Relationship

Child of #24. Found by #260. Distinct from #54 (spine rewrite) and
from #313 (TableView row checkboxes). Do not start #254.
