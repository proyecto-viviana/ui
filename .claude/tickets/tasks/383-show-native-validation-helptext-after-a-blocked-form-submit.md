---
id: 383
type: task
title: "Show native validation HelpText after a blocked Form submit"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 form functional pass: isolated remount ?isRequired=true&value= click Submit (no checkValidity beforehand) blocks both with valueMissing and focuses the input; React then paints error HelpText Please fill out this field., aria-invalid, data-invalid, red group border rgb(183,40,24), AX [invalid]; Solid keeps the description slot, aria-invalid omitted, gray-900 focused border. createTextField never calls createFormValidation, so the native invalid event never commits displayValidation",
    }
---

S2 native Form validation, after a blocked required-empty submit,
commits the native `validationMessage` into the field's error
HelpText, sets `aria-invalid` / `data-invalid`, and paints the
negative group border. Solid already blocks the submit
(`valueMissing`, focus moves to the input) and then leaves the
description slot and the resting (or focus) border.

RAC `useTextField` calls `useFormValidation`, which listens for the
native `invalid` event, prevents the browser balloon, and commits
`displayValidation`. Solid `createTextField` never calls
`createFormValidation`
(`packages/solidaria/src/form/createFormValidation.ts`), so that
commit never happens. The comparison Form fixture is the first
place this route wraps TextField in a real `<form>` and clicks its
submit button.

Required-empty *rest* (no submit) already matches: both `required`,
description visible, no error, AX equal, BODY focus.

## Evidence

`http://127.0.0.1:4341/components/form/?isRequired=true&value=`,
islands mounted. Isolated remount, no `checkValidity()` before the
click.

Before click: both BODY, `required=true`, description
`Inherited from the parent form.`, `error=null`,
`aria-invalid` omitted, group border `rgb(218, 218, 218)`.

After click Submit:

| | React | Solid |
|---|---|---|
| `submitCount` | 0 | 0 |
| focus | input | input |
| `aria-invalid` | `"true"` | omitted |
| group `data-invalid` | `"true"` | omitted |
| HelpText | error `Please fill out this field.` | description stays |
| group border | `rgb(183, 40, 24)` | `rgb(19, 19, 19)` + 2px focus ring |
| AX | `textbox "Project name" [invalid]` + error text | `textbox "Project name"` + description |

Live `{isRequired:true, value:""}` then click is the same split.

`createFormValidation` already exists and is used by DateField /
HiddenSelect. TextField never grew that branch.

## Done when

A blocked native required-empty Form submit paints Solid error
HelpText, `aria-invalid`, `data-invalid`, and the negative group
border like S2, including AX `[invalid]`. Rest before submit stays
matched. A comparison-route walk fails if Solid keeps the
description slot after that blocked submit.

## Relationship

Child of #24. Found by #260. Likely the same missing
`createFormValidation` call as #351, but the user-visible hole is
different: #351 is `isInvalid` → `setCustomValidity` so submit
*proceeds*; this path already *blocks* via `valueMissing` and omits
the native error UI. Not #345 (live `isInvalid` HelpText slot on a
prop change). Do not start #254.
