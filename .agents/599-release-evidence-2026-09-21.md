# 599 — the publish route reads evidence instead of being told it

Date: 2026-09-21. Seat: the `ui` main checkout, branch `main`, base `d344d174`.

## 1. What the ticket found, re-checked in the tree first

`check-release-prerequisites.mjs` passed a prerequisite on `satisfied === true`
plus any non-empty `evidence` string, and never parsed or re-ran the string.
Run against HEAD's own config with an unreachable registry, the pre-fix guard
printed one `SKIP` line, `release prerequisites — PASS`, and exited 0
(`npm_config_registry=http://127.0.0.1:9 node scripts/check-release-prerequisites.mjs`,
EXIT=0): twelve hand-written sentences, zero reads. HEAD's `changeset:publish`
was `vp run guard:release-prerequisites && vp run build && vp exec changeset
publish` — no same-sha check anywhere on the local route.

## 2. What changed

**`scripts/check-release-evidence.mjs`** — the gate is a workflow run
conclusion read from the Actions API for one exact sha, filtered again on
`head_sha` and `head_branch` after the query, and nothing else. Per workflow:
any completed `success` at that sha passes (a later cancelled re-run does not
retract a green the same tree already took); a run still in progress is waited
for; no run at all, or a completed run with any other conclusion, is refused by
name. Refusal prints one `FAIL:` line per workflow plus how many of the three
are missing. Fails closed by construction: Release Readiness and Site Gate are
`disabled_manually` (#568, an owner gate), a disabled workflow produces no run,
and there is no bypass, no env override and no "if disabled, skip" branch.
`RELEASE_SHA`/`GITHUB_SHA` resolve through `git rev-parse`, the repository
falls back to the `origin` remote and the token to `gh auth token`, so the guard
runs off a checkout as well as in Actions; every fallback derives from the
machine, so it can only make the check run, never make it pass. Missing inputs
are a refusal, not a skip.

**`package.json`** — `changeset:publish` is now
`guard:release-prerequisites && guard:release-evidence && build && changeset
publish`. The evidence read is before the build, so a blocked publish costs
seconds rather than half an hour.

**`.github/workflows/release.yml`** — the publish step passes
`RELEASE_SHA: ${{ github.event.workflow_run.head_sha || github.sha }}`, because
the guard now runs inside `changeset:publish` and `github.sha` in a
`workflow_run` event is the default branch head, not the revision being
released. The pre-existing early-exit step keeps its own copy and is now
documented as an early exit, not the gate.

**`scripts/check-release-prerequisites.mjs` + `scripts/release-prerequisites.json`**
— `satisfied`/`evidence` is refused by name, so one entry cannot quietly go
back to it. Each prerequisite is now either `verify` (re-derived on every run
from a live registry read through `npm_config_registry`) or `attested` (`by`,
`at` as `YYYY-MM-DD`, `why`, `says`; printed as `ATTESTED:`). Two verify kinds:
`npm-registered` (the packument answers, `name` matches, `dist-tags.latest` is
a string) and `npm-provenance` (`versions[latest].dist.attestations.provenance
.predicateType === https://slsa.dev/provenance/v1`). Provenance is the public,
re-takeable stand-in for npm's 2FA-gated trusted-publisher settings: it is the
registry's own record that the publish came over OIDC from the workflow.
A read that cannot be taken is a failure, not a pass.

Eleven of the twelve rows re-derive. The twelfth, kumo's
`trusted-publisher-registered`, is a dated attestation: kumo's only tarball is
the pre-trusted-publishing `0.0.0-bootstrap.0` reservation, so there is no
provenance to read, and the settings page has no public read. Its `says` field
carries the trust-list result without the connection identifier. From kumo's
first OIDC publish, `npm-provenance` replaces it.

## 3. Proof, every exit code run in this session

- `node scripts/test-ci-guard-contracts.mjs` — EXIT=0, 44 PASS lines, including
  the eight new ones: an unregistered candidate fails on the live read; no
  provenance fails the trusted-publisher row; a re-derived pair passes and
  prints what was read; `satisfied: true` plus a sentence is refused; an
  undated attestation is refused; a dated, owned one passes; the local publish
  route reads the same evidence CI does; the publish step names the candidate
  sha.
- The same test file against the pre-fix implementation (HEAD's four files
  restored into the tree, the new test kept) — EXIT=1 at
  `test-ci-guard-contracts.mjs:1491`, `a release candidate the registry does
  not serve passed its own registry row`. The post-fix files were restored from
  a scratchpad copy and verified by `sha256sum`.
- Release evidence, real API, at base `d344d174` with
  `RELEASE_EVIDENCE_TIMEOUT_MS=1` — EXIT=1, three `FAIL:` lines, `Certification
  Gates`, `Release Readiness` and `Site Gate` each `no run at this SHA`,
  `Publishing is blocked: 3 of 3 required workflows`.
- The same guard at `a686e846ab28148d84062996485b120c06c3b5dc`, the last sha
  with a green ladder — EXIT=0, `PASS: all required workflows succeeded for
  exact release SHA a686e846…`.
- Release prerequisites, real registry — EXIT=0, ten `VERIFIED:` lines naming
  the url, `dist-tags.latest` and the provenance predicate read for each of the
  five published packages, plus kumo's `SKIP` at `0.0.0`.
- `vp exec tsx scripts/check-changeset-required.mjs` — EXIT=0, no releasable
  package changed. `vp fmt --check` on the changed files — EXIT=1 on two
  wrapping issues, both fixed by `vp fmt` (diff against the pre-format copies:
  two line breaks, no other change), then the contract test re-run green.
  `vp lint` on the three changed scripts — EXIT=0. `.mjs` is not typechecked.

The fake registry in the contract test is driven through `run`, not `runSync`:
`spawnSync` blocks this process's event loop, so an in-process server never
answers and the guard's read hangs to its own timeout instead of reading the
status. That cost one red run before it was diagnosed.

## 4. Disagreement recorded

The brief named the `ui` main checkout, branch `main`, while the harness opened
this session in the `public-face` worktree, whose write paths are READMEs and
app page content only (hub `AGENTS.md`, campaign #544). The tree wins: all work
is in the main checkout, and nothing under the worktree was touched.

## 5. Owed

No push from this seat, so no CI run id backs these numbers — `merged`, not
`verified`. `ci:changesets` now needs registry network access in CI, because
`guard:release-prerequisites` is a live read. And with two of the three
workflows disabled, the release condition is unsatisfiable until the owner
re-enables them; that is the intended reading of #568, not a defect to patch
around.
