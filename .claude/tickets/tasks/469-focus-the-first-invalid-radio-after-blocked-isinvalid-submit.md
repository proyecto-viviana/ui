---
id: 469
type: task
title: "Focus the first invalid radio after blocked isInvalid submit"
created: 2026-09-05
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-09-05,
      note: "Last D14 red after #376/#466. Full D14 37 pass / 1 fail (NumberField min/max/step pairs already green at 09343f9f). Radio invalid · submit attempt: both stacks block (submits 0, invalids 3) and native validity matches; React focuses selected radio starter; Solid focuses last radio enterprise. RadioImpl/RadioField/RadioButton onInvalid and setInputRef listeners focus event.currentTarget on every radio, so the last invalid wins. RAC useRadio → useFormValidation focuses only getFirstInvalidInput.",
    }
  - {
      state: in-progress,
      at: 2026-09-05,
      note: "Git v2 implement. Drop RadioImpl/RadioField/RadioButton invalid handlers that focused currentTarget. Drop group onInvalidCapture focus and preventDefault so createFormValidation can focus getFirstInvalidInput.",
    }
  - {
      state: merged,
      at: 2026-09-05,
      note: "Package tests: isInvalid and required-empty requestSubmit focus starter, not enterprise. RadioGroup.test.tsx 80 passed. Same costume as #378; comparison walk still that ticket's Done-when.",
    }
---

`createRadio` already calls `createFormValidation` (#376). After a blocked
`isInvalid` submit, RAC `useFormValidation` focuses the first invalid
`form.elements` entry (`starter` on the D14 route — first and selected).
Solid still focuses the last radio (`enterprise`).

The leftover is not `createFormValidation`. `RadioImpl`, `RadioFieldImpl`,
and `RadioButtonImpl` each add an `invalid` handler that focuses
`event.currentTarget` and `preventDefault`. Every radio is invalid, so the
last handler wins. That costume also explains #378 (`valueMissing` empty
required group).

## Done when

An `isInvalid` RadioGroup that blocks `requestSubmit` focuses the first
radio (`starter` on this route), not the last (`enterprise`). A package
test fails if Solid focuses the last radio.

## Proof

```bash
vp test run packages/solidaria-components/test/RadioGroup.test.tsx
# 80 passed
# isInvalid and required-empty requestSubmit focus starter, not enterprise
```

## Relationship

Child of #24. Remainder of #376 after native custom validity landed.
Same `invalid`-handler costume as #378 (required-empty `valueMissing`).
Do not edit `apps/comparison/**`. Do not re-run full D14 Playwright.
