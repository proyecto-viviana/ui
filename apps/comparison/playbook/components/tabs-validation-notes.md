# Tabs Validation Notes

Date: 2026-06-01
Status: accepted

## Target

- Component: Tabs
- Slug: `tabs`
- Family or direct subcomponents: `Tabs`, `TabList`, `Tab`, `TabPanel`,
  `TabPanels`, `Collection`, `Text`, `SelectionIndicator`, and overflow
  `TabsPicker`.
- Pass goal: bring Tabs back to a live React Spectrum S2 vs Solid Spectrum
  comparison route, port the public S2 API shape, cover the headless static and
  dynamic collection bug class, and port the upstream horizontal overflow
  collapse branch into the S2 Tabs Picker.

## Task Status

| Task                   | Status   | Evidence                                                                                                    |
| ---------------------- | -------- | ----------------------------------------------------------------------------------------------------------- |
| 0 Research             | complete | S2 MCP docs and installed `@react-spectrum/s2/src/Tabs.tsx`/`TabsPicker.tsx` source mapped.                 |
| 1 Baseline             | complete | Manifest moved Tabs from missing Solid styled wiring to live parity with overflow evidence.                 |
| 2 Route harness        | complete | React/Solid fixtures, shared demo props, controls, visual matrix, and Playwright route checks added.        |
| 3 Source map/API       | complete | Public props/defaults/exports mapped into Solid wrapper, including overflow collapse into TabsPicker.       |
| 4 Cross-layer audit    | complete | Headless static/dynamic collection, selection, disabled, and manual keyboard behavior covered.              |
| 5 Transitions          | complete | Route control updates, controlled remounts, manual activation, picker selection, and panel changes covered. |
| 6 State                | complete | Controlled/default selection and late collection registration are package-tested.                           |
| 7 ARIA hooks           | complete | Required labeling, roles, disabled state, hidden labels, keyboard activation, and panel linkage tested.     |
| 8 Headless             | complete | Static tabs, `TabList.items`, disabled static tabs, and default selection after registration tested.        |
| 9 Styled S2            | complete | Non-overflow S2 style contract and horizontal overflow collapse into Picker are asserted.                   |
| 10 Runtime lifecycle   | complete | Route listeners, keyed remounts, ResizeObserver measurement, and collapse lifecycle are covered.            |
| 11 Harness integrity   | complete | React uses S2; Solid uses public `@proyecto-viviana/solid-spectrum`; focused gates pass.                    |
| 12 Comparison evidence | complete | Focused package tests, regression snapshot, build, and Tabs Playwright passed.                              |
| 13 Acceptance          | complete | Accepted after overflow collapse, style contract, package, build, report, guard, and browser gates passed.  |

## Acceptance Gate Checklist

- [x] Official Docs And Viewer Parity
- [x] External Authority And Standards
- [x] Upstream React Source Parity
- [x] Solid Idiomatic Implementation
- [x] Accessibility And I18n
- [x] Behavior State Machine
- [x] Style Source-To-Computed Parity
- [x] React-Vs-Solid Comparison Harness Parity
- [x] Known Defects And Regression Protection
- [x] Evidence And Handoff

## Gate Outcome Summary

| Gate                                     | Outcome  | Evidence                                                                                                                                                                                                                    | Blockers/owner |
| ---------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| Official Docs And Viewer Parity          | complete | Docs/API/source list `density`, `labelBehavior`, selection, disabled keys, orientation, collections, panels, and overflow picker behavior.                                                                                  | None.          |
| External Authority And Standards         | complete | React Aria Tabs docs checked for collection and selection semantics; package/browser tests assert roles and keyboard behavior.                                                                                              | None.          |
| Upstream React Source Parity             | complete | Public API, slots, selected indicator, Text/Icon, panels, and `CollapsingTabs`/`TabsPicker` branch mapped.                                                                                                                  | None.          |
| Solid Idiomatic Implementation           | complete | Wrapper keeps accessor-backed props, lazy child resolution under context providers, context refs, keyed route remounts, and ResizeObserver-based collapse state.                                                            | None.          |
| Accessibility And I18n                   | complete | Required label guard, tablist label forwarding, hidden-label `aria-labelledby`, disabled tabs, manual activation, picker semantics, and collapsed panel `group` labeling tested.                                            | None.          |
| Behavior State Machine                   | complete | Package and browser tests cover selection, disabled suppression, default collection registration, manual activation, collapse state, and picker selection.                                                                  | None.          |
| Style Source-To-Computed Parity          | complete | Browser contract covers tablist, selected/idle tab, selected indicator, selected panel, hidden-label padding, vertical icon-hidden spacing, forced-colors disabled branches, and overflow picker collapse against React S2. | None.          |
| React-Vs-Solid Comparison Harness Parity | complete | Shared route props and fixtures drive both public stacks; Tabs Playwright route gate passes.                                                                                                                                | None.          |
| Known Defects And Regression Protection  | complete | Known defects are recorded instead of hidden; package/browser regression coverage added, including force-mounted inactive panel semantics.                                                                                  | None.          |
| Evidence And Handoff                     | complete | Focused package tests, regression snapshot, comparison build, Tabs Playwright, reports, and guards pass.                                                                                                                    | None.          |

