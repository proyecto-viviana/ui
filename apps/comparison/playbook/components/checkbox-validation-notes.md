# Checkbox Validation Notes

Updated: 2026-05-21

## Target

- Component: Checkbox
- Slug: checkbox
- Family or direct subcomponents: Checkbox, CheckboxContext, React Aria
  checkbox input behavior, Form validation inheritance, CheckboxGroup item
  participation
- Pass goal: accept Checkbox under the current full gate model with parity for
  public API/defaults, form validation behavior, controlled/uncontrolled
  selection, indeterminate state, hover/focus-visible/pressed styling, disabled,
  read-only, invalid, required, side-panel controls, and source-backed S2
  styling.

## Task Status

| Task                   | Status  | Evidence                                                                                                                                   |
| ---------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 0 Research             | passing | S2 MCP Checkbox page; React Aria MCP Checkbox and CheckboxGroup pages; installed React Spectrum S2 and RAC source.                         |
| 1 Baseline             | passing | `comparison:report:gaps`, `comparison:report:exports`, existing Checkbox route/tests.                                                      |
| 2 Route harness        | passing | `apps/comparison/e2e/checkbox-visual.spec.ts`, `e2e/modeled-controls-contract.spec.ts`.                                                    |
| 3 Source map/API       | passing | Upstream `@react-spectrum/s2/src/Checkbox.tsx`, `exports/Checkbox.ts`, RAC private Checkbox source; Solid owner files listed below.        |
| 4 Cross-layer audit    | passing | Standalone Checkbox, Checkbox inside group, headless hook/state, component wrapper, and styled S2 branches mapped.                         |
| 5 Transitions          | passing | Browser hover/focus gate waits for settled computed styles before React/Solid comparison.                                                  |
| 6 State                | passing | `createCheckboxGroupState` default validation behavior and grouped item metadata covered.                                                  |
| 7 ARIA hooks           | passing | `createCheckbox`, `createCheckboxGroup`, and `createCheckboxGroupItem` tests cover native/ARIA validation and first-render group metadata. |
| 8 Headless             | passing | `solidaria-components` Checkbox/CheckboxGroup tests cover Form inheritance and public component composition.                               |
| 9 Styled S2            | passing | `solid-spectrum` tests and browser geometry cover S2 classes, icon, box, color, focus, hover, and press branches.                          |
| 10 Runtime lifecycle   | passing | Group metadata updates synchronously for first render and reactively after prop changes.                                                   |
| 11 Harness integrity   | passing | Same serialized route props, same provider/theme, public imports, no component CSS patches.                                                |
| 12 Comparison evidence | passing | Focused package tests, comparison build, and focused Playwright gate listed below.                                                         |
| 13 Acceptance          | passing | Checkbox accepted under the current full gate model; CheckboxGroup remains separately owned.                                               |

## Gate Outcome Summary

| Gate                                     | Outcome | Evidence                                                                                                                                                                                                                                                       |
| ---------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Official Docs And Viewer Parity          | passing | S2 Checkbox docs expose Selection, Forms, and API; route controls cover selection source, size, label, indeterminate, emphasized, required, validation behavior, form props, disabled, read-only, and invalid state.                                           |
| External Authority And Standards         | passing | React Aria Checkbox/CheckboxGroup docs and RAC source define native input, label, group, form, validation, and indeterminate semantics.                                                                                                                        |
| Upstream React Source Parity             | passing | S2 source wraps RAC Checkbox, exports `CheckboxContext`, merges Form props, uses `inputRef`, and styles wrapper/box/icon through S2 macros; Solid mirrors those public branches.                                                                               |
| Solid Idiomatic Implementation           | passing | Solid props remain accessor-backed, context and slot props are merged lazily, refs use Solid callbacks, and group metadata is reactive.                                                                                                                        |
| Accessibility And I18n                   | passing | Native checkbox input, accessible name, checked/indeterminate state, required/native vs ARIA validation, invalid/read-only/disabled state, form props, label/keyboard/touch activation, and no component-local strings.                                        |
| Behavior State Machine                   | passing | Controlled `isSelected`, uncontrolled `defaultSelected`, click, label click, Space, touch press, disabled/read-only suppression, group participation, and form validation defaults covered.                                                                    |
| Style Source-To-Computed Parity          | passing | Browser assertions compare current React Spectrum and Solid computed root color, box background/border/shadow/outline, icon sizing/centerline, baseline, selected XL, indeterminate, invalid, disabled/read-only, hover, focus-visible, and pressed transform. |
| React-Vs-Solid Comparison Harness Parity | passing | React fixture imports current `@react-spectrum/s2` Checkbox; Solid fixture imports public `@proyecto-viviana/solid-spectrum`; both receive identical route props and provider/theme conditions.                                                                |
| Known Defects And Regression Protection  | passing | Four defects fixed and covered: default validation behavior, Form validation inheritance, first-render grouped metadata, and transition-settled hover/focus computed style sampling.                                                                           |
| Evidence And Handoff                     | passing | Commands below are green; remaining assistive-technology transcript debt is process-wide and does not hide a known Checkbox bug.                                                                                                                               |

