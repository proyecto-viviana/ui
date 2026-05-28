# Picker Validation Notes

Date: 2026-05-28
Status: partial

## Target

- Component: Picker
- Slug: `picker`
- Family or direct subcomponents: S2 `Picker`, `PickerItem`,
  `PickerSection`; React Aria `Select`; Solid Spectrum `Picker`; Solidaria
  `Select`, `SelectTrigger`, `SelectValue`, `SelectPopover`, `SelectListBox`,
  and `SelectOption`.
- Pass goal: tighten the existing Picker route and public wrapper against the
  S2 docs surface, close the S2 single/multiple value alias gap, and record
  remaining collection/item composition blockers instead of accepting an
  incomplete pass.

## Task Status

| Task                   | Status   | Evidence                                                                                               |
| ---------------------- | -------- | ------------------------------------------------------------------------------------------------------ |
| 0 Research             | complete | S2 Picker MCP docs and React Aria Select MCP docs checked on 2026-05-28.                               |
| 1 Baseline             | complete | Parity report had Picker in missing validation-note coverage while route/evidence already existed.     |
| 2 Route harness        | complete | React/Solid fixtures and modeled controls now expose `selectionMode` in addition to existing controls. |
| 3 Source map/API       | partial  | S2 value/defaultValue/onChange aliases mapped for single and multiple selection.                       |
| 4 Cross-layer audit    | partial  | Lower Select stack supports multiple selected keys and hidden inputs; flat collection blocks sections. |
| 5 Transitions          | partial  | Existing browser evidence covers open/select/keyboard paths for the flat item route.                   |
| 6 State                | partial  | Wrapper-level tests cover controlled/default single and multiple value aliases.                        |
| 7 ARIA hooks           | partial  | Select/listbox roles and multiple selection are covered; section/link item semantics remain.           |
| 8 Headless             | partial  | Solidaria Select supports multiple keys but not hierarchical Picker sections or link options.          |
| 9 Styled S2            | partial  | Invalid/open/advanced route states have visual evidence; default pair diff remains planned.            |
| 10 Runtime lifecycle   | partial  | Route controls and load-more counter are covered; section/link navigation lifecycle remains.           |
| 11 Harness integrity   | complete | React imports S2 directly; Solid imports public `@proyecto-viviana/solid-spectrum` Picker.             |
| 12 Comparison evidence | complete | Focused package, build, Playwright, parity, and check gates passed for this checkpoint.                |
| 13 Acceptance          | blocked  | Do not mark accepted until blockers below are resolved or deliberately scoped out.                     |

## Acceptance Gate Checklist

- [x] Official Docs And Viewer Parity
- [x] External Authority And Standards
- [ ] Upstream React Source Parity
- [x] Solid Idiomatic Implementation
- [ ] Accessibility And I18n
- [ ] Behavior State Machine
- [ ] Style Source-To-Computed Parity
- [x] React-Vs-Solid Comparison Harness Parity
- [x] Known Defects And Regression Protection
- [x] Evidence And Handoff

## Gate Outcome Summary

| Gate                                     | Outcome | Evidence                                                                                                                                               | Blockers/owner                                                                      |
| ---------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| Official Docs And Viewer Parity          | partial | S2 docs list static/dynamic collections, items, sections, renderValue, forms, validation, async loading, and popover props.                            | PickerSection, PickerItem link navigation, and rich item slot evidence remain.      |
| External Authority And Standards         | partial | React Aria Select docs checked for value, collection, form, validation, and listbox semantics.                                                         | Need section/link semantics mapped after lower collection work.                     |
| Upstream React Source Parity             | partial | Solid wrapper now accepts S2 `value`, `defaultValue`, and `onChange` for single and multiple selection.                                                | Hierarchical sections and link items are not ported.                                |
| Solid Idiomatic Implementation           | passing | Wrapper uses accessors/mergeProps and routes S2 aliases through Solidaria selected-key APIs.                                                           | None for the current flat item route.                                               |
| Accessibility And I18n                   | partial | Package tests cover listbox multiple selection and form hidden inputs.                                                                                 | Section group labeling, link option navigation, and richer item content need proof. |
| Behavior State Machine                   | partial | Existing e2e covers invalid/open/select/keyboard paths; package tests cover multiple alias payloads.                                                   | Multi-select browser transition and section/link transitions remain.                |
| Style Source-To-Computed Parity          | partial | Invalid required XL, open list, keyboard, and advanced states have current visual/computed evidence, including option focus-visible background parity. | Dedicated default-state pair diff and rich item slot geometry remain.               |
| React-Vs-Solid Comparison Harness Parity | passing | Shared Picker demo data drives both React S2 and Solid public Picker, including `selectionMode`.                                                       | None for the current flat item route.                                               |
| Known Defects And Regression Protection  | partial | Known section/link/default-visual gaps are now blockers in this note and metadata.                                                                     | Resolve blockers before accepted status.                                            |
| Evidence And Handoff                     | passing | Focused gates passed for this checkpoint.                                                                                                              | Keep partial blockers active until resolved.                                        |

