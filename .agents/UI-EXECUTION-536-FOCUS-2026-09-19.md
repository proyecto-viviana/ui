# UI #536 focus lifecycle parity — 2026-09-19

Starting revision: `f65794fad873b9e88dcf1f3aab11c4675bc20652`, branch `main`.
Initial status and index clean. Root is sole source writer; independent agents
review read-only. Owner-directed autonomous execution admits this bounded slice,
not task, initiative or release acceptance.

## Named scope and cause

- `packages/solidaria/src/focus/createAutoFocus.ts` and `createFocusRestore.ts`:
  move existing real onSettled registrations before the SSR no-op returns.
  Preserve browser timing, methods and cleanup; remove unused imports only.
- `packages/solidaria/test/fixtures/hydrationHooks.tsx`,
  `hydrationHooks.ssr.test.tsx`, `hydrationHooks.hydrate.test.tsx`: three
  same-owner generated-ID fixtures with real renderToString and node adoption.
- `packages/solidaria/test/focus.test.tsx`: five owning lifecycle regressions
  for restore/disabled/clear and queued cancel/dispose, with connected targets.
- #536/#531 dated progress, #534 explicit deferred timer finding, this receipt,
  and generated status/roadmap through the supported docs command.

Installed Solid 2 rc.9 reserves child IDs for server onSettled registrations
without executing their callbacks. The old AutoFocus/FocusRestore SSR returns
skip that reservation; both baseline hydration cases request key `2` against
unclaimed div key `1`/ID `0`. The ID is generated immediately after the hook in
the same owner, captured before hydration, and compared after exact node/ref
adoption. createVirtualFocus is an unchanged passing allocation control:
literal signals do not reserve child IDs. No version duplication or Kumo
behavior is implicated, and no dependency/API/version change is made.

Focus restoration still captures the settled trigger before another component's
queued autofocus. Moving it to a client-source effect would alter that order;
this slice preserves the existing callback. Actual autofocus ref/focus work is
queued after hydration and is asserted with hydrating=false. SSR methods remain
inert and client cleanup remains excluded from SSR. The tests explicitly seed
keyboard modality so immediate focus assertions do not inherit virtual modality's
transition/frame deferral. Independent source review accepted the minimal repair;
test review identified that precondition and it was corrected.

## Proof

One worker, sequential test lanes; focused/owning commands bounded at 90 seconds,
complete lanes at 120 seconds. No timeout or saturation. Exact commands, exits,
logs and final Git outcome: `/tmp/ui-execution-536-focus-result.md`. Logs use
the `/tmp/ui-execution-536-focus-` prefix.

| Phase / log suffix                | Exit   | Result                                        |
| --------------------------------- | ------ | --------------------------------------------- |
| Old-source `baseline-ssr.log`     | 0      | 10/10, 586ms                                  |
| Old-source `baseline-hydrate.log` | 1      | 8/10, 1.82s; only two key-2 failures          |
| Corrected `focused-ssr.log`       | 0      | 10/10, 530ms                                  |
| Corrected `focused-hydrate.log`   | 0      | 10/10, 1.29s                                  |
| Initial owning `owning.log`       | 0      | 34/34, 1.58s                                  |
| Fresh complete `full-ssr.log`     | 0      | 63/63, 26 files, 30.76s                       |
| Then complete `full-hydrate.log`  | 0      | 71/71, 25 files, 12.58s                       |
| Final owning `owning-final.log`   | 0      | 34/34, 1.93s, explicit keyboard preconditions |
| `typecheck.log`                   | 0      | `vp run typecheck`                            |
| `check.log`                       | 0      | Six code paths, formatting/lint clean         |
| Docs wrappers                     | 1 each | Known sandbox tsx IPC EPERM                   |
| Direct docs generate/check        | 0 each | Supported no-IPC equivalents                  |

SSR assertions cover inert methods, no browser callbacks, no queue/stack work
and marker-bearing IDs. Hydration asserts exact node/ref identity, immutable
server-ID equality, enabled autofocus, trigger capture/manual restore/clear,
and real keyboard VirtualFocus updates with disabled-item skipping. Ordinary
tests retain connected targets across disposal and drain bounded frame/timer
work, proving restoreOnUnmount, disabled/cleared cases and cancel/dispose before
queue processing. Existing behavior assertions are retained.

## Remaining acceptance

Only generated status/roadmap board hashes change; fixture HTML remains ignored.
The attribution gate still exits 1 with the identical 64-path mismatch set
(one exact-source, 63 reviewed-local); 103 mappings needing review is a separate
inventory statistic. Unlike the preceding slice, both focus source files edited
here are in that pre-existing mismatch set. Their header/mapping reconciliation
remains outstanding; reviewed behavior changes do not silently refresh hashes
or waive that gate. No unexpected tracked generated changes were observed.
The parent ecosystem gate passes 38/38 outside the sandbox; no parent files
were edited. Independent source/test review reports no remaining blocker in
this bounded slice after the explicit keyboard-precondition correction.

#536 still needs FocusScope structure/context parity, public portal-route proof,
stale guidance/comments, actual unresolved-shell/late-tail asynchronous streaming,
then final complete lanes. VirtualFocus default-key SSR semantics are separate
from this null-initial-state allocation control.

#534 records a source-observed untracked delayed-autofocus timer after its winner
is dequeued. These pre-queue cancellation tests do not prove that later branch;
it requires a failing delayed positive-control/cancel/dispose regression and
bounded repair. #531 retains every sibling/build/certification requirement.

#139 precedes packaging; #194 evidence repairs precede #537's live 2,177-case
same-revision zero-failure/skip/waiver proof. Attribution/security and all exact-SHA
release checks remain gates. No broad ordinary suite, build, pack, certified run,
versioning or publication ran here. #87's census/foundation-first decision,
#136's owner holds, successor #245, skip #254 and experimental Kumo/Geist first
release boundaries are unchanged. Persistent release goal remains active.