## Research

- React Spectrum S2 docs: Checkbox page sections are Selection, Forms, API.
- React Aria docs: Checkbox page sections are Vanilla CSS example, Tailwind
  example, Selection, Forms, API.
- React Aria docs: CheckboxGroup page sections are Vanilla CSS example,
  Tailwind example, Value, Forms, API.
- Installed upstream source:
  - `apps/comparison/node_modules/@react-spectrum/s2/src/Checkbox.tsx`
  - `apps/comparison/node_modules/@react-spectrum/s2/exports/Checkbox.ts`
  - `apps/comparison/node_modules/react-aria-components/dist/private/Checkbox.mjs`
  - `apps/comparison/node_modules/@react-stately/checkbox/dist/useCheckboxGroupState.mjs`
- Source disagreement resolved: RAC and current React Spectrum default
  `validationBehavior` to `native`; Solid previously defaulted standalone and
  grouped Checkbox paths to `aria`, which was a port bug.

## Official Docs And Viewer Parity

| Docs item    | Official setting/example                                                                     | Route/control                                                               | Status  |
| ------------ | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------- |
| Selection    | Checkbox supports selected and default selected state.                                       | `isSelected`, `defaultSelected`, and `selectionSource`.                     | passing |
| Forms        | Checkbox participates in forms with name/value/form and required validation behavior.        | `name`, `value`, `form`, `isRequired`, `validationBehavior`.                | passing |
| API          | Size, emphasized, disabled, read-only, invalid, indeterminate, context, refs, and DOM props. | Side-panel controls and package tests.                                      | passing |
| Viewer state | React and Solid examples use the same serialized route props and provider theme.             | `checkbox-demo.ts`, React/Solid styled fixtures, modeled-controls contract. | passing |

## Source Map And Public Contract

| Layer               | Upstream files                                                                          | Solid files                                                                                                 | Status                                                                                                                                     |
| ------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| State               | `react-stately/useCheckboxGroupState`                                                   | `packages/solid-stately/src/checkbox/createCheckboxGroupState.ts`                                           | matched default validation behavior and grouped selection state.                                                                           |
| ARIA hooks          | `react-aria/useCheckbox`, `react-aria/useCheckboxGroup`, RAC private Checkbox source    | `packages/solidaria/src/checkbox/createCheckbox.ts`, `createCheckboxGroup.ts`, `createCheckboxGroupItem.ts` | matched native/ARIA validation, form/name propagation, indeterminate, and first-render group metadata.                                     |
| Headless components | `react-aria-components` Checkbox and CheckboxGroup                                      | `packages/solidaria-components/src/Checkbox.tsx`                                                            | matched Form validation inheritance, children splitting, description/error props, group state props, and standalone Checkbox behavior.     |
| Styled S2           | `@react-spectrum/s2/src/Checkbox.tsx`, `exports/Checkbox.ts`, generated S2 Checkbox CSS | `packages/solid-spectrum/src/checkbox/index.tsx`, tests, generated CSS                                      | matched public `Checkbox` and `CheckboxContext`, S2 wrapper/box/icon classes, size, emphasis, focus ring, hover, and press-scale branches. |

## Behavior State Machine

| State/input                   | Expected React                                                                          | Expected Solid | Evidence                                                                      |
| ----------------------------- | --------------------------------------------------------------------------------------- | -------------- | ----------------------------------------------------------------------------- |
| Unchecked default             | native input unchecked, no required unless requested, S2 default box/text color.        | same           | default screenshot and geometry test.                                         |
| Controlled selected           | `isSelected` controls checked state and selected data attrs.                            | same           | selected emphasized XL geometry and click test.                               |
| Uncontrolled default selected | `defaultSelected` initializes checked state, later clicks update DOM state.             | same           | `defaultSelected initializes uncontrolled value and form props`.              |
| Required default              | omitted or explicit native validation sets `required=true` and no `aria-required`.      | same           | `required default and native validation match React Spectrum`; package tests. |
| Explicit ARIA validation      | `required=false`, `aria-required=true`.                                                 | same           | defaultSelected/form test; package tests.                                     |
| Indeterminate                 | input `indeterminate=true`, `data-indeterminate`, dash icon, selected visual box.       | same           | indeterminate emphasized XL browser test.                                     |
| Hover/focus-visible           | hover/focus attrs and settled S2 color/shadow/outline tokens match.                     | same           | transition-settled hover/focus browser test.                                  |
| Disabled/read-only/invalid    | invalid styling matches; disabled/read-only suppress hover/press/toggle as upstream.    | same           | side-panel inactive states and pressed-transform tests.                       |
| Grouped item                  | group name/form/validation/required metadata reaches child on first render and updates. | same           | Solidaria and component package tests.                                        |

