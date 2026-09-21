# 598 — the publish-drift boundary is the registry's answer

Date: 2026-09-21. Seat: the `ui` main checkout, branch `main`, base `5fcf3d35`.

## 1. What the ticket found, re-measured before anything moved

`guard:publish-drift` took its boundary from the last commit touching
`packages/<dir>/CHANGELOG.md`. CHANGELOG.md is written by `changeset version`,
which is the *bump* — the publish is a separate step that can be skipped,
cancelled or fail. So the guard started its diff after an unpublished bump and
called the rest clean.

Measured at HEAD, before the change:

- `vp run guard:publish-drift` — EXIT=0, `No publish drift`.
- That boundary, for all five packages, was `a2e5220c` (2026-09-12), a
  `changeset version` whose publish never ran.
- The registry at the same moment: `latest` is solid-stately 0.5.1,
  solidaria 0.4.3, solidaria-components 0.5.1, solid-spectrum 0.6.4, ui 0.6.3.
  The tree carries 0.5.2, 0.5.0, 0.6.0, 0.7.0, 0.7.0 — every one a minor ahead
  of what npm serves.
- All five had a pending changeset, and the skip at `:87` excused any package
  with one, so on the release commit the guard skipped every subject it had.

The real publish boundary is `dc0e90cf` (2026-08-29, "merge published
0.6.3/0.6.4 line back into main"), found by walking each manifest's own history
for the commit that set the version npm serves.

## 2. What changed

**`scripts/check-publish-drift.mjs`** — the boundary is now
`dist-tags[<tag>]` read from the registry, and the guard asks two questions
instead of one.

1. *Source with nothing to publish it.* `src` and `package.json` moved after
   the last bump and no pending changeset names the package. Unchanged in
   substance; this is what the guard already did.
2. *A bump the registry never received, with work stacked on top of it.* The
   published version is compared to the manifest's; when they differ and there
   is either a pending changeset or a post-bump source change, the guard fails
   and diffs from `commitThatSetVersion(dir, published)` — the tree npm's
   tarball was built from.

A pending changeset answers (1) and not (2): the next bump carries the source
it names, but a changeset queued on top of an unpublished bump is the evidence
that the bump was abandoned, not an excuse for it. That is the narrowing of the
`:87` skip.

Three edges the ticket did not name:

- **A bump with nothing stacked passes**, deliberately. That is exactly the
  state of the Version-Packages commit the release job publishes from; failing
  it would make the publish this guard protects impossible.
- **Prerelease mode.** `.changeset/pre.json` supplies the tag while `mode` is
  `pre`, and the ids in its `changesets` array are subtracted from pending —
  a prerelease bump consumes changesets but leaves the files on disk until
  `pre exit`, and `latest` deliberately stays on the last stable. Without this
  the #544 RC would read as five permanent failures.
- **An unreadable registry exits 1**, with no env bypass, like the shallow-clone
  refusal above it. `changeset publish` needs the same registry a step later, so
  an unreachable one is a failed release either way; saying so here names it
  while it is still cheap. A 404 is not unreadable — it means no release yet,
  and prints a line.

Versions are compared for inequality, never ordered: no semver dependency, and
a rollback reads as drift the same way a skipped publish does.

**`scripts/release-candidates.mjs`** — the live registry read moved here
(`registry`, `packument`, a per-process cache) together with
`pendingChangesets`, `pendingChangesetPackages` and `preRelease`.
**`scripts/check-release-prerequisites.mjs`** lost its own copy of the URL, the
env variable and the error shape and imports them. Two guards asking npm the
same question is precisely where a second copy drifts.

**`.github/workflows/release.yml`** — the comment above the publish-drift step
justified its placement with a publish simulation the script has never done. It
now says what the step is (a git diff plus one registry read, writing nothing),
what the two failures are, and why it sits immediately before the publish: the
registry is half of the comparison, and an answer taken on a pull request hours
ago describes a registry state that has since moved.

**`.claude/current/release-policy.md`** — the paragraph that called
`guard:publish-drift` the control holding the push path now says what that
control measures.

## 3. Proof, every exit code run in this session

- `vp run guard:publish-drift`, real registry, pre-fix — EXIT=0,
  `No publish drift`. Post-fix — EXIT=1, naming all five, each with published
  tree `dc0e90cf` and the changed-file counts (`solid-spectrum` 637,
  `solid-stately` 57, `solidaria` 512, `solidaria-components` 110, `ui` 636).
- The simulated publish — a loopback registry serving the tree's own versions
  as `latest` — EXIT=0, `No publish drift`. Then `git checkout -- .` on the
  files touched and a clean `git status --short` bar `.agents/drafts-548/`,
  which is another session's untracked work.
- `vp test run scripts/check-publish-drift.test.ts --maxWorkers=2` — EXIT=0,
  **11 passed**. The tests spawn the real script against a loopback `node:http`
  registry, the way `scripts/test-ci-guard-contracts.mjs` does. Seven are new:
  a bump the registry never received with a changeset stacked on it fails; the
  same tree passes once the registry serves the bumped version; a changeset does
  not excuse the bump it sits on; a bump with nothing stacked passes; the
  prerelease tag is read and consumed changesets ignored; no release under the
  tag says so and passes; an unreadable registry refuses.
- The same file against the pre-fix script — **4 failed | 7 passed**, the four
  drifted fixtures it used to accept, by name.
- `vp run test:ci-guard-contracts` — EXIT=0, unchanged, which is what proves the
  extraction out of `check-release-prerequisites.mjs` safe.
- `vp lint` — EXIT=0. `vp check scripts/` — EXIT=0.
  `vp exec tsc --noEmit -p tsconfig.typecheck.json` — EXIT=0.
- `vp exec tsx scripts/check-changeset-required.mjs` — EXIT=0, `No releasable
  package changes detected`. Nothing under `packages/*/src` or a published
  manifest changed.

The fake registry is driven through an async `spawn`, not `execFileSync`:
`spawnSync` blocks this process's event loop, so an in-process server never
answers and the guard's read hangs to its own timeout. That lesson is #599's,
re-used here.

## 4. Disagreement recorded

The ticket's Done-when asks for a `release.yml` comment that "describes a
git-only diff". Scope 1 makes that false in the same breath — it requires the
boundary to come from the published version, which is a registry read. The
comment describes a git diff **plus one read of the registry**, and says
explicitly that the step writes nothing and simulates no publish, which is the
falsehood the finding was actually about. Scope wins over Done-when.

## 5. Found, not fixed

`scripts/release-candidates.test.ts` is red at `5fcf3d35`, with and without this
change: `2 failed | 5 passed`, the same two cases with the same output either
way. Both assert the `satisfied`/`evidence` shape #599 abolished by name.
Rewriting an assertion to match the behaviour that broke it is the re-bless move
this board refuses elsewhere, so it is ticketed as **#607** and left alone.

## 6. Owed

No push from this seat, so no CI run id backs any of these numbers — `merged`,
not `verified`. And `guard:publish-drift` now needs registry network access
wherever it runs; in `release.yml` that is already true a step later, but the
guard is no longer runnable offline.
