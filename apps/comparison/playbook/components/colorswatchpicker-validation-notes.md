# ColorSwatchPicker Validation Notes

Date: 2026-05-22
Status: accepted

## Target

- Component: ColorSwatchPicker
- Slug: `colorswatchpicker`
- Family or direct subcomponents: `ColorSwatchPicker`, `ColorSwatch`,
  `ColorSwatchPickerContext`, `ColorSwatchPickerItem`, `createColorSwatchPicker`,
  `createColorSwatchPickerItem`, and the public
  `@proyecto-viviana/solid-spectrum/ColorSwatchPicker` subpath.
- Pass goal: accept ColorSwatchPicker under the full gate model with parity for
  the official S2 child-composition API, controlled and default selection,
  density, size, rounding, listbox/option semantics, ARIA references, S2
  selected overlay styling, route controls, and public package exports.

## Task Status

| Task                   | Status   | Evidence                                                                                                                  |
| ---------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| 0 Research             | complete | React Spectrum S2 ColorSwatchPicker docs and React Aria ColorSwatchPicker docs checked through skills/MCP.                |
| 1 Baseline             | complete | Prior ColorSwatch work separated static swatch display from selectable picker behavior and exposed the missing route gap. |
| 2 Route harness        | complete | `apps/comparison/e2e/colorswatchpicker-visual.spec.ts` and `e2e/modeled-controls-contract.spec.ts`.                       |
| 3 Source map/API       | complete | S2 picker API and React Aria listbox/item API mapped to Solid owner files.                                                |
| 4 Cross-layer audit    | complete | Headless picker, styled wrapper, child swatch wrapping, fixtures, controls, reports, and package exports mapped.          |
| 5 Transitions          | complete | Default, controlled value, defaultValue, density, size, rounding, ARIA references, and click selection covered.           |
| 6 State                | complete | Existing Solid color state parsing and listbox selection state reused; value update paths are covered in tests.           |
| 7 ARIA hooks           | complete | `packages/solidaria-components/src/Color.tsx` and headless color tests cover listbox/item semantics.                      |
| 8 Headless             | complete | Headless picker forwards id, slot, ARIA refs, selected/default state, disabled items, and keyboard skipping.              |
| 9 Styled S2            | complete | `packages/solid-spectrum/src/color/ColorSwatchPicker.tsx`, child wrapping context, public subpath, and package tests.     |
| 10 Runtime lifecycle   | complete | Controlled/default route state, generated ids, provider locale/theme, and reactive child swatch colors audited.           |
| 11 Harness integrity   | complete | React imports real S2 ColorSwatchPicker; Solid imports public S2 wrapper and ColorSwatch children.                        |
| 12 Comparison evidence | complete | Focused package tests, comparison typecheck/build, Playwright visual/control gates, reports, root check, and diff check.  |
| 13 Acceptance          | complete | All component gates passed; checkpoint is ready for commit.                                                               |

## Agent Workflow

No subagents were used for this component pass.

| Agent role | Files read                                                                                           | Files changed                                                                                                                                                             | Evidence added                                                                                                                  | Commands run                                                                                            | Blockers | Next owner |
| ---------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------- | ---------- |
| main       | S2/React Aria docs through MCP/skills; color state/headless/styled tests; comparison fixtures/gates. | Headless ColorSwatchPicker props, Solid Spectrum picker wrapper/public exports, package tests, comparison route data/controls/fixtures, manifest/matrix, Playwright spec. | API controls, child-composition tests, controlled/default selection tests, computed listbox/item/overlay contracts, gate notes. | Focused unit tests, comparison typecheck/build, Playwright, reports, root check, and diff check passed. | none     | main       |

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

| Gate                                     | Outcome  | Evidence                                                                                                                                                                                                                                                                | Blockers/owner |
| ---------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| Official Docs And Viewer Parity          | complete | S2 ColorSwatchPicker docs checked on 2026-05-22. Route controls cover `value`, `defaultValue`, `density`, `size`, `rounding`, ARIA labelling/details, `id`, and `slot`; children use documented `ColorSwatch` composition.                                              | none           |
| External Authority And Standards         | complete | React Aria docs define listbox/option semantics, controlled/default value, ARIA reference props, disabled item support, and grid layout behavior; headless and browser tests assert those contracts.                                                                    | none           |
| Upstream React Source Parity             | complete | Solid follows S2's public picker surface and uses lower-level React Aria item semantics only as an internal/compatibility mechanism.                                                                                                                                    | none           |
| Solid Idiomatic Implementation           | complete | Provider/context values remain accessor-backed; child swatches are wrapped through Solid context without stale color/rounding captures; route fixtures use signals and cleanup.                                                                                         | none           |
| Accessibility And I18n                   | complete | Browser contracts compare role `listbox`, option count, selected option, generated or explicit ids, `aria-label`, `aria-labelledby`, `aria-describedby`, and `aria-details`; S2 `slot` is consumed for context and does not render to the DOM, matching React Spectrum. | none           |
| Behavior State Machine                   | complete | Unit and browser tests cover uncontrolled defaultValue, controlled value stability, onChange selection updates, keyboard disabled-item skip, density/size/rounding transitions, and route-control updates.                                                              | none           |
| Style Source-To-Computed Parity          | complete | Browser contract compares S2 flex/wrap/gap layout, 16/24/32/40 child swatch sizing via the shared ColorSwatch wrapper, item border radius, selected overlay border/outline, and screenshot pair evidence.                                                               | none           |
| React-Vs-Solid Comparison Harness Parity | complete | React fixture imports `@react-spectrum/s2/ColorSwatchPicker`; Solid fixture imports public `@proyecto-viviana/solid-spectrum` wrappers; both receive the same serialized route props and provider locale/theme.                                                         | none           |
| Known Defects And Regression Protection  | complete | Fixed and covered: missing public picker wrapper/subpath, S2 ColorSwatch child composition, missing headless `id`/`slot`/`aria-details`, controlled value parity, and missing comparison route controls.                                                                | none           |
| Evidence And Handoff                     | complete | Final comparison typecheck/build/Playwright/report/check commands passed on 2026-05-22.                                                                                                                                                                                 | none           |

