---
id: 626
type: task
title: "Give a TreeView row a second expand control"
created: 2026-10-08
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-10-08,
      note: "visualmode T3. One TreeExpandButton per row. A second control has no upstream equivalent, so its public name is owner-steered. Lower than #624, #329, #84, and #625. Waiting visualmode #10157.",
    }
  - {
      state: open,
      at: 2026-10-08,
      note: "Held. TreeViewItem renders one TreeExpandButton, and neither TreeItemProps nor TreeExpandButtonProps names a second control. Upstream TreeView has one ExpandableRowChevron and no equivalent, so no second expand control was minted. The name decision is #520.",
    }
  - {
      state: open,
      at: 2026-10-08,
      note: "Owner accepted the second expand control on viviana-ui TreeView only. Child rows stay on expandedKeys. The second control is hasDetail on the item and detailExpandedKeys / onDetailExpandedChange on the tree. Each control toggles only its own state. Do not change solid-spectrum. This is not a #520 hold.",
    }
---

A TreeView row has one expand control, `TreeExpandButton`, rendered once per
item. The second control is a viviana-ui TreeView extension only. Do not
change solid-spectrum, and do not change the headless tree's existing
`expandedKeys` path.

The owner accepted the second control. Child rows stay on `expandedKeys`.
The item takes `hasDetail`. The tree takes `detailExpandedKeys` and
`onDetailExpandedChange`. Each control toggles only its own state. This is
not a #520 hold.

The placeholder button on a non-expandable row already stops propagation.
That is not a second control.

## Done when

Each control toggles only its own expanded state. Activating one does not
toggle the other, does not select the row, and does not steal the existing
expand button's keyboard path. Proof is the two states, not a screenshot.

## Relationship

Child of #24. From visualmode T3. Visualmode #10157 waits on it. Lower than
the 24px row (#624), the item action menu (#329), drag-and-drop (#84), and
in-place label edit (#625).
