---
id: 310
type: task
title: "Keep TableView rowheader after collection updates"
created: 2026-09-03
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 tableview functional pass: selecting a second row rebuilds Solid cells as role=gridcell with *-cell keys, so AX row names become the full cell dump; React keeps Name as rowheader",
    }
  - {
      state: merged,
      at: 2026-09-03,
      note: "TableCell maps by data-column index (skips __selection__) and keeps a *-name fallback so Name stays role=rowheader after collection rebuilds.",
    }
---

S2 TableView keeps `role=rowheader` on the Name cell after selection,
sort, ActionBar clear, and RTL tab. Solid starts with
`project-brief-name` / `quarterly-report-name` rowheaders, then a
collection rebuild drops `isRowHeader` and remounts those cells as
`role=gridcell` with `*-cell` keys.

## Evidence

`http://127.0.0.1:4341/components/tableview/`, islands mounted, one
panel at a time. Default AX is identical (Name is rowheader on every
row). Click Budget (`[data-key="budget"]`):

|                         | React                   | Solid                                                    |
| ----------------------- | ----------------------- | -------------------------------------------------------- |
| Project brief Name      | `role=rowheader`        | `role=rowheader` (`project-brief-name`)                  |
| Quarterly / Budget Name | `role=rowheader`        | `role=gridcell` (`quarterly-report-cell`, `budget-cell`) |
| AX row name (Quarterly) | `Quarterly report.docx` | `Select Quarterly report.docx Document Noah Review`      |

Same loss after Select All, `selectionMode=none` onAction Enter, RTL
Tab, and ActionBar clear. Already-selected Project brief often keeps
the rowheader. Pointer selection values still match.

## Done when

Name stays `role=rowheader` with a stable `*-name` key after selection
and other collection updates, matching React. A comparison-route AX
walk fails if selecting Budget turns Quarterly's name into the full
cell dump.

## Relationship

Child of #24. Found by #260. Not #89 (native `<table>` vs
`div[role=grid]`; default rest AX already matches). Do not start #254.
