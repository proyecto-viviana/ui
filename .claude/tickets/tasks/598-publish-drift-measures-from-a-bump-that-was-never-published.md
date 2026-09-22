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
  - {
      state: merged,
      at: 2026-09-21,
      note: 'the review of the landed work found four problems; each was re-measured against the tree before anything moved, and all four were real. (1) The missing dist-tag disabled the whole check, not one package: proved live by writing `.changeset/pre.json` with `tag: rc` at HEAD, where the pre-fix guard exits 0, `No publish drift`, over five lines that each say it serves no `rc` release. The registry serves no `rc` for any of the five names - `latest` only, 0.6.4 / 0.5.1 / 0.4.3 / 0.5.1 / 0.6.3 - so `changeset pre enter rc`, which #544 is about to run, would have turned the guard off on exactly the skew this ticket exists for. The boundary now falls back `<tag>` then `latest` then the highest published semver version, because the rc line and the stable line are one package; post-fix exit 1 naming all five, each saying it has no `rc` release yet. The temporary `pre.json` was deleted both times and `git status --porcelain` checked after each. (2) Comparison was equality-only, so a tree *behind* the registry passed, and with a changeset stacked it was diagnosed as an unpublished bump with a remedy that cannot be carried out - the 0.6.2 -> 0.5.0 realign of 2026-07-23 is that state. Semver precedence is hand-rolled (`parseVersion`/`compareVersions`: release triple, prerelease below release, identifier by identifier, build metadata carries none) because `semver` is a dependency this seat may not add for a guard. Two new failure kinds, `behind` and `unorderable`. (3) The diff walked `src` and `package.json` under a doc comment claiming `files` is `["dist","src"]`; all five manifests also ship LICENSE, LICENSE-APACHE-2.0, NOTICE and a README. `git diff dc0e90cf..HEAD` over those paths returns 5 files, three of them publishable READMEs, none of which the guard could see. Diff paths come from each manifest''s own `files` now, plus `package.json` and `README.md`, falling back to the whole package directory when a manifest declares none, and `releasablePackages()` carries `files` so both guards read one answer. The live run lists `packages/solid-spectrum/README.md` and 628 changed files where it listed 627. (4) A 200 with no `dist-tags` flowed on as ''never published''; it is refused now, and only a 404 or an empty `versions` map means never published. The ''serves no release'' notes go to stderr inside a failing run and to stdout only when the run is clean. Proof: `scripts/check-publish-drift.test.ts` 11 -> 20 cases; on the pre-fix script 9 failed | 11 passed, after 20 passed. `vp run test:ci-guard-contracts` exit 0, `vp lint` exit 0, `vp check scripts/` exit 0 after `--fix`, `vp exec tsc --noEmit -p tsconfig.typecheck.json` exit 0, `node scripts/check-release-prerequisites.mjs` exit 0. Live `node scripts/check-publish-drift.mjs` exit 1 before and after - the five unpublished bumps are still there, which is the point. No changeset: only `scripts/`, `.github/workflows/` and `.claude/` changed. `release-policy.md` and the `release.yml` comment state the fallback, the refusal and both directions. Adding `files` to `releasablePackages()` broke the exact-shape assertion in `scripts/release-candidates.test.ts`; repaired there and covered by a case of its own, leaving that file on the two pre-existing #607 reds, `2 failed | 6 passed`. Still `merged`: no push from this seat, so no run id backs these numbers either',
    }
  - {
      state: merged,
      at: 2026-09-22,
      note: "the amendment-B second review of `58f33185` found one problem here and it is real: the boundary fix deadlocked the release it guards. Measured before anything moved, against a loopback registry serving what npm served on 2026-09-21 (0.5.1, 0.4.3, 0.5.1, 0.6.4, 0.6.3), `node scripts/check-publish-drift.mjs` EXIT=1 with all five packages named, each `a pending changeset is queued on top of that bump`. That step in `release.yml` runs before the changesets action, which is both stages, so the version stage - the one move that consumes the changeset and supersedes the bump - was blocked by the guard standing in front of it, and the rc could not ship by the decided route. The two stages ask different questions, so the guard now takes `--version-stage`: there it defers an unpublished bump a pending changeset covers, and nothing else - source no changeset will publish, and a tree behind the registry, still fail. `release.yml`'s step passes the flag; `changeset:publish`, which now runs this guard at all (see #599), runs it plain, where nothing is left to defer to. Same fixture registry post-fix: plain EXIT=1 as before, `--version-stage` EXIT=0 with five `deferred to the version stage` notes. The `unpublished-bump` message now names the recovery it always owed - re-run `Release` at that green sha, or `vp run release:npm` from a clean checkout of it - because queuing a fresh changeset on top does not republish an abandoned bump. Proof, run in this session: `vp test run scripts/check-publish-drift.test.ts --maxWorkers=2` pre-fix `1 failed | 22 passed (23)` EXIT=1 at `check-publish-drift.test.ts:269`, post-fix `23 passed (23)` EXIT=0, with three new cases - the version stage defers that same tree, and defers nothing else, neither a change no changeset publishes nor a tree behind the registry. `node scripts/test-ci-guard-contracts.mjs` EXIT=0, including the release.yml step asserted to carry `--version-stage` and `changeset:publish` asserted to carry the guard before `changeset publish` and without the flag. `.claude/current/release-policy.md` records the split and the recovery. Still `merged`, not `verified`: this seat does not push",
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
