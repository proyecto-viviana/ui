---
id: 173
type: task
title: "Stop restating matte field chrome after control spreads"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
---

## Cause

`control({ register: "matte" })` is the shared well chrome. Later keys in the
same `style()` object replace entire `borderStyle` / `borderColor` /
`backgroundColor` maps. Picker became a borderless slab next to ComboBox
because ComboBox restates the register values and Picker did not. Seventeen
matte call sites now restate by hand.

## Work

Make `style()` spreads merge-safe for register chrome, or forbid later keys
that wipe the map.

## Done when

Picker and ComboBox matte wells share one helper and do not copy-paste maps.

## Relationship

F-QUALITY-002. Intra-package structure, not #1 identity.