## Research

- S2 docs: Tabs MCP page checked on 2026-05-24. Public API lists required
  `aria-label`/`aria-labelledby`, `defaultSelectedKey`, `selectedKey`,
  `onSelectionChange`, `disabledKeys`, `isDisabled`, `keyboardActivation`,
  `orientation`, `density`, `labelBehavior`, `styles`, unsafe props, `items`,
  `children`, `Tab`, `TabList`, and `TabPanel.shouldForceMount`.
- React Aria Tabs docs checked on 2026-05-24 for the baseline collection and
  selection semantics: `TabList.items`, static collections, `defaultSelectedKey`,
  `selectedKey`, and disabled tabs.
- Installed upstream source:
  - `apps/comparison/node_modules/@react-spectrum/s2/src/Tabs.tsx`
  - `apps/comparison/node_modules/@react-spectrum/s2/src/TabsPicker.tsx`
- Source disagreement/decision: S2 docs show the high-level collection API, but
  installed source is the authority for hidden-tab measurement, Picker collapse,
  selected-indicator tokens, label-hidden `Text` display, and tab panel display.

## Source Branch Ledger

| Branch                     | React S2 behavior                                                                                           | Solid status | Evidence                                                                                                                                                     |
| -------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Required label             | Throws without `aria-label`/`aria-labelledby`.                                                              | ported       | `packages/solid-spectrum/test/Tabs.test.tsx`.                                                                                                                |
| Static collection          | Static `<Tab>` children build the collection.                                                               | ported       | `packages/solidaria-components/test/Tabs.test.tsx`.                                                                                                          |
| Dynamic collection         | `TabList items` render prop builds tabs.                                                                    | ported       | Package tests and comparison route.                                                                                                                          |
| Controlled selection       | `selectedKey` and `onSelectionChange`.                                                                      | ported       | Package tests and route props.                                                                                                                               |
| Default selection          | `defaultSelectedKey` for uncontrolled state.                                                                | ported       | State late-registration regression test.                                                                                                                     |
| Disabled keys              | Root `disabledKeys` plus per-`Tab isDisabled`.                                                              | ported       | Package tests and route props.                                                                                                                               |
| Manual keyboard activation | Arrow focus does not select until activation.                                                               | ported       | `packages/solid-spectrum/test/Tabs.test.tsx`.                                                                                                                |
| `labelBehavior="hide"`     | Text gets `display:none`, icon remains; menu shows text.                                                    | ported       | Unit and Playwright assert hidden label ids, `aria-labelledby`, display none, icon presence, and 6px hidden-label tab padding.                               |
| Selected indicator         | Neutral token, forced-colors Highlight, orientation geometry.                                               | ported       | Browser computed contract asserts normal, vertical icon-hidden, and forced-colors disabled selected-indicator styles.                                        |
| Panels                     | `shouldForceMount`, inert display none, flex grow, gray-800; collapsed overflow panels are labelled groups. | ported       | Selected panel behavior, computed color/flex/margin branches, inactive force-mounted panel exposure, collapsed group role, and picker selection are covered. |
| Horizontal overflow        | Hidden measured tabs collapse into S2 Tabs Picker.                                                          | ported       | Browser test forces narrow width, asserts no visible tablist, visible Picker, collapsed group panel, and React/Solid picker selection parity.                |

## Remaining Gaps

None.

## Evidence Log

- Passed for this checkpoint:
  - `vp test run packages/solid-spectrum/test/Tabs.test.tsx packages/solidaria-components/test/Tabs.test.tsx`
  - `vp test run packages/solid-spectrum/test/regression.test.tsx -t "Regression: Tabs" -u`
  - `vp run comparison:build`
  - `env COMPARISON_BASE_URL=http://127.0.0.1:4321 vp exec --filter @proyecto-viviana/comparison playwright test e2e/tabs-visual.spec.ts --project=chromium --reporter=line` (6 passed)
  - `vp run comparison:report:gaps`
  - `vp run comparison:report:parity`
  - `vp run comparison:report:parity:strict`
  - `vp run comparison:report:exports`
  - `vp run guard:rac-parity`
  - `vp run guard:rac-export-gap`
- Earlier package passes before route wiring:
  - `vp test run packages/solidaria-components/test/Tabs.test.tsx`
  - `vp test run packages/solid-spectrum/test/Tabs.test.tsx`
  - `vp test run packages/solid-spectrum/test/regression.test.tsx -t "Regression: Tabs" -u`
