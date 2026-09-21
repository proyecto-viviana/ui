---
id: 589
type: task
title: "CI reports verdicts it does not hold: half the runs are cancelled, eight failing shards render green, and a receipt names the wrong chain"
created: 2026-09-21
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-21,
      note: "opened from the 2026-09-21 round-1 audit, receipt `.agents/audit-2026-09-21/round-1-results.md`. Three findings, one shape - the thing a reader sees is not the thing that ran: `ci-truth/cancel-in-progress-erases-the-verdict`, `ci-truth/certified-shards-render-green-while-failing`, `ci-truth/contrast-receipt-leg-mislabel`. Measured here rather than taken from the audit: the last 60 Certification Gates runs on `main` are 31 failure, 29 cancelled, 0 success, and the last success is 2026-08-31T00:49:19Z, run 33345702215 at `a686e846`. So for three weeks the workflow has produced no green at all, and just under half of what it did produce is not a verdict",
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
