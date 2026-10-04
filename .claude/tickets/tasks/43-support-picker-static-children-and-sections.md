---
id: 43
type: task
title: "Support Picker static children and sections"
created: 2026-08-20
parent: 33
status: in-progress
history:
  - {
      state: open,
      at: 2026-08-20,
      note: "migrated from legacy task picker-static-children-and-sections",
    }
  - {
      state: in-progress,
      at: 2026-10-04,
      note: "f5b391e7 landed static ListBoxItem children and ListBoxSection groups in Select. select|role|group suspect fact added to upstream test parity baseline under --allow-growth 43.",
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
the retired tech-debt note.
