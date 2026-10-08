---
id: 624
type: task
title: "Fit TreeView rows to a 24px layer tree"
created: 2026-10-08
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-10-08,
      note: "visualmode T2. The layer tree is the left column of the timeline and needs 24px rows. treeViewItem minHeight and treeExpandButton size are 40 in both styled trees, on local main and in 0.8.0-rc.0. Waiting visualmode #10156 and #10157. The public name that selects the shorter row is owner-steered; do not mint one.",
    }
---

The layer tree needs rows whose computed height is 24px, including the expand
control. Both styled trees set the row to `minHeight: 40` and the expand
control to `size: 40`:

- `packages/viviana-ui/src/tree/index.tsx` (`treeViewItem` around line 308,
  `treeExpandButton` around line 426)
- `packages/solid-spectrum/src/tree/index.tsx` (the same two styles)

`TreeProps` has no size or density field that changes those numbers. The
installed `0.8.0-rc.0` tarball matches. There is no upstream TreeView answer
that already names a shorter row.

## Done when

A layer-tree row and its expand control compute to 24px, and the existing
40px row still matches upstream when that shorter row is not requested. Proof
is the computed height, not a screenshot floor.

The public name for the shorter row is owner-steered. Stop and record if that
name is not already approved. Do not mint `density`, `compact`, or another
public prop while waiting.

## Relationship

Child of #24. From visualmode T2. Visualmode #10156 and #10157 wait on it.
Not a styling patch in `apps/comparison`.
