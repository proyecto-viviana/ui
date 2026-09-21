---
id: 589
type: task
title: "CI reports verdicts it does not hold: half the runs are cancelled, eight failing shards render green, and a receipt names the wrong chain"
created: 2026-09-21
parent: 544
status: merged
history:
  - {
      state: open,
      at: 2026-09-21,
      note: "opened from the 2026-09-21 round-1 audit, receipt `.agents/audit-2026-09-21/round-1-results.md`. Three findings, one shape - the thing a reader sees is not the thing that ran: `ci-truth/cancel-in-progress-erases-the-verdict`, `ci-truth/certified-shards-render-green-while-failing`, `ci-truth/contrast-receipt-leg-mislabel`. Measured here rather than taken from the audit: the last 60 Certification Gates runs on `main` are 31 failure, 29 cancelled, 0 success, and the last success is 2026-08-31T00:49:19Z, run 33345702215 at `a686e846`. So for three weeks the workflow has produced no green at all, and just under half of what it did produce is not a verdict",
    }
  - {
      state: merged,
      at: 2026-09-21,
      note: "all three findings, with the shape of the first two bound by the repo's workflow-shape contract test so it cannot drift back. No workflow can be executed locally, so the proof is that test plus a read of the YAML; the run id the Proof section asks for is owed, which is why this is `merged` and not `verified`. Item 1, cancellation: every ref-keyed concurrency group now reads `cancel-in-progress: ${{ github.ref != 'refs/heads/main' }}` - certification-gates, site-gate, release-readiness, changesets-check, journeys-nightly. `release.yml` is untouched on purpose: its group is keyed per sha and is already `false`. journeys-nightly is a deliberate half-case and its comment says so - its group is the bare string `journeys-nightly`, shared by the schedule and a dispatch, and a scheduled run's own ref is `refs/heads/main`, so the nightly is never cancelled while a dispatch from another ref still supersedes. Item 2, shards: `continue-on-error: true` and `id: certified_shard` are gone from the `certified shard` step, so a shard that exits 1 concludes red; nothing read that id (`grep -rn certified_shard .github scripts apps/comparison/scripts` exits 1). Three things the brief asked for were already true in the tree and needed no edit - `fail-fast: false` on the matrix, `if: always()` plus `if-no-files-found: error` on `Upload certified shard reports`, and `needs: [comparison-build, certified]` on the report job - and the tree wins; the contract test now binds all three so they cannot be dropped silently. The report job's `always()` became `!cancelled()`, so a cancelled run publishes no verdict at all rather than a verdict over a suite that did not finish. The summary table split into two rows, one per job name, because the shards are no longer advisory: the shard row says a failing slice concludes red and the other seven still run, the report row says it is the merged blocking verdict. Exactly one live `continue-on-error:` key remains repo-wide, `certification-gates.yml:284`, `guard:upstream-freshness`, and the header comment now says that is the only advisory gate left. Item 3, the receipt: `.agents/site-gate-2026-09-21.contrast.md` names its real chain - the third of the four `&&`-chained legs of `a11y:check`, itself the second of `ci:site`'s five - carries `170 of 174 routes` in its title and in its tally line, and adds a paragraph that corrects the landing commit's word `measured`, because the commit cannot be amended. #586's defect section carries the same coverage caveat and the same leg labels; its history is append-only and was not touched, and #545's note already carried 170/174. The contract test: a reviewer found `scripts/test-ci-guard-contracts.mjs` comparing whole-file `indexOf` offsets across jobs, and `run: pnpm run build` is a step of both `certification-gates` and `comparison-build`, so an ordering assertion could be satisfied by the other job's step and re-anchor silently when one is deleted. New `jobBlock()`/`stepBlock()` read one job's own block, and all five ordering anchors go through them. Isolated in `scratchpad/offset-proof.mjs` against a mutant where the gates job loses its build step: whole-file reports `budget @9197 (certification-gates) < build @21774 (comparison-build) -> PASS`, job-scoped reports `build @-1 -> FAIL`. A full pre-fix run does not show that hole, because the jsx-deopt assertion fails first on the same mutation - the proof had to be written, not just run. Two new contracts. One walks every file under `.github/workflows`, requires `cancel-in-progress` to be `false` or the main-exempt expression, requires a `github.ref`-keyed group to use the expression rather than `false`, and floors the count at 5 so a deleted group is not a silent pass (6 found). One binds the certified job: no `continue-on-error` key, `fail-fast: false`, an `always()`/`!cancelled()` shard upload, `!cancelled()` on the report job, and a `needs` list containing both `certified` and `comparison-build`, read in either YAML spelling so a legal reformat is not a false red. The `continue-on-error` assertion matches keys and skips comment lines, after it first tripped on the new YAML comment that names the thing it forbids. Staged red then green on the real files, `node scripts/test-ci-guard-contracts.mjs` each time: pre-fix EXIT=1 on `cancel-in-progress: true`; after the five cancellation fixes EXIT=1 on the shard's `continue-on-error`; after removing it EXIT=1 on the report's `always()`; after the report fix EXIT=0 with 34 PASS lines. Eight mutations in a scratch mutant root (`scratchpad/mutate.mjs`: the repo symlinked with a real copied `.github`, the real script run against it) - `cancel-true`, `cancel-false-on-ref-group`, `shard-continue-on-error`, `shard-fail-fast`, `shard-upload-skipped`, `report-always`, `report-drops-shards`, `gates-loses-its-build` - each exit 1 with its own message, baseline exits 0, and the block-list spelling of `needs` exits 0. `vp check` EXIT=0, 4427 files formatted, 3188 files lint-clean; all six workflows parse; `.mjs` is not typechecked, so `vp run typecheck` was not run for it. Bookkeeping seen while landing this, recorded on #588 and #587: run 35623988073 at `e8bacb9d` failed in `certification-gates` at step 24 `guard layer-boundary`, so `docs:check` and `guard entry-import-budget` were both `skipped` and neither ticket gets a verdict from it. That run is also pre-fix, so its eight green shard jobs are the old behaviour, not the new one",
    }
