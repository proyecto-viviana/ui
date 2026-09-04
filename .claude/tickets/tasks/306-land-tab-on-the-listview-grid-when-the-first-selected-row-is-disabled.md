---
id: 306
type: task
title: "Land Tab on the ListView grid when the first selected row is disabled"
created: 2026-09-03
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 listview functional pass: ?disabledItem=project-brief Tab lands React on the grid then ArrowDown Quarterly; Solid Tab lands on Quarterly then ArrowDown Budget. Solid also keeps aria-selected on the disabled selected row; RAC omits it",
    }
  - {
      state: merged,
      at: 2026-09-03,
      note: "Entry focus prefers firstSelectedKey; disabled selected rows omit aria-selected; grid stays tabbable when the focused key is navigation-disabled.",
    }
---

When the default selected row is also disabled, RAC keeps the grid as the
tab stop (`tabIndex=0` on the grid, no `aria-selected` on the disabled
row). ArrowDown then moves to the first enabled row. Solid Tabs onto that
first enabled row immediately, so one ArrowDown overshoots, and the
disabled selected row stays `[disabled][selected]`.

`createGridListItem` sets `aria-selected` whenever `selectionMode !==
"none"` and the key is selected, including disabled keys
(`packages/solidaria/src/gridlist/createGridListItem.ts:123`).

## Evidence

`http://127.0.0.1:4341/components/listview/?disabledItem=project-brief`,
islands mounted, one panel at a time. `selectedKeys` stay
`project-brief` on both.

Rest AX:

|                       | React                     | Solid                   |
| --------------------- | ------------------------- | ----------------------- |
| first row             | `[disabled]`, no selected | `[disabled] [selected]` |
| checkbox on first row | present, checked          | present, checked        |

Tab from Before, then ArrowDown:

|           | React                  | Solid               |
| --------- | ---------------------- | ------------------- |
| Tab       | focus grid "Documents" | focus row Quarterly |
| ArrowDown | focus Quarterly        | focus Budget        |

`?disabledItem=quarterly-report` and `?disabledKeys=quarterly-report`
skip the disabled row on click/arrow on both (not #290). This ticket is
only the disabled-and-selected first row.

## Done when

Tab from Before lands on the Documents grid, ArrowDown focuses Quarterly,
and the disabled selected row omits `aria-selected`, matching React. A
comparison-route walk on `?disabledItem=project-brief` fails if Solid Tab
lands on Quarterly.

## Relationship

Child of #24. Found by #260. Distinct from #290 (SelectBoxGroup disabled
skip) and #291 (disabled group Tab skip). Do not start #254.
