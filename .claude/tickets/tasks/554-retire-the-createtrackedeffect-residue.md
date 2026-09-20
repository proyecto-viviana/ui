---
id: 554
type: task
title: "Retire the createTrackedEffect residue of the Solid 2 codemod"
created: 2026-09-20
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-20,
      note: "audit lens 1 (.agents/audit-2026-09-20/lens1-codemod.md) counted 185 calls in 101 files under packages/*/src. Informational, not reproduced by the conductor as a defect; post-RC, not a release blocker",
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
