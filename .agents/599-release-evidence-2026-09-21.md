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

> Two sentences above are false as written and are retracted: **"no env
> override"** and **"every fallback … can only make the check run, never make
> it pass"**. `GITHUB_API_URL` was an unvalidated env override that made the
> guard pass, and the `gh auth token` fallback handed the developer's
> credential to whatever host it named. §6 has the measurement and the fix.

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

## 6. Addendum, 2026-09-21: what the review found in §2

Base `ec9f4164`. A review of the work above found five problems. Each was
re-measured against the tree before anything moved; all five were real, so the
list below is what was wrong, then the proof it is not any more. Probe scripts
live in this session's scratchpad; each one stands up a loopback HTTP server
that answers the Actions API, hashes the `Authorization` header it receives,
and spawns the guard against it. Where a probe line is quoted below, "the gh
token" stands for the value `gh auth token` prints; no token value was printed
anywhere, only the first 12 hex of its sha256, compared.

**1, high — the env override that passed, and the leaked credential.**
`GITHUB_API_URL` was read raw. Against a fake host serving one invented
`success` row, HEAD's guard printed `PASS: all required workflows succeeded`
and EXIT=0 — a green read from whatever host the environment named. Worse, with
`GITHUB_TOKEN` empty the guard fell back to `gh auth token`, so the probe's
comparison of sha256 hashes reported *token sent to fake host equals the gh
token: true*. The fallback did not only "make the check run": it
made the check pass, and paid the developer's credential to a stranger for it.
Now `resolveApi()` accepts `https://api.github.com` and a loopback host (which
is announced as `FIXTURE` and never handed the `gh` credential), and refuses
anything else with `release evidence is read from api.github.com only. A
redirected read is not a read.` `GITHUB_REPOSITORY` is the same class: the
`origin` remote decides, and the env var may name it but may not disagree with
it against the real API. Post-fix, the same probe is EXIT=1 with three
refusals and *token sent to fake host equals the gh token: false*.

**2, high — `some(success)` was looser than the code it replaced.** The verdict
was `runs.some(completed && success)`, so `[success, failure]` at one SHA
passed: a re-run that went red could not take the green back. Measured on HEAD:
EXIT=0. The intent of #589 was only that a *cancelled* re-run does not retract
a green, and that is now what the code says — `STANDING_CONCLUSIONS` is
`success`, `cancelled`, `skipped`; any other completed conclusion refuses and is
named. Post-fix: EXIT=1, `concluded failure; the green at the same SHA does not
stand against it`.

**3, high — `head_branch === "main"` is not a push to this repo's main.** On a
`pull_request` run, `head_branch` is the PR head's *ref name* and `head_sha` is
the PR head commit, and all three required workflows carry an unfiltered
`pull_request:` trigger. So a fork PR whose branch is called `main` was
evidence. `gh run list --event pull_request` on this repository returns rows
whose `headBranch` is the contributor's branch, which is the same mechanism.
Measured on HEAD with one forked `pull_request` row: EXIT=0. The filter now
also requires `event` in `{push, workflow_dispatch}` and
`head_repository.full_name` equal to the repository. Post-fix: EXIT=1, `no run
at this SHA`.

**4, medium — `attested` was a shape, not an exception.** Any row could be
downgraded from a live read to four field names, at any date. A fixture config
with every row attested at `2019-01-01` passed HEAD's guard: EXIT=0, `release
prerequisites — PASS`. Now `ATTESTABLE` lists the pairs that may be attested —
exactly `@proyecto-viviana/kumo` / `trusted-publisher-registered` — everything
else must carry a verify block, and an attestation older than
`ATTESTATION_MAX_AGE_DAYS` (90) is refused with its age. Post-fix the fixture is
EXIT=1 on both counts.

**5, medium — the local route proved a commit and published a tree.** Nothing
tied the SHA whose runs were read to the code about to be packed: no clean-tree
check, no check that HEAD is on `origin/main`. When the SHA comes from HEAD the
guard now refuses a dirty tree, a missing `refs/remotes/origin/main`, and a HEAD
`origin/main` does not contain. An explicit `RELEASE_SHA` is untouched, because
that is CI's path and CI checks out what it names.

Proof, every exit code run in this session:

- `node scripts/test-ci-guard-contracts.mjs` — EXIT=0, **56 PASS** lines, twelve
  more than §3's 44. New contracts: a failure retracts a green; a `pull_request`
  run is not evidence; another repository's run is not evidence; a base that is
  not `api.github.com` is refused; a stand-in base gets no `gh` credential;
  `GITHUB_REPOSITORY` may not disagree with `origin`; an attested row outside
  the allowlist is refused; a stale attestation is refused with its age; and, on
  a throwaway git fixture (`git init`, one commit, `update-ref
  refs/remotes/origin/main`), dirty-tree, missing-`origin/main` and unpushed-HEAD
  refusals plus a clean, pushed, green checkout that still publishes. The two
  attestation contracts are dated `daysAgo(17)` and `daysAgo(400)` so they
  cannot rot into the answer.
- The same test file against the pre-fix guards, twice, because one revert does
  not prove two fixes. Both guards restored from `ec9f4164` with the new test
  kept — EXIT=1 at `test-ci-guard-contracts.mjs:1633`, `a prerequisite with a
  public read was downgraded to an attestation and passed`. The evidence guard
  alone reverted — EXIT=1 at `:1792`, `a later run that concluded failure did
  not retract the green at the same SHA`. Post-fix files restored from the
  scratchpad copy and verified with `sha256sum -c`, both `OK`.
- Against the real API, to prove the tighter filter does not refuse the real
  path: `gh api` shows the green run at
  `a686e846ab28148d84062996485b120c06c3b5dc` is `event: push`,
  `head_repository.full_name: proyecto-viviana/ui`; the new guard at that SHA is
  EXIT=0, `PASS`. At `d1c5f4b3` it is EXIT=1 (Certification Gates concluded
  failure; the other two have no run). At HEAD with no `RELEASE_SHA` it is
  EXIT=1 on the dirty tree and on HEAD not being contained in `origin/main` —
  which is the intended answer in this checkout today.
- `vp run guard:release-prerequisites` against the real registry — EXIT=0, ten
  `VERIFIED:` lines plus kumo's `SKIP`; kumo's row is inside the new allowlist
  and its `at: 2026-09-04` is inside the window.
- `vp fmt` on the three scripts — EXIT=0; `vp lint` on the three — EXIT=0; the
  contract test re-run after formatting — EXIT=0, 56 PASS.

Open decisions this session made, none of them the reviewer's to make:
`workflow_dispatch` is evidence alongside `push`, because once #568's disabled
workflows are re-enabled a dispatch is the only way to earn evidence at a SHA
that already exists, and a dispatch checks out the ref it names; the attestation
window is 90 days, stated as a constant, which binds nothing today because
kumo's row is the only one and it SKIPs at `0.0.0`; untracked files count as a
dirty tree, so another session's untracked work in this checkout blocks a local
publish, which is the safe direction; and `guard:publish-drift` was *not* added
to `changeset:publish` — it is `release.yml`'s, and widening the local route was
not this ticket's scope.
