---
id: 598
type: task
title: "guard:publish-drift measures drift from a version bump that was never published, so a skipped publish reads clean"
created: 2026-09-21
parent: 544
status: merged
history:
  - {
      state: open,
      at: 2026-09-21,
      note: "opened from the 2026-09-21 round-1 audit, receipt `.agents/audit-2026-09-21/round-1-results.md`. Two findings: `release-path/publish-drift-boundary-false` (medium, confirmed) and `release-path/publish-drift-comment-false` (low). The guard takes its boundary from the last commit touching `packages/*/CHANGELOG.md` - `check-publish-drift.mjs:49-53,64-69` - and for all five packages that is `a2e5220c` (2026-09-12), a `changeset version` whose publish never ran. So it starts its diff **after** an unpublished bump and never consults npm: the exact state the tree is in, a full minor ahead of the registry, reads as clean. Run at HEAD: exit 0, 'No publish drift'. Published `latest` is 0.5.1 / 0.4.3 / 0.5.1 / 0.6.4 / 0.6.3; local is 0.5.2 / 0.5.0 / 0.6.0 / 0.7.0 / 0.7.0. Worse, `:87` skips any package with a pending changeset, and all five have one - so on the release commit the guard skips every subject it has. This is the control `release-policy.md:92-95` names as what makes the `pull_request`-only Changesets Check safe",
    }
  - {
      state: merged,
      at: 2026-09-21,
      note: "the boundary is the registry's answer now. `check-publish-drift.mjs` reads each publishable package's `dist-tags[<tag>]` from `npm_config_registry`, and asks two questions instead of one: source that moved after the last bump with no pending changeset to publish it, and a version the registry never received with work stacked on top of it. Measured before: `vp run guard:publish-drift` exit 0, `No publish drift`. After: exit 1, naming all five, boundary `dc0e90cf` (2026-08-29) for each - solid-spectrum 0.7.0 vs 0.6.4, solid-stately 0.5.2 vs 0.5.1, solidaria 0.5.0 vs 0.4.3, solidaria-components 0.6.0 vs 0.5.1, ui 0.7.0 vs 0.6.3, all under `latest`. Simulated the publish (fake registry serving the local versions): exit 0, then `git checkout -- .` and a clean `git status --short`. Contract tests `scripts/check-publish-drift.test.ts` run the real script against a loopback `node:http` registry, as `scripts/test-ci-guard-contracts.mjs` does: 11 passed after, and on the pre-fix script 4 failed | 7 passed - the drifted fixtures it used to accept, by name. `vp run test:ci-guard-contracts` exit 0, `vp lint` exit 0, `vp check scripts/` exit 0, `vp exec tsc --noEmit -p tsconfig.typecheck.json` exit 0. No changeset: nothing under `packages/*/src` or a published manifest changed. Three decisions the ticket left open. Scope 2 says remove the `:87` skip; it is narrowed, not removed - a pending changeset is still a true answer to the first question, because the next bump carries the source it names, and it is now no answer at all to the second, since a changeset queued on top of an unpublished bump is the evidence that the bump was abandoned. A bump with nothing stacked on it passes on purpose: that is the state of the commit the release job publishes from, and failing it would make the publish this guard protects impossible. `.changeset/pre.json` supplies the tag while prerelease mode is on and its consumed ids are subtracted from pending, so the #544 RC does not read as five permanent failures with `latest` parked on the stable. An unreadable registry exits 1 with no env bypass, like the shallow-clone refusal above it: `changeset publish` needs the same registry a step later. Disagreement, recorded per the brief: Done-when asks for a `release.yml` comment that describes a git-only diff, which Scope 1 makes false - the step now reads the registry. The comment describes a git diff plus one read, says it writes nothing and simulates nothing, and says why it sits immediately before the publish. Scope wins over Done-when. The registry read itself lives in `release-candidates.mjs`, shared with `check-release-prerequisites.mjs`, whose local copy is deleted: two guards asking npm the same question is where a second copy of the URL and the error shape would drift. While running the files around it, `scripts/release-candidates.test.ts` proved red at `5fcf3d35` with and without this change, 2 failed | 5 passed, on two cases asserting the `satisfied`/`evidence` shape #599 abolished; left alone and ticketed as #607 rather than re-blessed here. Still `merged`, not `verified`: this seat does not push, so no run id backs any of these numbers",
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
