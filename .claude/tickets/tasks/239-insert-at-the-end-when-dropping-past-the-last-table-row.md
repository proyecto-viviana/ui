---
id: 239
type: task
title: "Insert at the end when dropping past the last Table row"
created: 2026-09-02
parent: 34
status: in-progress
history:
  - { state: open, at: 2026-09-02, note: "opened from the 2026-09 upstream train source diff" }
  - {
      state: in-progress,
      at: 2026-09-02,
      note: "TreeDropTargetDelegate item-only ancestor guard; Table wraps ListDropTargetDelegate with createTreeDropTargetDelegate; drop-past-last-row test red-then-green",
    }
---

## Cause

RAC 1.21.0 inserts after the last row when a drop lands past the table end.
`TreeDropTargetDelegate` only pushes an "after parent" target when
`parentItem?.type === 'item'`, so a generated TableBody key is no longer a
drop target
(`packages/react-aria-components/src/TreeDropTargetDelegate.ts:212-226` on
`f56660b`). Test:
`packages/react-aria-components/test/Table.test.js:1976`. Release note:
"Insert at the end when dropping past the last row instead of failing to
resolve the drop target". #84 is the whole DnD subsystem; this is a 1.21
drop-target resolution fix on that spine.

## Work

Port the item-only ancestor target guard. Add the Table drop-past-last-row
insert test.

## Done when

Dropping below the last row calls `onInsert` with
`{type: 'item', key: lastRowKey, dropPosition: 'after'}`. The test fails if
the target escalates to TableBody.

## Relationship

Child of #220. Delta on #84; do not wait for the full subsystem to close.

## Landed

- `react-aria-components/src/TreeDropTargetDelegate.ts:212-226` → `packages/solidaria-components/src/Tree.tsx:396-409` → `inserts after the last item instead of escalating to a generated TableBody ancestor` (`packages/solidaria-components/test/TreeDropTargetDelegate.test.tsx`)
- Table wrap (RAC already did this): `packages/solidaria-components/src/Table.tsx:749-759`
- `createTreeDropTargetDelegate` is exported from `Tree.tsx` for Table + tests, not from the package index (no new public name).
- Red-then-green: without the `parentItem?.type === "item"` guard, last `getDropTargetFromPoint` returned `{key: "body", dropPosition: "after"}`; restored, green.
