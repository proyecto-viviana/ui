---
id: 224
type: task
title: "Make upstream item names canonical and deprecate ListBoxOption and ComboBoxOption"
created: 2026-09-01
parent: 33
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from owner decisions on the round-2 audit" }
---

## Cause

Owner decision on #218 item 4. `solidaria-components` made `ListBoxOption` /
`ComboBoxOption` canonical with the RAC names as aliases. RAC's canonical
item is `ListBoxItem` (ComboBox uses ListBox items); S2's are `ComboBoxItem`
and `PickerItem`.

## Work

Flip canonical and alias: `ListBoxItem` (headless), `ComboBoxItem` and
`PickerItem` (styled) become the defined names; `ListBoxOption` /
`ComboBoxOption` become `@deprecated` re-exports whose JSDoc names the
removal release. Generated API reference pages move to the canonical names
and list the aliases. The styled `SelectTrigger` / `SelectListBox` /
`SelectOption` names are handled by #221 (S2 has no `Select`). Changeset
(minor: additive canonical names, deprecations).

## Done when

Every canonical name matches the pinned RAC / S2 export; each alias carries
`@deprecated` with the removal release; `guard:rac-parity` and
`guard:api-reference` are green; a test asserts alias and canonical resolve
to the same component.

## Relationship

Owner decision on #218 item 4. Feeds #33.
