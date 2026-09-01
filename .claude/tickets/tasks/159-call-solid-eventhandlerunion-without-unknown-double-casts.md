---
id: 159
type: task
title: "Call Solid EventHandlerUnion without unknown double casts"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
---

## Cause

`createRadioGroup` / `createRadio` already type props as Solid JSX
attributes. RadioGroup still double-casts to a single-function handler
because `EventHandlerUnion` includes the bound-tuple form. ComboBox extracted
`callInputKeyDown`; ContextualHelpTrigger extracted `callHandler`. RadioGroup
alone has 26 inline casts.

## Work

Share one typed EventHandlerUnion caller at the RAC layer.

## Done when

RadioGroup, Checkbox, DateField, DatePicker, and TimeField do not
`as unknown as` those handlers.

## Relationship

F-TS-010.
