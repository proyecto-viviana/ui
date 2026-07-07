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
vp run pr:check           # pr:check:fast + ci:a11y (web/a11y/CI changes)
vp run release:prepare    # changeset:version + ci:release-readiness
vp run release:publish    # publish via Changesets
vp run release            # release:prepare + release:publish
```

PR enforcement mirrors these locally: `Changesets Check` = `ci:changesets`,
`Release Readiness` = `ci:release-readiness`, `Accessibility Gate` = `ci:a11y`;
together they match `vp run pr:check`. `ci:a11y` is the blocking accessibility bar
(WCAG 2.2 AA + smoke, axe `color-contrast` temporarily excluded — `tech-debt.md`);
`a11y:full` runs stricter contrast/AAA/experimental audits without blocking.

## GitHub automation

On push to `main`, the `Release` workflow runs in two stages: if unpublished
changesets exist it creates/updates the Changesets version PR; when that version
PR merges, it publishes the changed npm packages. So a feature merge triggers
release automation, but the registry publish happens on the version-PR merge.

The workflow is wired for **npm trusted publishing (OIDC)**: `id-token: write` is
set, npm is upgraded to `>=11.5.1`, no `NPM_TOKEN` secret is stored. **BLOCKED as
of 2026-07-06:** the registry-side half was never done — no trusted publisher is
registered on npmjs.com for the 5 packages, so the first real publish (PR #7 merge,
run 28834107097) failed `E404 Not Found - PUT` on every package while the log
confirmed `OIDC is available - using npm trusted publishing`. npm returns 404 (not
403) on an unauthorized publish. Consequence: PR #7 is merged (repo at 0.4.0 /
solid-spectrum 0.6.0) but npm is still at the old versions (0.3.x / 0.5.3) — the
version gap is now wider, not closed. Unblock requires an npm-account action (see
`tech-debt.md` `release-oidc-trusted-publisher-unregistered`): register a GitHub
Actions trusted publisher (org `proyecto-viviana`, repo `ui`, workflow
`release.yml`) on each package, *or* add a granular `NPM_TOKEN` secret and thread
it into the workflow env. Then re-run publish via `gh workflow run release.yml`
(workflow_dispatch is enabled; changesets are already consumed, so it re-attempts
publish for any package whose version isn't yet on npm).

## Scope

Root workspace management covers `packages/*`, `apps/web`, and `apps/comparison`.
The apps are private and ignored by Changesets for publishing, but kept in the
workspace graph so internal dependency ranges stay in sync. Docs-only changes
need no Changeset; releasable package code usually does.
