# Tabs Validation Notes

Date: 2026-05-24
Status: partial

## Target

- Component: Tabs
- Slug: `tabs`
- Family or direct subcomponents: `Tabs`, `TabList`, `Tab`, `TabPanel`,
  `TabPanels`, `Collection`, `Text`, `SelectionIndicator`, and overflow
  `TabsPicker`.
- Pass goal: bring Tabs back to a live React Spectrum S2 vs Solid Spectrum
  comparison route, port the public S2 API shape, cover the headless static and
  dynamic collection bug class, and keep the upstream horizontal overflow
  collapse branch as an explicit blocker until it is implemented.

## Task Status

| Task                   | Status   | Evidence                                                                                                |
| ---------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| 0 Research             | complete | S2 MCP docs and installed `@react-spectrum/s2/src/Tabs.tsx`/`TabsPicker.tsx` source mapped.             |
| 1 Baseline             | complete | Manifest moved Tabs from missing Solid styled wiring to live partial parity with named blockers.        |
| 2 Route harness        | complete | React/Solid fixtures, shared demo props, controls, visual matrix, and Playwright route checks added.    |
| 3 Source map/API       | partial  | Public props/defaults/exports mapped into Solid wrapper; overflow collapse remains unmapped.            |
| 4 Cross-layer audit    | complete | Headless static/dynamic collection, selection, disabled, and manual keyboard behavior covered.          |
| 5 Transitions          | partial  | Route control updates, controlled remounts, manual activation, and selected panel changes covered.      |
| 6 State                | complete | Controlled/default selection and late collection registration are package-tested.                       |
| 7 ARIA hooks           | complete | Required labeling, roles, disabled state, hidden labels, keyboard activation, and panel linkage tested. |
| 8 Headless             | complete | Static tabs, `TabList.items`, disabled static tabs, and default selection after registration tested.    |
| 9 Styled S2            | blocked  | Upstream horizontal overflow collapse into Picker is not yet ported.                                    |
| 10 Runtime lifecycle   | partial  | Route listeners and Solid keyed remounts added; ResizeObserver/collapse lifecycle still pending.        |
| 11 Harness integrity   | complete | React uses S2; Solid uses public `@proyecto-viviana/solid-spectrum`; focused gates pass.                |
| 12 Comparison evidence | complete | Focused package tests, regression snapshot, typecheck, build, and Tabs Playwright passed.               |
| 13 Acceptance          | blocked  | Do not mark accepted while overflow collapse and strict style evidence remain incomplete.               |

## Acceptance Gate Checklist

- [x] Official Docs And Viewer Parity
- [x] External Authority And Standards
- [ ] Upstream React Source Parity
- [x] Solid Idiomatic Implementation
- [x] Accessibility And I18n
- [x] Behavior State Machine
- [ ] Style Source-To-Computed Parity
- [x] React-Vs-Solid Comparison Harness Parity
- [x] Known Defects And Regression Protection
- [x] Evidence And Handoff

## Gate Outcome Summary

| Gate                                     | Outcome  | Evidence                                                                                                                       | Blockers/owner                                                                   |
| ---------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| Official Docs And Viewer Parity          | partial  | Docs/API/source list `density`, `labelBehavior`, selection, disabled keys, orientation, collections, panels.                   | Overflow Picker collapse still missing.                                          |
| External Authority And Standards         | complete | React Aria Tabs docs checked for collection and selection semantics; package/browser tests assert roles and keyboard behavior. | None for the current non-overflow scope.                                         |
| Upstream React Source Parity             | blocked  | Public API, slots, selected indicator, Text/Icon, and panels mapped.                                                           | `CollapsingTabs`/`TabsPicker` branch not ported.                                 |
| Solid Idiomatic Implementation           | partial  | Wrapper keeps accessor-backed props, lazy child resolution under context providers, context refs, and keyed route remounts.    | Collapse observer lifecycle pending.                                             |
| Accessibility And I18n                   | complete | Required label guard, tablist label forwarding, hidden-label `aria-labelledby`, disabled tabs, and manual activation tested.   | Overflow Picker menu semantics pending with collapse work.                       |
| Behavior State Machine                   | complete | Package and browser tests cover selection, disabled suppression, default collection registration, and manual activation.       | Overflow collapse state pending.                                                 |
| Style Source-To-Computed Parity          | blocked  | S2 style branches mapped from source and hidden-label display covered in browser.                                              | Need collapse branch and stricter computed/pair-diff evidence before acceptance. |
| React-Vs-Solid Comparison Harness Parity | complete | Shared route props and fixtures drive both public stacks; Tabs Playwright route gate passes.                                   | None for the current non-overflow scope.                                         |
| Known Defects And Regression Protection  | partial  | Known defects are recorded instead of hidden; package/browser regression coverage added.                                       | Overflow collapse and strict visual evidence remain blockers.                    |
| Evidence And Handoff                     | complete | Focused package tests, regression snapshot, comparison typecheck/build, and Tabs Playwright all pass.                          | Keep status partial until overflow collapse is implemented.                      |

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

