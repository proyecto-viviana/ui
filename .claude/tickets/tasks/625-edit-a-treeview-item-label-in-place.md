---
id: 625
type: task
title: "Edit a TreeView item label in place"
created: 2026-10-08
parent: 24
status: in-progress
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
  - {
      state: in-progress,
      at: 2026-10-08,
      note: "Reopened bounded blur qualification: original and patched #627 controls reproduce commits-on-blur failure; prior assertion-free diagnostic proves execution only. Sole source implementer admitted at 39de9a8268b831dbece6233353f409b3713a25a3, generation 9c02d06e-921b-4663-b2c5-7deea1b57cc0. Codex fallback authorized by current conductor dispatch. Exact scope is UI rename lifecycle and existing rename test, this ticket/generated views, and conditional UI patch note. Conductor owns review, stop and commit.",
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

## Bounded qualification, 2026-10-08

The conductor amended the same generation to allow only the imperative focus
boundary in `packages/solidaria/src/selection/createSelectableItem.ts` and its
existing `packages/solidaria/test/createSelectableItem.test.tsx`. Native blur
inside the tracked focus effect reads TextField value through createFocusable's
live disability guard. This contaminates the effect's dependencies; it is not
proof that whole-options reads caused this failure. Local compensation trials
are withdrawn. The amendment receipt and raw evidence are under
`/tmp/ui-625-evidence-2026-10-08`; no other shared source is admitted.

Final bounded candidate (awaiting independent review and conductor owned-stop):
10 admitted suites pass, 355 tests; unchanged final assertions on exact old
lower/UI source fail 8 of 46 tests, then source restoration hashes match.
The original owning baseline fails 1 of 8 (`commits on blur`). Root canonical
tsc exits 2 with the identical 21 inherited diagnostics, zero added; this is
not a green compiler or native/runtime certification. Raw commands, counts,
trial failures, causal stacks, source inputs and restoration receipts are in
`/tmp/ui-625-evidence-2026-10-08`; final handoff is
`/tmp/ui-625-worker-result-2026-10-08.md`.

The lower fix untracks only imperative custom/native/virtual focus work while
keeping manager/key/options/ref/mode and scheduling guards tracked. The UI
change selects only on editor entry, preserving caret on protective refocus.
No synchronous local compensation remains. The existing queued refocus could
restore focus after typing settled, but it left a same-turn blur window and
reset selection; the durable tests cover immediate and post-microtask edits,
real outside focus, repeated updates, Enter/Escape, internal targets and
pending-refocus disposal. Direct tests cover native handler reads, custom
callback receiver/replacement, virtual events/ref/mode, manager transitions,
suppression and keyboard drag cancellation. These are JSDOM assertions, not
browser certification. Other shared reactive oversubscription is unaudited
follow-on debt, not claimed fixed. #627 ordinary label-pointer selection is
separate and unchanged.

The existing admitted semantic Changeset names solidaria and UI patch intent;
no pending rename/focus-boundary duplicate was found (#547 later deduplicates).
No public API/dependencies, static-probe narrowing or function-child registration
changed. No browser/build, commit, push or publication was performed.
