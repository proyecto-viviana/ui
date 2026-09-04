---
id: 194
type: task
title: "Ratchet certified skipped counts and the strict baseline and pin the certified record to HEAD"
created: 2026-09-01
parent: 136
status: in-progress
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
  - {
      state: in-progress,
      at: 2026-09-02,
      note: "sharded certified CI job on HEAD, waiver file, certified-summary reporter; pending orchestrator verification",
    }
---

## Cause

`lastFullCertifiedSuiteRun` is revision `0f1e1198…` (2026-08-21; 2170
passed / 4 skipped / 2174 total). HEAD is 86 commits later and today's run
is 2120 passed / 4 skipped after the twelve archive specs were deleted.
`validateCertifiedSuiteEvidence` checks arithmetic and `skipped ===
expectedFixmes.length`; it never requires `revision === HEAD` and never
reads a Playwright report (`apps/comparison/src/data/certified-suite-evidence.ts:13-46`).
`extractKnownDivergenceKeys` reads the first `knownDivergences: { … }` block
per file; driver-level `test.fixme(true, reason)` in `events.ts:102-106`,
`ax.ts:131-135`, `motion.ts:143-145` is invisible, so skipped can grow with
no inventory change. `parity-strict-baseline.json` lists nine slugs and
`unbaselined()` drops any gap on that list; a tenth slug hides a new hole
with no shrink-only guard (`report-component-parity.ts:532-581, 703-727`).
Certification Gates still comments "2170 passed, 6 skipped".

## Work

Make the certified record carry the HEAD SHA it was produced at and fail
`--strict` when it is stale; make the skipped inventory count every
`test.fixme` site; make the strict baseline shrink-only. Update the
workflow comment from the validator, not by hand.

## Done when

Adding a `knownDivergence` key, a driver `fixme`, or a baseline slug without
a matching inventory change fails `report:parity --strict`; a certified
record older than HEAD fails it too.

## Relationship

F-HARNESS-001/004. Deltas on #161 (dead validator) and #85 (the nine
baseline slugs). Do not "fix" the six-name list in `acceptance-schema.test.ts`
here; that is #161.

## Landed

2026-09-02. Certification Gates no longer treats the serial pair/contract
steps as the recertification bar. A sharded `certified` job runs
`comparison:test:certified` on every `main` push and PR (blob reporter,
`playwright merge-reports`, one HTML artifact, component × driver summary).
The recorded suite is therefore the revision CI just ran, not a hand-copied
SHA. Tracked waivers live in `apps/comparison/e2e/certified-waivers.json`
(`{ pattern, ticket, expires }`); matching failures become "waived (ticket)"
and do not fail `certified report`. A waiver whose ticket is
verified/merged/closed, or whose `expires` date has passed, fails the job.
The file is empty on purpose — the orchestrator seeds #240 if that pin
waiver is wanted. Local `comparison:test:certified` writes the same
`test-results/certified-summary.json` the parity report reads.
