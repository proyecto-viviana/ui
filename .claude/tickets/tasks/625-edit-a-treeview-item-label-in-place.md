---
id: 625
type: task
title: "Edit a TreeView item label in place"
created: 2026-10-08
parent: 24
status: merged
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
  - {
      state: merged,
      at: 2026-10-12,
      note: "Published in ui 0.8.0-rc.1; the Chromium rename proof passes 12 of 12. VisualMode still runs rc.0, so installed-consumer verification is open.",
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

## Current local Tree owning return — 2026-10-09

The defaultValue repair now passes all six unchanged owner files and 131/131
cases, including uninterrupted editor selection. It initializes TextField through
its existing live uncontrolled state and removes the redundant controlled signal
loop; no assertion, timing compensation or selection restoration was added.
Original scoped format and lint also pass. Each actual return has exit 0,
no timeout, owned processes closed and bound inputs conserved:

- Owning: `/tmp/ui-tree-rename-selection-direct-proof-20261009/01-tree-selection-candidate-full-unit-owners.return.json`, SHA256 `1e2120bb6a13c75f8380f1ebcb364bc359e4b1c9adee90650ea9c7f34649ef1c`.
- Format: `/tmp/ui-tree-rename-selection-direct-proof-20261009/02-tree-source-format-check.return.json`, SHA256 `219aaaa0bf2afd93a3052ff47146d4166a021c4eb4b687a20a32b84bd0f55c4c`.
- Lint: `/tmp/ui-tree-rename-selection-direct-proof-20261009/03-tree-source-lint.return.json`, SHA256 `5705ecccec69cfce0e43c7f4ff0a832b37b848ac2e1f9ee03a3de65589869dc3`.

The prior full six-owner run remains historical: 130 passed and one failed out
of 131, with uninterrupted selection expected `[2, 4, "backward"]` and actual
`[7, 7, "none"]`. Actual exit 1, no timeout, owned closure and conserved inputs:
`/tmp/ui-tree-dnd-direct-proof-20261009/01-tree-candidate-full-unit-owners.return.json`,
SHA256 `5e5a96fd7214878fc592aefae93d4ea752d75f554aaa6b2644763dc6010edb81`.
The wrapper callback is not established as the cause of that failure. The full
build, fresh whole Tree SSR/hydration and final browser qualification remain
pending; this local result does not close the ticket or replace earlier history.

## Published and browser proof — 2026-10-12

Inline renaming shipped in `@proyecto-viviana/ui@0.8.0-rc.1` (Release run
38146924038 from a2ccaf10, 2026-10-11). Release Readiness run 38145690444 ran
the unit, SSR and hydration suites green at that SHA.

The Chromium proof from 00bc8821 was run on current main:

```bash
vp exec --filter @proyecto-viviana/comparison -- playwright test -c e2e/tree-rename.playwright.config.ts
```

First run: 11 passed, 1 failed, "omitted onRename never opens an editor". The
product was not at fault. That case loaded the page a second time with
`?rename=off`; the fixture serves the package source unbundled, and the second
full load in one page failed with `net::ERR_INSUFFICIENT_RESOURCES` before the
tree rendered. Opened once at `/?rename=off`, the fixture renders its three
rows. The case now gets its URL from the single `beforeEach` navigation and
asserts it is in the `rename=off` page. Second run: 12 passed.

Not yet proved: installed-consumer verification. VisualMode runs ui
0.8.0-rc.0; its T5 request is checked there on rc.1.
