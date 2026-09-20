# UI #534 native Hover boundary and lifecycle — 2026-09-19

Start `dbf3911487804a91f4e4dbb7178c1f56414c1092`, main, clean status/index.
Root sole writer; independent reviewers read-only. Named scope: owning Hover
test, #534/#531, generated status/roadmap and this receipt. Two baseline failures
justify createHover.ts source extension before repair. Later integration exposes
Pressable fixture leakage, justifying owning Pressable.test.tsx cleanup only.
No unrelated product edits.

## Proof and disposition

- Native removal recovery previously reported body as hoverend.target; now it
  retains the original hovered owner. Native child-to-child pointerout previously
  ended hover; now relatedTarget containment excludes internal transitions.
  This matches pinned useHover's saved target and normalized enter/leave behavior.
  Effect indentation changes are formatting only. No scheduler/callback-order,
  touch-duration or disposal-policy change.
- Native disabled/enabled proof replaces absent optional mouse-handler calls.
  Disabling inside hover-start preserves exact start/change(true)/end/change(false),
  no duplicate terminal events and successful restart. Owner disposal removes the
  exact capture-listener registration and remains silent after outside events.
  Two owners share touch suppression until final disposal; cleanup precedes
  restoration of feature mocks. Existing helper unit coverage stays intact.
- Baseline: 2 failed/28, 26 passed, 1.09s. Corrected owning: 28/28, 1.08s.
  Six affected suites: 287/287, 5.03s. Fresh complete SSR: 75/75, 28 files,
  27.32s; subsequent hydration: 98/98, 27 files, 11.97s. One bounded worker.
- Test-only cleanup negative control suppresses actual removal of the exact
  pointerover listener while retaining recorded removal calls. It fails on the
  forbidden post-disposal hoverend/change(false), not registration bookkeeping:
  1 selected failed, 27 unselected, 978ms. Finally removes the real listener;
  temporary mutation then restored before final proof.
- Independent source/test review accepts the bounded changes. Scoped code
  format/check passes. Attribution still fails on the same 64 paths (1 exact,
  63 reviewed-local); 103 independent mappings need review. No hash refresh.
  Exact commands and final static/docs/Git results:
  `/tmp/ui-execution-534-hover-result.md`.

Restored integration rerun exposed order-dependent leaked Pressable fixtures in
Button's first test: 1/287 failed,286 passed,4.91s. The installed testing library
registers automatic cleanup only when its module evaluates; Pressable lacked
explicit cleanup. Named test-only extension adds file-level afterEach(cleanup),
preserving all queries/assertions. Independent review accepts this extension.
Final affected ordinary passes 287/287, six files,5.74s; fresh SSR 75/75,28 files,
41.22s; subsequent hydration 98/98,27 files,17.76s. Docs wrappers fail with known
sandbox tsx IPC EPERM; direct generation/check pass. Generated changes are only
board hashes. Final typecheck and all three code-path format/lint checks pass.
Scoped diff check passes; eight named paths, no unexpected generated output.
Parent ecosystem gate passes 38/38; no parent edits. No source changes after
final proof. Attribution remains an explicit separate failed gate, not waived.

## Remaining

Separate timing review finds local 50ms suppression vs pinned upstream 500ms,
with local 100ms recovery expectations predating this slice. No intentional
exception was found; this requires explicit boundary proof and reconciliation,
not a silent assertion change. Menu native drag/item-keyboard/modality,
virtual-focus handoff cancellation and final all-owning tests also remain #534.
#533/#535, builds/attribution and #139/#194/#537 release requirements remain open.
Keep live 2,177-case same-revision zero-failure/skip/waiver acceptance, all owner
holds, successor #245, skip #254 and experimental publication boundaries.
No broad ordinary, build, pack, certified, version or publication run here.
