---
id: 661
type: task
title: "Publish static collection items outside owned disposal"
created: 2026-10-26
parent: 443
status: merged
history:
  - { state: open, at: 2026-10-26 }
  - { state: in-progress, at: 2026-10-26 }
  - {
      state: merged,
      at: 2026-10-26,
      note: "Owner-free publication and regression passed locally; three rc.5 candidates prepared for conductor integration and main CI.",
    }
---

## Cause

VisualMode consumes solidaria-components 0.7.0-rc.4. Opening and closing a
Timeline keyframe menu logs `REACTIVE_WRITE_IN_OWNED_SCOPE` from a
DefaultCatchBoundary during disposal, and the menu item detaches mid-click.
`createStaticCollectionState` calls `setItems` from `syncItems`; item cleanup
can reach that write while a keyed parent computation reruns. VisualMode's
published-file patch wraps this write in `runWithOwner(null, ...)`.

## Scope

One writer in ui's treeview-controlled checkout on `collection-owned-write`,
under the owner's 2026-10-26 exception. Change Collection source and its tests,
one patch changeset for solidaria-components, and release version files.
This ticket and generated board views record the work requested by the owner.
Keep release tag-step fix `f0fa4825`. Add no dependency. Push nothing, publish
nothing, and create no remote tag.

## Done when

A regression first fails on item cleanup inside a keyed computation, then
passes with synchronous item removal, survivor retention, and re-registration.
Publication runs outside the owner without changing collection behavior.
The rc version stage prepares the affected packages and dependency closure
for release.yml after the conductor lands and pushes main.

## Proof

Run the failing and passing focused test, `vp run check`, all
solidaria-components tests, changeset and release-prerequisite guards, and
the pack-chain script under `flock ~/.cache/visualmode-lock/heavy.lock`.
Record exact results and versions. Local checks do not supply the three
successful exact-SHA main workflows required before release.yml publishes.

## Relationship

Child of #443. Producer for VisualMode's Timeline menu repair; the consumer
keeps its rc.4 patch until the release publishes. The VisualMode conductor
alone integrates and pushes. The prepared candidate retains pre mode `rc`.

## Local evidence, 2026-10-26

- Before the source fix, the Collection suite failed 1/16 tests with
  `REACTIVE_WRITE_IN_OWNED_SCOPE`. The cause stack points to `syncItems`,
  `unregisterItem`, and registration cleanup during `For` disposal.
- After the fix, the same suite passed 16/16. The regression also retains
  the surviving descriptor, re-registers the removed item, and clears the list.
- Use the consumer patch's `runWithOwner(null, ...)` at the shared publication
  point. This Solid-specific registration helper keeps the synchronous Map
  snapshot and ordering; it only removes the ambient owner for the signal write.
  There is no need to restructure the upstream React collection abstraction
  or permit owned writes on the signal everywhere.
- Pre-version changeset-required (using the actual working diff), changeset
  status, live release prerequisites, and publish-drift version preflight passed.
  The first status attempt did not see the untracked changeset; staging it
  made the same guard pass.
- Changesets prepared solidaria-components `0.7.0-rc.5`, solid-spectrum
  `0.8.0-rc.5`, and ui `0.8.0-rc.5`, with dependency changelogs for the two
  dependents. solid-stately stays `0.6.0-rc.3`; solidaria stays `0.6.0-rc.4`;
  Kumo and Geist stay `0.0.0`. The single patch changeset moves into
  `.changeset/pre/` under Changesets 3; pre.json remains in pre mode with rc.
- `vp run check` passed format, lint (three existing warnings), and typecheck
  after formatting the new test. The initial attempt caught only that test's
  formatting. `vp test run packages/solidaria-components/test` passed 83 files,
  2,937 tests, in 120.40 seconds.
- `vp run changeset:version` updated the three manifests and changelogs.
  Its lockfile refresh initially could not open pnpm's cache database in the
  sandbox; the same lockfile-only install passed with cache access and produced
  no lockfile diff. There are no dependency additions or range changes.
- Live `guard:release-prerequisites` passed before and after versioning.
  Post-version `check-changeset-status.mjs` reports changed packages with no
  pending changesets: the one changeset has already been consumed. Pre-version
  both changeset guards passed; the policy deliberately runs Changesets Check
  on pull requests only and publish-drift on versioned main candidates.
- `vp run pack:local-chain` built all seven packages, then npm pack failed
  on the sandbox's default npm cache access. With the same fresh builds,
  `NPM_CONFIG_CACHE=/tmp/collection-owned-write-npm-cache vp run
  pack:local-chain:skip-build` passed. All seven tarballs were produced.
  Inspection confirmed the fix in source and both built Collection exports,
  and ui/Spectrum depend on components rc.5 with the unchanged lower versions.
- `guard:package-artifacts` passed: 3,000 manifest targets across seven public
  packages; 1,005 mapped attribution references cover 554 source files.
  `docs:check` and `git diff --check` passed. All requested heavy checks and
  retries ran under `flock ~/.cache/visualmode-lock/heavy.lock`.
- Final changed-file format/lint and regenerated board checks passed;
  the formatted Collection suite passed 16/16 again. The plain publish-drift
  guard passed on the versioned candidate.
- The required ecosystem audit failed five of 38 gates: doc-shape,
  eligibility declarations, missing checkout paths, Start lists, and link
  inspection. Its failures are outside this ticket's write grant.
- Local proof does not claim the complete CI release-readiness, Site Gate,
  or certification ladder. Those three workflows must pass on the exact final
  main SHA before release.yml publishes. No push, publish, or remote tag was
  performed here; the conductor owns integration and the consumer patch removal.
