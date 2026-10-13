---
id: 656
type: task
title: "List static children in a ComboBox"
created: 2026-10-12
parent: 33
status: open
history:
  - {
      state: open,
      at: 2026-10-12,
      note: "Checked after #652: a ComboBox with static ComboBoxItem children opens, but its list does not hold the items.",
    }
---

## Cause

Not the #652 defect: the ComboBox opens. A `@proyecto-viviana/ui` ComboBox
given two static `ComboBoxItem` children and no `items` reports
`aria-expanded="true"` after a press on its button, and again after typing a
letter, but the document then holds one element with `role="option"`, not
two. `packages/solidaria-components/src/ComboBox.tsx` has no static-collection
registration of the kind #43 gave Select, so static children never reach the
collection. Which element the single option is was not established.

VisualMode does not use a ComboBox with static children today.

## Scope

Decide whether ComboBox supports static `ComboBoxItem` and `ComboBoxSection`
children as S2 does, and if so register them the way Select does, in the
headless ComboBox, with both styled ComboBoxes consuming it. No new public
name, no dependency.

## Done when

A ComboBox with static items lists them when opened by its button and filters
them when typed into, in both skins, and a choice reports once.

## Proof

Owning tests in `packages/solidaria-components/test/ComboBox.test.tsx` and both
styled ComboBox test files, failing before the repair. Patch Changesets for
the repaired packages.

## Relationship

Child of #33. Follows #43 and #652.
