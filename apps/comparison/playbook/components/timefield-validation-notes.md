# TimeField Validation Notes

Updated: 2026-05-19

| Gate                            | Status  | Evidence                                                                                                                                                                | Notes                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Upstream React Source Parity    | partial | MCP docs checked for `TimeField` S2 and React Aria APIs.                                                                                                                | Solid now mirrors the S2 FieldLabel, FieldGroup, TimeInput segment container, TimeSegment paint, invalid icon, help text, size names, Provider locale route shape, `form`, and `validationBehavior` route props. Contextual help and transcript-level screen reader evidence remain tracked.                                                                                                                                        |
| Official Docs And Viewer Parity | partial | `apps/comparison/src/data/component-controls.ts` and `apps/comparison/src/data/timefield-demo.ts`.                                                                      | Side-panel controls cover label, size, label position/alignment, necessity indicator, controlled value, granularity, hourCycle, hideTimeZone, locale, name, form owner, validation behavior, help/error text, min/max, disabled/read-only, required, and invalid states.                                                                                                                                                            |
| Route Harness                   | passing | `apps/comparison/src/components/react/fixtures/styled.jsx`, `apps/comparison/src/components/solid/fixtures/styled.tsx`, `apps/comparison/e2e/timefield-visual.spec.ts`. | Both stacks mount live TimeField islands with serialized control props, controlled values, Provider locale, validation behavior routing, associated-form hidden input evidence, and strict deterministic closed-field pair-diff evidence.                                                                                                                                                                                           |
| Acceptance Gates                | passing | `apps/comparison/e2e/timefield-visual.spec.ts`, `packages/solid-stately/test/createTimeFieldState.test.ts`, package TimeField tests.                                    | Browser tests assert segmented semantics, form owner/name serialization, associated `FormData`, second granularity, validation states, locale text parity, and strict closed-field visual parity. React S2 does not expose native `min`/`max` attributes on its named TimeField inputs, so min/max attributes are asserted on the Solid hidden input while cross-stack constraint behavior is asserted through invalid/error state. |
| Evidence And Handoff            | updated | `apps/comparison/src/data/comparison-manifest.ts`, `apps/comparison/src/data/visual-state-matrix.ts`, this file.                                                        | TimeField is moved from catalogue-only gap to live partial parity with explicit remaining gaps.                                                                                                                                                                                                                                                                                                                                     |

## Route States

- Default segmented TimeField: visible label, editable time spinbuttons, help text, S2 field shell, and strict React/Solid closed-field pair diff.
- Second-granularity time route: controlled value, hourCycle, form owner/name, validation behavior, hidden form input serialization, associated `FormData`, and data attribute evidence.
- Validation/range route: required state, invalid styling, error text, min/max constraints, and hidden input attributes where exposed.
- Locale route: Provider locale propagation and localized segment text parity.
- Side-panel modeled controls: full TimeField docs control surface dispatches through the shared modeled-controls contract.

## Verification

- `vp test run packages/solidaria-components/test/TimeField.test.tsx packages/solid-spectrum/test/TimeField.test.tsx packages/solid-stately/test/createTimeFieldState.test.ts`
- `vp exec --filter @proyecto-viviana/comparison playwright test e2e/timefield-visual.spec.ts --reporter=line`
- `vp exec --filter @proyecto-viviana/comparison playwright test e2e/modeled-controls-contract.spec.ts --grep TimeField --reporter=line`
- `vp run --filter @proyecto-viviana/comparison typecheck`
- `vp run --filter @proyecto-viviana/comparison build`

## Remaining Gaps

- Contextual help is API-listed but not route-rendered in this pass.
- Screen-reader transcript evidence remains open beyond DOM-level ARIA linkage.