---

## Scope

1. **Cancellation.** `certification-gates.yml:36` sets
   `cancel-in-progress: true`. On a repository that commits straight to `main`,
   that cancels a half-hour suite on every push, and
   `scripts/check-release-evidence.mjs` treats a cancelled run at the release
   sha as a hard block. Either set `cancel-in-progress: false` for pushes to
   `main`, or stop citing per-push CI walks as the evidence mechanism and name
   the one sha that must get a complete run. The first is one line; the second
   is a change to how this campaign works.
2. **Shards.** `continue-on-error: true` on the `certified shard` step
   (`certification-gates.yml:641`) makes all eight shard jobs conclude success
   while their annotations carry `Process completed with exit code 1`. The
   blocking verdict is the separate `certified report` job and it does fail, so
   nothing leaks — but a reader, and any future branch-protection rule keyed on
   job names, sees eight passes over an 88-failure suite. Rename them
   (`certified shard N/8 (advisory)`) or drop `continue-on-error` and key the
   report job off `always()`.
3. **The contrast receipt.** `a11y:contrast` is the third leg of `a11y:check`,
   which is `ci:site`'s second leg — the receipt calls it a leg of `ci:site`.
   And the run it reports reached 170 of 174 routes before the harness stopped
   it for memory pressure; the receipt says so and the commit message calls the
   result "measured". Fix the label and carry the 170/174 caveat into every
   summary that cites the tally.

## Done when

A push to `main` is not cancelled by the next one, or the plan names the sha
that must complete and says why the others may be lost. The run's job list
cannot be read as a pass while the suite is failing. The contrast receipt names
its real chain and its real coverage.

## Proof

The workflow diff; one run id whose job list shows the shards labelled as they
conclude; the corrected receipt.

## Relationship

Child of #544, stage S0-c. Ahead of #590 because a chain walk whose evidence is
a CI run is worth nothing while half the runs are erased. Feeds #568, which
measures what the five workflows actually cover.
