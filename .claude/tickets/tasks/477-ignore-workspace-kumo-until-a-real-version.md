---
id: 477
type: task
title: "Ignore workspace Kumo until a real version"
created: 2026-09-05
parent: 443
status: merged
history:
  - {
      state: open,
      at: 2026-09-05,
      note: "Gates sibling left Kumo ignore uncommitted: config.json ignore, check-changeset-required drops kumo from releasable, check-changeset-status rejects mixed ignored+releasable files, guard:release-prerequisites fails if a 0.0.0 package is named and not ignored, contract tests, release-policy. Absorb that work. Do not version. Do not publish Kumo.",
    }
  - {
      state: in-progress,
      at: 2026-09-05,
      note: "Git v2. Commit the sibling policy and scripts. Mixed changesets stay #478.",
    }
  - {
      state: merged,
      at: 2026-09-05,
      note: "Kumo ignored. test-ci-guard-contracts PASS including pending-0.0.0 and ignored leftover names. Mixed files are #478.",
    }
---

Workspace Kumo is `0.0.0` (name reservation only). Changesets that
name it next to a releasable package would bump it off `0.0.0` as a
side effect of the Adobe train.

Ignore `@proyecto-viviana/kumo` until the workspace version is a real
release. `guard:release-prerequisites` fails if pending changesets name
a `0.0.0` package that is not ignored.

## Done when

`.changeset/config.json` ignores Kumo. `check-changeset-required` does
not treat `packages/kumo` as a changeset-required path. A pending
changeset that names an un-ignored `0.0.0` package fails
`guard:release-prerequisites`. Mixed ignored+releasable files fail
`check-changeset-status` (those files are #478).

## Relationship

Child of #443. Distinct from #447 (npm registration evidence) and #478
(strip Kumo from the four mixed files). Leave `experimental-kumo-button.md`
as Kumo-only. Do not `changeset:version`. Do not publish.
