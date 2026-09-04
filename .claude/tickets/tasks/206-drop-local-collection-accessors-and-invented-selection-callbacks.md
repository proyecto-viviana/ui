---
id: 206
type: task
title: "Drop local collection accessors and invented selection callbacks"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
---

## Cause

RAC collection identity lives on item nodes; component props carry no
`getKey` / `getTextValue` / `getDisabled`. The port adds that trio on Menu,
ComboBox, Select, ListBox, GridList, Table, TagList, Tabs, Breadcrumbs
(`packages/solidaria-components/src/Menu.tsx:119-126`,
`ComboBox.tsx:85-174`, `Select.tsx:120-144`, `ListBox.tsx:119-127`) and at
the state layer (`createSelectState`). Select keeps `selectedKey` plus
invented `onSelectionChangeKeys`; ComboBox invents `onSelectionChangeMultiple`;
upstream exposes `value` / `onChange` through `ValueType<M>`. ComboBox render
props add `isFocused`, `isFocusVisible`, `isSelected`, `inputValue` that RAC
does not have. None is documented as a local addition. A consumer following
RAC docs cannot find these names; one following the generated tables treats
them as the contract.

## Work

Inventory each invented prop/field per component; remove or, where the owner
keeps one, label it as a local addition in the barrel and generated docs.
Do this together with #125 / #115 / #154 so the value contract changes once.

## Done when

Public collection props and render props match RAC field-for-field, or each
difference is an owner-labeled local addition.

## Relationship

F-UP-008, F-API-005. Delta on #33, #125, #115, #154, #55.
