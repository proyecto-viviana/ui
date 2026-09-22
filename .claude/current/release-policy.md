---
kind: reference
status: current
---

# Release Policy

Status: live policy.
Update when: the release matrix, the Changesets flow, or the CI gates change.

## Source of truth

- Each package's `package.json` owns its releasable `name`, `version`,
  `description`, and npm dependency ranges.
- The license is the root `LICENSE` plus per-package manifest metadata pointing
  to it.
- Versioning is **independent per package** — no lockstep. Release intent is
  expressed through Changesets.

## Release matrix

| Workspace                            | Classification    | Registry | Privacy |
| ------------------------------------ | ----------------- | -------- | ------- |
| `packages/solid-stately`             | releasable        | npm      | public  |
| `packages/solidaria`                 | releasable        | npm      | public  |
| `packages/solidaria-components`      | releasable        | npm      | public  |
| `packages/kumo`                      | releasable        | npm      | public  |
| `packages/geist`                     | releasable        | npm      | public  |
| `packages/solid-spectrum`            | releasable        | npm      | public  |
| `packages/viviana-ui`                | releasable        | npm      | public  |
| `packages/solidaria-test-utils`      | private/test-only | none     | private |
| `packages/solid-spectrum-test-utils` | private/test-only | none     | private |
| `apps/web`                           | app-only          | none     | private |
| `apps/comparison`                    | app-only          | none     | private |

`@proyecto-viviana/ui` (dir `packages/viviana-ui`) was promoted into the release
matrix on 2026-06-20 (owner decision) — it is the client-facing entry point for the
`viviana-social` apps. Its publish must version its **actual manifest closure**
coherently: `ui` directly depends on `solid-stately`, `solidaria`, and
`solidaria-components` via `workspace:*`. It does not depend on the sibling
`solid-spectrum` package. A UI release that needs a new lower-package export
must republish the owning lower package. Unrelated Spectrum changes do not
belong in that closure. The Changesets check, release-prerequisite guard, pack-chain
script, and out-of-workspace consume smoke enforce this contract.

`@proyecto-viviana/kumo` entered the matrix as an experiment on 2026-08-13.
`@proyecto-viviana/geist` entered on 2026-09-10. Both depend on
`solidaria-components` and its lower dependencies. They are not in the
`@proyecto-viviana/ui` dependency closure.

Workspace Kumo stays at `0.0.0`. Workspace Geist stays at `0.0.0` the same
way. The guard permits those unpublished workspace versions. Changesets
ignore them until the workspace version is a real release, so
`changeset version` cannot bump them off `0.0.0` as a side effect of the
Adobe stack train. `guard:release-prerequisites` fails if pending
changesets name a `0.0.0` package that is not ignored — that path would
publish a fake first release. A nonzero release-candidate version fails CI
and publish unless `scripts/release-prerequisites.json` records both npm
package registration and trusted-publisher registration. Those
registrations exist for Kumo's deprecated `0.0.0-bootstrap.0` name
reservation. They do not make workspace `0.0.0` a product release. Geist
has no npm registration yet.

## Flow

```bash
vp run pr:check:fast      # ci:changesets + ci:release-readiness
vp run pr:check           # pr:check:fast + ci:site (web/a11y/CI changes)
vp run release:prepare    # changeset:version + ci:release-readiness
vp run release:publish    # publish via Changesets
vp run release            # release:prepare + release:publish
```

CI enforcement mirrors these: `Changesets Check` = `ci:changesets`,
`Release Readiness` = `ci:release-readiness`, and `Site Gate` = `ci:site`.
Together, they match `vp run pr:check`. `ci:site` is the blocking accessibility bar (WCAG
2.2 AA + comparison/smoke + a dedicated `color-contrast` sweep over every route
in both themes) plus the all-routes render sweep. `a11y:full` runs the broader
playground audit. AA and best-practice rules stay strict. AAA attaches only
`color-contrast-enhanced` as an informative report. Experimental attaches only
the exact-upstream Tag `focus-order-semantics` finding. Every other AAA or
experimental finding fails. These attached reports are not a component-parity
waiver and do not substitute for the certification playbook.

A fourth workflow, `Certification Gates`, runs the guard/parity ladder. Its
blocking steps include pinned-upstream preflight, the monotonic `@ts-nocheck`
budget, baselined parity hard edges, and the certified suite. One check remains
advisory and says why in the workflow itself: `guard:upstream-freshness`, red
when Adobe ships past our pin, which is news about upstream and not a defect in
this branch. The certified shards were advisory by accident until #589; a shard
now concludes red unless every failure it saw is waived in
`apps/comparison/e2e/certified-waivers.json`. The three evidence workflows fire
on pull requests **and on push to `main`** — work here lands direct to main, so a
PR-only gate never fires.

`vp run guard:gate-coverage` prints how `ci:release-readiness` overlaps that ladder.

`ci:release-readiness runs 11 of 44 blocking gate steps locally across the six Certification Gates jobs; the other 33 run only there; 45 steps are runner plumbing (scripts/gate-coverage.json)`

`Changesets Check` stays `pull_request`-only, and stays correct there: on a
direct push to `main` the changeset is already in the tree beside the change it
describes, so the push path is held by `guard:publish-drift` instead, which fails
any unreleased change no pending changeset publishes, over the files each
manifest's own `files` ships plus its README.

