# UI #534 delayed autofocus — 2026-09-19

Start `08b4c00bbe632055311f70d935e86b452aa75721`, main, clean before first
test edit. Root sole writer/committer, independent agents read-only. Named scope:
createAutoFocus.ts, focus.test.tsx, #534/#531, generated status/roadmap and this
receipt. Owner authorized autonomous scoped execution, commit and push.

## Cause and repair

The old queue discarded its winner before scheduling an untracked delay timer.
Cancel, disposal and clear could no longer reach it. Ref-based removal also
canceled another hook sharing the same accessor. Stable per-request ownership
now spans queue, processing and delayed phases with explicit timer cleanup.
Reentrant skip callbacks cannot revive canceled work; a throwing skip preserves
its original error and independently queued next batch. Existing priority,
eligibility timing and symmetric onSettled registration are retained.

Retained manual focus is now inert after disposal, explicitly tested. Global
queue clear still permits live manual focus. This repair covers the owned timer,
not later transition work inside virtual-modality focusSafely.

## Proof

- Old source: nine failures / 44 tests. All 34 original tests and new delayed
  positive control pass; failures cover cancel/dispose/clear after dequeue,
  multiple delayed batches, shared-ref identity and reentrant cancellation.
- Corrected owning suite: 46/46, 1.42s. Twelve new cases retain connected
  targets, forced focus, keyboard modality, sentinel focus, exact timer/callback
  counts, 99/100 ms delay, reentrant clearing and exact-error/next-batch recovery.
- Fresh focused SSR then hydrate: 16/16 each. Complete SSR 75/75, 28 files,
  31.35s, then hydrate 98/98, 27 files, 12.54s. One worker, bounded commands.
- Scoped formatting/check passes with no warnings/errors. Attribution remains
  the same 64 mismatched paths, including this source; no hash refresh. Its
  separate 103 mapping reviews remain unresolved.

Independent source/test reviews accept; original assertions unchanged. Exact
commands, remaining static/docs checks and final source identity are recorded
in `/tmp/ui-execution-534-autofocus-result.md`.

Final typecheck and direct docs generation/check pass. Both docs wrappers hit
the known sandbox tsx IPC EPERM before their direct equivalents passed. Parent
ecosystem gate passes 38/38 (one unrelated dirty file unread by doc-shape; no
parent edits). Scoped diff check passes; generated changes are only expected
board hashes and #534's open-to-in-progress status/count. Seven named paths.

## Remaining

#534 stays in-progress for native Press target replacement/propagation/cleanup,
Hover owner lifecycle, full Menu drag/keyboard modality and remaining owning
interaction proof. #533/#535, foundation build/attribution, #139 packaging
safety, #194 evidence repair and #537 live 2,177 same-revision zero-failure/
skip/waiver certified proof remain. Preserve owner holds, #245, skip #254 and
experimental package publication boundaries. No broad ordinary/build/pack/
certified/version/publish command in this slice.
