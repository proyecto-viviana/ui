---
kind: research
status: current
---

Status: Current source of truth.
Update when: this research pack is revised, superseded, or relocated.

# Depth audit slice: forms, fields, selection controls, and indicators

## Scope and authority

This slice continues the unfinished narrow form-control pass. It covers `Form`, `TextField`, `TextArea`, `SearchField`, `NumberField`, `Checkbox`, `CheckboxGroup`, `Switch`, `RadioGroup`, `Meter`, `ProgressBar`, and `ProgressCircle`.

Authorities consulted during this pass: installed `@react-spectrum/s2@1.3.0` sources for `Form`, `TextField`, `SearchField`, `NumberField`, `Checkbox`, `CheckboxGroup`, `Switch`, `RadioGroup`, `Meter`, `ProgressBar`, and `ProgressCircle`; local `solid-spectrum` wrapper sources; local `solid-stately` form validation state; existing comparison validation notes; and the external obligations ledger in this pack. This is still a proof queue, not certification.

## Findings

### FFC-001 — Form context exists, but consumer coverage is uneven

Upstream S2 form context flows `size`, `labelPosition`, `labelAlign`, `necessityIndicator`, `isRequired`, `isDisabled`, `isReadOnly`, and validation behavior through `useFormProps`. Local Form exposes the same broad intent, and many local consumers call `useFormProps`, but not every consumer has equal source parity or strict evidence. Certification needs a matrix proving each field family inherits every applicable form context value and also proves explicit field props override form defaults.

Required proof: one React-vs-Solid route per field family for form-level `isRequired`, `isDisabled`, `isReadOnly`, `validationBehavior`, `size`, `labelPosition`, `labelAlign`, and `necessityIndicator`, plus override cases at the child field.

### FFC-002 — Hard-coded required/optional strings persist in text, search, checkbox, radio, and number fields

Local TextField, SearchField, CheckboxGroup, and RadioGroup render literal `(required)` / `(optional)` text for necessity labels. Local NumberField renders literal `(required)` and does not show the same optional text branch as the other fields. Upstream S2 routes necessity display through FieldLabel/Form plumbing and localization. These are i18n/accessibility blockers until replaced with upstream-equivalent localized strings or explicitly classified as local drift.

Required proof: non-English locale routes for every required/optional label branch, accessible-name/description assertions, and visual pair contracts for icon-vs-label necessity indicators.

### FFC-003 — Type suppression hides form-control API drift

`// @ts-nocheck` is present in local Checkbox/CheckboxGroup, RadioGroup/Radio, TextField, SearchField, and NumberField wrapper files. These are public, high-surface certified components; type suppression can hide missing upstream props, extra local aliases, context/ref mismatches, and invalid forwarding.

Required path: remove type suppression as part of certification, or record a specific owner-approved exception per file with a deadline. Until then, treat the component as not fully certified even if visual reports are green.

### FFC-004 — TextField/TextArea/SearchField/NumberField public ref parity is not proven

Upstream S2 exposes a TextField-style imperative ref contract (`focus`, `select`, and input access) for text-like fields. Local wrappers accept Solid-style refs to root elements or rely on headless internals, but the research pack does not yet prove that public ref behavior matches S2 for TextField, TextArea, SearchField, and NumberField.

Required proof: component tests for focus, select, and input/root access; comparison fixtures that verify the same focus target and selection behavior after imperative calls; and API documentation for any Solid-specific ref shape.

### FFC-005 — Validation-display semantics need branch-level tests across all fields

Local `solid-stately` has a form validation state modeled on React Stately, but the field wrappers often show error UI only when explicit `errorMessage` and invalid render state are both present. Date-field findings already showed this can diverge from upstream fallback validation messages. The same risk must be audited for TextField, SearchField, NumberField, CheckboxGroup, RadioGroup, and Form server-error context.

