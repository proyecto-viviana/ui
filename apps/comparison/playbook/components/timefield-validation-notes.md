# TimeField Validation Notes

Updated: 2026-05-21

| Gate                            | Status  | Evidence                                                                                                                                                                | Notes                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Upstream React Source Parity    | passing | MCP docs checked for `TimeField` S2 and React Aria APIs; React package source checked for contextual help, form context, and validation behavior flow.                  | Solid now mirrors the S2 FieldLabel/contextualHelp placement, FieldGroup, TimeInput segment container, TimeSegment paint, invalid icon, help text, size names, leading-zero hour formatting, Provider locale route shape, `form`, and native/aria `validationBehavior` hidden-input semantics. Transcript-level screen reader evidence remains tracked.                                                                  |
| Official Docs And Viewer Parity | passing | `apps/comparison/src/data/component-controls.ts` and `apps/comparison/src/data/timefield-demo.ts`.                                                                      | Side-panel controls cover label, contextual help, size, label position/alignment, necessity indicator, controlled value, leading-zero formatting, granularity, hourCycle, hideTimeZone, locale, name, form owner, validation behavior, help/error text, min/max, disabled/read-only, required, and invalid states.                                                                                                       |
| Route Harness                   | passing | `apps/comparison/src/components/react/fixtures/styled.jsx`, `apps/comparison/src/components/solid/fixtures/styled.tsx`, `apps/comparison/e2e/timefield-visual.spec.ts`. | Both stacks mount live TimeField islands with serialized control props, controlled values, Provider locale, validation behavior routing, associated-form hidden input evidence, and strict deterministic closed-field pair-diff evidence.                                                                                                                                                                                |
| Acceptance Gates                | passing | `apps/comparison/e2e/timefield-visual.spec.ts`, `packages/solid-stately/test/createTimeFieldState.test.ts`, package TimeField tests.                                    | Browser tests assert segmented semantics, contextual help, leading-zero hour formatting, form owner/name serialization, associated `FormData`, second granularity, native validation hidden state, aria validation/error state, locale text parity, and strict closed-field visual parity. Native and aria validation modes intentionally omit native min/max attributes, matching the React Aria hidden input contract. |
| Evidence And Handoff            | updated | `apps/comparison/src/data/comparison-manifest.ts`, `apps/comparison/src/data/visual-state-matrix.ts`, this file.                                                        | TimeField is tracked as live parity with the remaining transcript evidence caveat called out below.                                                                                                                                                                                                                                                                                                                      |

## Route States

- Default segmented TimeField: visible label, editable time spinbuttons, help text, S2 field shell, and strict React/Solid closed-field pair diff.
- Second-granularity time route: controlled value, hourCycle, form owner/name, validation behavior, hidden form input serialization, associated `FormData`, and data attribute evidence.
- Native validation/range route: required state, hidden native validation display, text-input hidden form semantics, and no native min/max attributes.
- Aria validation/range route: invalid styling, error text, min/max constraints, hidden-input aria validation semantics, and no native min/max attributes.
- Contextual-help/leading-zero route: label-adjacent contextual help button, forced `09` hour text, serialized control props, and segment text parity.
- Locale route: Provider locale propagation and localized segment text parity.
- Side-panel modeled controls: full TimeField docs control surface dispatches through the shared modeled-controls contract.

## Verification

- `vp test run packages/solidaria-components/test/TimeField.test.tsx packages/solid-spectrum/test/TimeField.test.tsx packages/solid-stately/test/createTimeFieldState.test.ts`
- `vp exec --filter @proyecto-viviana/comparison playwright test e2e/timefield-visual.spec.ts --reporter=line`
- `vp exec --filter @proyecto-viviana/comparison playwright test e2e/modeled-controls-contract.spec.ts --grep TimeField --reporter=line`
- `vp run --filter @proyecto-viviana/comparison typecheck`
- `vp run --filter @proyecto-viviana/comparison build`

## Remaining Gaps

- Screen-reader transcript evidence remains open beyond DOM-level ARIA linkage.
