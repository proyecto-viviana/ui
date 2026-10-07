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
  - {
      state: in-progress,
      at: 2026-09-05,
      note: "Postcard still 0f1e1198 (2026-08-21, 2170/0/4). HEAD 030c200b, 211 ahead of origin/main. Did not recertify the suite tonight. Do not print the postcard as HEAD.",
    }
  - {
      state: in-progress,
      at: 2026-09-05,
      note: "HEAD subset 308/25/4/337, complete false. Product: #111 virtual pointer, #381 pending ActionButton name. Leftovers #480 Toast open (harness), #481 Overlay Escape (harness), #482 Calendar D5 trail. D3 still fail-closed. Postcard stays 0f1e1198.",
    }
  - {
      state: in-progress,
      at: 2026-09-20,
      note: "report-merger parse blocker fixed: 163f4377 dropped the import opener at merge-certified-reports.ts line 12, so the Certification Gates merge step died in esbuild after all eight shards passed, and vp check could not start. Restored byte-exact; the script now parses and reaches its own no-summaries guard. Found behind it: vp check reports 374 unformatted files, which CI also listed; handled as its own mechanical commit. Evidence-integrity work here stays open",
    }
  - {
      state: in-progress,
      at: 2026-09-20,
      note: "slice 1 of .agents/close-gates-2026-09-20.task.md done: a certified shard must now explain its own exit. The reporter gained onError (each load-time error with its file) and records Playwright's FullResult status; merge-certified-reports fails on any shard load error, on a non-pass status the summary does not explain, and on a summary carrying no status at all. Proved with a spec that throws at import: the merge passed it before (exit 0, all zeros) and fails it now, naming the file. Held by 10 cases in apps/comparison/src/data/certified-shard-outcomes.test.ts",
    }
  - {
      state: in-progress,
      at: 2026-09-20,
      note: "slice 2 done: a committed floor on discovered cases per certified spec file. apps/comparison/e2e/certified-case-floor.json records 73 files and 2177 cases at e327ae9d; guard:certified-case-floor discovers with playwright test --list --reporter=json (no browser, no web server, ~2s), fails on a file whose count drops or that discovers nothing, and on a listing error, and ratchets up with --write. Proved by moving actionbar.certified.spec.ts aside: --list still exits 0 reporting 2173 tests, the guard exits 1 naming the missing spec. Wired into ci:release-readiness and the comparison-build job; held by 10 cases in scripts/check-certified-case-floor.test.ts",
    }
  - {
      state: in-progress,
      at: 2026-09-20,
      note: "slice 3 done: skipped and flaky ceilings. The fixme inventory now counts every site - every knownDivergences block in a spec, not only the first, and every trigger-level knownDivergence - proved by planting a knownDivergence on datefield's spin-up announce trigger: the count stayed at 4 and the postcard validated, and after the repair counts 5 and fails. merge-certified-reports now fails above skippedCeiling (4) and flakyBudget (0), both committed in apps/comparison/e2e/certified-case-floor.json beside the case floor; a shard summary with 40 skipped and 7 flaky merged green before and exits 1 now. Held by 9 cases in apps/comparison/src/data/certified-run-budgets.test.ts, one of which pins the ceiling to the inventory count",
    }
  - {
      state: in-progress,
      at: 2026-09-21,
      note: "slice 4 done: the strict baseline only shrinks. `apps/comparison/scripts/parity-strict-baseline.ts` owns the rule. `unbaselined` moved there, and the new `staleBaselineSlugs` names each listed slug whose gap no longer occurs. `report:parity:strict` counts those as blocking and prints each one with the instruction to delete it, following the precedent of `scripts/check-peers.mjs`'s allowlist. Growth is pinned by `apps/comparison/src/data/parity-strict-baseline.test.ts`: every section must stay a subset of #85's nine as frozen on 2026-08-07, and adding a slug means editing a constant whose comment says never to. 5 cases. Planted defect, `button` added to `missingControlGroups`: the old report printed `[pass] No new catalogue gaps outside the frozen baseline` and let it through (its exit 1 is only #574's postcard). The new one fails naming `missingControlGroups: button (Button)`, and the pin test fails 1 of 5. Today all 27 entries still occur (`[pass] Every baselined gap still occurs`). The workflow comment says so. Remaining for Done-when: the certified record against HEAD, which #574 now expresses and a fresh full certified run must supply",
    }
  - {
      state: in-progress,
      at: 2026-09-21,
      note: "2026-09-21 round-2 audit, receipt `.agents/audit-2026-09-21/round-2-results.md`, finding `r2-guards/r2-guards-4`, low, partly: slice 4's only-shrinks is a fixed ceiling, not a ratchet. `staleBaselineSlugs` fires only when a listed gap is absent, and the growth pin in `apps/comparison/src/data/parity-strict-baseline.test.ts` compares against `frozenBacklog`, a literal array of nine slugs that never shrinks when the JSON does - so a gap that closes, has its entry deleted, and later regresses can be re-baselined for the same slug and section with both checks green. Contained today, which is why it is low: `apps/comparison/scripts/parity-strict-baseline.json` holds all nine slugs in all three sections, 27 of 27, so no slack exists to remove and the pin can only refuse a tenth slug, and re-adding means editing a constant whose comment forbids it. Note the auditor cites `apps/comparison/src/data/parity-strict-baseline.json`, which does not exist; the JSON is under `scripts/`. Fix: record a per-section count (or the section's committed contents) in a frozen snapshot and fail when a section exceeds it, so deleting an entry lowers the ceiling permanently. Until then the workflow comment should say the baseline is capped at #85's nine, not that it only shrinks",
    }
  - {
      state: in-progress,
      at: 2026-09-21,
      note: "the waiver record this ticket landed gained a field, so `## Landed` is corrected in place: an entry is `{ pattern, ticket, expires, ticketStatus }`, and the merged verdict reads that recorded state instead of resolving the ticket out of `.claude/tickets` on every run. #574's review found that read: the board is outside `certifiedSuiteCoveredPathspecs`, so one commit editing `status:` flipped the merger's exit code while the postcard still said current. The board read now lives in `comparison:guard:certified-waiver-tickets`, outside the certified job. Nothing else here moves - the file is still `[]` and the pin still waits on a full run",
    }
  - {
      state: in-progress,
      at: 2026-09-28,
      note: "shrink-only ceiling: parity-strict-baseline.ceiling.json snapshots each section. A baseline slug outside it fails strict parity, and a ceiling slug the baseline dropped fails until the ceiling drops too. Planted button and listbox cases plus the live 9/9/9 equality are held by parity-strict-baseline.test.ts (10). The strict report passes the ceiling and still fails because postcard 151006ff does not speak for HEAD 3186dd94: 355 covered paths changed. The full certified run that would re-pin the postcard remains open",
    }
  - {
      state: in-progress,
      at: 2026-09-28,
      note: "two local runs at 78af41c1 died before a summary. Unsharded workers=1 reached test 500/2181 and Playwright was terminated as headless Chrome aborted (signal 5, int3, same binary offset) at 01:35:20. Shard 1/8 workers=1 then exited 143 at test 85/323 on ActionMenu list D3 at 01:48:59, same Chrome abort, certified-summary.1.json missing. That second signal is the same second a visualmode shell started kill_tree on pid 3809160 and then launched its own Playwright test. earlyoom logged no kill. No assertion mismatch was printed. Postcard stays 151006ff. The ceiling commit stands. The record that speaks for HEAD is still open",
    }
  - {
      state: in-progress,
      at: 2026-10-07,
      note: "a driver test.fixme that is not the knownDivergence binding fails strict parity. The calls that pass divergence from knownDivergences, or trigger.knownDivergence, stay matched to the spec inventory; a literal or unbound call is a gap. Held by certified-run-budgets.test.ts. The postcard still does not speak for HEAD, so the full certified run stays open",
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
(`{ pattern, ticket, expires, ticketStatus }` since #574); matching failures
become "waived (ticket)" and do not fail `certified report`. A waiver whose
recorded `ticketStatus` is verified/merged/closed, or whose `expires` date has
passed, fails the job. The run reads that field, never the board — #574 moved
the board read into `comparison:guard:certified-waiver-tickets`, outside it.
The file is empty on purpose — the orchestrator seeds #240 if that pin
waiver is wanted. Local `comparison:test:certified` writes the same
`test-results/certified-summary.json` the parity report reads.
