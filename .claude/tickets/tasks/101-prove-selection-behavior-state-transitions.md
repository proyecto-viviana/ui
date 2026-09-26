---
id: 101
type: task
title: "Prove selection-behavior state transitions"
created: 2026-08-20
parent: 31
status: verified
history:
  - {
      state: open,
      at: 2026-08-20,
      note: "recovered while checking a stale state gap in the completed press-path epic",
    }
  - {
      state: verified,
      at: 2026-09-26,
      note: "verified selectionBehavior state transitions across createMultipleSelectionState, SelectionManager, List, Grid, Tree, and Table with touch long-press lifecycle tests",
    }
---

The completed press-path plan said that a `selectionBehavior="replace"` prop
locked the state. The current state code no longer has that gap. It stores an
internal behavior and mirrors the applicable upstream transition rules.

The repository has no direct regression test for those rules. The existing
item test only verifies the manager call after a touch long press.

## Scope

- Add direct tests for `createMultipleSelectionState` behavior changes.
- Prove that a touch long press can change `replace` to `toggle`.
- Prove that an empty selection resets the internal behavior to `replace`.
- Prove that a changed `selectionBehavior` prop updates internal state.
- Check the grid, tree, and table adapters for the same user-observable rules.
- Compare every branch with the pinned React Stately source.

## Done when

The tests fail against the old locked-state implementation. They also fail if
the reset or prop-sync rule changes. Relevant collection consumers retain their
press-path behavior.

## Relationship

This task preserves the last state-evidence gap from the retired
`press-path-epic.md`. Ticket #100 owns the separate virtual-focus gap.
