---
id: 616
type: task
title: "The gate-coverage guard has known blind spots"
created: 2026-09-22
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-22,
      note: "opened while landing the #568 follow-up on main. The guard now reads every script a step runs, allowlists Publish floor summary, and names guard:entry-import-budget in the Publish summary table. The lines below are the blind spots that review named and this change leaves. The moved paragraph is the old #568 Followups section, with the jobBlock line brought to where the function sits after that edit.",
    }
---

`jobBlock` cut duplicated at `scripts/check-gate-coverage.mjs:52-58` and `scripts/test-ci-guard-contracts.mjs:65-71`.

The plumbing allowlist is keyed by bare step name (`scripts/check-gate-coverage.mjs:167`), so a rename in any job demotes a gate.

`legRunsStep` (`scripts/check-gate-coverage.mjs:174`) is a bidirectional substring test.

`isAdvisory` (`scripts/check-gate-coverage.mjs:92`) misses `|| true`.

`findDocProblems` (`scripts/check-gate-coverage.mjs:420`) is `includes`, so a stale second sentence beside the right one passes.

The `Publish summary` table is an unguarded second copy of the gate list (34 `O_*` bindings and 34 rows, `.github/workflows/certification-gates.yml:331-451`).

"a blocking step has no name" (`scripts/check-gate-coverage.mjs:337`) names no job or index.

The counting test (`scripts/check-gate-coverage.test.ts:196-215`) re-implements `countCoverage`.

Five of the nine allowlist names are `uses:` steps, which `stepKind` (`scripts/check-gate-coverage.mjs:165`) already classes as plumbing, so those five names are inert.

`jobBlock` is still a second copy: `scripts/check-gate-coverage.mjs:52` and `scripts/test-ci-guard-contracts.mjs:65`. `scripts/check-gate-server-reuse.mjs` and `scripts/check-workflow-pins.mjs` do not read workflow jobs, so there is nothing to extract in one move.
