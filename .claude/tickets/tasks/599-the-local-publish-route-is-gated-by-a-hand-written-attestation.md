---
id: 599
type: task
title: "The local publish route is gated by a hand-written attestation, so it passes with the whole ladder red"
created: 2026-09-21
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-21,
      note: "opened from the 2026-09-21 round-1 audit, receipt `.agents/audit-2026-09-21/round-1-results.md`, finding `release-path/release-prereq-self-attestation`, verdict partly. `check-release-prerequisites.mjs:96-106` passes a prerequisite on `satisfied === true` plus any non-empty `evidence` string; the evidence text is never parsed and never re-run. All twelve entries in `scripts/release-prerequisites.json` say true, so the guard passes today with Certification Gates red on `main` and no successful run since 2026-08-31. And `changeset:publish` is `guard:release-prerequisites` -> `build` -> `changeset publish`; `scripts/check-release-evidence.mjs`, the one thing that checks for a green run at the release sha, is called only from `release.yml:55`. So a local `vp run release:npm` reaches npm without the ladder having passed",
    }
  - {
      state: open,
      at: 2026-09-21,
      note: "recorded as a hole, not as a live risk, because the skeptic checked the decided route: #547 publishes through `release.yml`, whose evidence gate fails closed today, and the prerequisites guard does fail on an unlisted candidate - `76bd2b06` (#553) widened it to all five and made it read its subjects from the tree. So this is the local route only. It is still worth closing before the RC, because 'we will use the workflow' is the same class of answer as 'we remembered to run it', which #547 already refuses for the dist-tag step",
    }
---

## Scope

1. Add `node scripts/check-release-evidence.mjs`, or an equivalent same-sha
   green check, to `changeset:publish`, so the local route cannot bypass the
   ladder.
2. Make each prerequisite's evidence re-derived rather than stored: a live
   `npm view` read for the registry rows, a command and its exit code for the
   rest. A stored sentence is a claim, and a claim is a debt.
3. Where a prerequisite genuinely cannot be re-derived, say so in the entry and
   name who attested it and when, so the attestation is visible as an
   attestation.

## Done when

`vp run changeset:publish` refuses to reach `changeset publish` on a sha whose
Certification Gates run is not green, and each of the twelve prerequisites
either re-derives its evidence or is marked as an attestation with an owner and
a date.

## Proof

The guard's output on a red sha and on a green one; the diff of
`release-prerequisites.json`.

## Relationship

Child of #544, stage S4-b. Pairs with #598. Depends on there being a green
Certification Gates run at all, which is #588.
