---
id: 624
type: task
title: "Fit TreeView rows to a 24px layer tree"
created: 2026-10-08
parent: 24
status: verified
history:
  - {
      state: open,
      at: 2026-10-08,
      note: "visualmode T2. The layer tree is the left column of the timeline and needs 24px rows. treeViewItem minHeight and treeExpandButton size are 40 in both styled trees, on local main and in 0.8.0-rc.0. Waiting visualmode #10156 and #10157. The public name that selects the shorter row is owner-steered; do not mint one.",
    }
  - {
      state: open,
      at: 2026-10-07,
      note: "Held. Upstream TreeViewStyleProps is only selectionStyle, and neither styled TreeProps has a size or density field. The 24px row has no approved public name, so density, compact, and any other new prop were not minted. The name decision is #520. The 40px row is unchanged.",
    }
  - {
      state: open,
      at: 2026-10-08,
      note: 'Owner approved density="compact" on viviana-ui TreeView only. Compact is a 24px row and a 24px expand control. Omitted stays the 40px row. Do not change solid-spectrum. This is not a #520 hold.',
    }
  - {
      state: verified,
      at: 2026-10-08,
      note: "viviana-ui TreeView density compact computes a 24px row and a 24px expand control. Omitted and regular stay the 40px row. solid-spectrum is unchanged.",
    }
---

The layer tree needs rows whose computed height is 24px, including the expand
control. Both styled trees set the row to `minHeight: 40` and the expand
control to `size: 40`. The extension lands only in
`packages/viviana-ui/src/tree/index.tsx` (`treeViewItem` and
`treeExpandButton`). Leave `packages/solid-spectrum/src/tree/index.tsx` at
40px.

The owner approved `density="compact"` on the viviana-ui TreeView. Compact is
a 24px row and a 24px expand control. Omitted stays the 40px row. Do not add
`spacious`. This is not a #520 hold.

## Done when

A viviana-ui layer-tree row and its expand control compute to 24px when
`density="compact"`, and the existing 40px row still matches when that prop is
omitted. Proof is the computed height, not a screenshot floor. solid-spectrum
stays at 40px.

## Relationship

Child of #24. From visualmode T2. Visualmode #10156 and #10157 wait on it.
Not a styling patch in `apps/comparison`.
