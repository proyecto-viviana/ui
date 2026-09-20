---
id: 550
type: task
title: "Present the comparison site as public evidence"
created: 2026-09-20
parent: 26
status: open
history:
  - {
      state: open,
      at: 2026-09-20,
      note: "opened under #26 by owner direction (#544). Follows #543, which restores the app's Solid 2 development path. Write paths: apps/comparison pages and chrome, never component styling (ADR 0001)",
    }
---

## Scope

The comparison app is the proof behind every parity claim, and today it reads
as an internal harness.

1. An index a visitor can read: what is compared, against which pinned
   upstream versions, and how a case passes.
2. Per-component pages keep the live side-by-side viewer and gain the
   component's certified result and its named debt.
3. Results come from the merged certified summary, never from typed numbers.
4. The app verifies behavior. It does not patch styling.

## Done when

A visitor can go from a README claim to the component's live comparison and
its last certified result in two clicks. `vp run comparison:build` passes and
the certified suite is no worse than before the change.

## Proof

`vp run comparison:build`, the certified summary before and after, and a
browser pass over the index and three component pages.

## Relationship

Child of #26. After #543. Depends on #194's report merger for its data. Where
it is hosted is an owner decision not yet made; this ticket does not deploy.
