---
id: 662
type: task
title: "See the Dialog focus hand-off that ends before the wait"
created: 2026-10-27
parent: 443
status: merged
history:
  - { state: open, at: 2026-10-27 }
  - { state: in-progress, at: 2026-10-27 }
  - {
      state: merged,
      at: 2026-10-28,
      note: "Recorder attached before the click; both failing scenarios passed idle and under load. The rc.5 eight-shard run is the coordinator's.",
    }
---

## Cause

The rc.5 certified suite at `be89ac6e` went red twice in a row on shard 3/8,
each time with one failure in the same helper:

- run 3: D1 state matrix — Dialog surface › modal-open · dark
- run 4: D7 contrast — Dialog surface › modal-open · dark

Both threw `dialog VoiceOver refocus did not complete` from
`openDialogWithPointer` in `apps/comparison/e2e/certified/dialog.certified.spec.ts`.
useDialog focuses the surface, then blurs and refocuses it 500ms later for iOS
VoiceOver. The helper attached its `focusout`/`focusin` listeners to the dialog
only after `expect(dialog).toBeVisible()` returned. Under full-suite load that
return can come after the hand-off has finished; the listeners then wait for a
blur that already happened, and the 2 s timer rejects.

Both failure snapshots show the hand-off over, not missing: the React trigger
is `[expanded]`, the Solid panel is not yet opened, and the React dialog is
`dialog [active]` — open and holding focus when the wait timed out. No source
under the Dialog path changed since the rc.4 certification (`3d4e46ce`).

Evidence, local and untracked:

- `~/.cache/vmtmp/cert-rc5/third-attempt/shard-3/certified-dialog.certified-a4dcd-g-surface-modal-open-·-dark-chromium/error-context.md`
- `~/.cache/vmtmp/cert-rc5/fourth-attempt/shard-3/certified-dialog.certified-fcebc-g-surface-modal-open-·-dark-chromium/error-context.md`

## Scope

One writer on `collection-owned-write` in `ui/.claude/worktrees/treeview-controlled`,
under the owner's grant of 2026-10-27 for this test fix. Paths: this ticket,
`dialog.certified.spec.ts`, and the generated status and roadmap views.
No assertion is weakened and the 2 s limit is unchanged. No dependency, push
or publication.

## Fix

Before the click, `openDialogWithPointer` installs a capture-phase recorder of
`focusout`/`focusin` on the document. The wait then reads that record: it
resolves once this dialog has a `focusout` followed by a `focusin` and holds
focus, whether that happened before or during the wait. The condition, the
2 s rejection and the closing `toBeFocused()` are the ones the helper had.

## Done when

The two scenarios that failed pass repeatedly, idle and with the CPU saturated,
and the whole Dialog spec still passes.

## Proof

Local, 2026-10-28, on `be89ac6e` plus this change, comparison dist built at
that revision, `--workers=2`, grep for exactly the two scenarios:

- Idle: 5 runs, 2 passed each.
- With 16 busy loops on 16 cores: 5 runs, 2 passed each; then the whole
  `dialog.certified` spec, 27 passed.
- The same set ran once before a machine shutdown on 2026-10-27, with the
  same result (`dialog-proof-pre-shutdown/`).

Not reproduced: the unfixed helper passed 2 of 2 runs under the same synthetic
load (a third was cut off by the shutdown). CPU load alone does not recreate
the suite's timing; the snapshots above are the evidence of the race. The
eight-shard certification of rc.5 is still owed and is the real test.

## Relationship

Child of #443: it blocks certification of the fifth release candidate.
The helper came from #578 (`3192bc91`, "settle dialog D1 after the VoiceOver
refocus"). Earlier one-off failures in the same runs (ActionButton pending D4/D6,
ComboBox field D3 light) passed on focused reruns and are not covered here.
