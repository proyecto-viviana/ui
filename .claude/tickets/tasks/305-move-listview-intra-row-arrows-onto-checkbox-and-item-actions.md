---
id: 305
type: task
title: "Move ListView intra-row ArrowLeft and ArrowRight onto checkbox and item actions"
created: 2026-09-03
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 listview functional pass: RAC ArrowRight from the focused row focuses the Select checkbox then Archive; Solid stays on the row. Capture handler is mergeCollectionRowInteractionProps; S2 checkbox is opacity-0 tabIndex -1",
    }
  - {
      state: merged,
      at: 2026-09-03,
      note: "mergeCollectionRowInteractionProps binds oncapture:keydown so ArrowRight lands on the checkbox then Archive.",
    }
---

S2 ListView `keyboardNavigationBehavior` defaults to `"arrow"`: Left/Right
move focus among intra-row widgets (selection checkbox, Archive,
ActionMenu). RAC does that. Solid `createGridListItem` already merges
`mergeCollectionRowInteractionProps`, but ArrowRight/Left never leave the
row.

The S2 checkbox is `excludeFromTabOrder` (`tabIndex=-1`) and `opacity:0`
(`packages/solid-spectrum/src/gridlist/index.tsx:1250-1347`). RAC's
checkbox is `tabIndex=0` and becomes `opacity:1` when it is the focus
target. Archive is `tabIndex=0`, 57×24, visible on both stacks, and still
never receives Solid ArrowRight.

## Evidence

`http://127.0.0.1:4341/components/listview/`, islands mounted, one panel
at a time. Tab from Before lands on Project brief on both (`role=row`,
`tabIndex=0`). Then:

|                  | React                   | Solid            |
| ---------------- | ----------------------- | ---------------- |
| ArrowRight       | focus INPUT name Select | stays on the row |
| ArrowRight again | back on the row         | stays on the row |
| ArrowLeft        | INPUT Select            | stays on the row |

`?itemActionSlot=buttonGroup`: React ArrowRight → checkbox, ArrowRight →
Archive Project brief.pdf. Solid never leaves the row.

Distinct from #295 (typeahead letters) and #128 (typeahead Space capture).

## Done when

From the focused Project brief row, ArrowRight focuses the Select
checkbox, then Archive when `itemActionSlot=buttonGroup`, matching React.
A comparison-route keyboard walk fails if Solid stays on the row.

## Relationship

Child of #24. Found by #260. ListView is the S2 GridList. Handler lives in
`packages/solidaria/src/selection/createCollectionRowInteraction.ts`. Do
not start #254.
