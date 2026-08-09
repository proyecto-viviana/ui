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
  - {
      state: done,
      at: 2026-08-08,
      note: "draft PR #21 opened for hosted exact-SHA qualification; its first two heads exposed a depth-limited Changesets fetch and a built-artifact guard without its producer, both now held by ordering contracts",
    }
  - {
      state: done,
      at: 2026-08-08,
      note: "hosted head 98670653651fc4bd11d6e2338a05212bef019f1a passed all four intended contexts; strict main protection now requires those exact contexts",
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
The same contract suite now asserts that Changesets Check preserves complete
release history: `fetch-depth: 0` must remain, and no later depth-limited fetch
may silently turn the checkout shallow before `guard:publish-drift` runs.
It also requires Certification Gates to build the published package artifacts
before `guard:jsx-deopt-size` measures `dist/*.jsx`, so a dirty local checkout
cannot supply evidence that a clean runner never produced.

The separate owner-steered branch-policy task (`tech-debt.md` →
`ci-gates-required`) is also closed: after the exact hosted head passed,
`main` protection was enabled and read back with strict required checks for
`certification-gates`, `changesets-check`, `release-readiness`, and `site-gate`,
administrator enforcement on, and force pushes/deletions off.
