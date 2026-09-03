---
id: 382
type: task
title: "Honor Form validationBehavior on descendant fields"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 form functional pass: URL ?validationBehavior=aria&isRequired=true&value= sets both forms noValidate=true; React descendant input required=false aria-required=true :invalid=false; Solid keeps required=true aria-required omitted :invalid=true. Live {validationBehavior:'aria'} also leaves Solid form noValidate=false, so empty submit is blocked and focused on the input while React submits {name:''}",
    }
---

S2 Form `validationBehavior="aria"` sets `noValidate` on the `<form>`
and switches descendant fields from native `required` to
`aria-required`. URL remount of that prop already sets Solid's form
`noValidate`, but the owner-tree TextField never sees the headless
FormContext, so it stays on native required. A live
`comparison:controls-change` after mount also leaves Solid's form
`noValidate` on the first-paint value.

Two wiring holes:

1. `packages/solidaria-components/src/Form.tsx` puts `FormContext`
   (the `validationBehavior` publisher) *inside* `<form>`. Solid
   context follows the owner tree, not the DOM, so fixture children
   created by S2 Form never read it. S2 already lifted *its* style
   `FormContext` outside `HeadlessForm` for `useFormProps`; the
   headless context was not moved. `withFormValidationBehavior` in
   `packages/solidaria-components/src/TextField.tsx` is a no-op when
   `useContext(FormContext)` is null.
2. Headless Form captures
   `const validationBehavior = local.validationBehavior ?? "native"`
   once, so live `noValidate={validationBehavior !== "native"}` never
   updates.

On URL remount, (2) is hidden because the form remounts. Submit can
still match because `noValidate` skips constraint validation even
when the input stays `required`. Live aria does not.

## Evidence

`http://127.0.0.1:4341/components/form/`, islands mounted.

URL `?isRequired=true&value=&validationBehavior=aria` remount:

| | React | Solid |
|---|---|---|
| `form.noValidate` | true | true |
| `input.required` | false | true |
| `aria-required` | `"true"` | omitted |
| `:invalid` | false | true |
| click Submit | `{name:""}` count 1, focus submit | `{name:""}` count 1, focus submit |

AX rest still equal (no required/invalid announced). Combined
`?size=XL&labelPosition=side&validationBehavior=aria&isRequired=true&isDisabled=true`
has the same required / aria-required split.

Live from a fresh default route,
`{validationBehavior:"aria", isRequired:true, value:""}`:

| | React | Solid |
|---|---|---|
| `form.noValidate` | true | false |
| `input.required` | false | true |
| `aria-required` | `"true"` | omitted |
| click Submit | submits `{name:""}` count 1, focus submit | blocked count 0, focus input |

Native required-empty (no aria) still blocks both.

## Done when

Form `validationBehavior="aria"` matches S2 on URL remount *and* live
change: `noValidate`, descendant `required` off, `aria-required` on,
empty submit proceeds. Native mode stays on native `required`. A
comparison-route walk fails if Solid keeps native required under aria
or if live aria leaves `noValidate` false.

## Relationship

Child of #24. Found by #260. Opposite direction from #273 (ComboBox
default native emits aria-required). Distinct from #351 (isInvalid
custom validity) and from #383 (native valueMissing HelpText after a
blocked submit). Do not start #254.