| Branch                     | React S2 behavior                                             | Solid status | Evidence                                                                                                         |
| -------------------------- | ------------------------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------- |
| Required label             | Throws without `aria-label`/`aria-labelledby`.                | ported       | `packages/solid-spectrum/test/Tabs.test.tsx`.                                                                    |
| Static collection          | Static `<Tab>` children build the collection.                 | ported       | `packages/solidaria-components/test/Tabs.test.tsx`.                                                              |
| Dynamic collection         | `TabList items` render prop builds tabs.                      | ported       | Package tests and comparison route.                                                                              |
| Controlled selection       | `selectedKey` and `onSelectionChange`.                        | ported       | Package tests and route props.                                                                                   |
| Default selection          | `defaultSelectedKey` for uncontrolled state.                  | ported       | State late-registration regression test.                                                                         |
| Disabled keys              | Root `disabledKeys` plus per-`Tab isDisabled`.                | ported       | Package tests and route props.                                                                                   |
| Manual keyboard activation | Arrow focus does not select until activation.                 | ported       | `packages/solid-spectrum/test/Tabs.test.tsx`.                                                                    |
| `labelBehavior="hide"`     | Text gets `display:none`, icon remains; menu shows text.      | ported       | Unit and Playwright assert hidden label ids, `aria-labelledby`, display none, and icon presence.                 |
| Selected indicator         | Neutral token, forced-colors Highlight, orientation geometry. | partial      | Solid indicator exists and source geometry/token branches are mapped; forced-colors visual proof pending.        |
| Panels                     | `shouldForceMount`, inert display none, flex grow, gray-800.  | partial      | Selected panel behavior covered; strict force-mounted panel exposure differs in React route and needs follow-up. |
| Horizontal overflow        | Hidden measured tabs collapse into S2 Tabs Picker.            | gap          | Blocker for acceptance.                                                                                          |

## Remaining Gaps

| Gap                                                                                                                               | Gate                                                    | Owner          | Blocking acceptance |
| --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | -------------- | ------------------- |
| Port horizontal overflow collapse and TabsPicker behavior for Solid.                                                              | Upstream React Source Parity / Style Source-To-Computed | Tabs pass      | yes                 |
| Add strict computed/pair-diff evidence for selected indicator forced-colors and panel style branches.                             | Style Source-To-Computed                                | Tabs follow-up | no                  |
| Reconcile `shouldForceMount` browser expectations against current React S2 route behavior before adding a strict route assertion. | Behavior / Evidence                                     | Tabs follow-up | no                  |
| Add at least one overflow-collapse browser test once Solid has a TabsPicker branch.                                               | Comparison Harness / Evidence                           | Tabs follow-up | yes                 |

## Evidence Log

- Passed for this checkpoint:
  - `vp test run packages/solid-spectrum/test/Tabs.test.tsx packages/solidaria-components/test/Tabs.test.tsx`
  - `vp test run packages/solid-spectrum/test/regression.test.tsx -t "Regression: Tabs" -u`
  - `vp run comparison:typecheck`
  - `vp run comparison:build`
  - `vp exec playwright test e2e/tabs-visual.spec.ts --reporter=line`
- Earlier package passes before route wiring:
  - `vp test run packages/solidaria-components/test/Tabs.test.tsx`
  - `vp test run packages/solid-spectrum/test/Tabs.test.tsx`
  - `vp test run packages/solid-spectrum/test/regression.test.tsx -t "Regression: Tabs" -u`
