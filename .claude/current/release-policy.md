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
| `packages/solid-spectrum`            | releasable        | npm      | public  |
| `packages/viviana-ui`                | releasable        | npm      | public  |
| `packages/solidaria-test-utils`      | private/test-only | none     | private |
| `packages/solid-spectrum-test-utils` | private/test-only | none     | private |
| `apps/web`                           | app-only          | none     | private |
| `apps/comparison`                    | app-only          | none     | private |

`@proyecto-viviana/ui` (dir `packages/viviana-ui`) was promoted into the release
matrix on 2026-06-20 (owner decision) — it is the client-facing entry point for the
`viviana-social` apps. Its publish must version the **whole closure** coherently:
`ui` depends on `solid-spectrum` + `solidaria-components` via `workspace:*`, which
transitively pull `solidaria` + `solid-stately`, so a `ui` release that needs a new
lower-package export must republish that package too. The implementation of the
promotion (Changesets scope, coherent closure publish, out-of-workspace install
smoke) is tracked as **UC-00** in `ui-client-contract.md`.

## Flow

```bash
vp run pr:check:fast      # ci:changesets + ci:release-readiness
vp run pr:check           # pr:check:fast + ci:site (web/a11y/CI changes)
vp run release:prepare    # changeset:version + ci:release-readiness
vp run release:publish    # publish via Changesets
vp run release            # release:prepare + release:publish
```

CI enforcement mirrors these: `Changesets Check` = `ci:changesets`,
`Release Readiness` = `ci:release-readiness`, `Site Gate` = `ci:site`; together
they match `vp run pr:check`. `ci:site` is the blocking accessibility bar (WCAG
2.2 AA + comparison/smoke + a dedicated `color-contrast` sweep over every route
in both themes) plus the all-routes render sweep; `a11y:full` runs the broader
best-practice/AAA/experimental playground audit without blocking.

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

After that evidence barrier, the workflow still runs in two Changesets stages:
if unpublished changesets exist it creates/updates the version PR; when that PR
merges, it publishes the changed npm packages.

The workflow publishes via **npm trusted publishing (OIDC)** — `id-token: write`,
npm `>=11.5.1`, **no `NPM_TOKEN` secret** — and the release job runs on a
**github-hosted runner** (`ubuntu-latest`), which is mandatory: OIDC auto-enables
sigstore provenance, and npm rejects provenance from self-hosted/third-party
(e.g. Blacksmith) runners with `E422`. Two prerequisites, both one-time and both
now satisfied (2026-07-06): a GitHub Actions trusted publisher registered on each
of the 5 packages on npmjs.com (org `proyecto-viviana`, repo `ui`, workflow
`release.yml`), and the github-hosted runner. History of getting here is in
`tech-debt.md` `release-oidc-trusted-publisher-unregistered` (E404 → register
publisher → E422 → github-hosted runner → green, run 28836083269 published all 5
with provenance).

## Scope

Root workspace management covers `packages/*`, `apps/web`, and `apps/comparison`.
The apps are private and ignored by Changesets for publishing, but kept in the
workspace graph so internal dependency ranges stay in sync. Docs-only changes
need no Changeset; releasable package code usually does.
