---
id: 607
type: task
title: "Two release-prerequisite unit tests still assert the satisfied/evidence shape #599 abolished, so scripts/release-candidates.test.ts is red"
created: 2026-09-21
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-21,
      note: "found while working #598, which extracted the live registry read into `release-candidates.mjs`. `scripts/release-candidates.test.ts` carries three `check-release-prerequisites` cases written against the pre-#599 contract, and two of them are red at HEAD, before and after #598: `vp test run scripts/release-candidates.test.ts --maxWorkers=2` at `5fcf3d35` gives `2 failed | 5 passed`, the same two, with the same output, as after #598's change. `passes a candidate whose prerequisites are satisfied and evidenced` feeds the guard `{ satisfied: true, evidence: 'npm view …' }` and expects exit 0; `fails a prerequisite that claims satisfaction with no evidence` expects the string `requires npm-package-registered`. #599 made that shape illegal by name and replaced the message, so both now get `still carries satisfied/evidence`. Not fixed under #598 on purpose: rewriting an assertion to match the behaviour that broke it is the re-bless move this board refuses elsewhere, and the decision of what these two cases should now assert belongs with #599's author",
    }
---

## Scope

1. Decide, per case, whether it is deleted or rewritten. The behaviour they
   reach for is already contract-tested in `scripts/test-ci-guard-contracts.mjs`
   (`PASS: satisfied=true plus a sentence is refused as release evidence`,
   `PASS: an attestation with no owner and date is refused`, and four more), so
   a rewrite has to say what it adds over the harness rather than duplicate it.
2. The third case in that block, `fails a publish candidate the prerequisite
list forgets`, is green and is not in question.
3. Do not widen `check-release-prerequisites.mjs` to make the old shape pass
   again: #599 refused `satisfied`/`evidence` by name precisely so it could not
   return one entry at a time.

## Done when

`vp test run scripts/release-candidates.test.ts` is green, and every
`check-release-prerequisites` case left in it names something the contract
harness does not already prove.

## Proof

The file's before and after counts from `vp test run
scripts/release-candidates.test.ts --maxWorkers=2`, and a green
`vp run test:ci-guard-contracts`.

## Relationship

Child of #544. Left by #599; surfaced by #598, which ran the file and left it
alone.
