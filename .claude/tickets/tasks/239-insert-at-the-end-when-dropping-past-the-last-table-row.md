---
id: 239
type: task
title: "Insert at the end when dropping past the last Table row"
created: 2026-09-02
parent: 34
status: open
history:
  - { state: open, at: 2026-09-02, note: "opened from the 2026-09 upstream train source diff" }
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
