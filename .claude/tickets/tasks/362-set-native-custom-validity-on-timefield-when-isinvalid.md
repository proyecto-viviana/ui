---
id: 362
type: task
title: "Set native custom validity on TimeField when isInvalid"
created: 2026-09-03
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 timefield functional pass: URL ?isInvalid=true&name=startTime (and the same with validationBehavior=native) leaves React hidden input customError=true, checkValidity=false, :invalid, validationMessage Invalid value., requestSubmit blocked with focus on hour; Solid stays valid and submits {startTime:09:30:00}. Required empty still blocks both via valueMissing",
    }
  - {
      state: open,
      at: 2026-09-03,
      note: "#260 datefield: same createDateField hole. URL ?isInvalid=true&name=date leaves React hidden text customError=true, checkValidity=false, validationMessage Invalid value., requestSubmit blocked with focus month; Solid stays valid and submits {date:2025-02-03}. Required empty still valueMissing-blocks both, but Solid focus stays on Submit (console: An invalid form control with name='date' is not focusable) because the invalid-event focusFirst never attaches. Cause: createDateField is called with an accessor, so if (props && typeof props === object) skips createFormValidation. DateField.tsx already threads validationInputRef. No new id.",
    }
  - {
      state: merged,
      at: 2026-09-03,
      note: "createDateField always registers createFormValidation (accessor props no longer skip). DateField and TimeField share the hook.",
    }
---

S2 TimeField default `validationBehavior` is native. RAC DateInput's
hidden `<input type="text">` gets `setCustomValidity("Invalid value.")`
when `isInvalid` is true, so a filled invalid field still fails HTML
constraint validation and blocks form submit.

Solid TimeField already calls `createFormValidation` through
`createDateField` and wires `validationInputRef` onto that hidden
input. `isRequired` empty still sets `valueMissing` and blocks submit
on both stacks. `isInvalid` never reaches `setCustomValidity`, even
when the route sets `validationBehavior=native`.

The comparison-route error row, invalid icon, red group border, and
AX `[invalid]` already match. Native validity does not.

## Evidence

`http://127.0.0.1:4341/components/timefield/?isInvalid=true&name=startTime`,
islands mounted. Other `.s2-framework-panel` `visibility:hidden`.
Injected `form[data-fp-form]` + `requestSubmit`. Value stays
`09:30:00`.

|                               | React               | Solid                             |
| ----------------------------- | ------------------- | --------------------------------- |
| `checkValidity()`             | false               | true                              |
| `:invalid`                    | true                | false                             |
| `validationMessage`           | `Invalid value.`    | `""`                              |
| `validity.customError`        | true                | false                             |
| injected form `requestSubmit` | blocked, focus hour | submits `{startTime: "09:30:00"}` |

Same table with `?validationBehavior=native` added. Empty
`?isRequired=true&value=&name=startTime` `valueMissing` blocks submit
on both (`Please fill out this field.`).

## Done when

`?isInvalid=true` matches S2: native custom validity,
`checkValidity()===false`, `:invalid`, and form submit blocked. A
comparison-route form walk fails if Solid submits an `isInvalid`
TimeField. Disabled invalid stays valid on both.

## Relationship

Child of #24. Found by #260. Wiring is
`packages/solidaria/src/datepicker/createDateField.ts`
`createFormValidation` plus the DateField / TimeField
`validationInputRef`. `createTimeField` delegates to `createDateField`.
DateField is the same hole (accessor skip). Distinct from #351
(TextField never calls `createFormValidation`) and #355 (Checkbox
`createToggle`). TimeField required-empty focus already matches;
DateField required-empty focus stays on Submit. Do not start #254.
