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

`jobBlock` cut duplicated at `scripts/check-gate-coverage.mjs:57-63` and `scripts/test-ci-guard-contracts.mjs:65-71` (`scripts/check-gate-coverage.mjs:57` and `scripts/test-ci-guard-contracts.mjs:65`). `scripts/check-gate-server-reuse.mjs` and `scripts/check-workflow-pins.mjs` do not read workflow jobs, so there is nothing to extract in one move.

The plumbing allowlist is keyed by bare step name (`scripts/check-gate-coverage.mjs:176`), so a rename in any job demotes a gate.

`legRunsStep` (`scripts/check-gate-coverage.mjs:183`) is a bidirectional substring test.

`isAdvisory` (`scripts/check-gate-coverage.mjs:97`) misses `|| true`.

`findDocProblems` (`scripts/check-gate-coverage.mjs:426`) is `includes`, so a stale second sentence beside the right one passes.

The `Publish summary` table is an unguarded second copy of the gate list (34 `O_*` bindings and 34 rows, `.github/workflows/certification-gates.yml:331-451`).

"a blocking step has no name" (`scripts/check-gate-coverage.mjs:346`) names no job or index.

The counting test (`scripts/check-gate-coverage.test.ts:196-215`) re-implements `countCoverage`.

Five of the nine allowlist names are `uses:` steps, which `stepKind` (`scripts/check-gate-coverage.mjs:173`) already classes as plumbing, so those five names are inert.

An env-prefixed command is invisible: `CI=1 pnpm run x` (`scripts/check-gate-coverage.mjs:44`).

A `then`-guarded command is invisible: `if [ -f x ]; then pnpm run x; fi` (`scripts/check-gate-coverage.mjs:44`).

A single `&` drops the second script: `pnpm run a & pnpm run b` (`scripts/check-gate-coverage.mjs:44`).

A single `|` drops the second script: `pnpm run a | pnpm run b` (`scripts/check-gate-coverage.mjs:44`).

`(pnpm run a); (pnpm run b)` is caught by the legRunsStep fallback (`scripts/check-gate-coverage.mjs:266`), not the run-script message.

`RUN_FLAGS` (`scripts/check-gate-coverage.mjs:45`) is `"gm"`, so `^` matches after every newline. Replacing the `certification-gates / typecheck` run (`pnpm run typecheck`) with `cat <<EOF`, a newline, `  pnpm run typecheck`, a newline, `  EOF`, or with `echo "`, a newline, `  pnpm run typecheck"`, makes the invoked scripts `["typecheck"]`. `evaluateGateCoverage` returns `problems: []`. That text is here-doc data, or the inside of a double-quoted echo. `2b7690ee` compiles `RUN_SOURCE` with `"g"` and returns `blocking step "certification-gates / typecheck" leg "typecheck" does not run this step`. 0 of 89 blocking bodies differ between `"g"` and `"gm"`.

A null leg returns at `scripts/check-gate-coverage.mjs:284`, before the does-not-reach loop at `scripts/check-gate-coverage.mjs:296`. `pnpm run build:web` on its own line after `set +e` in the certified shard (`.github/workflows/certification-gates.yml:714`, under `run: |` at `:713`) leaves the invoked scripts `["build:web"]`. `build:web` is a package script and `ci:release-readiness` leaves it unreached. `evaluateGateCoverage` returns `problems: []`. The same edited step with leg `build:web` returns `entry "certified (${{ matrix.shard }}/8) / certified shard" leg "build:web" is not reached by ci:release-readiness` and `blocking step "certified (${{ matrix.shard }}/8) / certified shard" runs "build:web", which ci:release-readiness does not reach`.

2026-09-22. `node /tmp/vw277-s3zdl4/tmp/w616a/proof.mjs` imports `evaluateGateCoverage` from the committed module, feeds it the edited workflow text, and exits 0:

```text
COUNTS
{"blocking":89,"named":89,"bodiesDifferGvsGm":0,"diffs":[],"packageScriptsDifferGvsGm":0,"buildWebIsScript":true,"buildWebReached":false,"typecheckReached":true,"typecheckKeys":["certification-gates / typecheck"],"typecheckRunBodies":["pnpm run typecheck"],"shardKey":"certified (${{ matrix.shard }}/8) / certified shard","shardLeg":null,"shardInvoked":[]}
BASELINE_CURRENT
{"ok":true,"problems":[]}
BASELINE_OLD
{"ok":true,"problems":[]}
HEREDOC_STEP
{"oldBlock":"        run: pnpm run typecheck","runBody":"cat <<EOF\n  pnpm run typecheck\n  EOF","invoked":["typecheck"],"g":[],"gm":["typecheck"]}
HEREDOC_CURRENT
{"ok":true,"problems":[]}
HEREDOC_OLD
{"ok":false,"problems":["blocking step \"certification-gates / typecheck\" leg \"typecheck\" does not run this step"]}
ECHO_STEP
{"runBody":"echo \"\n  pnpm run typecheck\"","invoked":["typecheck"],"g":[],"gm":["typecheck"]}
ECHO_CURRENT
{"ok":true,"problems":[]}
ECHO_OLD
{"ok":false,"problems":["blocking step \"certification-gates / typecheck\" leg \"typecheck\" does not run this step"]}
SHARD_STEP
{"runBody":"set +e\n          pnpm run build:web\n          pnpm exec playwright test e2e/certified --shard=${{ matrix.shard }}/8 --workers=2\n          code=$?\n          set -e\n          pnpm exec tsx scripts/check-certified-shard.ts --shard ${{ matrix.shard }} --exit-code \"$code\"","invoked":["build:web"],"g":[],"gm":["build:web"],"leg":null}
SHARD_NULL_CURRENT
{"ok":true,"problems":[]}
SHARD_NULL_OLD
{"ok":true,"problems":[]}
SHARD_LEG_BUILD_WEB_CURRENT
{"ok":false,"problems":["entry \"certified (${{ matrix.shard }}/8) / certified shard\" leg \"build:web\" is not reached by ci:release-readiness","blocking step \"certified (${{ matrix.shard }}/8) / certified shard\" runs \"build:web\", which ci:release-readiness does not reach"]}
```
