---
id: 349
type: task
title: "Omit NumberField aria-required when validation is native"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 numberfield functional pass: ?isRequired=true both set native required=true; React aria-required omitted, Solid aria-required=true. TextArea on this catalogue already omits aria-required under native. Distinct from ComboBox #273 (native required missing)",
    }
---

NumberField default validation is native. `isRequired` should set
the input's native `required` and omit `aria-required`, matching S2
`useNumberField` (`if (validationBehavior === 'native')
inputProps['aria-required'] = undefined`).

Solid `createNumberField` always sets both
`"aria-required": p.isRequired` and `required: p.isRequired`. Native
constraint validation still runs. Extra `aria-required` can
double-announce required. `createTextField` already branches; the
TextArea comparison route omits `aria-required` under native.

The comparison NumberField demo does not route
`validationBehavior`; default is native.

## Evidence

`http://127.0.0.1:4341/components/numberfield/?isRequired=true`

| | React | Solid |
|---|---|---|
| `input.required` | true | true |
| `aria-required` | omitted | `"true"` |

AX snapshot still `textbox "Quantity"` on both (Playwright does not
surface `[required]`). ComboBox #273 is the inverse: Solid never
sets native `required`.

## Done when

Default / native NumberField on the comparison route matches S2:
native `required`, no `aria-required`. A walk fails if Solid emits
`aria-required` under native.

## Relationship

Child of #24. Found by #260. Same native-vs-aria split as #273
(ComboBox), different export and different missing half (`required`
is already set). Wiring is
`packages/solidaria/src/numberfield/createNumberField.ts`. Do not
start #254.
