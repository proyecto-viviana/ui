# ColorSwatch Validation Notes

Date: 2026-05-22
Status: accepted

## Target

- Component: ColorSwatch
- Slug: `colorswatch`
- Family or direct subcomponents: `ColorSwatch`, `ColorSwatchContext`,
  `createColorSwatch`, and the public `@proyecto-viviana/solid-spectrum/ColorSwatch`
  subpath.
- Pass goal: accept ColorSwatch under the current full gate model with parity
  for the official static S2 swatch API, generated and custom color names,
  transparent/no-color slash rendering, S2 size and rounding controls, ARIA
  label/reference props, non-interactive semantics, and public package exports.

## Task Status

| Task                   | Status   | Evidence                                                                                                         |
| ---------------------- | -------- | ---------------------------------------------------------------------------------------------------------------- |
| 0 Research             | complete | React Spectrum S2 ColorSwatch docs/source, React Aria ColorSwatch docs/source, installed S2/RAC/React Aria code. |
| 1 Baseline             | complete | Existing color tests and comparison reports showed ColorSwatch was not modeled or exported as a public subpath.  |
| 2 Route harness        | complete | `apps/comparison/e2e/colorswatch-visual.spec.ts` and `e2e/modeled-controls-contract.spec.ts`.                    |
| 3 Source map/API       | complete | Upstream `@react-spectrum/s2/src/ColorSwatch.tsx`, RAC `ColorSwatch.tsx`, and React Aria `useColorSwatch.ts`.    |
| 4 Cross-layer audit    | complete | ARIA hook, headless component, styled S2 wrapper, fixtures, controls, reports, and package exports mapped.       |
| 5 Transitions          | complete | Default, custom color name, ARIA references, size/rounding, route controls, and transparent fallback covered.    |
| 6 State                | complete | Uses normalized color parsing from the color state package; no separate interactive state is required.           |
| 7 ARIA hooks           | complete | `packages/solidaria/src/color/createColorSwatch.ts` and component tests.                                         |
| 8 Headless             | complete | `packages/solidaria-components/src/Color.tsx` and component tests.                                               |
| 9 Styled S2            | complete | `packages/solid-spectrum/src/color/index.tsx`, public subpath, package export, and browser contracts.            |
| 10 Runtime lifecycle   | complete | Generated ids, controlled route prop updates, provider locale/theme, and transparent fallback audited.           |
| 11 Harness integrity   | complete | React imports real S2 ColorSwatch; Solid imports public S2 package/root wrapper.                                 |
| 12 Comparison evidence | complete | Focused package, typecheck, build, Playwright, gaps, exports, and root check gates listed below.                 |
| 13 Acceptance          | complete | No accepted ColorSwatch blockers remain; picker/selectable behavior belongs to the ColorSwatchPicker pass.       |

## Agent Workflow

No subagents were used for this component pass.

| Agent role | Files read                                                                                                | Files changed                                                                                                                                                                             | Evidence added                                                                                                                   | Commands run                                                                        | Blockers | Next owner |
| ---------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------- | ---------- |
| main       | S2/React Aria docs through MCP/skills; installed S2/RAC/React Aria ColorSwatch source; color owner files. | ColorSwatch ARIA/headless/styled files, public S2 export/subpath/package config, comparison route data/controls/fixtures, manifest/matrix, package tests, Playwright spec, and this note. | API controls, accessible name/reference-id contracts, computed S2 style, transparent slash assertions, screenshot pair evidence. | Focused package, typecheck, build, Playwright, gaps, exports commands listed below. | none     | none       |

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

