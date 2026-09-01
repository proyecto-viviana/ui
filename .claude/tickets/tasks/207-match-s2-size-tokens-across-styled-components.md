---
id: 207
type: task
title: "Match S2 size tokens across styled components"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
---

## Cause

S2 size is `'S' | 'M' | 'L' | 'XL'`. Styled ComboBox, DatePicker, Switch,
Badge, Checkbox, Slider, TagGroup, DateField, SearchField, TextField and
others add `"sm" | "md" | "lg"` to the public union
(`packages/solid-spectrum/src/switch/ToggleSwitch.tsx:47-48`,
`combobox/index.tsx:103`, `calendar/DatePicker.tsx:71-80`); non-S2 components
invent the lowercase ladder only (`SelectSize`, `ListBoxSize`, …). DatePicker's
JSDoc says `@default 'md'`, and its popover Calendar and TimeField are
hardcoded `size="md"` regardless of picker size
(`DatePicker.tsx:808-816`), so an XL picker opens a medium calendar. Button
already matches upstream, so this is not a Solid constraint. The generated
Switch reference prints both alphabets as one enum.

## Work

Remove the lowercase aliases from public unions (or, if the owner keeps a
compatibility alias, label it and keep it off the generated table), fix the
nested Calendar/TimeField size plumbing, and add a type test that fails if a
lowercase token appears on an S2 component's size union.

## Done when

Every S2-catalogue component's size type equals upstream; the nested
DatePicker calendar follows the picker size; the api-reference tables show
one alphabet.

## Relationship

F-UP-009, F-API-003. Delta on #33. Rule #2.