## Research

- React Spectrum S2 docs: ColorSwatchPicker page sections checked through the
  S2 skill/MCP.
- React Aria docs: ColorSwatchPicker page sections checked through the React
  Aria skill/MCP.
- Relevant public API:
  - `ColorSwatchPicker` renders `ColorSwatch` children.
  - `value`, `defaultValue`, and `onChange` define controlled/default selection.
  - `density`, `size`, and `rounding` are S2 styling controls.
  - `slot`, `styles`, `UNSAFE_className`, and `UNSAFE_style` are public S2
    surface area.
  - React Aria supplies listbox/option semantics and ARIA reference props.

## Official Docs And Viewer Parity

| Docs item    | Official setting/example                                                                 | Route/control                                                  | Status  |
| ------------ | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------- |
| Composition  | `<ColorSwatchPicker><ColorSwatch /></ColorSwatchPicker>`.                                | React/Solid fixtures render the same seven child swatches.     | passing |
| Value source | Controlled `value` and uncontrolled `defaultValue`.                                      | `valueSource`, `value`, `defaultValue`, controlled click test. | passing |
| Density      | `compact`, `regular`, `spacious`.                                                        | `density`, browser computed gap contract.                      | passing |
| Size         | `XS`, `S`, `M`, and `L`.                                                                 | `size`, browser child swatch geometry assertions.              | passing |
| Rounding     | `none`, `default`, and `full`.                                                           | `rounding`, browser item/swatch border-radius assertions.      | passing |
| ARIA         | Label/reference props and id forward to listbox; S2 `slot` is consumed for context only. | Side-panel controls and browser DOM contract.                  | passing |
| Viewer state | React and Solid examples use the same serialized props.                                  | `colorswatchpicker-demo.ts`, fixtures, controls contract.      | passing |

## Source Map And Public Contract

| Layer              | Upstream behavior                         | Solid files                                                                                     | Status                                                                                                   |
| ------------------ | ----------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Color parsing      | React Stately color values                | `packages/solid-stately/src/color`                                                              | Reused normalized color parsing and CSS serialization for picker values.                                 |
| ARIA/headless      | React Aria ColorSwatchPicker listbox/item | `packages/solidaria-components/src/Color.tsx`                                                   | Matched listbox props, generated/explicit ids, ARIA references, slot, selection, disabled skip behavior. |
| Styled S2          | S2 ColorSwatchPicker and ColorSwatch      | `packages/solid-spectrum/src/color/ColorSwatchPicker.tsx`, `src/color/index.tsx`, public config | Matched public S2 API, child composition, picker density, swatch size/rounding inheritance, overlay.     |
| Comparison harness | Official React Spectrum reference stack   | `apps/comparison/src/components/*/fixtures/styled.*`, `src/data/*`, `e2e/*`                     | Added live route, controls, state matrix, and browser parity tests.                                      |

## Behavior State Machine

| State/input      | Trigger                                | Expected React                                                          | Expected Solid | Evidence                                             |
| ---------------- | -------------------------------------- | ----------------------------------------------------------------------- | -------------- | ---------------------------------------------------- |
| Official default | Route mount                            | Seven-swatch listbox, first option selected.                            | Same.          | `colorswatchpicker-visual.spec.ts`.                  |
| Default value    | `defaultValue=#3b82f6`                 | Blue swatch selected without controlled prop.                           | Same.          | Browser density/size/rounding route.                 |
| Controlled value | `valueSource=value&value=#e11d48`      | Selection follows owner value until onChange.                           | Same.          | Browser controlled click test and package tests.     |
| Picker styling   | `density`, `size`, `rounding` controls | Gap, child swatch size, item/swatch rounding match.                     | Same.          | Browser computed style contract.                     |
| ARIA references  | `id`, `aria-labelledby`, refs, `slot`  | Listbox keeps explicit id and reference props; S2 slot is context-only. | Same.          | Browser DOM contract and headless tests.             |
| Disabled item    | Headless item disabled state           | Disabled option is inert and keyboard skips it.                         | Same.          | `packages/solidaria-components/test/Color.test.tsx`. |
| Side controls    | Modeled comparison control event       | React and Solid update serialized props and DOM.                        | Same.          | `e2e/modeled-controls-contract.spec.ts`.             |

