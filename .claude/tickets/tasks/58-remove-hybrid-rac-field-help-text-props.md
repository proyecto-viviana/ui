---
id: 58
type: task
title: "Remove hybrid RAC field help-text props"
created: 2026-08-20
parent: 31
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from legacy task rac-field-prop-divergence" }
---

Remove `description` and `errorMessage` props from the seven hybrid RAC field
components: TextField, SearchField, NumberField, DateField, TimeField,
ComboBox, and DatePicker.

React Aria Components uses `TextContext` slots at this layer. The props belong
only to the `solid-spectrum` layer. Use the per-hook slot-ID and reactive
binding pattern. This breaking change is owner-authorized.

## Relationship

Replaces `rac-field-prop-divergence` from `.claude/current/tech-debt.md`.
Depends on #56.
