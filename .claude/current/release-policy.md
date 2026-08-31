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

`@proyecto-viviana/kumo` entered the matrix as an experiment on 2026-08-13. It
depends on `solidaria-components` and its lower dependencies. It is not in the
`@proyecto-viviana/ui` dependency closure.

The first npm publish is not ready. `guard:release-prerequisites` permits the
unpublished `0.0.0` package to remain in the workspace, but fails CI and publish
once Kumo has a nonzero release-candidate version unless both package
registration and trusted-publisher registration have explicit evidence in
`scripts/release-prerequisites.json`. Register both, verify them independently,
and update that evidence before merging Kumo's version PR.

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
budget, baselined parity hard edges, and the certified suite. Two checks remain
advisory and say why in the workflow itself. The three evidence workflows fire
on pull requests **and on push to `main`** — work here lands direct to main, so a
PR-only gate never fires.

## GitHub automation

`Release` no longer races the evidence workflows on every push. A successful
`Certification Gates` run on `main` triggers it for that run's exact head SHA.
Before Changesets can create/update a version PR or publish packages,
`guard:release-evidence` requires successful `Certification Gates`, `Release
Readiness`, and `Site Gate` runs for that same SHA. It waits for independently
running siblings and fails closed on absent, cancelled, timed-out, or failed
evidence. Manual dispatch remains available and has the same exact-SHA check.

After that evidence barrier, the workflow runs in two Changesets stages. If
unpublished changesets exist, it creates or updates the version PR. When that
PR merges, it publishes the changed npm packages.

The workflow publishes via **npm trusted publishing (OIDC)** — `id-token: write`,
npm `>=11.5.1`, **no `NPM_TOKEN` secret** — and the release job runs on a
**github-hosted runner** (`ubuntu-latest`), which is mandatory: OIDC auto-enables
sigstore provenance, and npm rejects provenance from self-hosted/third-party
(e.g. Blacksmith) runners with `E422`. Two prerequisites, both one-time and both
now satisfied (2026-07-06): a GitHub Actions trusted publisher registered on each
of the original five packages on npmjs.com (org `proyecto-viviana`, repo `ui`, workflow
`release.yml`), and the github-hosted runner. Run 28836083269 published all five
packages with provenance.

The Kumo package does not have this registration yet. This is an executable
release blocker. `guard:release-prerequisites` runs in `ci:changesets` and again
inside `changeset:publish`. Do not mark either Kumo prerequisite satisfied
until the recorded evidence has been checked.

## Scope

Root workspace management covers `packages/*`, `apps/web`, and `apps/comparison`.
The apps are private and ignored by Changesets for publishing, but kept in the
workspace graph so internal dependency ranges stay in sync. Docs-only changes
need no Changeset. Releasable package code usually does.