## Accessibility And I18n

- Native `input[type=checkbox]` is preserved for standalone and grouped paths.
- Accessible name comes from label children; label click and Space toggle are
  covered.
- `aria-checked`, input `checked`, and `indeterminate` are asserted against
  current React Spectrum.
- Required, invalid, disabled, read-only, name/value/form, and native vs ARIA
  validation branches are asserted.
- Form validation inheritance from `FormContext` is covered for standalone
  Checkbox and CheckboxGroup.
- No component-local messages require localization in this pass.
- Forced-colors behavior is inherited from S2 source classes; a dedicated
  forced-colors browser row remains process-wide visual coverage debt.

## Style Source-To-Computed Parity

- Upstream S2 source uses wrapper `transition: colors`, `baseColor('neutral')`
  text color, focus ring, control border radius/size, S2 box background and
  border tokens, icon fill tokens, and `pressScale`.
- Solid S2 Checkbox uses the same generated S2 macro path and public
  `@proyecto-viviana/solid-spectrum` component import in the comparison route.
- Browser assertions compare root color, box background, box border color, box
  shadow, outline color/style/width/offset, root height, box size, centerline,
  icon dimensions, icon centerline, and press transform.
- Hover/focus evidence waits for computed styles to settle before comparison so
  transient transition frames are not counted as parity failures.
- Comparison app CSS remains shell-only for this component; no Checkbox-specific
  app CSS patch is used.

## Known Defects And Regression Protection

| Defect                                                                                      | Fix                                                                                                                                       | Regression evidence                                                       |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Solid defaulted Checkbox validation to `aria` while RAC/React Spectrum default to `native`. | Changed standalone hook, group state, group hook metadata, and group item fallback to `native`.                                           | Solidaria, component, solid-spectrum, and browser required/default tests. |
| Standalone Checkbox and CheckboxGroup did not inherit `FormContext.validationBehavior`.     | Added form-aware validation behavior proxy before `splitProps`.                                                                           | Component and solid-spectrum Form inheritance tests.                      |
| CheckboxGroup item metadata could be stale or missing on first render.                      | Store group metadata synchronously, then keep it reactive with `createEffect`; pass name/form/validate/validation props into group state. | Solidaria grouped item tests and component group required tests.          |
| Hover/focus visual gate sampled React during a transition frame.                            | Added stable computed-geometry polling before comparing React and Solid hover/focus state.                                                | Focused hover/focus Playwright test and full Checkbox visual gate.        |

## Commands

- `vp test run packages/solidaria/test/createCheckboxGroup.test.tsx packages/solid-stately/test/createCheckboxGroupState.test.ts packages/solidaria-components/test/Checkbox.test.tsx packages/solid-spectrum/test/Checkbox.test.tsx`
  - `4` files, `146` tests passed.
- `vp run comparison:build`
  - comparison build produced `70` static pages including
    `/components/checkbox/index.html`.
- `COMPARISON_BASE_URL=http://127.0.0.1:4322 vp exec --filter @proyecto-viviana/comparison playwright test e2e/checkbox-visual.spec.ts e2e/modeled-controls-contract.spec.ts --grep Checkbox --reporter=line --workers=1`
  - `12` browser tests passed after running outside the sandbox because
    Chromium launch hit `sandbox_host_linux.cc:41 shutdown: Operation not
permitted`.
- `vp run comparison:report:gaps`
  - report passed; `69` official entries tracked, `47` live on both sides,
    `22` missing/gap, `272` official visual states tracked.
- `vp run comparison:report:exports`
  - report passed; `46` React S2 value exports remain missing from
    `solid-spectrum`, all non-root/support exports.
- `vp run guard:rac-export-gap`
  - report passed; `0` missing `solidaria-components` named exports.
- `vp run check`
  - formatting, lint, and typecheck passed after `vp check --fix` formatted the
    new Markdown note.

## Remaining Gaps

- CheckboxGroup remains a separate component pass even though this pass fixed
  and tested the grouped item contracts needed by standalone Checkbox.
- Dedicated assistive-technology transcript capture is still process-wide
  tooling debt; this pass includes semantic DOM and keyboard assertions but not
  a screen-reader transcript.
