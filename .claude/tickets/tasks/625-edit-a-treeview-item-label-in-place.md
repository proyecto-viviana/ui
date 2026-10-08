---
id: 625
type: task
title: "Edit a TreeView item label in place"
created: 2026-10-08
parent: 24
status: verified
history:
  - {
      state: open,
      at: 2026-10-08,
      note: "visualmode T5. No edit mode exists on TreeView. Upstream Tree has no equivalent, so the public name is owner-steered. Depends on #623. Waiting visualmode #10156 and #10157.",
    }
  - {
      state: open,
      at: 2026-10-08,
      note: "Held. #623 is on main, and neither TreeProps nor TreeItemProps has an edit field. F2, double press, commit, and cancel have no approved public name, so no edit-mode prop was minted. The name decision is #520.",
    }
  - {
      state: open,
      at: 2026-10-08,
      note: "Owner approved onRename(key, name) on viviana-ui TreeView only. Passing it enables F2 or double-press to edit, Enter to commit, Escape to cancel, and blur to commit. Arrows and type-ahead stay in the field. Do not change solid-spectrum. A row-menu Rename item is not this ticket. This is not a #520 hold.",
    }
  - {
      state: verified,
      at: 2026-10-08,
      note: "onRename on viviana-ui TreeView opens an internal TextField on F2 or a double press. Enter and blur commit, Escape cancels, and arrows and type-ahead stay in the field. Unmount does not throw.",
    }
---

A TreeView row needs to edit its own label without leaving the row. Nothing
in the styled or headless tree starts that edit, commits it, or cancels it.
Upstream React Spectrum Tree does not have this behavior, so this is a
viviana-ui extension. Do not change solid-spectrum.

The owner approved one optional `onRename(key, name)` on the viviana-ui
TreeView. Passing it enables F2 or a double press to edit. Enter commits,
Escape cancels, and blur commits. Arrow keys and type-ahead stay in the
field. The field is an internal TextField. A Rename item in the row menu is
not this ticket. This is not a #520 hold.

#623 is on main. Unmounting the editor must not throw.

## Done when

F2 or a double press on the label opens the editor. Enter commits, Escape
cancels, and blur commits. Arrow keys and type-ahead do not move the tree
while the editor is open. Unmounting the editor does not throw. Proof covers
keyboard, focus, and the #623 unmount path.

## Relationship

Child of #24. From visualmode T5. Visualmode #10156 and #10157 wait on it.
Depends on #623. Not a second drag-and-drop ticket (#84) and not the action
slot (#329).