## Accessibility And I18n

- The picker root is a `role="listbox"` and each swatch choice is a
  `role="option"` with `aria-selected`.
- `aria-label`, `aria-labelledby`, `aria-describedby`, and `aria-details` are
  forwarded to the listbox root and compared against React Spectrum.
- Explicit `id` is forwarded to the listbox root; S2 `slot` is consumed for
  context lookup and intentionally does not render as a DOM slot, matching
  React Spectrum.
- Color swatches retain their `role="img"` color names through the existing
  ColorSwatch ARIA implementation and are counted in browser contracts.
- Keyboard and disabled option behavior remain in the headless component test
  layer, where lower-level item APIs are public.
- No new component-local strings require translation beyond color names from
  child ColorSwatches and React Aria's color/i18n layer.

## Style Source-To-Computed Parity

- Picker density maps to S2 flex gap variants for compact, regular, and
  spacious spacing.
- Child swatch size maps to fixed 16/24/32/40px squares through inherited picker
  context.
- Picker rounding maps to item and child swatch border radius variants.
- Selected state renders the S2 absolute overlay with token-backed border and
  outline while leaving pointer events disabled.
- Browser assertions compare computed layout, item styling, swatch geometry,
  selected overlay styling, and a screenshot pair against React Spectrum.

## Known Defects And Regression Protection

| Finding source | Defect or risk                                                                             | Class        | Blocking? | Regression evidence or owner                                                           |
| -------------- | ------------------------------------------------------------------------------------------ | ------------ | --------- | -------------------------------------------------------------------------------------- |
| Current pass   | Solid S2 lacked a public ColorSwatchPicker wrapper and package subpath.                    | API bug      | no        | Public export/subpath tests and export config.                                         |
| Current pass   | Static ColorSwatch children were not automatically wrapped as picker options.              | API bug      | no        | Child-composition unit test and browser option/swatch count contract.                  |
| Current pass   | Headless picker did not forward explicit `id`, `slot`, or `aria-details`.                  | a11y bug     | no        | Headless DOM prop forwarding tests and browser contract.                               |
| Current pass   | Controlled value behavior could drift from React Spectrum's owner-value contract.          | behavior bug | no        | Unit controlled-value test and browser controlled click test.                          |
| Current pass   | Comparison app had no picker controls, live route, visual matrix, or gate notes.           | harness bug  | no        | Demo data, controls, fixtures, manifest, visual matrix, Playwright spec.               |
| Browser gate   | Solid S2 rendered `slot` on the listbox DOM while React S2 strips it after context lookup. | parity bug   | no        | Wrapper strips DOM `slot`; browser contract asserts both sides render no listbox slot. |

## Commands

- `vp test run packages/solidaria-components/test/Color.test.tsx packages/solid-spectrum/test/ColorSwatchPicker.test.tsx packages/solid-spectrum/test/ColorSwatch.test.tsx`
  - Passed: 3 test files, 89 tests.
- `vp run comparison:typecheck`
  - Passed: Astro check result was 70 files, 0 errors, 0 warnings, 0 hints.
- `vp run comparison:build`
  - Passed: comparison app built 70 pages, including `/components/colorswatchpicker/`.
- `vp exec --filter @proyecto-viviana/comparison playwright test e2e/colorswatchpicker-visual.spec.ts e2e/modeled-controls-contract.spec.ts --grep ColorSwatchPicker --reporter=line --workers=1`
  - Passed: 5 browser tests, including default visual parity,
    density/size/rounding controls, controlled click behavior, DOM/ARIA refs,
    and modeled side-panel controls.
- `vp run comparison:report:gaps`
  - Passed: 69 official catalogue entries, 53 live on both sides,
    ColorSwatchPicker styled default state asserted, 16 known missing/gap
    official entries remain unrelated to this pass.
- `vp run comparison:report:exports`
  - Passed: 0 missing catalogue root exports; remaining missing exports are
    non-root/support S2 exports already tracked by the report.
- `vp run check:fix`
  - Applied formatting after the first root check reported formatting issues.
- `vp run check`
  - Passed: all 1666 checked files formatted, no lint warnings/errors across
    1514 files, root TypeScript no-emit check passed.
- `git diff --check`
  - Passed.

## Remaining Gaps

- Dedicated assistive-technology transcript capture remains process-wide
  tooling debt; this pass includes semantic DOM, keyboard, and browser parity
  assertions but not a screen-reader transcript.
