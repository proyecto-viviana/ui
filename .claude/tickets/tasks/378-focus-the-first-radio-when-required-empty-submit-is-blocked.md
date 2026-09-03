---
id: 378
type: task
title: "Focus the first radio when required empty RadioGroup submit is blocked"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 radiogroup functional pass: ?isRequired=true&selectedValue=none blocks requestSubmit on both with valueMissing Please select one of these options.; React then focuses radio:starter with data-focus-visible on starter only; Solid focuses radio:enterprise. Isolated remount of the same URL is the same focus targets. Native required on every input matches. Clean remount rest geometry is 16×16 on both (do not treat the 0×0 SNAP from a hidden panel as this ticket)",
    }
---

S2 RadioGroup with `isRequired` and no selected value fails native
constraint validation and moves focus to the first radio in the
group (`starter` on this route).

Solid blocks the same submit (`valueMissing`, message `Please
select one of these options.` on every radio) and then focuses the
last radio (`enterprise`). Assistive tech and keyboard users land
on a different option than S2.

## Evidence

`http://127.0.0.1:4341/components/radiogroup/?isRequired=true&selectedValue=none`,
islands mounted. Injected `form[data-fp-form]` + `requestSubmit`.
Other `.s2-framework-panel` `visibility:hidden` + `inert`.

| | React | Solid |
|---|---|---|
| `requestSubmit` | blocked, payload `null` | blocked, payload `null` |
| `validity.valueMissing` | true (all three) | true (all three) |
| `validationMessage` | `Please select one of these options.` | same |
| focus after blocked submit | `radio:starter`, `data-focus-visible` on starter only | `radio:enterprise` |

`?isRequired=true` with starter selected submits on both. Aria
validation (`validationBehavior=aria`) required-empty submits on
both (`required=false`, `aria-required=true` on the group).

A clean remount of this URL at rest is 16×16 circles, no
focus-visible, on both stacks. Do not treat a 0×0 circle SNAP taken
while the Solid panel was `visibility:hidden` as this ticket.

## Done when

A required empty RadioGroup that blocks submit focuses the first
radio (`starter` on this route) on both stacks, matching S2. A
comparison-route form walk fails if Solid lands on `enterprise`
while React lands on `starter`.

## Relationship

Child of #24. Found by #260. Distinct from #376 (custom validity on
`isInvalid`; this path is native `valueMissing`). Do not start
#254.
