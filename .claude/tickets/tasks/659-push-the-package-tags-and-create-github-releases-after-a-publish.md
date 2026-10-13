---
id: 659
type: task
title: "Push the package tags and create GitHub releases after a publish"
created: 2026-10-13
parent: 443
status: merged
history:
  - {
      state: open,
      at: 2026-10-13,
      note: "Owner, 2026-10-13: the Release workflow publishes to npm and leaves no tags and no GitHub releases; rc.2's were created by hand.",
    }
  - {
      state: merged,
      at: 2026-10-13,
      note: "The release job pushes the tags of the packages it uploaded and creates their releases. Proven against the rc.2 publish output and its five live releases; the push and the release creation themselves first run at the next real release.",
    }
---

## Cause

`.github/workflows/release.yml` ends with `pnpm run changeset:publish`.
`changeset publish` uploads to npm and creates a git tag for each package it
uploaded, on the runner. The job then ends and the runner is discarded, so the
tags never reach the repository, and nothing creates a GitHub release. The
Changesets action did both until it was dropped for breaking under pre mode;
the 0.6.x releases it made are the last automatic ones.

State on 2026-10-13, from `git ls-remote --tags origin` and `gh release list`:

- `0.x.0-rc.0` and `0.x.0-rc.1` of the five packages are on npm under `rc` and
  have no tags and no GitHub releases. This ticket does not create them.
- rc.2's five tags and five pre-releases exist. They were created by hand on
  2026-10-13 after Release run 38339551171 published from `142ee7c3`.

## Scope

After a successful publish the release job pushes the tags of the packages that
run uploaded and creates one GitHub release per package: named like the
existing ones (`@proyecto-viviana/ui@0.8.0-rc.2`), with that version's section
of the package's `CHANGELOG.md` as its notes, and a pre-release when the
version is a prerelease. `.github/workflows/release.yml`, a script under
`scripts/` with its tests, and `.claude/current/release-policy.md`.

Not in scope: tags or releases for rc.0 and rc.1, any change to what is
published or when, a new action, a new dependency.

## Done when

A `Release` run that publishes packages leaves their tags in the repository and
a release for each, with no step by hand. A run that publishes nothing creates
nothing and stays green.

## Proof

`scripts/publish-github-releases.mjs` reads the packages under `Successfully
published:` in the publish step's output, checks each against the tree (the
manifest holds that version, the tag exists and points at the released commit,
the CHANGELOG has a section for it), and only then pushes the tags in one push
and creates the releases with `gh release create --verify-tag`.

Proven locally, on 2026-10-13:

- Against the rc.2 state. The publish output of run 38339551171 is kept as
  `scripts/fixtures/changeset-publish-rc2.txt`. Package manifests and
  changelogs are unchanged since `142ee7c3`. Then

  ```bash
  RELEASE_SHA=142ee7c3 node scripts/publish-github-releases.mjs --publish-log scripts/fixtures/changeset-publish-rc2.txt
  ```

  prints five releases. Compared with `gh release view` of the five live rc.2
  releases: the same five tags, and for each the same name, the same
  pre-release flag and the same notes.

- `scripts/publish-github-releases.test.ts`, 13 cases: the five names are read
  through the log's timestamps and cursor codes; a publish that announced
  packages and uploaded none releases nothing; a version the tree does not
  hold, a missing tag, a tag on another commit, a missing CHANGELOG section, a
  private and an unknown package are each refused; a stable version is not
  marked a pre-release; the tags go in one push before any release, each
  release takes its tag as title and its notes from a file, a failed push
  creates no release, and an existing release is left alone.
- `vp run test:ci-guard-contracts`: the publish step keeps its output with
  `pipefail` set, and the tag step comes after it, reads that output, applies,
  and has `GH_TOKEN`, `RELEASE_SHA` and `contents: write`.
- `guard:workflow-pins`, `guard:github-hosted-runners` and
  `guard:gate-coverage` pass. The workflow adds no action and no runner.

Not proven, because no workflow was run. These first happen at the next real
release:

- That `git push` of the tags is accepted from the job. The job has
  `contents: write` and checkout leaves its token in place, as the rc.2 log's
  post-job cleanup shows, but a tag ruleset on the repository would refuse it.
- That `gh release create` succeeds with the job token, and what the releases
  look like on the page.
- That `changeset publish` leaves a tag on the released commit for every
  package it lists. The rc.2 run printed `Created git tags.`, without naming
  them. If a tag is missing the step fails before pushing anything.
- The step's behaviour inside `bash -e` on the runner, `$RUNNER_TEMP` included.

If the step fails the packages are already on npm; `release-policy.md` gives
the commands to finish by hand.

## Relationship

Child of #443. Follows #655 (rc.2) and #547. The next release candidate is the
first run of this step.