## Research

- S2 docs: Picker MCP page checked on 2026-05-28. Public docs cover
  `Picker`, `PickerItem`, `PickerSection`, static and dynamic collections,
  selected value rendering, forms, validation, async loading, link items, and
  popover placement props.
- React Aria docs: Select MCP page checked on 2026-05-28 for collection,
  selected item, form, validation, and listbox behavior.
- Owner files:
  `packages/solid-spectrum/src/picker/index.tsx`,
  `packages/solidaria-components/src/Select.tsx`,
  `apps/comparison/src/data/picker-demo.ts`,
  `apps/comparison/src/data/component-controls.ts`, React/Solid styled
  fixtures, `visual-state-matrix.ts`, and
  `apps/comparison/e2e/picker-visual.spec.ts`.

## Source Branch Ledger

| Branch                          | React S2 behavior                                      | Solid status | Evidence or blocker                                       |
| ------------------------------- | ------------------------------------------------------ | ------------ | --------------------------------------------------------- |
| `value`/`defaultValue` single   | S2 aliases control selected key.                       | ported       | Package Picker tests.                                     |
| `value`/`defaultValue` multiple | S2 aliases use arrays when `selectionMode="multiple"`. | ported       | Package Picker tests and route control.                   |
| `onChange` single/multiple      | Callback returns key or key array.                     | ported       | Package Picker tests.                                     |
| `renderValue`                   | Receives selected item objects.                        | partial      | Flat item route covered; rich item slots need evidence.   |
| Forms                           | Named hidden inputs submit selected values.            | ported       | Single existing test plus new multiple hidden input test. |
| Async loading/load more         | Loading state and `onLoadMore` exposed.                | route slice  | Existing route/control evidence.                          |
| Popover props                   | Direction, alignment, width, flip.                     | route slice  | Existing route/control evidence.                          |
| PickerSection                   | Sections group item collections with headings.         | gap          | Lower Select collection is currently flat.                |
| PickerItem link props           | Link items navigate and are not selectable.            | gap          | Lower SelectOption renders `li` and ignores link props.   |

## Remaining Gaps

| Gap                                                         | Gate                                | Owner               | Blocks acceptance |
| ----------------------------------------------------------- | ----------------------------------- | ------------------- | ----------------- |
| Implement `PickerSection`/hierarchical collection support.  | Docs, source, behavior, a11y, style | Picker/Select stack | yes               |
| Implement `PickerItem` link navigation and non-selection.   | Docs, source, behavior, a11y        | Picker/SelectOption | yes               |
| Add browser evidence for multi-select transitions.          | Behavior / Comparison Harness       | Picker e2e          | yes               |
| Add dedicated default Picker pair diff and computed checks. | Style Source-To-Computed            | Picker e2e          | yes               |
| Prove rich item slot geometry for icon/avatar/description.  | Docs, source, style, a11y           | Picker route/e2e    | yes               |
| Map section labels and link items to accessible name/order. | Accessibility And I18n              | Picker/Select stack | yes               |

## Evidence Log

- Passed for this checkpoint:
  - `vp test packages/solidaria-components/test/Select.test.tsx packages/solid-spectrum/test/Picker.test.tsx`
    - 2 files, 77 tests passed.
  - `vp test packages/solid-spectrum/test/Picker.test.tsx`
    - 1 file, 9 tests passed after the final iterable selection helper
      cleanup.
  - `vp exec --filter @proyecto-viviana/comparison playwright test e2e/picker-visual.spec.ts e2e/modeled-controls-contract.spec.ts --project=chromium --reporter=line --grep "comparison Picker visual parity|Picker side-panel controls"`
    - 12 tests passed.
  - `vp run comparison:build`
    - 70 pages built.
  - `vp run comparison:report:parity`
    - 69/69 official routes, 69/69 modeled controls, 64/69 validation notes.
      Missing notes remain RadioGroup, SearchField, Switch, TextArea, and
      TextField.
  - `vp check --fix`
    - Formatting completed and lint passed.
  - `git diff --check`
    - Passed.

## Handoff

- Status after this pass: partial.
- This checkpoint fixes the S2 alias gap for single and multiple selection and
  keeps the remaining blockers explicit. It also fixes the Select popover option
  focus-visible mismatch exposed by the Picker open-list parity test. Picker
  must not be moved to accepted until the gaps above are closed with package and
  browser evidence.
