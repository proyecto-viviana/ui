---
id: 7
type: task
title: "Bind release to a fully certified revision"
created: 2026-08-08
status: done
history:
  - { state: open, at: 2026-08-08, note: "opened from the main CI incident review" }
  - {
      state: done,
      at: 2026-08-08,
      note: "release now starts after certification and requires all release gates on the exact SHA",
    }
---

The Release workflow ran independently on every push to `main`. On 2026-08-08,
SHA `c3367a3` produced a failed Certification Gates run while Release succeeded;
the same split occurred on earlier revisions. A green release job therefore did
not mean the candidate was certified.

## Scope

- Start automated release work only after Certification Gates succeeds on
  `main`.
- Require successful Certification Gates, Release Readiness, and Site Gate runs
  for the exact release SHA before Changesets can create a version PR or publish.
- Fail closed on absent, pending past timeout, cancelled, or failed evidence.
- Keep manual dispatch available, but hold it to the same exact-SHA evidence.

## Resolution

`.github/workflows/release.yml` now uses `workflow_run` from successful main
Certification Gates rather than an independent push trigger. Before install or
publish simulation, `scripts/check-release-evidence.mjs` queries all three
required workflow files for the exact candidate SHA and waits for complete green
results. Any non-success blocks publication. `test:ci-guard-contracts` holds
failed, absent, and complete same-SHA API responses as discriminating fixtures.

Branch protection remains a separate owner-steered decision in
`tech-debt.md` (`ci-gates-required`): enforcing required checks before `main`
moves would replace or bypass the repository's current direct-to-main workflow.
