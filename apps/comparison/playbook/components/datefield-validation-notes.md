# DateField Validation Notes

Updated: 2026-05-21

## Gate Matrix

| Gate                            | Status  | Evidence                                                                                                                                                                         | Notes                                                                                                                                                                                                                                                                                                                             |
| ------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Upstream React Source Parity    | passing | React Spectrum S2 `DateField` docs/source and React Aria `DateField` API checked for `contextualHelp`, `isDateUnavailable`, `shouldForceLeadingZeros`, and `validationBehavior`. | Solid mirrors the S2 FieldLabel, contextual-help slot, FieldGroup, segmented DateInput, DateSegment paint, invalid icon, help text, size names, Provider locale route shape, `form`, `validationBehavior`, required/invalid state, constraints, and unavailable-date state.                                                       |
| Official Docs And Viewer Parity | passing | `apps/comparison/src/data/component-controls.ts` and `apps/comparison/src/data/datefield-demo.ts`.                                                                               | Side-panel controls cover label, contextual help, size, label position/alignment, necessity indicator, controlled value, leading zeros, granularity, hourCycle, hideTimeZone, locale, name, form owner, validation behavior, help/error text, min/max, unavailable dates, disabled/read-only, required, and invalid states.       |
| Route Harness                   | passing | `apps/comparison/src/components/react/fixtures/styled.jsx`, `apps/comparison/src/components/solid/fixtures/styled.tsx`, `apps/comparison/e2e/datefield-visual.spec.ts`.          | Both stacks mount live DateField islands with serialized props, controlled values, Provider locale, validation behavior routing, contextual help, forced leading zeros, associated-form hidden input evidence, native-vs-aria validation semantics, and strict deterministic closed-field pair-diff evidence.                     |
| Acceptance Gates                | passing | `apps/comparison/e2e/datefield-visual.spec.ts`, `packages/solid-stately/test/createDateFieldState.test.ts`, package DateField tests.                                             | Browser tests assert segmented semantics, form owner/name serialization, associated `FormData`, date-time route controls, native hidden required input semantics, aria invalid/error display, unavailable-date invalidation, contextual help, leading-zero formatting, locale text parity, and strict closed-field visual parity. |
| Evidence And Handoff            | updated | `apps/comparison/src/data/comparison-manifest.ts`, `apps/comparison/src/data/visual-state-matrix.ts`, this file.                                                                 | DateField now has live parity coverage for the checklist gates above. Screen-reader transcript evidence remains tracked separately from DOM-level ARIA, browser, and unit coverage.                                                                                                                                               |

## Covered States

- Default segmented DateField: visible label, three editable date spinbuttons, help text, S2 field shell, and strict React/Solid closed-field pair diff.
- Date-time control state: `value`, `granularity`, `hourCycle`, `hideTimeZone`, `name`, `form`, `validationBehavior`, hidden form value, and associated `FormData`.
- Label and help state: `labelPosition`, `labelAlign`, `necessityIndicator`, and `contextualHelp`.
- Formatting state: `shouldForceLeadingZeros` with segment-text parity.
- Validation state: required, explicit invalid, native hidden validation, aria validation, min/max range, unavailable dates, error text, disabled, and read-only.
- Locale state: Provider `locale` route, including Unicode calendar extension text parity.

## React Reference Caveat

React Aria and S2 expose built-in aria validation for `minValue`, `maxValue`, and `isDateUnavailable`. In the comparison browser bundle, the React island did not surface the unavailable-date aria error until `isInvalid` was provided explicitly, although the installed S2 source and isolated SSR probe did surface it. The React fixture now mirrors React Stately's built-in invalid calculation for the route and marks this with `data-comparison-react-builtin-invalid="true"` when it normalizes the React visual reference. Solid does not use that normalization; its invalid state comes from `createDateFieldState`.

## Commands

- `vp test run packages/solidaria-components/test/DateField.test.tsx packages/solid-spectrum/test/DateField.test.tsx packages/solid-stately/test/createDateFieldState.test.ts`
- `vp run --filter @proyecto-viviana/comparison test:datefield`
- `vp run --filter @proyecto-viviana/comparison typecheck`

## Remaining Gaps

- Screen-reader transcript evidence remains open beyond DOM-level ARIA linkage and browser behavior assertions.
