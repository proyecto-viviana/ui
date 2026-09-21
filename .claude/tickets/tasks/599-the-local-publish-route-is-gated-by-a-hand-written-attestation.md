---
id: 599
type: task
title: "The local publish route is gated by a hand-written attestation, so it passes with the whole ladder red"
created: 2026-09-21
parent: 544
status: merged
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
  - {
      state: merged,
      at: 2026-09-21,
      note: "all three Scope items, proved red first. Receipt `.agents/599-release-evidence-2026-09-21.md`. The finding was re-measured before anything was written: HEAD's prerequisites guard, run against HEAD's own config with `npm_config_registry=http://127.0.0.1:9`, printed one `SKIP` line and `release prerequisites — PASS` and exited 0 - twelve sentences, zero reads, no network needed to pass. Scope 1: `changeset:publish` is now `guard:release-prerequisites && guard:release-evidence && vp run build && changeset publish`, evidence before the build so a blocked publish costs seconds; `release.yml`'s publish step passes `RELEASE_SHA: ${{ github.event.workflow_run.head_sha || github.sha }}`, because in a `workflow_run` event `github.sha` is the default branch head, not the revision being released, and the guard now runs inside the script the action calls. The step at `release.yml:55` is now documented as the early exit, not the gate. `check-release-evidence.mjs` was rewritten around one fact: a workflow run conclusion read from the Actions API for one exact sha, re-filtered on `head_sha` and `head_branch` after the query, never a sentence a human or an earlier step wrote. Per workflow, any completed `success` at that sha passes - a cancelled re-run does not retract a green the same tree already took - a run still in progress is waited for, and no run at all or any other conclusion is refused with the workflow named. It fails closed with no bypass, no env override and no 'if disabled, skip' branch, which is the honest reading of #568: while Release Readiness and Site Gate are `disabled_manually` the release condition is unsatisfiable, and saying which workflow has no run at that sha is the point. Missing inputs (repository, token, sha) are themselves a refusal; the fallbacks - `git rev-parse`, the `origin` remote, `gh auth token` - derive from the machine, so they can make the check run but never make it pass. Scope 2 and 3: `satisfied`/`evidence` is now refused by name so one entry cannot quietly return to it, and every prerequisite is either `verify`, re-derived on every run from a live registry read through `npm_config_registry`, or `attested`, with `by`, a `YYYY-MM-DD` `at`, `why` and `says`, printed as `ATTESTED:`. Kinds: `npm-registered` (packument answers, name matches, `dist-tags.latest` present) and `npm-provenance` (`versions[latest].dist.attestations.provenance.predicateType` is `https://slsa.dev/provenance/v1`). Provenance is the public stand-in for npm's 2FA-gated trusted-publisher page: it is the registry's own record that the publish came over OIDC from `release.yml`, and unlike the settings page anyone can re-take it. Eleven of the twelve rows re-derive; the twelfth is kumo's `trusted-publisher-registered`, a dated owner attestation, because kumo's only tarball is the pre-trusted-publishing `0.0.0-bootstrap.0` reservation and carries no provenance to read - from its first OIDC publish `npm-provenance` replaces it, and the `says` field carries the trust-list result without the connection identifier. Proof, exit codes all run in this session: `node scripts/test-ci-guard-contracts.mjs` EXIT=0 with 44 PASS lines, eight of them new - unregistered candidate fails on the live read, no provenance fails the trusted-publisher row, a re-derived pair passes and prints what was read, `satisfied: true` plus a sentence is refused, an undated attestation is refused, a dated owned one passes, the local route reads the same evidence CI does, the publish step names the candidate sha. The same test file against the pre-fix implementation, HEAD's four files restored into the tree and the new test kept, EXIT=1 at `test-ci-guard-contracts.mjs:1491`, 'a release candidate the registry does not serve passed its own registry row'; the post-fix files were restored from a scratchpad copy and verified by `sha256sum`. Against the real API at base `d344d174` with `RELEASE_EVIDENCE_TIMEOUT_MS=1`, EXIT=1 with three `FAIL:` lines, each `no run at this SHA`, and `Publishing is blocked: 3 of 3 required workflows`; at `a686e846ab28148d84062996485b120c06c3b5dc`, the last sha with a green ladder, EXIT=0 and `PASS: all required workflows succeeded for exact release SHA`. Against the real registry the prerequisites guard EXIT=0 with ten `VERIFIED:` lines naming the url, `dist-tags.latest` and the predicate read for each published package, plus kumo's `SKIP` at `0.0.0`. `vp exec tsx scripts/check-changeset-required.mjs` EXIT=0, no releasable package changed; `vp fmt` fixed two wrappings (diff against the pre-format copies is two line breaks and nothing else) and the contract test was re-run green after it; `vp lint` on the three scripts EXIT=0; `.mjs` is not typechecked. One method note worth keeping: the new registry contracts run the guard through `run`, not `runSync` - `spawnSync` blocks the test's event loop, so an in-process fake server never answers and the child's read hangs to its own timeout instead of reading the status. Disagreement recorded, because the tree beats the brief: the brief named the main checkout on `main` while the harness opened this session in the `public-face` worktree, whose write paths are READMEs and app page content only, so all work is in the main checkout and nothing under that worktree was touched. Owed, and why this is `merged` and not `verified`: this seat does not push, so no run id backs these numbers, and `ci:changesets` now needs registry network access because `guard:release-prerequisites` is a live read",
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
