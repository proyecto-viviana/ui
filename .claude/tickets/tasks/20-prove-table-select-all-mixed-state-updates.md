---
id: 20
type: task
title: "Prove Table Select All mixed-state updates"
created: 2026-08-20
parent: 24
status: verified
history:
  - {
      state: open,
      at: 2026-08-20,
      note: "opened from the latest-work review of the Table mixed-state regression",
    }
  - {
      state: in-progress,
      at: 2026-08-21,
      note: "selected after ticket #18; tracing real controlled and uncontrolled selection transitions through the headless and styled Table layers",
    }
  - {
      state: verified,
      at: 2026-08-21,
      note: "proved controlled and uncontrolled Select All transitions in Chromium and corrected the shared grid state that misclassified explicit full sets and could not deselect from the all sentinel",
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

- [x] Replace the tautological assignment with a real selection-state transition.
- [x] Prove none to mixed, mixed to all, all to mixed, and mixed to none as
      applicable to the pinned upstream behavior.
- [x] Assert `checked`, `indeterminate`, the component data attribute, and the
      accessibility-tree checked state.
- [x] Add browser evidence for the Chromium failure mode.
- [x] Make the regression fail if the component render effect is removed.
- [x] Compare controlled and uncontrolled selection when they take different code
      paths.

Do not accept an initial-render assertion as evidence for the reactive update.

## Checkpoint

The headless and styled Table tests now change real row selection. They cover
none, mixed, and all states in both controlled and uncontrolled modes. Each
state checks `checked`, the native `indeterminate` property, and the component
data attribute.

The Chromium comparison drives the same transitions through React Spectrum and
Solid Spectrum. It compares the native properties and the accessibility-tree
checked state after each change. The test depends on the component render
effect because Chromium clears `indeterminate` when the reactive `checked`
property is written.

The transition test also found two lower-layer state faults. `createGridState`
could not deselect one row from the `"all"` sentinel. It also treated a
controlled set that contained every selectable row as mixed. Shared grid state
now materializes selectable row keys when one row is removed and exposes the
upstream `isEmpty` and `isSelectAll` concepts. Table, GridList, the ARIA
select-all hook, and the S2 Table wrapper read those shared results instead of
calculating them again.

Verification on 2026-08-21:

- `vp test packages/solid-stately/test/createGridState.test.ts packages/solid-stately/test/createTableState.test.ts packages/solid-stately/test/createTreeGridState.test.ts packages/solidaria/test/createTableRow.test.tsx packages/solidaria/test/createGridList.test.tsx packages/solidaria-components/test/Table.test.tsx packages/solid-spectrum/test/Table.test.tsx` — 270 passed and 4 skipped.
- `vp run typecheck` — passed.
- `vp run comparison:build` — built all 100 comparison pages. The existing
  source-map warning remains tracked by ticket #22.
- `vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/tableview-visual.spec.ts --grep "Select All exposes reactive mixed state" --reporter=line` — 2 passed in Chromium.

## Done when

A named regression changes real Table selection state and proves that Select
All remains exposed as mixed after the framework writes `checked`.

## Relationship

Extends the latest Table mixed-state fix. Its evidence contributes to ticket
#11.
