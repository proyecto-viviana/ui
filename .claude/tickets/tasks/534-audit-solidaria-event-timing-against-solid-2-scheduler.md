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

## Done when

All press, hover, and focus interaction tests pass cleanly in `packages/solidaria`
under the Solid 2.0 scheduler.

## Relationship

Child of #531. Sibling of #532 and #533.
