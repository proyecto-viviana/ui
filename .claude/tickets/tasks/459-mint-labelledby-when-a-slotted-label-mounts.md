---
id: 459
type: task
title: "Mint labelledby when a slotted Label mounts"
created: 2026-09-04
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-09-04,
      note: "picked up from overnight dirty tree: RAC useSlot so useLabel mints labelledby; TextField/SearchField/NumberField inputs had no accessible name from a slotted Label. Previous lead left scratch probes.",
    }
  - {
      state: in-progress,
      at: 2026-09-04,
      note: "Git v2 implement. Finish NumberField LabelContext; replace scratch probes with tests that fail if the name is missing.",
    }
  - {
      state: merged,
      at: 2026-09-04,
      note: "useSlot + LabelContext on TextField/SearchField/NumberField; Form validationBehavior is a getter. Package tests fail if the slotted name is missing or a live Form validationBehavior change is ignored.",
    }
---

RAC `TextField` / `SearchField` / `NumberField` call `useSlot` so `useLabel`
only mints `labelProps` / `aria-labelledby` when a slotted `<Label>` actually
mounted (`useLabel.ts:52`). Solid's canonical

`<TextField><Label/><Input/></TextField>`

rendered an input with no accessible name. Same hole on SearchField and
NumberField. Form `validationBehavior` on a descendant TextField is only
observable once that name exists.

## Done when

A slotted `<Label>` (shared or the field's own label component) is the
input's accessible name. A live Form `validationBehavior` change flips a
descendant TextField between native `required` and `aria-required`. Tests
fail if the name is missing.

## Relationship

Child of #24. Uncommitted overnight work, not #351 / #383.
