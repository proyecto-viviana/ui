---
kind: research
status: current
---

Status: Current source of truth.
Update when: this research pack is revised, superseded, or relocated.

# Evidence gap ledger

This ledger records proof gaps found by breadth mapping and baseline reports. It does not claim implementation bugs unless a source/test mismatch was directly observed.

## Global gaps

### GAP-GLOBAL-001 — strict pair-diff depth

- Axis: visual parity.
- Evidence: gap report showed 349 tracked visual states, 113 states with current evidence, and 56 states with strict pair-diff tests.
- Risk: many states remain asserted/current-evidence only, so screenshot stability is not enough to prove parity branches.
- Future proof: convert each asserted state to either strict React-vs-Solid pair diff or computed contract with source-branch rationale.

### GAP-GLOBAL-002 — S2 non-root/support exports

- Axis: API/export parity.
- Evidence: export report showed 22 missing non-root/support S2 exports and 69 extra Solid exports.
- Missing categories: contexts, hooks, helper `mergeStyles`, subcomponents `Autocomplete`, `ComboBoxSection`, `PickerSection`, and `EditableCell`.
- Future proof: classify every missing/extra export as parity bug, documented local addition, or intentionally unsupported branch.

### GAP-GLOBAL-003 — RAC guard source authority absent

- Axis: guard environment / upstream authority.
- Evidence: RAC guards read `react-spectrum/packages/react-aria-components/src/index.ts`, but this checkout has no vendored `react-spectrum/` tree.
- Future proof: either vendor/sync the required upstream tree or update guard source resolution to installed package authority without reducing strictness.

### GAP-GLOBAL-004 — virtualizer keyboard fallback invariant

- Axis: keyboard/focus behavior.
- Evidence: virtualizer keyboard parity guard failed on missing opposite-direction fallback scan invariant.
- Future proof: inspect upstream virtualizer keyboard navigation and add/fix behavior with regression tests.

## Per-component automated gaps

| Component | Gap | Suggested future proof |
|---|---|---|
| Accordion | Not listed as accepted under full gate model in validation index. | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| ActionBar | Not listed as accepted under full gate model in validation index. | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| ActionButton | Not listed as accepted under full gate model in validation index. | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| ActionButtonGroup | No component-specific e2e spec found by automated map; Not listed as accepted under full gate model in validation index. | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| ActionMenu | Not listed as accepted under full gate model in validation index. | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| Avatar | Not listed as accepted under full gate model in validation index. | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| AvatarGroup | No component-specific e2e spec found by automated map; Not listed as accepted under full gate model in validation index. | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| Badge | Not listed as accepted under full gate model in validation index. | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| Breadcrumbs | Not listed as accepted under full gate model in validation index. | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| Button | Not listed as accepted under full gate model in validation index. | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| ButtonGroup | No component-specific e2e spec found by automated map; Not listed as accepted under full gate model in validation index. | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| Card | partial: Card/CardView note lists release-hardening gaps. | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| CardView | partial: Card/CardView note lists release-hardening gaps. | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| CheckboxGroup | Not listed as accepted under full gate model in validation index. | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| ComboBox | Not listed as accepted under full gate model in validation index. | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| ContextualHelp | Not listed as accepted under full gate model in validation index. | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| DateField | Not listed as accepted under full gate model in validation index. | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| DatePicker | Not listed as accepted under full gate model in validation index. | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| DateRangePicker | Not listed as accepted under full gate model in validation index. | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| Dialog | Not listed as accepted under full gate model in validation index. | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| Divider | Not listed as accepted under full gate model in validation index. | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| Form | Not listed as accepted under full gate model in validation index. | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| Icons | No component-specific e2e spec found by automated map;  | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| IllustratedMessage | No component-specific e2e spec found by automated map;  | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| Illustrations | No component-specific e2e spec found by automated map;  | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| Image | Not listed as accepted under full gate model in validation index. | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| InlineAlert | No component-specific e2e spec found by automated map;  | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| Link | Not listed as accepted under full gate model in validation index. | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| LinkButton | No component-specific e2e spec found by automated map; Not listed as accepted under full gate model in validation index. | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| Menu | Not listed as accepted under full gate model in validation index. | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| Meter | Not listed as accepted under full gate model in validation index. | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| Picker | partial: validation note names component-owned blockers around hierarchical sections, link semantics, rich slots, group labeling, multi-select transitions, and geometry. | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| Popover | No component-specific e2e spec found by automated map;  | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| ProgressBar | No component-specific e2e spec found by automated map; Not listed as accepted under full gate model in validation index. | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| ProgressCircle | No component-specific e2e spec found by automated map; Not listed as accepted under full gate model in validation index. | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| Provider | No component-specific e2e spec found by automated map; tracked/pre-pass: source-to-computed and strict pair-diff acceptance remain incomplete. | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| RangeCalendar | Not listed as accepted under full gate model in validation index. | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| RangeSlider | Not listed as accepted under full gate model in validation index. | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| SegmentedControl | No component-specific e2e spec found by automated map; Not listed as accepted under full gate model in validation index. | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| SelectBoxGroup | No component-specific e2e spec found by automated map; Not listed as accepted under full gate model in validation index. | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| Skeleton | Not listed as accepted under full gate model in validation index. | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| Slider | Not listed as accepted under full gate model in validation index. | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| StatusLight | Not listed as accepted under full gate model in validation index. | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| TableView | Not listed as accepted under full gate model in validation index. | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| TimeField | Not listed as accepted under full gate model in validation index. | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| ToggleButton | No component-specific e2e spec found by automated map;  | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
| ToggleButtonGroup | No component-specific e2e spec found by automated map;  | Complete per-component source branch matrix and add behavior/contract/pair-diff tests for every upstream branch. |
