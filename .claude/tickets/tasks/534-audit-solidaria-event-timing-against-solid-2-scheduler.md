---
id: 534
type: task
title: "Audit solidaria event timing against Solid 2 scheduler"
created: 2026-09-13
parent: 531
status: open
history:
  - {
      state: open,
      at: 2026-09-13,
      note: "opened under #531 to review eventPathContains and modality guards against Solid 2 batched scheduling",
    }
  - {
      state: open,
      at: 2026-09-19,
      note: "coordination from #536 focus lifecycle review: createAutoFocus removes queued requests on cancel/disposal, but processAutoFocusQueue schedules an untracked positive-delay winner after clearing the queue. Cancellation after that handoff needs an owning failing regression and bounded repair under this scheduler audit; #536 registration parity neither fixes nor claims coverage of that branch",
    }
---

## Cause

In Solid 1.x, native synchronous event bubbling interacts with immediate signal
updates, requiring adapters like `eventPathContains` in `createPress` and
modality guards around `target.click()` in `createMenuItem`. Solid 2.0 introduces
a refined scheduler and batching model.

## Work

1. Audit `createPress`, `createHover`, and `createFocusRing` in `packages/solidaria`
   under the Solid 2.0 scheduler.
2. Verify whether `eventPathContains` and synthetic click modality guards can be
   simplified or whether browser event dispatch semantics require keeping them.
3. Test drag-selection, pointer replacement during pointerdown, and keyboard
   activation sequences.
4. Prove and repair cancellation of an already-dequeued delayed autofocus
   request. Keep the target connected and use `force: true` with a focused
   sentinel so a missing focus callback cannot pass through the should-focus
   guard. Include a successful delayed positive control; verify cancel and
   owner disposal after queue processing suppress both focus and callbacks.
   Retain priority, skip and queue cleanup contracts. This is source-observed
   debt awaiting its own regression, not a reported failing test result.

## Done when

All press, hover, and focus interaction tests pass cleanly in `packages/solidaria`
under the Solid 2.0 scheduler.

## Relationship

Child of #531. Sibling of #532 and #533.