That guard takes its boundary from the registry, not from the tree's account of
itself (#598). It reads what each publishable package is served under the
release tag — the prerelease tag while `.changeset/pre.json` says `pre`, falling
back to `latest` and then to the highest published version, because npm serves
no `rc` for a name that has never had a prerelease and the rc line and the
stable line are the same package. Only a 404 or an empty `versions` map is
"never published"; an answer that cannot be read, including a 200 carrying no
`dist-tags`, is refused rather than passed. Versions are compared by semver
precedence, so both directions fail: a version the registry never received once
a changeset or a source change is stacked on top of it, and a tree behind what
npm serves, which is not the tree that was released. A bump with nothing stacked
on it is the commit the release job publishes from, and passes. A pending
changeset excuses unreleased source, because the next bump carries it; it never
excuses an unpublished bump, which is what it is queued on top of.

It runs at both Changesets stages, and each stage is asked a different question
(#598 second review). Before `changeset version` it runs as `--version-stage`,
which defers an unpublished bump a pending changeset covers: that stage is the
route that consumes the changeset and supersedes the bump, so refusing there
would block the only move that clears the drift. It defers nothing else — source
no changeset will publish, and a tree behind the registry, still fail at that
stage. Before `changeset publish`, inside `changeset:publish`, it runs plain,
with nothing left to defer to. A bump abandoned by a failed publish is recovered
by re-running `Release` at that same green SHA, or by `vp run release:npm` from a
clean checkout of it; queuing a fresh changeset on top does not republish it.

## GitHub automation

`Release` no longer races the evidence workflows on every push. A successful
`Certification Gates` run on `main` triggers it for that run's exact head SHA.
Before Changesets can create/update a version PR or publish packages,
`guard:release-evidence` requires successful `Certification Gates`, `Release
Readiness`, and `Site Gate` runs for that same SHA. A run is evidence only if it
is this repository's own `push` or `workflow_dispatch` on `main`: a
`pull_request` run records the PR head's ref name and can carry a fork's code,
so it never counts (#599). The guard waits for siblings still running and fails
closed on no run at all. The newest completed run at that SHA decides (#599
second review): a green re-run clears an older `failure`, `timed_out` or
`action_required`, and the refusal says when an older green stands behind the
red it refuses on. `cancelled` and `skipped` stand aside — they neither release
nor retract — so the decision falls to the newest run under them, and a SHA whose
runs are all cancelled is refused as no evidence at all. It reads
`api.github.com` only: a `GITHUB_API_URL` naming any other host is a refusal, not
a redirect, and never receives the local `gh` credential. The single exception is
this guard's own contract tests, and it needs two signals together — a loopback
host **and** `RELEASE_EVIDENCE_FIXTURE=1`. Either alone refuses, so a stand-in
server cannot answer for a release. Whenever the revision it judges is HEAD —
taken from HEAD, or named in `RELEASE_SHA` by HEAD's own 40 digits — it refuses a
dirty tree: edits on top of that commit are not what any workflow ran, and naming
the commit does not make them published. Taken from HEAD it also requires an
`origin/main` that contains HEAD; naming another revision explicitly asks about
that revision, not about this checkout. Manual dispatch remains available and has
the same exact-SHA check.

After that evidence barrier, the workflow runs in two Changesets stages. If
unpublished changesets exist, it creates or updates the version PR. When that
PR merges, it publishes the changed npm packages.

Every workflow runs on GitHub-hosted runners. Owner 2026-09-17: the
third-party runner is removed on cost, reversing the #140 trade. Provenance
publish already required a GitHub-hosted runner and is unchanged.

The workflow publishes via **npm trusted publishing (OIDC)** — `id-token: write`,
npm `>=11.5.1`, **no `NPM_TOKEN` secret** — and the release job runs on a
**github-hosted runner** (`ubuntu-latest`), which is mandatory: OIDC auto-enables
sigstore provenance, and npm rejects provenance from self-hosted or
third-party runners with `E422`. Two prerequisites, both one-time and both
now satisfied (2026-07-06): a GitHub Actions trusted publisher registered on each
of the original five packages on npmjs.com (org `proyecto-viviana`, repo `ui`, workflow
`release.yml`), and the github-hosted runner. Run 28836083269 published all five
packages with provenance.

The Kumo package has the same two registrations as of 2026-09-04 (`3ca3a915`,
ticket #447): public `@proyecto-viviana/kumo@0.0.0-bootstrap.0` on npmjs.com,
and a GitHub Actions trusted publisher (`type: github`, `file: release.yml`,
`repository: proyecto-viviana/ui`). `guard:release-prerequisites` runs in
`ci:changesets` and again inside `changeset:publish`. Workspace Kumo remains
the deliberate `0.0.0` non-candidate until the first real publish. Kumo's
`trusted-publisher-registered` is the one prerequisite allowed to be attested
instead of re-derived; the guard holds that pair by name, refuses an attestation
on any other row, and expires one older than 90 days (#599).

## Scope

Root workspace management covers `packages/*`, `apps/web`, and `apps/comparison`.
The apps are private and ignored by Changesets for publishing, but kept in the
workspace graph so internal dependency ranges stay in sync. Docs-only changes
need no Changeset. Releasable package code usually does.
