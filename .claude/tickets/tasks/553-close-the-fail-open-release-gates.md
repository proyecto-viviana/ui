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
