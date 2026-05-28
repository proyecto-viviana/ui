# NumberField Validation Notes

Date: 2026-05-28
Status: accepted

## Target

- Component: NumberField
- Slug: `numberfield`
- Family or direct subcomponents: S2 `NumberField`, React Aria
  NumberField, Solidaria `NumberField`, `NumberFieldGroup`,
  `NumberFieldInput`, `NumberFieldIncrementButton`, and
  `NumberFieldDecrementButton`.
- Pass goal: accept NumberField under the current gate model using the live
  React/Solid comparison route, modeled S2 controls, source-to-computed style
  checks, value/stepper behavior evidence, and package-level headless/state
  coverage.

## Task Status

| Task                   | Status   | Evidence                                                                                             |
| ---------------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| 0 Research             | complete | S2 MCP docs, installed S2 source, Solid S2 source, Solidaria headless source, state and route tests. |
| 1 Baseline             | complete | Parity report gap was validation-note coverage plus a planned default visual matrix entry.           |
| 2 Route harness        | complete | `numberfield-demo.ts`, React/Solid fixtures, modeled controls, and visual spec are live.             |
| 3 Source map/API       | complete | S2 size/options API compared to Solid public props and route controls.                               |
| 4 Cross-layer audit    | complete | Value, min/max/step, description/error, required/invalid, disabled/read-only, and steppers covered.  |
| 5 Transitions          | complete | Typing, blur commit, increment/decrement, hover, press, and focus return covered in browser tests.   |
| 6 State                | complete | Solid state package covers controlled/uncontrolled value, constraints, and step transitions.         |
| 7 ARIA hooks           | complete | Spinbutton input, form states, labels/help/error, keyboard, and focus behavior covered.              |
| 8 Headless             | complete | Solidaria component tests cover field structure and NumberField button behavior.                     |
| 9 Styled S2            | complete | Default and invalid XL computed geometry and explicit pair-diff thresholds compare against React.    |
| 10 Runtime lifecycle   | complete | Controlled route value marker, focus stability, and no transient stepper blur/focusout covered.      |
| 11 Harness integrity   | complete | React fixture imports S2 directly; Solid fixture imports public Solid Spectrum API.                  |
| 12 Comparison evidence | complete | Focused package tests, NumberField visual spec, and modeled-controls contract pass.                  |
| 13 Acceptance          | complete | No NumberField-owned blockers remain.                                                                |

## Agent Workflow

No subagents were used for this component pass.

| Agent role | Files read                                                                                                                    | Files changed                                                                                                                   | Evidence added                                                                                            | Commands run                                                            | Blockers | Next owner |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | -------- | ---------- |
| main       | S2 docs/source, Solid S2/Headless/state source, React/Solid fixtures, demo data, component controls, visual matrix, e2e spec. | NumberField S2 wrapper API, web examples, NumberField visual spec, visual matrix, component notes README, this validation note. | Default visual/geometry browser evidence, S2-only size public surface, validation note and README update. | Focused NumberField package tests, Playwright visual, modeled controls. | none     | none       |

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

