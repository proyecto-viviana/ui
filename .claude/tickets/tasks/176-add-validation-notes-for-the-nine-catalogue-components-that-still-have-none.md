---
id: 176
type: task
title: "Add validation notes for the nine catalogue components that still have none"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
---

## Cause

ActionGroup, Autocomplete, GridList, LabeledValue, ListBox, ListBox DnD,
StepList, Toolbar, and Virtualizer have no
`playbook/components/*-validation-notes.md`. #85 tracks modeled viewer
controls for the same nine, not the gate-outcome table.

## Work

Add notes with the ten gates. Keyboard-heavy entries must cite D5 and D6 or
be partial.

## Done when

Each of the nine has a note. None is `accepted` without applicable D5/D6.

## Relationship

F-A11Y-001. Delta on #85.
