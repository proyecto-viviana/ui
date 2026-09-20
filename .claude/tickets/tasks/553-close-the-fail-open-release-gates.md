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
  - {
      state: open,
      at: 2026-09-20,
      note: "slice 6 done: npm is pinned exactly in release.yml, 11.19.1 (npm view npm@11 version, 2026-09-20). Every uses: in the workflow set is pinned to a commit SHA because a tag is mutable; npm install -g npm@^11.5.1 was the one exception, letting the registry choose which npm ran in the job that holds contents: write, pull-requests: write and the publish token — fourteen minors past the reviewed version. New guard:workflow-pins (scripts/check-workflow-pins.mjs) holds both rules and ran red on the range before the pin, green after; wired into ci:release-readiness. 7 cases in scripts/check-workflow-pins.test.ts",
    }
  - {
      state: open,
      at: 2026-09-20,
      note: "slice 7 done: guard:entry-import-budget fails a budgeted entry that is not built. It skipped one silently and only failed when every entry was unbuilt, so a renamed exports target, a package dropped from the build, or a half-built tree read as a pass on each entry it removed. Proved on the real dist: with packages/viviana-ui/dist/Provider.js moved aside the guard printed 'entries measured: 1/2' and exit 0, and after the repair exit 1 naming @proyecto-viviana/ui ./Provider as not built. 3 cases in scripts/check-entry-import-budget.test.ts. Separately, the guard is red on main for its own reason and stays red, unfixed here: 5/5 entries over their module ceilings (ui ./Provider 25 vs 21, solid-spectrum ./Provider 25 vs 21, ./ButtonGroup 29 vs 28, ./ProgressBar 24 vs 23, ./ProgressCircle 20 vs 19) against a 12:20 build. Raising the ceilings would be papering over it; recorded under Left red",
    }
  - {
      state: open,
      at: 2026-09-20,
      note: "slice 8 done: guard:package-sourcemaps runs in ci:release-readiness immediately after build. It passed on the built tree (generated 1:13 maps to scripts/fixtures/style-macro-sourcemap.ts:3:13; JSX-preserve transform keeps its map, build rejects SOURCEMAP_BROKEN, PACK_PASS selects one pack pass per process) but was reachable from no chain, while tooling.md claimed it held the pack-pass contract. The order is now asserted in scripts/test-ci-guard-contracts.mjs alongside the generated-icon ordering: unwired it exits 1 with 'release readiness must run guard:package-sourcemaps after building packages', wired it exits 0. tooling.md says where it runs",
    }
  - {
      state: open,
      at: 2026-09-20,
      note: "slice 9 done: ci:release-readiness discovers the apps' unit tests instead of naming two directories. test:run was `vp test run packages scripts`, so every unit test an app owns sat outside the chain; it is now `vp test run` with no filter, plus the three app configs the root config cannot see (comparison SSR, comparison hydrate, web) and the journeys-driver config. test:comparison-data is gone — the root config already discovers apps/comparison/src/data/**. Held by an assertion beside the existing ordering contract in scripts/test-ci-guard-contracts.mjs: unfiltered it exits 0, filtered it exits 1 with 'test:run must discover tests from the config'. Discovery proof is `vp test list --filesOnly` = 345 files (.agents/chain-walk-2026-09-20/discovery-files.txt), exactly the per-package walk (323) + scripts (8) + apps/comparison (14); scripts 8/51, apps/comparison 14/99, SSR 1/8, hydrate 4/175, drivers 1/5 all green here. The single whole-suite run is unverified locally and says so in the log: --maxWorkers=2 died twice with 'Worker exited unexpectedly' and --maxWorkers=1 outran a 30-minute cap, a fourth runs detached. That disagreement between the whole-suite run and the per-file runs is ticketed as #556, with the two pre-existing regression.test.tsx snapshot failures under Left red",
    }
  - {
      state: open,
      at: 2026-09-20,
      note: "slice 10 done: the four tests that assert nothing now assert what their titles promise. createFormValidation's invalid-event case dispatches the cancelable invalid event a browser fires (fireEvent.invalid is not cancelable) and asserts defaultPrevented plus the committed displayValidation ['Required']; its change case asserts not-displaying before, displaying after; createFocusRing's autoFocus case asserts the memo's isFocused() gate (autoFocus alone shows no ring) and the ring on focus; Toast's global-queue case subscribes and asserts close() marks the toast exiting and keeps it while remove() drops it, which is what hasExitAnimation buys. Red first with the four behaviours planted out of the three sources: 8 failed | 59 passed (67), all four named; sources restored, 67 passed (67). Two were order-dependent and the fix stayed in the test: createFocusRing inherited the module-global interaction modality an earlier case left, so its beforeEach now sets keyboard (the resample matches upstream useFocusRing.ts:44,60 and is not our divergence), and the Toast case asserts on its own key because earlier cases leave nine toasts in the shared globalToastQueue — same family as #556. Tests only, no changeset; vp check and vp lint clean",
    }
  - {
      state: open,
      at: 2026-09-20,
      note: "slice 11 done (added by the conductor in .agents/CONDUCTOR-PENDING-2026-09-20b.md): a gate never reuses a server. Both apps/** Playwright configs had reuseExistingServer: !process.env.CI and none of the 33 scripts that run playwright test set CI, so every browser gate on a developer machine could grade a preview server left on the port by an older build. The switch is VIVIANA_GATE=1, not CI=1, because these configs also hang .env.local loading, two retries and the blob reporter off CI — a local gate under CI=1 would lose this machine's Chromium arguments and retry twice; CI stays in the expression for the hosted run. Proved on a throwaway fixture with a stale server on 4399 serving ok while the config's own server would have served broken: without the switch 1 passed, exit 0 against a server it did not start; with it, exit 1, 'http://127.0.0.1:4399/ is already used'. New guard:gate-server-reuse was red on the tree as found with 35 problems (both configs, all 33 scripts) and green after, 7 cases in scripts/check-gate-server-reuse.test.ts, wired into ci:release-readiness beside guard:workflow-pins and asserted in scripts/test-ci-guard-contracts.mjs (unwired exit 1, wired exit 0). tooling.md records the switch",
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
12. A gate never reuses a server: every `apps/**` Playwright config and
    every script that runs Playwright refuse a server the run did not
    start (added 2026-09-20, `.agents/CONDUCTOR-PENDING-2026-09-20b.md`).

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