| Gate                                     | Outcome  | Evidence                                                                                                                                                                       | Blockers/owner |
| ---------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| Official Docs And Viewer Parity          | complete | S2 NumberField docs checked on 2026-05-28. Route models the visible S2 axes: label, value, placeholder, size, help/error text, min/max/step, stepper, and field states.        | none           |
| External Authority And Standards         | complete | React Aria NumberField owns spinbutton semantics, number formatting, keyboard increment/decrement, form state, and accessible name/description behavior.                       | none           |
| Upstream React Source Parity             | complete | Installed S2 source maps to Solid field layout, generated style macro branches, `hideStepper`, S/M/L/XL sizing, invalid icon, help text, unsafe/style props, and Provider.     | none           |
| Solid Idiomatic Implementation           | complete | Solid uses accessors for route props/theme/value, Solid split props, public wrapper import boundaries, and Solidaria state/headless primitives instead of React-style runtime. | none           |
| Accessibility And I18n                   | complete | Package/state tests cover spinbutton labeling, required/invalid/disabled/read-only states, keyboard, min/max/step, value formatting, and controlled value commits.             | none           |
| Behavior State Machine                   | complete | Browser tests cover default state, invalid required XL, controlled typing/blur, stepper click updates, hover states, press focus stability, and no transient focusout.         | none           |
| Style Source-To-Computed Parity          | complete | Default and invalid XL tests compare React/Solid geometry, colors, help spacing, stepper dimensions, icon sizes, and explicit pair-diff thresholds.                            | none           |
| React-Vs-Solid Comparison Harness Parity | complete | React imports `@react-spectrum/s2/NumberField`; Solid imports public Solid Spectrum; both serialize and render identical modeled route props and controlled value markers.     | none           |
| Known Defects And Regression Protection  | complete | Default visual matrix gap is closed; legacy NumberField-only `variant` and lower-case size aliases were removed from the Solid S2 public surface.                              | none           |
| Evidence And Handoff                     | complete | Focused package tests, NumberField Playwright spec, modeled-controls contract, parity audit, `vp check --fix`, and whitespace check are complete.                              | none           |

## Research

- S2 docs: NumberField MCP page checked on 2026-05-28. The public example
  imports `NumberField` from `@react-spectrum/s2/NumberField`, with documented
  value/defaultValue, `formatOptions`, `minValue`, `maxValue`, `step`,
  `hideStepper`, size `S | M | L | XL`, form states, Provider locale behavior,
  and style override props.
- Installed upstream source:
  `apps/comparison/node_modules/@react-spectrum/s2/src/NumberField.tsx`.
- Solid owner files:
  `packages/solid-spectrum/src/numberfield/index.tsx`,
  `packages/solidaria-components/test/NumberField.test.tsx`,
  `packages/solid-stately/test/createNumberFieldState.test.ts`, and
  `packages/solid-spectrum/test/NumberField.test.tsx`.
- Route owner files:
  `apps/comparison/src/data/numberfield-demo.ts`,
  `apps/comparison/src/data/component-controls.ts`,
  React/Solid styled fixtures, visual matrix, and
  `apps/comparison/e2e/numberfield-visual.spec.ts`.

## Official Docs And Viewer Parity

| Docs item        | Official setting/example                         | Route/control                                                               | Status  |
| ---------------- | ------------------------------------------------ | --------------------------------------------------------------------------- | ------- |
| Composition      | Single `NumberField` wrapper                     | React and Solid route render public component wrappers                      | passing |
| Controlled value | `value` plus change handler                      | Side-panel value input drives both panes and data marker                    | passing |
| Size             | `S`, `M`, `L`, `XL`, default `M`                 | Side-panel radio group in documented order                                  | passing |
| Step scale       | `minValue`, `maxValue`, `step`                   | Numeric controls drive both panes                                           | passing |
| Stepper          | `hideStepper` optional                           | Switch covers visible and hidden branches                                   | passing |
| Field states     | disabled, read-only, required, invalid           | Switches cover all field state props                                        | passing |
| Help/error       | `description` and `errorMessage`                 | Text controls drive default and invalid branches                            | passing |
| Styles           | S2 generated styles plus safe unsafe/style props | Wrapper keeps `styles`, `UNSAFE_className`, `UNSAFE_style`, and class alias | passing |

| Route control | Source surface     | Official values       | Route values          | Status  |
| ------------- | ------------------ | --------------------- | --------------------- | ------- |
| `size`        | S2 docs/API/source | `S`, `M`, `L`, `XL`   | `S`, `M`, `L`, `XL`   | matched |
| `hideStepper` | S2 docs/API/source | boolean, false        | switch, default false | matched |
| field states  | S2 docs/API/source | boolean branches      | switches              | matched |
| value scale   | RAC/S2 API         | number and step props | numeric controls      | matched |

## Source Map And Public Contract

