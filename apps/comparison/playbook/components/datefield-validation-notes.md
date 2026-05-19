# DateField Validation Notes

Updated: 2026-05-19

## Gate Matrix

| Gate                            | Status  | Evidence                                                                                                                                                                | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Upstream React Source Parity    | partial | MCP docs checked for `DateField` S2 and React Aria APIs.                                                                                                                | Solid now mirrors the S2 FieldLabel, FieldGroup, DateInput segment container, DateSegment paint, invalid icon, help text, size names, Provider locale route shape, `form`, and `validationBehavior` route props. Contextual help and transcript-level screen reader evidence remain tracked.                                                                                                                                                                             |
| Official Docs And Viewer Parity | partial | `apps/comparison/src/data/component-controls.ts` and `apps/comparison/src/data/datefield-demo.ts`.                                                                      | Side-panel controls cover label, size, label position/alignment, necessity indicator, controlled value, granularity, hourCycle, hideTimeZone, locale/calendar-system, name, form owner, validation behavior, help/error text, min/max, unavailable dates, disabled/read-only, required, and invalid states.                                                                                                                                                              |
| Route Harness                   | passing | `apps/comparison/src/components/react/fixtures/styled.jsx`, `apps/comparison/src/components/solid/fixtures/styled.tsx`, `apps/comparison/e2e/datefield-visual.spec.ts`. | Both stacks mount live DateField islands with serialized control props, controlled values, Provider locale, validation behavior routing, associated-form hidden input evidence, and strict deterministic closed-field pair-diff evidence.                                                                                                                                                                                                                                |
| Acceptance Gates                | passing | `apps/comparison/e2e/datefield-visual.spec.ts`, `packages/solid-stately/test/createDateFieldState.test.ts`, package DateField tests.                                    | Browser tests assert segmented semantics, form owner/name serialization, associated `FormData`, date-time route controls, validation states, unavailable-date invalidation, locale text parity, and strict closed-field visual parity. React S2 does not expose native `min`/`max` attributes on its named DateField inputs, so min/max attributes are asserted on the Solid hidden input while cross-stack constraint behavior is asserted through invalid/error state. |
| Evidence And Handoff            | updated | `apps/comparison/src/data/comparison-manifest.ts`, `apps/comparison/src/data/visual-state-matrix.ts`, this file.                                                        | DateField is moved from catalogue-only gap to live partial parity with explicit remaining gaps.                                                                                                                                                                                                                                                                                                                                                                          |

## Covered States

- Default segmented DateField: visible label, three editable date spinbuttons, help text, S2 field shell, and strict React/Solid closed-field pair diff.
- Date-time control state: `value`, `granularity`, `hourCycle`, `hideTimeZone`, `name`, `form`, `validationBehavior`, hidden form value, and associated `FormData`.
- Label layout state: `labelPosition`, `labelAlign`, and `necessityIndicator`.
- Validation state: required, invalid, min/max range, unavailable dates, error text, disabled/read-only.
- Locale/calendar-system state: Provider `locale` route, including Unicode calendar extension text parity.

## Commands

- `vp test run packages/solidaria-components/test/DateField.test.tsx packages/solid-spectrum/test/DateField.test.tsx packages/solid-stately/test/createDateFieldState.test.ts`
- `vp exec --filter @proyecto-viviana/comparison playwright test e2e/datefield-visual.spec.ts --reporter=line`
- `vp exec --filter @proyecto-viviana/comparison playwright test e2e/modeled-controls-contract.spec.ts --grep DateField --reporter=line`
- `vp run --filter @proyecto-viviana/comparison typecheck`
- `vp run --filter @proyecto-viviana/comparison build`

## Remaining Gaps

- Contextual help is API-listed but not route-rendered in this pass.
- Screen-reader transcript evidence remains open beyond DOM-level ARIA linkage.
