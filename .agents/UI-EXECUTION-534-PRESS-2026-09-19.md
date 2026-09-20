# UI #534 native Press proof — 2026-09-19

Start `f97ca3b84db340508ee517ded7818613a5608458`, main, clean status/index.
Root sole writer; independent reviewers read-only. Named scope: owning
createPress.test.tsx, #534/#531, generated status/roadmap and this receipt.
Justified test-only extension: solidaria-components/test/Button.test.tsx explicit
fixture cleanup. Product createPress.ts was temporarily mutated for negative
controls, then restored exactly. No lasting product source change.

## Proof and disposition

- Native target replacement records disconnection, failed DOM containment and
  composed-path membership before ancestor press handling. Exact callback/state/
  target sequence passes. Removing only composedPath fallback fails missing
  pressstart: retain the guard despite Solid 2 batching. Unrelated release cannot
  activate the press. Pinned React Aria propagation contract is now exact:
  default inner 3/outer 0; continued inner 4/outer 4, including onPressUp.
- Disposal asserts exact global listener removal and no later callbacks.
  Suppressing only matching removals fails with leaked pressend. Pending 80 ms
  click cleanup checks a reattached connected target's click/focus directly;
  removing cleanup fails with a leaked click. Existing live-fallback coverage
  proves the 79/80 ms boundary, then explicitly flushes Solid for DOM assertions.
- Initial affected run failed 57/235: one new timer DOM assertion needed that
  explicit flush; 56 Button failures accumulated fixtures in the combined worker.
  Isolated two-test Button baseline passes. Removing only explicit Button cleanup
  reproduces 56 failures with Press green; file-level cleanup covers the sibling
  ToggleButton suite too. No query or assertion is weakened.
- Final affected ordinary passes 235/235 across four files, 5.37s. Fresh complete
  SSR passes 75/75, 28 files, 30.95s; then hydration 98/98, 27 files, 12.95s.
  One worker; bounded commands. All product mutations restored before final proof.
- Scoped code format/check passes. Independent reviewers accept the native proof,
  cleanup controls and minimal owning-test extension. Full exact command and
  static/docs/Git ledger: `/tmp/ui-execution-534-press-result.md`.

Final typecheck passes. Docs wrappers fail only on known sandbox tsx IPC EPERM;
direct generation/check pass. Parent ecosystem gate passes 38/38, with one
unrelated dirty file unread by doc-shape and no parent edits. Final scoped diff
check passes; seven named paths, generated views change only board hashes.
Known attribution debt remains unaltered and is not claimed green in this slice.

## Remaining

#534 remains in-progress: native Hover lifecycle, full Menu drag/item-keyboard/
modality, virtual-focus deferred handoff cancellation and final all-owning tests.
#533/#535, foundation builds/attribution and #139/#194/#537 release gates remain.
Keep live 2,177-case same-revision zero-failure/skip/waiver acceptance, all owner
holds, successor #245, skip #254 and experimental package publication boundaries.
No broad ordinary suite, build, pack, certified, version or publish run here.