| Layer               | Upstream files                                       | Solid files                                                                     | Status  |
| ------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------- | ------- |
| State               | React Aria/Stately NumberField state                 | `@proyecto-viviana/solid-stately` NumberField state                             | matched |
| ARIA hooks          | React Aria Components NumberField                    | `@proyecto-viviana/solidaria-components` NumberField family                     | matched |
| Headless components | `NumberField`, `Input`, stepper buttons, field group | Solidaria NumberField, label, group, input, increment, and decrement components | matched |
| Styled S2           | `@react-spectrum/s2/src/NumberField.tsx`             | `packages/solid-spectrum/src/numberfield/index.tsx`                             | matched |
| Comparison route    | Official docs plus installed S2 runtime              | Demo data, fixtures, controls, visual matrix, and NumberField e2e spec          | matched |

- Public props/defaults: `size='M'`, `hideStepper=false`, `value`,
  `defaultValue`, `onChange`, `placeholder`, `formatOptions`, `minValue`,
  `maxValue`, `step`, `label`, `description`, `errorMessage`, field state props,
  `labelPosition`, `labelAlign`, `necessityIndicator`, `styles`,
  `UNSAFE_className`, and `UNSAFE_style`.
- Fixed in this pass: Solid Spectrum NumberField no longer exposes the
  component-local legacy `variant` prop or lower-case `sm/md/lg` size aliases.
  Local web examples were updated to S2 `S/M/L/XL` sizes.

## Behavior State Machine

| State/input        | Trigger                   | Expected React                                             | Expected Solid | Status  | Evidence                         |
| ------------------ | ------------------------- | ---------------------------------------------------------- | -------------- | ------- | -------------------------------- |
| Docs default       | Route mount               | M field, value 5, description, visible steppers.           | Same.          | matched | Default visual and geometry.     |
| Invalid required   | Query `isInvalid=true`    | Error icon/message, invalid border, required semantics.    | Same.          | matched | Invalid XL visual and geometry.  |
| Controlled typing  | Fill input, blur          | Value marker commits edited number.                        | Same.          | matched | Browser interaction test.        |
| Increment button   | Click stepper             | Value increments by `step` and focus returns to input.     | Same.          | matched | Browser interaction test.        |
| Decrement button   | Mouse down/up on stepper  | Value decrements and no transient focusout is emitted.     | Same.          | matched | Focus stability browser test.    |
| Hover              | Hover each stepper button | Button background/color/cursor and icon size update.       | Same.          | matched | Hover browser contract.          |
| Min/max/step       | Package state transitions | Value constrains to min/max and steps by configured scale. | Same.          | matched | Solid state package tests.       |
| Disabled/read-only | Field state props         | Input and button behavior follows React Aria state.        | Same.          | matched | Headless/package route coverage. |

## Accessibility And I18n

| Surface                                              | Upstream/current React                                               | Solid | Status  | Evidence                                       |
| ---------------------------------------------------- | -------------------------------------------------------------------- | ----- | ------- | ---------------------------------------------- |
| Role/name/description/value                          | Spinbutton input is labeled and described by field text.             | Same. | matched | Headless tests and browser DOM contract.       |
| ARIA references and generated IDs                    | React Aria owns generated label/help/error relationships.            | Same. | matched | Package tests and route assertions.            |
| Keyboard and focus                                   | Arrow keys and stepper activation update value without blur loss.    | Same. | matched | Headless/state and browser focus tests.        |
| Disabled/read-only/required/invalid/hidden semantics | Field state props map to input/button state and ARIA attributes.     | Same. | matched | Package tests and invalid geometry assertions. |
| Form labels/help/error/reset/submit                  | Form owner props flow through React Aria NumberField.                | Same. | matched | Headless tests cover form state and labels.    |
| Live announcements and cleanup                       | No custom live region; route value marker reflects controlled state. | Same. | matched | Browser interaction tests.                     |
| Forced colors/reduced motion/contrast/target size    | S2 style macros own token and forced-colors branches.                | Same. | matched | Source-to-computed style checks.               |
| Locale/direction/formatting/messages                 | `formatOptions` and Provider locale extension are state-owned.       | Same. | matched | Solid state package formatting coverage.       |
| Multiple instances                                   | Generated ids and state stay instance-local.                         | Same. | matched | Package tests.                                 |

