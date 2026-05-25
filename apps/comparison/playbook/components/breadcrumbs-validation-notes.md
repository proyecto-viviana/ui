# Breadcrumbs Validation Notes

## Target

- Component: Breadcrumbs
- Slug: breadcrumbs
- Family or direct subcomponents: Breadcrumbs, Breadcrumb, BreadcrumbItem,
  BreadcrumbsContext
- Pass goal: add the S2 `./Breadcrumbs` public surface, static and dynamic
  collection support, localized overflow trigger, React/Solid comparison route,
  route controls, behavior contracts, and current visual evidence.
- Date: 2026-05-17

## Task Status

| Task                   | Status | Evidence                                                                                                         | Blocker or next action                |
| ---------------------- | ------ | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| 0 Research             | done   | S2 Breadcrumbs docs and API page via S2 MCP, installed React S2 behavior through comparison route                | None                                  |
| 1 Baseline             | done   | Before pass: Breadcrumbs was a missing/gap catalogue entry and root export/subpath were absent                   | None                                  |
| 2 Route harness        | done   | `breadcrumbs-demo.ts`, controls, manifest entry, React/Solid fixtures, visual-state rows                         | None                                  |
| 3 Source map/API       | done   | `./Breadcrumbs` subpath, root exports, package export map, build entries, `BreadcrumbsContext`, `Breadcrumb`     | None                                  |
| 4 Cross-layer audit    | done   | Headless static children, dynamic collection keys, `aria-details`, refs, overflow menu label/action path         | None                                  |
| 5 Transitions          | n/a    | Breadcrumbs has no owned transition; overflow menu uses shared Menu/MenuTrigger behavior                         | Menu visual parity is covered by Menu |
| 6 State                | done   | Route tests cover control reset, disabled state, action dispatch, and path truncation                            | None                                  |
| 7 ARIA hooks           | done   | Package tests and route tests cover nav/list semantics, current item, disabled state, accessible menu trigger    | None                                  |
| 8 Headless             | done   | `solidaria-components` tests cover static render and static `onAction` ids                                       | None                                  |
| 9 Styled S2            | done   | Generated S2 breadcrumb styles, localized overflow trigger, separator placement, bounded default visual evidence | Responsive auto-collapse covered      |
| 10 Runtime lifecycle   | done   | Playwright route contract and visual spec pass                                                                   | None                                  |
| 11 Harness integrity   | done   | Reports now list Breadcrumbs live on both sides                                                                  | None                                  |
| 12 Comparison evidence | done   | Focused package tests, route contract, visual spec, package build, comparison build, reports                     | None                                  |
| 13 Acceptance          | done   | API, route behavior, responsive overflow measurement, and visual evidence accepted                               | None                                  |

## Gate Outcome Summary

| Gate                                     | Outcome | Evidence                                                                                                                                          | Blockers/owner |
| ---------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| Official Docs And Viewer Parity          | done    | Route models S2 size, disabled, dynamic collection action, and overflow examples                                                                  | None           |
| External Authority And Standards         | done    | Breadcrumb landmark/list/current semantics asserted through package and browser tests                                                             | None           |
| Upstream React Source Parity             | done    | Public API and route behavior mapped; React responsive measurement collapse is ported for collection overflow                                     | None           |
| Solid Idiomatic Implementation           | done    | Reactive props/context, lazy static children, render props, refs, and generated style accessors                                                   | None           |
| Accessibility And I18n                   | done    | `aria-details`, accessible names, current item, disabled state, and localized `More items` covered                                                | None           |
| Behavior State Machine                   | done    | Action dispatch, path truncation, disabled suppression, and overflow menu exposure covered                                                        | None           |
| Style Source-To-Computed Parity          | done    | Default path has bounded pair-diff and computed style parity; responsive overflow structure matches React; overflow menu visual delegates to Menu | None           |
| React-Vs-Solid Comparison Harness Parity | done    | Both fixtures receive identical props and route tests prove controls update both stacks                                                           | None           |
| Evidence And Handoff                     | done    | Verification commands and refreshed reports recorded below                                                                                        | None           |

## Acceptance Gate Checklist

### 1. Official Docs And Viewer Parity

- [x] Official S2 Breadcrumbs API checked: `Breadcrumbs`, `Breadcrumb`,
      `size`, `isDisabled`, `items`, `children`, `onAction`, `slot`, `styles`,
      `UNSAFE_*`, and `aria-details`.
- [x] Primary dynamic collection example mapped to route behavior.
- [x] Overflow docs mapped to a route item-set and browser menu assertions.
- [x] Route controls model `size`, `itemSet`, and `isDisabled`.
- [x] Default route uses an action-only two-crumb path so browser tests do not
      navigate away from the comparison harness.

