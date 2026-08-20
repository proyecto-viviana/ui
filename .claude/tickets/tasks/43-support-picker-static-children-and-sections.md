---
id: 43
type: task
title: "Support Picker static children and sections"
created: 2026-08-20
parent: 33
status: open
history:
  - {
      state: open,
      at: 2026-08-20,
      note: "migrated from legacy task picker-static-children-and-sections",
    }
---

Bring `Picker` collection input into parity with React Spectrum.

## Current gap

`items` is required in `solidaria-components/src/Select.tsx`, so static
`PickerItem` children do not work. The collection is also flat: `PickerSection`
is exported, but `Picker` does not read it. `Menu` already supports static JSX
children through a synthetic item descriptor and provides a pattern to study.

## Done when

`items` is optional, static `PickerItem` children work, and the collection reads
`PickerSection`. Restore the two Picker documentation examples and remove the
temporary limitation section.

## Relationship

Replaces `picker-static-children-and-sections` from
`.claude/current/tech-debt.md`.
