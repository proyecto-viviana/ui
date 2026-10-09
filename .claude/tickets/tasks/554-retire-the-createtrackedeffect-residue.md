---
id: 554
type: task
title: "Retire the createTrackedEffect residue of the Solid 2 codemod"
created: 2026-09-20
parent: 544
status: in-progress
history:
  - {
      state: open,
      at: 2026-09-20,
      note: "audit lens 1 (.agents/audit-2026-09-20/lens1-codemod.md) counted 185 calls in 101 files under packages/*/src. Informational, not reproduced by the conductor as a defect; post-RC, not a release blocker",
    }
  - {
      state: in-progress,
      at: 2026-10-07,
      note: "Converted 9 solidaria calls (checkbox indeterminate, calendar and range-calendar paging focus, color-field autofocus, useAnnouncer, radio-group form data, date-segment focused element) from createTrackedEffect to createEffect or onSettled. Before: 183 calls in 101 files. After: 174 calls in 96 files. guard:tracked-effect ratchets the rest and fails a planted call. Dialog.tsx stays frozen, so calls remain.",
    }
---

## Scope

The Solid 2 codemod left 185 `createTrackedEffect` calls in 101 files under
`packages/*/src`. The primitive is deprecated. Convert each site to
`createEffect(compute, effect)` or `onSettled`, whichever the site means, with
the test that proves the conversion kept its behaviour.

Per site, not in bulk: the two forms differ in when the effect reads, and a
blind rewrite moves reads between tracking scopes.

## Done when

No `createTrackedEffect` call remains under `packages/*/src`, each converted
site is covered by a test, and a guard fails on a new one.

## Proof

The count before and after, the guard's red run on a planted call, and the
suites of the packages touched.

## Relationship

Child of #544. Source `.agents/audit-2026-09-20/lens1-codemod.md`. Post-RC;
not a blocker for the release candidate.

## Exact-count repair admission — 2026-10-09

Registered sole source worker generation `f6c8acef-8589-4ee4-9b2f-00b424995478`,
base `5c27e35fd7a07cfa2af3a0d98695ce0a8a77ca78`; prior #579 generation closed.
Admission: only the HiddenSelect 1→absent and TagGroup 2→1 baseline repair,
this ticket, and normal generated status/roadmap consequences. Source, tests
and guards remain read-only. Conductor reviews, stops this exact generation
and integrates separately from #547; worker does not commit, push or publish.
Full retirement remains in-progress and separately owned post-RC.

## Bounded repair evidence

The read-only AST scan and pre-edit guard found exactly the admitted drift:
HiddenSelect 1→absent, TagGroup 2→1. Baseline totals change from 174 calls in
96 files to 172 calls in 95 files (−2 calls, −1 file). Version, generated date,
description and unrelated entries are unchanged. Pre-edit guard exit 1 and
seven-test suite exit 1 (6 passed, 1 live-baseline failure) are preserved in
`/tmp/ui-554-guard-before.log` and `/tmp/ui-554-tests-before.log`; final guard
exit 0 and suite 7/7 pass are recorded in their `-after` counterparts. Existing
synthetic scanner controls cover new files, growth and decreases without
planting package calls. No old-source behavior failure is claimed.

`cafce46b` (#125) replaced HiddenSelect's tracked reset listener with
`createFormReset` using the captured default and late-mounted select reference;
`130b7831` only narrowed readonly values. Existing default-reset and late-mount
assertions are in `packages/solidaria/test/createHiddenSelect.test.tsx`. The
#125 ticket records 186 passing tests, but its referenced raw /tmp log is absent
at this dispatch; that historical result is not newly qualified here.

`662d1e8e` (#54) delegates TagGroup navigation/focus to `createGridList`. The
shared grid tracked focus effect remains, as does TagGroup's live-region and
final-removal focus behavior. Existing hook/grid/component tests cover enabled
focus entry, disabled navigation, announcements, last removal, RTL, Delete and
tab order. Applicable unchanged-source receipt `/tmp/ui-54-cleanup-repaired-tests.log`
records 75/75 passes; product and test hashes were checked. Owning behavior
suites are not rerun for this JSON repair. No root compiler rerun is required;
current green compiler evidence belongs to #579, not the historical 24-error
inventory. The real parity guard remains red on 11 inherited findings, neither
changed nor waived here. No release-readiness or full-retirement claim.

Handoff: `/tmp/ui-554-worker-result-2026-10-08.md`, with manifests, raw receipts
and seal under `/tmp/ui-554-*`. Full retirement remains in-progress, post-RC.
