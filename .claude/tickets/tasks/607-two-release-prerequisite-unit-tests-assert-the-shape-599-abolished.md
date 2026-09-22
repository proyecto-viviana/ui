---
id: 607
type: task
title: "Two release-prerequisite unit tests still assert the satisfied/evidence shape #599 abolished, so scripts/release-candidates.test.ts is red"
created: 2026-09-21
parent: 544
status: merged
history:
  - {
      state: open,
      at: 2026-09-21,
      note: "found while working #598, which extracted the live registry read into `release-candidates.mjs`. `scripts/release-candidates.test.ts` carries three `check-release-prerequisites` cases written against the pre-#599 contract, and two of them are red at HEAD, before and after #598: `vp test run scripts/release-candidates.test.ts --maxWorkers=2` at `5fcf3d35` gives `2 failed | 5 passed`, the same two, with the same output, as after #598's change. `passes a candidate whose prerequisites are satisfied and evidenced` feeds the guard `{ satisfied: true, evidence: 'npm view …' }` and expects exit 0; `fails a prerequisite that claims satisfaction with no evidence` expects the string `requires npm-package-registered`. #599 made that shape illegal by name and replaced the message, so both now get `still carries satisfied/evidence`. Not fixed under #598 on purpose: rewriting an assertion to match the behaviour that broke it is the re-bless move this board refuses elsewhere, and the decision of what these two cases should now assert belongs with #599's author",
    }
  - {
      state: open,
      at: 2026-09-21,
      note: "counts moved, the reds did not. #598's review fix carries each manifest's own `files` through `releasablePackages()`, which broke the exact-shape assertion in `takes every non-private, non-ignored package from the tree`; that case was repaired in place and a new one, `carries each manifest's own published-file list`, was added beside it. `vp test run scripts/release-candidates.test.ts --maxWorkers=2` now gives `2 failed | 6 passed` - the same two `check-release-prerequisites` cases, with the same `still carries satisfied/evidence` output. Nothing here is decided",
    }
  - {
      state: merged,
      at: 2026-09-22,
      note: "decided as deletion, not rewrite, and landed. Why it could not wait: root `vitest.config.ts` includes `scripts/**/*.test.ts`, so these cases run in `test:run`, which runs inside `ci:release-readiness`, which is the `Release Readiness` workflow that `check-release-evidence.mjs` requires green at the release sha - two red unit tests here are a publish that cannot happen. Both asserted the shape #599 abolished by name (`satisfied: true` plus an `evidence` sentence passing, and the old `requires npm-package-registered` message), so making them green means widening `check-release-prerequisites.mjs`, which Scope 3 refuses. Deleted, and the block now carries a comment naming the harness cases that prove the rule in their place: `satisfied=true plus a sentence is refused as release evidence`, `an attestation with no owner and date is refused`, `what cannot be re-derived passes only as a dated, owned attestation`, `only the listed prerequisite may be attested; the rest must re-derive`, and `an attestation expires; a stale one is refused with its age`. The third case stays because it is the one question no other file asks - the guard reads its subjects from the tree, so a package with no entry must fail, and this file builds the throwaway workspace that shows it. Proof, run in this session: `vp test run scripts/release-candidates.test.ts --maxWorkers=2` before `2 failed | 6 passed (8)` EXIT=1, after `6 passed (6)` EXIT=0; `node scripts/test-ci-guard-contracts.mjs` EXIT=0. `merged`, not `verified`: this seat does not push, so no Release Readiness run id backs the claim that the workflow is green",
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
