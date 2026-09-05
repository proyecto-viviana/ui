---
id: 378
type: task
title: "Focus the first radio when required empty RadioGroup submit is blocked"
created: 2026-09-03
parent: 24
status: verified
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 radiogroup functional pass: ?isRequired=true&selectedValue=none blocks requestSubmit on both with valueMissing Please select one of these options.; React then focuses radio:starter with data-focus-visible on starter only; Solid focuses radio:enterprise. Isolated remount of the same URL is the same focus targets. Native required on every input matches. Clean remount rest geometry is 16×16 on both (do not treat the 0×0 SNAP from a hidden panel as this ticket)",
    }
  - {
      state: open,
      at: 2026-09-05,
      note: "Same invalid-handler costume as #469 (D14 isInvalid leftover). Package test now focuses starter after required-empty requestSubmit. Comparison-route walk in Done when is still open; do not close here.",
    }
  - {
      state: merged,
      at: 2026-09-05,
      note: "Implementation is cbf06ac7 (#469): drop per-radio invalid focus so createFormValidation focuses getFirstInvalidInput. Package tests already named required-empty requestSubmit → starter.",
    }
  - {
      state: verified,
      at: 2026-09-05,
      note: "Comparison D14 on the cbf06ac7 bundle: invalid · submit attempt and required-empty · submit attempt both stacks submits: 0, invalids: 3, active = starter. All 6 Radio D14 rows passed. Done-when met.",
    }
---

S2 RadioGroup with `isRequired` and no selected value fails native
constraint validation and moves focus to the first radio in the
group (`starter` on this route).

Solid used to block the same submit (`valueMissing`, message `Please
select one of these options.` on every radio) and then focus the
last radio (`enterprise`). The leftover was the same per-radio
`invalid` handler as #469.

## Evidence

Comparison D14 on HEAD `cbf06ac7` (comparison-lane walk; spec committed
separately):

| Row                               | Both stacks                                       |
| --------------------------------- | ------------------------------------------------- |
| `invalid · submit attempt`        | `submits: 0`, `invalids: 3`, `active` = `starter` |
| `required-empty · submit attempt` | `submits: 0`, `invalids: 3`, `active` = `starter` |

All 6 Radio D14 rows passed.

Filing snapshot (2026-09-03, before `cbf06ac7`): Solid focused
`radio:enterprise` after blocked required-empty submit on
`/components/radiogroup/?isRequired=true&selectedValue=none`.

## Done when

A required empty RadioGroup that blocks submit focuses the first
radio (`starter` on this route) on both stacks, matching S2. A
comparison-route form walk fails if Solid lands on `enterprise`
while React lands on `starter`.

## Proof

Comparison Radio D14 on `cbf06ac7`: both stacks focus `starter`
after blocked `invalid` and `required-empty` submit. Package
`RadioGroup.test.tsx` at that commit already focused `starter` on
required-empty `requestSubmit`.

## Relationship

Child of #24. Found by #260. Distinct from #376 (custom validity on
`isInvalid`; this path is native `valueMissing`). Same costume as
#469. Do not start #254.
