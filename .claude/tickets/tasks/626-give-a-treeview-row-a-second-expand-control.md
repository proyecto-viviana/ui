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
---

A TreeView row has one expand control, `TreeExpandButton`, rendered once per
item in `packages/viviana-ui/src/tree/index.tsx` and the solid-spectrum copy.
The layer tree needs a second control that expands and collapses on its own,
independent of that button. Upstream Tree does not provide one. Do not mint
the public name. Stop and record if the owner has not named it.

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
