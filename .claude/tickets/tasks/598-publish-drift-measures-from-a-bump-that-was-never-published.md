---
id: 598
type: task
title: "guard:publish-drift measures drift from a version bump that was never published, so a skipped publish reads clean"
created: 2026-09-21
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-21,
      note: "opened from the 2026-09-21 round-1 audit, receipt `.agents/audit-2026-09-21/round-1-results.md`. Two findings: `release-path/publish-drift-boundary-false` (medium, confirmed) and `release-path/publish-drift-comment-false` (low). The guard takes its boundary from the last commit touching `packages/*/CHANGELOG.md` - `check-publish-drift.mjs:49-53,64-69` - and for all five packages that is `a2e5220c` (2026-09-12), a `changeset version` whose publish never ran. So it starts its diff **after** an unpublished bump and never consults npm: the exact state the tree is in, a full minor ahead of the registry, reads as clean. Run at HEAD: exit 0, 'No publish drift'. Published `latest` is 0.5.1 / 0.4.3 / 0.5.1 / 0.6.4 / 0.6.3; local is 0.5.2 / 0.5.0 / 0.6.0 / 0.7.0 / 0.7.0. Worse, `:87` skips any package with a pending changeset, and all five have one - so on the release commit the guard skips every subject it has. This is the control `release-policy.md:92-95` names as what makes the `pull_request`-only Changesets Check safe",
    }
---

## Scope

1. Derive the boundary from the published version: `npm view <pkg> version`,
   then the commit that set that version in `package.json`. Failing that, at
   minimum fail when the local version is ahead of npm's `latest` with no
   pending publish.
2. Remove the skip at `:87`, or narrow it so it cannot swallow every package at
   once. A guard that excuses itself on the commit it exists for is not a
   guard.
3. Rewrite the comment above the publish-drift step in `release.yml`. It
   justifies the step's placement with a publish simulation; the script runs
   `git diff --name-only` over `packages/<dir>/src` and `package.json`, writes
   nothing, and leaves the tree clean. State what it does.

## Done when

At HEAD, with five local versions ahead of the registry and five pending
changesets, `vp run guard:publish-drift` fails and names the five. After a real
publish it passes. The `release.yml` comment describes a git-only diff.

## Proof

The guard's output at HEAD, before and after the change, and the simulated
post-publish case (`git checkout -- .` afterwards, as the
`publish-drift-invisible-in-repo` note requires).

## Relationship

Child of #544, stage S4-a. The `ui@0.6.0` incident is what this guard was
written for; this ticket is about it being unable to see the state that caused
it. Pairs with #599, the other gate on the publish path.
