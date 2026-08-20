---
id: 20
type: task
title: "Prove Table Select All mixed-state updates"
created: 2026-08-20
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-08-20,
      note: "opened from the latest-work review of the Table mixed-state regression",
    }
---

The latest Table fix re-applies the native `indeterminate` property after a
reactive `checked` write. The new regression test does not cause that write. It
assigns `selectAll.checked` to its current value in the test body, so it cannot
fail when the component effect is removed.

## Evidence

- `TableSelectAllCheckbox` uses a render effect to set `indeterminate` after
  reactive input properties are applied.
- The component test starts with one row selected and proves only the initial
  mixed state.
- The test then runs `selectAll.checked = selectAll.checked`. This is a direct
  DOM assignment. It does not change Solid state or run the component effect.
- The styled Table test also proves only the initial mixed state.
- No reviewed browser test changes row selection and then checks the native and
  accessibility mixed states.

## Scope

- Replace the tautological assignment with a real selection-state transition.
- Prove none to mixed, mixed to all, all to mixed, and mixed to none as
  applicable to the pinned upstream behavior.
- Assert `checked`, `indeterminate`, the component data attribute, and the
  accessibility-tree checked state.
- Add browser evidence for the Chromium failure mode.
- Make the regression fail if the component render effect is removed.
- Compare controlled and uncontrolled selection when they take different code
  paths.

Do not accept an initial-render assertion as evidence for the reactive update.

## Done when

A named regression changes real Table selection state and proves that Select
All remains exposed as mixed after the framework writes `checked`.

## Relationship

Extends the latest Table mixed-state fix. Its evidence contributes to ticket
#11.