### 2. Upstream React Source Parity

- [x] Solid public exports added:
      `Breadcrumbs`, `Breadcrumb`, `BreadcrumbItem`, `BreadcrumbsContext`,
      and `./Breadcrumbs`.
- [x] Build entries and package exports added for DOM and SSR bundles.
- [x] Static JSX child support added to the headless Breadcrumbs layer.
- [x] Dynamic collection and overflow action keys covered.
- [x] React S2 responsive measurement collapse is ported for collection
      overflow: hidden measurement breadcrumbs, folder-button width, container
      resize/mutation observation, and font-ready recalculation.

### 3. Accessibility And I18n

- [x] `aria-details` forwards through Breadcrumbs, BreadcrumbItem, and Link.
- [x] Current static and dynamic items expose current-page state in Solid.
- [x] Disabled Breadcrumbs state suppresses actions.
- [x] Overflow trigger label matches React S2 English string: `More items`.
- [x] Spanish locale entry added: `Más elementos`.

### 4. React-Vs-Solid Harness Parity

- [x] React fixture imports `@react-spectrum/s2/Breadcrumbs`.
- [x] Solid fixture imports the public `@proyecto-viviana/solid-spectrum`
      Breadcrumbs API.
- [x] Both fixtures use normalized demo props from `breadcrumbs-demo.ts`.
- [x] Browser contract covers mount, controls, disabled state, action dispatch,
      truncation, and overflow item exposure.
- [x] Visual spec covers bounded default path evidence and computed style
      parity across default, size L, and disabled axes.

### 5. Evidence And Handoff

- [x] Focused package tests:
      `vp test run packages/solid-spectrum/test/Breadcrumbs.test.tsx packages/solidaria-components/test/Breadcrumbs.test.tsx`
      (`38` passed).
- [x] Package build:
      `vp run --filter @proyecto-viviana/solid-spectrum build`.
- [x] Comparison build:
      `vp run --filter @proyecto-viviana/comparison build` (`70` pages,
      including `/components/breadcrumbs`).
- [x] Browser route contract:
      `vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/breadcrumbs-contract.spec.ts --reporter=line`
      (`5` passed).
- [x] Focused responsive route contract:
      `vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/breadcrumbs-contract.spec.ts:140 --reporter=line`
      (`1` passed).
- [x] Browser visual contract:
      `vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/breadcrumbs-visual.spec.ts --reporter=line`
      (`3` passed).
- [x] Refreshed reports:
      `vp run --filter @proyecto-viviana/comparison report:gaps` reports `38`
      styled entries live on both sides and `31` missing/gap entries.
      `vp run --filter @proyecto-viviana/comparison report:exports` reports
      `149` Solid value exports and `65` missing React S2 value exports.

## Files Changed For This Pass

- Package source and exports:
  `packages/solid-spectrum/src/breadcrumbs/index.tsx`,
  `packages/solid-spectrum/src/breadcrumbs/s2-breadcrumbs-styles.ts`,
  `packages/solid-spectrum/src/Breadcrumbs.ts`,
  `packages/solid-spectrum/src/index.ts`,
  `packages/solid-spectrum/package.json`,
  `packages/solid-spectrum/vite.config.ts`,
  `packages/solid-spectrum/src/intl/en-US.json`,
  `packages/solid-spectrum/src/intl/es-ES.json`,
  `macro-emitted package CSS`.
- Headless and aria source:
  `packages/solidaria-components/src/Breadcrumbs.tsx`,
  `packages/solidaria/src/breadcrumbs/createBreadcrumbs.ts`,
  `packages/solidaria/src/link/createLink.ts`.
- Tests and comparison route:
  `packages/solid-spectrum/test/Breadcrumbs.test.tsx`,
  `packages/solidaria-components/test/Breadcrumbs.test.tsx`,
  `apps/comparison/src/data/breadcrumbs-demo.ts`,
  `apps/comparison/src/data/component-controls.ts`,
  `apps/comparison/src/data/comparison-manifest.ts`,
  `apps/comparison/src/data/visual-state-matrix.ts`,
  `apps/comparison/src/components/react/fixtures/styled.jsx`,
  `apps/comparison/src/components/solid/fixtures/styled.tsx`,
  `apps/comparison/src/styles/global.css`,
  `apps/comparison/e2e/breadcrumbs-contract.spec.ts`,
  `apps/comparison/e2e/breadcrumbs-visual.spec.ts`.

## Final Status

Accepted for this Breadcrumbs pass: public API, route harness, behavior, i18n,
responsive collection overflow measurement, and default visual evidence are in
place. The prior responsive-overflow caveat is closed by the browser contract
that narrows both stacks to the same visible root, menu, and current breadcrumb
items.