## Style Source-To-Computed

| Style branch       | Upstream declaration                                   | Solid owner                                   | Observable proof                                                    | Status  |
| ------------------ | ------------------------------------------------------ | --------------------------------------------- | ------------------------------------------------------------------- | ------- |
| Field layout       | S2 `field()` grid with label/input/help areas          | `numberFieldRoot`, label wrapper, help styles | Default and invalid geometry tests.                                 | matched |
| Group chrome       | S2 control, field input, focus ring, border/background | `numberFieldGroup` style macro                | Computed border/background/input color checks.                      | matched |
| Size               | S/M/L/XL field, button, icon, and gap branches         | size accessors and stepper style macros       | M default and XL invalid geometry; controls contract covers values. | matched |
| Stepper buttons    | S2 div-buttons with square aspect, gap, press scale    | Solidaria buttons plus `inputButton` styles   | Button/icon dimensions, hover, press, and focus stability.          | matched |
| Invalid affordance | Error icon and negative help color                     | `fieldErrorIcon` and invalid help branch      | Invalid XL geometry and color assertions.                           | matched |
| Unsafe/style props | `styles`, `UNSAFE_className`, `UNSAFE_style`           | wrapper merge and allowed style overrides     | Public contract/source map.                                         | matched |

## Known Defects And Regression Protection

| Finding source       | Defect or risk                                                                       | Class      | Blocking? | Regression evidence or owner                                                     |
| -------------------- | ------------------------------------------------------------------------------------ | ---------- | --------- | -------------------------------------------------------------------------------- |
| Current audit        | Default visual matrix entry was still planned even though the route was live.        | evidence   | fixed     | Added default visual and geometry tests; matrix now points at NumberField spec.  |
| Current audit        | Solid wrapper exposed NumberField-only legacy `variant` and `sm/md/lg` size aliases. | API parity | fixed     | Public type/export and local examples now use S2 `S/M/L/XL` only.                |
| Existing route pass  | Broad screenshot threshold can hide geometry drift.                                  | style risk | no        | Computed geometry/color assertions check the exact default and invalid branches. |
| Existing route pass  | Stepper press can steal focus or emit transient blur/focusout.                       | behavior   | no        | Browser focus-stability test asserts active input and empty focusout event log.  |
| Cross-component pass | Provider/default theme changes can alter token output.                               | style risk | no        | Browser computed style checks compare current React Spectrum under pinned theme. |

## Evidence

- `vp test run packages/solid-spectrum/test/NumberField.test.tsx packages/solidaria-components/test/NumberField.test.tsx packages/solid-stately/test/createNumberFieldState.test.ts`
  - focused NumberField package, headless, and state tests passed: 92 tests.
- `vp exec --filter @proyecto-viviana/comparison playwright test e2e/numberfield-visual.spec.ts --reporter=line`
  - NumberField browser visual/geometry/interaction tests passed: 6 tests.
- `vp exec --filter @proyecto-viviana/comparison playwright test e2e/modeled-controls-contract.spec.ts --grep NumberField --reporter=line`
  - modeled NumberField controls contract passed: 1 test.
- `vp exec --filter @proyecto-viviana/comparison tsx scripts/report-component-parity.ts`
  - NumberField no longer appears in missing validation-note coverage; remaining
    missing notes are Picker, RadioGroup, SearchField, Switch, TextArea, and
    TextField.
- `vp check --fix`
  - formatting and lint checks passed.
- `git diff --check`
  - no whitespace errors.

## Blockers

| Label | Gate | Blocker | Owner/next action |
| ----- | ---- | ------- | ----------------- |
| none  | none | none    | none              |

## Handoff

- Status after this pass: accepted as of 2026-05-28.
- Next component-pass candidates from missing-note coverage: Picker,
  RadioGroup, SearchField, Switch, TextArea, and TextField.
