---
id: 656
type: task
title: "List static children in a ComboBox"
created: 2026-10-12
parent: 33
status: merged
history:
  - {
      state: open,
      at: 2026-10-12,
      note: "Checked after #652: a ComboBox with static ComboBoxItem children opens, but its list does not hold the items.",
    }
  - {
      state: merged,
      at: 2026-10-13,
      note: "The headless ComboBox registers static children as Select does and filters them; both styled ComboBoxes pass them through. Not yet looked at in a browser.",
    }
---

## Cause

Not the #652 defect: the ComboBox opens. A `@proyecto-viviana/ui` ComboBox
given two static `ComboBoxItem` children and no `items` reports
`aria-expanded="true"` after a press on its button, and again after typing a
letter, but the document then holds one element with `role="option"`, not
two. `packages/solidaria-components/src/ComboBox.tsx` has no static-collection
registration of the kind #43 gave Select, so static children never reach the
collection. The single option is the empty state: the styled ComboBoxes pass
`allowsEmptyCollection`, so the empty list opens and shows its "No results"
row, which carries `role="option"`.

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

## Repair and proof — 2026-10-13

S2 supports static `ComboBoxItem` and `ComboBoxSection` children, and filters
them: with children and no `items`, `useComboBoxState` filters the collection
by the default filter and drops a section left with no item
(`useComboBoxState.ts:297-302` and `filterNodes`, `:652-672`). S2's `Divider`
renders nothing when no node precedes it or a separator follows it
(`s2/src/ComboBox.tsx:853-861`), so a dropped section's divider goes too. The
repair mirrors both.

Headless, `packages/solidaria-components/src/ComboBox.tsx`:

- The ComboBox registers static children the way Select does
  (`createStaticCollectionState`). With neither `items` nor `defaultItems`, the
  registered descriptors stand in for `defaultItems`, so the default filter
  applies to them.
- `ComboBoxListBox` keeps a registration copy of static children mounted while
  it is mounted, and renders a second copy while open. In the open copy an item
  the filter dropped renders nothing.
- `ListBoxSection`, among static children of a filtering host, leaves the list
  when none of its items is displayed. The host says which items are displayed
  through a context internal to the package.

Styled, both `src/combobox/index.tsx`:

- The ComboBox dropped static children: it handed the list only a render
  function. It now hands static children through, registers them beside the
  Popover so a selection has its text while the list is closed, and keeps the
  copy inside the Popover from withdrawing them, as #652 did for Picker.
- `ComboBoxItem` registers in a registration copy. `ComboBoxSection` drops its
  divider with the section.

Tests, each failing before the repair:

- `packages/solidaria-components/test/ComboBox.test.tsx`, "static children",
  four cases: every option listed and a click reported once; typing filters and
  ArrowDown then Enter selects; a default selection shows its text while
  closed; sections are listed and one with no match is dropped.
- `packages/viviana-ui/test/ComboBox.test.tsx` and
  `packages/solid-spectrum/test/ComboBox.test.tsx`, two cases each: items
  listed, chosen by click and by keyboard after filtering, each reported once;
  a default selection shown while closed with no section heading in the page,
  then sections listed and filtered.

```bash
vp test run packages/solidaria-components/test/ComboBox.test.tsx packages/viviana-ui/test/ComboBox.test.tsx packages/solid-spectrum/test/ComboBox.test.tsx
```

The proof is jsdom. The styled list sits under a Virtualizer, and static
children under it were not looked at in a browser, for the ComboBox or for the
Picker of #652.

Patch Changeset `.changeset/combobox-static-children.md`.