| Gate                                     | Outcome  | Evidence                                                                                                                                                                                                     | Blockers/owner |
| ---------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| Official Docs And Viewer Parity          | complete | S2 ColorSwatch docs checked on 2026-05-22. Route controls cover `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-details`, `id`, `slot`, `color`, `colorName`, `size`, and `rounding`.             | none           |
| External Authority And Standards         | complete | React Aria docs/source define `role="img"`, localized color names, `colorName`, transparent fallback, and label/reference composition. Browser and package tests assert the DOM contract.                    | none           |
| Upstream React Source Parity             | complete | Installed S2 `ColorSwatch.tsx`, RAC `ColorSwatch.tsx`, and React Aria `useColorSwatch.ts` were mapped. Solid matches the public static S2 swatch surface and keeps picker selection separate.                | none           |
| Solid Idiomatic Implementation           | complete | Provider, render props, and route fixture props remain accessor-backed; `createMemo` owns normalized color/name state; generated id fallback stays reactive to explicit `id` updates.                        | none           |
| Accessibility And I18n                   | complete | Browser contract compares role, roledescription, generated or custom color name, composed `aria-label`, self-referenced `aria-labelledby`, `aria-describedby`, `aria-details`, `id`, and `slot`.             | none           |
| Behavior State Machine                   | complete | Default color, explicit color/name, ARIA reference props, `size`, `rounding`, route-control updates, and transparent/no-color fallback are covered.                                                          | none           |
| Style Source-To-Computed Parity          | complete | Browser contract and screenshots compare 16/24/32/40 sizes, rounding, border, box sizing, forced color adjustment, checkerboard background, and red slash background against React Spectrum.                 | none           |
| React-Vs-Solid Comparison Harness Parity | complete | React fixture imports `@react-spectrum/s2/ColorSwatch`; Solid fixture imports public `@proyecto-viviana/solid-spectrum` ColorSwatch; both receive the same serialized route props and provider locale/theme. | none           |
| Known Defects And Regression Protection  | complete | Fixed and covered: legacy selectable swatch wrapper, missing `colorName`/ARIA reference props, missing transparent slash, no public ColorSwatch subpath, and no comparison controls/evidence.                | none           |
| Evidence And Handoff                     | complete | Commands below are green; `comparison:report:gaps` lists ColorSwatch as asserted visual evidence, and `comparison:report:exports` has no ColorSwatch root export gap.                                        | none           |

## Research

- React Spectrum S2 docs: ColorSwatch sections checked through the S2 skill/MCP.
- React Aria docs: ColorSwatch sections checked through the React Aria
  skill/MCP.
- Installed upstream source:
  - `apps/comparison/node_modules/@react-spectrum/s2/src/ColorSwatch.tsx`
  - React Aria Components `ColorSwatch.tsx` source in the installed package.
  - `apps/comparison/node_modules/@react-aria/color/src/useColorSwatch.ts`
- Source caveat resolved: S2 ColorSwatch is static and non-interactive.
  Selectable swatches and listbox item wrapping are ColorSwatchPicker work.

## Official Docs And Viewer Parity

| Docs item    | Official setting/example                                             | Route/control                                        | Status  |
| ------------ | -------------------------------------------------------------------- | ---------------------------------------------------- | ------- |
| Default      | Static swatch with `color` defaulting to a transparent fallback.     | Default route props, screenshot, DOM/style contract. | passing |
| Value        | `color` may be a string or color object; `colorName` overrides name. | `color`, `colorName`, explicit accessible-name test. | passing |
| Custom size  | `size` supports `XS`, `S`, `M`, and `L`.                             | `size`, browser geometry assertions.                 | passing |
| Rounding     | `rounding` supports `default`, `none`, and `full`.                   | `rounding`, browser computed-style assertions.       | passing |
| ARIA         | Label/reference props, id, and slot forward to the swatch element.   | Side-panel controls and DOM contract.                | passing |
| Viewer state | React and Solid examples use the same serialized props.              | `colorswatch-demo.ts`, fixtures, controls contract.  | passing |

## Source Map And Public Contract

| Layer               | Upstream files                           | Solid files                                                                 | Status                                                                                              |
| ------------------- | ---------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Color parsing       | React Stately color parsing              | `packages/solid-stately/src/color`                                          | Reused normalized color parsing and CSS serialization.                                              |
| ARIA hooks          | React Aria `useColorSwatch`              | `packages/solidaria/src/color/createColorSwatch.ts`, `types.ts`             | Matched generated ids, role, roledescription, labels, reference props, transparent name, and style. |
| Headless components | RAC `ColorSwatch`                        | `packages/solidaria-components/src/Color.tsx`                               | Matched context fallback, render props, DOM prop filtering, and style merging.                      |
| Styled S2           | `@react-spectrum/s2/src/ColorSwatch.tsx` | `packages/solid-spectrum/src/color/index.tsx`, `src/ColorSwatch.ts`, config | Matched public API, static semantics, size/rounding, border, checkerboard, slash, and export path.  |

## Behavior State Machine

