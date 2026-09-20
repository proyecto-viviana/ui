---
id: 553
type: task
title: "Close the fail-open release gates the audit found"
created: 2026-09-20
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-20,
      note: "audit lens 2 (.agents/audit-2026-09-20/lens2-gates.md) found the gate chain cannot tell a good tree from a bad one: a certified spec that fails to load is green, a deleted spec is green, and guard:release-prerequisites inspects no shipping package. Conductor reproduced every row in .agents/audit-2026-09-20/VERIFIED.md",
    }
  - {
      state: open,
      at: 2026-09-20,
      note: "slice 0 done: guard:dependency-security is now scripts/check-dependency-security.mjs — a ratcheting peers allowlist (scripts/check-peers.mjs + expected-unmet-peers.json, 17 TanStack entries, unit test on both failure paths) plus both audits, each run whatever the one before returned. The first run the audits had had since the Solid 2 port found a moderate prod advisory, devalue <5.9.1 via astro (GHSA-9rgm-9g3h-6x36); fixed with a pnpm-workspace override to ^5.9.1, in the same block as the ws/undici/svgo security overrides. Guard exit 0",
    }
  - {
      state: open,
      at: 2026-09-20,
      note: "slice 4 done: guard:release-prerequisites enumerates its subjects from the tree. It read a hand-written list that named one ignored package and none of the five shipping ones, so it printed PASS while inspecting nothing releasable. Candidate derivation and the pending-changeset scan are now one helper, scripts/release-candidates.mjs, shared with check-publish-drift.mjs (they were two copies that disagreed). A candidate with no entry fails; proved by removing @proyecto-viviana/ui from the list. Recorded re-runnable evidence for all five: npm view <pkg> name version dist-tags --json, and npm view <pkg>@<version> dist.attestations --json showing SLSA provenance on every published tarball. Held by 7 cases in scripts/release-candidates.test.ts; test-ci-guard-contracts.mjs exit 0",
    }
  - {
      state: open,
      at: 2026-09-20,
      note: "slice 5 done: guard:publish-drift diffs each package's manifest as well as its src. A package's contract is its package.json — a new exports subpath, a widened peer range, a changed main ships to consumers exactly the way source does, and the guard was blind to all of it. Proved on a throwaway git fixture: a commit adding an exports subpath to packages/a/package.json printed 'No publish drift' and exit 0 before, and after the repair fails with packages/a/package.json named, exit 0 again once a changeset names the package. Held by 4 cases in scripts/check-publish-drift.test.ts. release-policy.md now records why Changesets Check stays pull_request-only: this guard holds the push path",
    }
---

## Scope

Turn each fail-open gate into a fail-closed one, in the order
`.agents/close-gates-2026-09-20.task.md` gives:

1. `guard:dependency-security` tells the truth about unmet peers and runs both
   audits whatever the peers result.
2. Certified shard load errors and non-pass run statuses must be explained by
   the merged summary.
3. A committed floor on discovered cases per certified spec file.
4. Skipped and flaky ceilings in the merge.
5. `guard:release-prerequisites` enumerates publish candidates from the tree,
   sharing one extracted helper with `check-publish-drift.mjs`.
6. `guard:publish-drift` diffs the package manifest, not only `src`.
7. npm pinned exactly in `release.yml`.
8. `guard:entry-import-budget` fails on an unbuilt budgeted entry.
9. `guard:package-sourcemaps` wired after `build`, or its claim corrected.
10. `ci:release-readiness` discovers the apps' unit tests.
11. The four tests that assert nothing get the assertion their title promises.

Every slice is red first: plant the defect, show the gate passing on it,
repair, show it failing, and keep the planted case as a test.

## Done when

Every slice is committed, or named under `## Left red` in
`.agents/close-gates-2026-09-20.log.md` with the command output that proves it.

## Proof

Per slice, the gate's passing run on the planted defect and its failing run
after the repair, in the log, with the commit hash.

## Relationship

Child of #544. Source `.agents/audit-2026-09-20/lens2-gates.md`. Slices 1–3
close the certified-suite half of #194.
