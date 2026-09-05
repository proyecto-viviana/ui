---
id: 464
type: task
title: "Return SearchField validationErrors and validationDetails"
created: 2026-09-04
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-09-04,
      note: "filed after the comparison D14 run. SearchFieldAria extends TextFieldAria so the type names validationErrors and validationDetails, but createSearchField's return only exposes isInvalid. Comparison cannot rebuild. D14 ran against an old bundle.",
    }
  - {
      state: in-progress,
      at: 2026-09-04,
      note: "Git v2 implement. Return displayValidation fields from createSearchField like RAC useSearchField spreading useTextField's ValidationResult. FieldErrorContext reads them.",
    }
  - {
      state: merged,
      at: 2026-09-04,
      note: "createSearchField returns validationErrors and validationDetails; SearchField FieldErrorContext reads them. Also dropped the leftover HiddenSelect validationState prop that broke solidaria tsc after #462. vp run --filter @proyecto-viviana/comparison build passed. Package tests: SearchField 78 passed.",
    }
---

RAC `useSearchField` spreads `useTextField`'s `ValidationResult`
(`isInvalid`, `validationErrors`, `validationDetails`). Solid
`SearchFieldAria` extends `TextFieldAria` so the names exist, but
`createSearchField` never returns the last two. The comparison app
cannot typecheck. FieldErrorContext still forges details from the
`isInvalid` prop.

## Done when

`createSearchField` returns `validationErrors` and `validationDetails`
from the inner `createTextField`. Headless SearchField FieldError reads
those, not a forged `customError`. `vp run --filter
@proyecto-viviana/comparison build` typechecks. A package test fails if
the return drops the fields.

## Relationship

Child of #24. Distinct from #351 / #383 (TextField displayValidation).
The comparison D14 pair run is blocked on this compile.
