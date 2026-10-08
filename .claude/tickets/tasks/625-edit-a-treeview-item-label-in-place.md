---
id: 625
type: task
title: "Edit a TreeView item label in place"
created: 2026-10-08
parent: 24
status: open
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
---

A TreeView row needs to edit its own label without leaving the row. Nothing
in the styled or headless tree starts that edit, commits it, or cancels it.
Upstream React Spectrum Tree does not have this behavior, so this is an
extension. Do not mint a public edit-mode prop until the owner names it.
Stop and record if the name is not already approved.

The edit field is a `TextField`. #623 still throws
`REACTIVE_WRITE_IN_OWNED_SCOPE` when `Input` or `TextArea` unmounts, so this
ticket waits on #623. It is not `blocked: true`; the dependency is that
unmount write.

## Done when

F2 or a double press on the label opens the editor. Enter commits, Escape
cancels, and blur commits. Arrow keys and type-ahead do not move the tree
while the editor is open. Unmounting the editor does not throw. Proof covers
keyboard, focus, and the #623 unmount path.

## Relationship

Child of #24. From visualmode T5. Visualmode #10156 and #10157 wait on it.
Depends on #623. Not a second drag-and-drop ticket (#84) and not the action
slot (#329).
