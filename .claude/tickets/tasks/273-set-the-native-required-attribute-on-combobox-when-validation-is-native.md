---
id: 273
type: task
title: "Set the native required attribute on ComboBox when validation is native"
created: 2026-09-03
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 combobox functional pass: default validationBehavior=native, React input.required=true with no aria-required; Solid required=false aria-required=true. Both match under validationBehavior=aria",
    }
  - {
      state: merged,
      at: 2026-09-03,
      note: "createComboBox matches createTextField: native required by default, aria-required only in aria mode.",
    }
---

RAC ComboBox default `validationBehavior` is `native` (Form context, then
`'native'`). `isRequired` then sets the input's native `required`
attribute and omits `aria-required` (journeys FB021 / FRM010). `aria` mode
flips that (FRM011). Solid ComboBox always emits `aria-required` and never
`required`, so browser constraint validation does not run.

`createTextField` already branches on `validationBehavior`. `createComboBox`
does not: it hard-codes `"aria-required": p.isRequired`. Headless ComboBox
has no `validationBehavior` prop. The comparison fixture default is
`validationBehavior: "native"` (`apps/comparison/src/data/combobox-demo.ts`).

## Evidence

`http://127.0.0.1:4341/components/combobox/?isRequired=true`

- React: `input.required === true`, `aria-required === null`.
- Solid: `input.required === false`, `aria-required === "true"`.

`?isRequired=true&validationBehavior=aria`: both `required === false`,
`aria-required === "true"`. The aria path already matches.

`packages/solidaria/src/combobox/createComboBox.ts` inputProps sets
`aria-required` only. Contrast
`packages/solidaria/src/textfield/createTextField.ts`:
`required: validationBehavior === "native" && p.isRequired`.

## Done when

Default / `validationBehavior=native` ComboBox on the comparison route
matches React: native `required`, no `aria-required`. `aria` mode stays on
`aria-required`. A test fails if native required is missing.

## Relationship

Child of #24. Found by #260. Same native-vs-aria split as TextField; ComboBox
never grew that branch.
