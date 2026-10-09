---
id: 643
type: task
title: "Resolve combined ToggleButton test isolation failure"
created: 2026-10-09
parent: 544
status: verified
history:
  - {
      state: open,
      at: 2026-10-09,
      note: "Admitted by conductor at base 1ca29b91ac9ebcd5870febfc673582a35cc64988, generation c0e5c90a-fa09-4f37-8d83-45e17aeb0989. Historical six-file run failed 15 tests across two ToggleButton suites while separate one-file invocations passed; earlier Pin DOM appeared in failure bodies. Cause unproven at admission.",
    }
  - {
      state: next,
      at: 2026-10-09,
      note: "Conductor records actual bounded admission before the registered implementation.",
    }
  - {
      state: in-progress,
      at: 2026-10-09,
      note: "Registered implementation ran 02:34-02:46 UTC; sealed review passed and exact owned worker stopped before commit handoff.",
    }
  - {
      state: merged,
      at: 2026-10-09,
      note: "Prepared for the conductor implementation commit; this transition takes effect only when that commit succeeds.",
    }
  - {
      state: verified,
      at: 2026-10-09,
      note: "Conductor accepted sealed causal withdrawal/restoration and exact six-file 104-test proof; independent review passed. Broader #556 debt and release qualification remain open.",
    }
---

## Scope

Diagnose combined ToggleButton teardown in repo:ui. Only editable tracked paths:
`vitest.setup.ts`, `packages/solidaria-components/test/ToggleButton.test.tsx`,
`packages/solid-spectrum/test/ToggleButton.test.tsx`, this ticket,
`.claude/current/status.md`, and `.claude/current/roadmap.md`.
Generated views come only from `vp run docs:generate`.
No product, configuration, dependency, pool, memory, public API, or Changeset change.
No worker commit, push, publish, browser, build, full suite, or provider access.
Evidence and private helpers stay under `/tmp/ui-643-cleanup-20261009-*`.

## Done when

Fresh exact six-file baseline reproduces; adaptive same-pool subsets and temporary
instrumentation demonstrate the boundary. A meaningful disposer/duplicate-label
regression fails with only the repair withdrawn, then passes after exact restoration.
One unchanged six-file command passes all original and added cases without unhandled
errors. Scoped checks pass and conductor independently accepts the sealed proof.
Worker results do not move lifecycle state or establish release candidate green.

## Proof

Registration and historical receipt snapshots, actual source/runtime identities,
raw serial process receipts, realized scheduling, diagnosis, repair withdrawal and
restoration, final six-file run, scoped formatting/lint, generated views guard,
and diff checks belong to `/tmp/ui-643-cleanup-20261009-evidence/`.
The exact six-file invocation uses Breadcrumbs, FileTrigger, headless ToggleButton,
Spectrum ToggleButton, TokenField and Tree with `--maxWorkers=1`.
If baseline is green, stop repair and report intervening changes.

## Relationship

Child of #544; bounded successor to #556, whose missing older bisect, ListView and
resource debt remain unpaid. #562 constrains the unchanged vmThreads/400MB pool;
its historical acceptance does not prove present teardown behavior. Both predecessor
tickets remain unchanged. Full discovered units and ordered `ci:release-readiness`
require later conductor qualification in the heavy slot. #642 is separate popup work.

## Admitted result — 2026-10-09

The measured boundary is the testing-library ESM's one-time auto-hook registration
against an earlier Vitest collector. The next file has an available global hook,
no skip flag, the same imported render/cleanup identities, and no new auto-hook;
its containers and Solid root survive cases. Shared hydration/mock teardown runs
but does not own these containers. Temporary instrumentation and an explicit
suite-imported cleanup control demonstrated this; the control was removed.

Shared setup now registers imported cleanup per file, preserving the existing
hydration/mock/observer teardown hook. Both suites add two cases guarding owned
Solid disposal before the next same-label mount. All original assertions remain.
Raw diagnosis, registration trace, source snapshots, receipt hashes and limits:
`/tmp/ui-643-cleanup-20261009-evidence/diagnosis.md`.

Fresh unchanged six: exit 1, 3 failed / 97 passed. Two-file reproducer: exit 1,
11 failed / 8 passed. Fresh Spectrum-only: exit 0, 5 passed. Local cleanup control:
exit 0, 19 passed. Repaired guard: exit 0, 23 passed. Withdraw only the repair to
exact prerepair setup bytes, retaining regression: exit 1, 13 failed / 10 passed,
including the disposer guard. Exact repair restoration: exit 0, 23 passed.

Final original six-file command ran once: exit 0, 6 files / 104 tests passed,
no unhandled errors. Realized order: Tree, Breadcrumbs, FileTrigger, headless
ToggleButton, TokenField, Spectrum ToggleButton. Navigation diagnostics remain.
Visible control/final child environments remove only agent-display markers so
passed files are reported; command/options, pool and configuration are unchanged.

Limits: earlier agent logs omit full realized baseline/pair order. All launchers
have PID/start/argv/exit, but descendant inventories began at withdrawal; earlier
grandchild start/exit identities were not recovered. Runtime identity hashing
occurred at its recorded post-baseline time. These gaps remain visible for
conductor review. Older #556 debt and later full qualification remain unresolved.
Acceptance and lifecycle advancement are reserved to the conductor.

Scoped `vp fmt` (setup, both tests, ticket), `vp lint` (the three TypeScript files),
`vp run docs:generate`, `vp run guard:generated-views` and `git diff --check` passed.
The generator writes only the two admitted views. Its sandboxed tsx IPC attempt
failed with EPERM; the qualified run used the approved local socket escalation.
An earlier generator wrapper lost its child's exit while parsing an unrelated
process name; exact owned process absence is recorded and the corrected generator
returned exit 0. No test source changed after final acceptance. No root compiler,
full unit, build or release chain was run. Sealed handoff and manifests remain
under the admitted temporary prefix; conductor review is still required.

## Conductor acceptance — 2026-10-09

Independent source and evidence review passed. Conductor verified all 30 named
source records and 152 evidence records, archived 184 bound files, then stopped
only generation `c0e5c90a-fa09-4f37-8d83-45e17aeb0989`; its stop receipt confirms
closed. Implementation/test bytes remain identical to the accepted worker seal.
Lifecycle entries above are prepared at the implementation commit step and take
effect with its successful commit. No future commit identifier is asserted.
Closure changes only this ticket and its generated work views.
