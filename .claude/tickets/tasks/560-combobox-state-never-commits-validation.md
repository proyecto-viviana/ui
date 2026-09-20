---
id: 560
type: task
title: "createComboBoxState has no validation state, so blur never commits validation"
created: 2026-09-20
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-20,
      note: 'found while clearing the 73 unused bindings for #555 item 8.3. `packages/solid-stately/src/combobox/createComboBoxState.ts:556` held `let valueOnFocus = ""`, written on focus and never read. Upstream reads it: `react-stately/src/combobox/useComboBoxState.ts:578-593` keeps `valueOnFocus = useRef([inputValue, displayValue])` and, on blur, calls `validation.commitValidation()` when either moved while focused. Our hook has no validation object at all - `rg commitValidation packages/solid-stately/src` names createSelectState, createRadioGroupState, createCheckboxGroupState, createNumberFieldState and createDateFieldState, never combobox. The unused local was the visible end of a missing feature, so the cleanup commit removed the dead write and cites this ticket; the wiring is owed here',
    }
---

## Scope

Give `createComboBoxState` the validation state upstream gives it, and commit
validation on blur.

1. Build the validation state the way `createSelectState` does
   (`createFormValidationState`), with the same props surface.
2. Restore `valueOnFocus` as upstream holds it - the pair
   `[inputValue, displayValue]` - and commit validation on blur when either
   moved. Upstream: `useComboBoxState.ts:578-593`.
3. Check the rest of upstream's validation surface is exposed too
   (`displayValidation`, `realtimeValidation`, `updateValidation`,
   `resetValidation`), not only the blur commit.

## Done when

A ComboBox with a failing constraint reports it after blur, and the hook's
validation surface matches upstream's.

## Proof

A red-then-green test per behaviour, run in solid-stately and in the styled
package that consumes it.

## Relationship

Child of #544. Found by #555 item 8.3.