| State/input       | Trigger                                  | Expected React                                                             | Expected Solid | Evidence                                             |
| ----------------- | ---------------------------------------- | -------------------------------------------------------------------------- | -------------- | ---------------------------------------------------- |
| Official default  | Route mount                              | 32px S2 swatch with generated color name plus route `aria-label`.          | Same.          | `colorswatch-visual.spec.ts`.                        |
| Custom name       | `colorName=Fire truck red`               | Accessible name is `Fire truck red, Background color`.                     | Same.          | Browser role-name assertion and package tests.       |
| ARIA references   | `id`, `aria-labelledby`, descriptions    | Swatch keeps explicit id, self-reference plus external label, refs/slot.   | Same.          | Browser DOM contract.                                |
| Size/rounding     | `size=XS&rounding=full`                  | 16px swatch with full rounding.                                            | Same.          | Browser computed geometry/style contract.            |
| Transparent slash | `color=` or omitted component color prop | Transparent swatch named `transparent` with red diagonal slash background. | Same.          | Browser screenshot/style contract and package tests. |
| Side controls     | Modeled comparison control event         | React and Solid update serialized props and rendered DOM from controls.    | Same.          | `modeled-controls-contract.spec.ts`.                 |

## Accessibility And I18n

- The swatch is non-interactive and exposes `role="img"` with the localized
  `aria-roledescription` from the color ARIA layer.
- The accessible name is the generated localized color name, or `colorName` when
  provided, composed with any `aria-label`.
- When `aria-labelledby` is provided, the swatch id is prepended to preserve the
  color-name label while adding external labels, matching React Aria.
- `aria-describedby`, `aria-details`, `id`, and `slot` are forwarded to the
  swatch element and compared in browser tests.
- Transparent/no-color fallback is named `transparent`, matching React Aria's
  localized transparent string in the tested locale.

## Style Source-To-Computed Parity

- S2 size maps to fixed 16/24/32/40px square swatches.
- S2 rounding maps to `default`, `none`, and `full` border radius variants.
- S2 border, box sizing, `forced-color-adjust`, and token-backed slash color
  are generated by the style macro and compared as computed browser styles.
- Non-transparent colors render as a solid color layer over the checkerboard
  alpha background.
- Transparent/no-color renders the S2 red diagonal slash with no checkerboard
  background.

## Known Defects And Regression Protection

| Finding source | Defect or risk                                                                                  | Class       | Blocking? | Regression evidence or owner                                                              |
| -------------- | ----------------------------------------------------------------------------------------------- | ----------- | --------- | ----------------------------------------------------------------------------------------- |
| Current pass   | Solid S2 ColorSwatch used the older selectable color swatch shape.                              | API bug     | no        | Replaced with static S2 wrapper; selectable behavior left to ColorSwatchPicker.           |
| Current pass   | Headless ARIA did not expose `colorName`, reference props, generated id composition, or `slot`. | a11y bug    | no        | ARIA/component tests and browser DOM contract.                                            |
| Current pass   | Transparent fallback did not render the S2 slash and name consistently.                         | style/a11y  | no        | Package transparent tests and browser screenshot/style contract.                          |
| Current pass   | Public package lacked a `./ColorSwatch` subpath and root context export.                        | export bug  | no        | Public subpath test and export report.                                                    |
| Current pass   | Comparison route had no ColorSwatch controls or asserted visual matrix evidence.                | harness bug | no        | `colorswatch-demo.ts`, controls contract, visual spec, manifest, and visual-state matrix. |

## Commands

- `vp test run packages/solidaria-components/test/Color.test.tsx packages/solid-spectrum/test/Color.test.tsx packages/solid-spectrum/test/ColorSwatch.test.tsx`
  - Passed: 3 test files, 80 tests.
- `vp run comparison:typecheck`
  - Passed: workspace package builds completed; Astro check reported 69 files,
    0 errors, 0 warnings, 0 hints.
- `vp run comparison:build`
  - Passed: workspace package builds completed; Astro built 70 static pages,
    including `/components/colorswatch/`.
- `vp exec --filter @proyecto-viviana/comparison playwright test e2e/colorswatch-visual.spec.ts e2e/modeled-controls-contract.spec.ts --grep ColorSwatch --reporter=line --workers=1`
  - Passed: 5 Chromium tests.
- `vp run comparison:report:gaps`
  - Passed: 69 official entries in the comparison app, 52 live on both sides,
    17 remaining gaps, 284 tracked states, 82 states with current React/Solid
    visual evidence, and 46 strict pair-diff states.
- `vp run comparison:report:exports`
  - Passed: 0 missing catalogue root exports; 35 remaining non-root/support
    S2 export gaps, none ColorSwatch-specific.
- `vp run check`
  - Passed after formatting generated CSS output: all 1661 files correctly
    formatted, no warnings or lint errors in 1510 files, root typecheck passed.
- `git diff --check`
  - Passed: no whitespace errors.

## Remaining Gaps

- Dedicated assistive-technology transcript capture remains process-wide
  tooling debt; this pass includes semantic DOM and browser parity assertions
  but not a screen-reader transcript.
- `ColorSwatchPicker` selectable swatches and `ColorWheel` remain separate
  component passes.