Required proof: tests for explicit `isInvalid`, native constraint validation, `validate` function results, server-side validation errors, `validationBehavior="aria"`, `validationBehavior="native"`, blur/commit timing, reset behavior, form submission, `aria-describedby`, and live/error announcement behavior.

### FFC-006 — NumberField stepper behavior and labels require upstream parity proof

Local NumberField implements custom stepper buttons and a local `hideStepper` branch. Upstream S2 NumberField exposes increment/decrement buttons through React Aria NumberField behavior and S2 styles. The audit must prove keyboard increment/decrement, press-and-hold/repeat behavior where upstream provides it, min/max clamping, locale number formatting/parsing, disabled/read-only stepper behavior, and accessible names for increment/decrement buttons.

Required proof: locale decimal/grouping tests, min/max/step clamping, PageUp/PageDown/Home/End or upstream-supported keyboard branches, pointer repeat timing if applicable, hidden-stepper layout contracts, and screen-reader role/name/value assertions.

### FFC-007 — Checkbox, Switch, and Radio roles need APG/WAI-ARIA state proof, not only screenshots

Checkbox and Radio wrappers are visually close but still have type suppression and hard-coded necessity labels. Switch has a split local surface that includes non-S2 helpers such as `TabSwitch`/`ToggleSwitch` alongside the S2 switch export path. Certification needs to separate S2 `Switch` from Viviana/local switch helpers and prove state semantics for checked, unchecked, mixed, disabled, readonly where applicable, invalid, required, grouped, and form-submission branches.

Required proof: accessibility-tree role/name/state snapshots for `checkbox`, `radio`, `radiogroup`, and `switch`; indeterminate checkbox tests; group disabled/required/invalid propagation; arrow-key radio movement; form reset/submission; and non-English necessity labels.

### FFC-008 — Meter and ProgressBar/ProgressCircle need computed value text and static-color proof

Local Meter/ProgressBar/ProgressCircle delegate to lower ARIA progress logic and include S2 macro styles, but certification still needs value-text and visual branches. ProgressBar converts arbitrary JSX `valueLabel` to string for `aria-valuetext`; that conversion must be checked against upstream behavior for plain strings, numbers, nested text, and non-text nodes. Static-color and forced-colors behavior also need computed contracts.

Implementation follow-up advanced: Meter now shares the ProgressBar/ProgressCircle safe-range guard for equal/invalid value ranges, and package tests assert equal `minValue`/`maxValue` no longer produces `NaN` aria value text, bar fill widths, or circle dash offsets. Headless `createMeter`/`createProgressBar` tests now isolate DOM with cleanup, and `createMeter` has equal-range value-text proof. Remaining proof: role/name/value/min/max/valueText assertions across Meter/ProgressBar/ProgressCircle, indeterminate branches, staticColor white/black/auto, forced-colors, label-position side/top, label alignment, absence of value label when indeterminate, and RTL/locale percent formatting.

### FFC-009 — Local additions must be separated from certified S2 surface

Local field families include convenience aliases and extra components/branches such as legacy `class` aliases, `hideStepper`, `TabSwitch`, and `ToggleSwitch`. These may be valid Viviana-native additions, but they cannot silently count as upstream S2 parity.

Required path: classify each addition in the component seed files as `local addition`, `compatibility alias`, or `parity surface`, then ensure export reports distinguish missing S2 exports from intentional local extras.

## Priority proof queue

1. Build a form-context inheritance matrix for every field family.
2. Replace or classify hard-coded required/optional strings and add non-English route proof.
3. Remove `// @ts-nocheck` from public field wrappers or file owner-approved exceptions.
4. Add TextField-style ref parity tests for text/search/number/textarea wrappers.
5. Add validation behavior tests covering native, aria, custom validate, server errors, reset, submit, and error announcement.
6. Add NumberField locale, stepper, min/max, keyboard, and accessible-name tests.
7. Add Checkbox/Switch/Radio APG/WAI-ARIA state snapshots and form serialization tests.
8. Add Meter/Progress computed value/static-color/forced-colors contracts.
