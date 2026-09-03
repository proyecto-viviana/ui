---
id: 438
type: task
title: "Render ListBox drop indicators in RAC before-and-last-after shape"
created: 2026-09-03
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from Wave-3 CI: certified D-reorder still red; #260 reconfirmed and forbade a waiver; not more #256 Virtualizer work",
    }
  - {
      state: merged,
      at: 2026-09-03,
      note: "Collection/ListBox/GridList/Table/Menu/Tree render before + last-after (Tree keeps RAC ancestor afters, drops collection-level on). isDropTargetFor treats after(item) and before(next) as one gap. After Enter: 4 unique Insert names; certified dnd-listbox D-reorder reorder-down + cancel + D6 AX all green.",
    }
---

Certified `dnd-listbox` D-reorder (`reorder-down` and `cancel`) fails after
Enter: Solid `active` is `listbox:Permissions` vs React
`option:Insert between Read and Write`. Single-item drop **order** still
matches once Enter is pressed on the unfocused drop target. #260 also
recorded duplicate AX indicators (6 vs RAC 4: "Insert between Read and
Write" ×2 and "Insert between Write and Admin" ×2). Do not waive.

## Cause

RAC `Collection.tsx` `renderAfterDropIndicators` (`:241-284`) renders
`before` + item for every item, and `after` only when the next item in the
same level is null. Comment: the after position is otherwise the next
item's before. RAC ListBox does not render collection-level `"on"`
indicators.

Solid `ListBoxItemWithDropIndicators` and the virtualized For loops emit
**before + on + after for every item**. During keyboard drag,
`useRenderDropIndicator` returns a node for every valid target, so
`after Read` and `before Write` both mount (same label).

The certified miss is the **focus trail**, not the duplicate list by
itself. Option remount + `ariaHideOutside` inerting a new node remains a
hypothesis: jsdom identity tests pass; #260 did not record before/after
`sameNode` in Chromium. After indicators match RAC, check `#read` identity
after Enter. If stable, the bounce is DragManager / `ariaHideOutside` /
deferred focus in `createDroppableItem`.

## Work

- Port `renderAfterDropIndicators` in
  `packages/solidaria-components/src/Collection.tsx`. Per item: `before` +
  item; `after` only last-in-level. Delete the per-item `after` in
  `renderCollectionItems`.
- `ListBoxItemWithDropIndicators`: drop `"on"` and per-item `"after"`.
- Mirror GridList, Table, Tree, Menu through Collection (Rule #5), not a
  ListBox-only patch.
- Then Chromium `sameNode` on `#read` before vs after Enter. If `sameNode:
true` and focus still listbox, remount is dead; fix DragManager /
  `createDroppableItem` timing.
- Tests: after Enter, exactly 4 unique drop-indicator option names; certified
  walk: `activeElement` is `option:Insert between Read and Write`.

## Done when

Certified `e2e/certified/dnd-listbox.certified.spec.ts` D-reorder is green
(both trails). AX after Enter has 4 unique Insert names. No waiver.

## Relationship

Child of #24. Sibling of #332 (multi-item `getKeysForDrag` — do not fold
in). #256 owns the Virtualizer split (landed); D-reorder was absorbed there
as a wave-3 regression and moves here. Do not keep stuffing DnD into #256.
