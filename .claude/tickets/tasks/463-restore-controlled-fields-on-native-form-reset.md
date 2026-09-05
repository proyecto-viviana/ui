---
id: 463
type: task
title: "Restore controlled fields on native form reset"
created: 2026-09-04
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-04,
      note: "filed from the 2026-09-04 overnight adversarial audit. createFormReset exists. DateField, Radio (#376), ComboBox (#461), and NumberField (#460) call it. Still missing on createTextField and Toggle. Upstream useTextField.ts:224 and useToggle call useFormReset. Controlled Solid TextField and Toggle will not restore on native form reset.",
    }
---

`createFormReset` lives at `packages/solidaria/src/form/createFormReset.ts`.
DateField has always called it. #376 added it to `createRadio`. #461 added
it to `createComboBox`. #460 added it to `createNumberField`. Upstream also
calls `useFormReset` from `useTextField` and toggle/checkbox paths.

Controlled TextField and Toggle will not restore on a native
`<form reset>` until those hooks call `createFormReset`.

## Done when

A native reset restores the default value on controlled TextField and
Toggle the way RAC does. A package test fails if the controlled value
stays after reset.

## Relationship

Child of #24. Remainder after #376 / #460 / #461. Do not duplicate
DateField / Radio / ComboBox / NumberField work.
