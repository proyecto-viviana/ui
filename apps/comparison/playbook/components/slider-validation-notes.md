# Slider Validation Notes

Updated: 2026-05-20

## Target

- Component: Slider
- Slug: slider
- Family or direct subcomponents: Slider, SliderContext, React Aria slider
  input behavior, FieldLabel, ContextualHelp wiring
- Pass goal: close the current comparison-route caveat by covering controlled
  and default values, value formatting, fill offset, label placement,
  emphasized/size/track/thumb styling, form wiring, disabled inheritance,
  contextual help wiring, keyboard changes, route controls, and support export
  parity against current React Spectrum S2.

## Gate Matrix

| Gate                                     | Status  | Evidence                                                                                                                                            | Notes                                                                                                                                                                                                                                    |
| ---------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Official Docs And Viewer Parity          | passing | S2 MCP `Slider` page, React Aria MCP `Slider` page, `apps/comparison/src/data/component-controls.ts`, `apps/comparison/src/data/slider-demo.ts`.    | Viewer now drives controlled/default value source, `defaultValue`, `fillOffset`, label position/alignment, `name`, `form`, `contextualHelp`, value bounds, step, size, track/thumb style, emphasis, and disabled state into both stacks. |
| External Authority And Standards         | passing | React Aria Slider docs and installed React Spectrum S2 source.                                                                                      | The Solid component keeps React Aria's slider role/input model, keyboard adjustment semantics, hidden range input form participation, and localized output formatting.                                                                   |
| Upstream React Source Parity             | passing | Installed `@react-spectrum/s2/src/Slider.tsx`, `@react-spectrum/s2/exports/Slider.ts`, Solid source `packages/solid-spectrum/src/slider/index.tsx`. | Solid now matches S2's wrapper shape for `SliderContext`, form props, provider props, label/contextual help composition, `fillOffset`, RTL-aware fill positioning, and output width derived from localized number formatting.            |
| Solid Idiomatic Implementation           | passing | `packages/solid-spectrum/src/slider/index.tsx`, `packages/solidaria-components/src/Slider.tsx`, package tests.                                      | Context and local props merge through getters, refs merge without taking ownership from callers, and the headless Solidaria slider exposes the root ref needed by the S2 wrapper.                                                        |
| Accessibility And I18n                   | passing | Package tests and browser assertions in `e2e/slider-visual.spec.ts`.                                                                                | Covered labelled slider semantics, keyboard ArrowRight updates, hidden range input name/form forwarding, disabled inheritance from `Form`, localized output width calculation, and RTL-aware `fillOffset` style selection.               |
| Behavior State Machine                   | passing | `packages/solid-spectrum/test/Slider.test.tsx`, `e2e/slider-visual.spec.ts`, `e2e/modeled-controls-contract.spec.ts`.                               | Covered controlled `value`, uncontrolled `defaultValue`, keyboard update, route-control resets, form prop pass-through, form disabled inheritance, context default props, context styles/classes, context refs, and disabled state.      |
| Style Source-To-Computed Parity          | passing | Solid S2 style source, shared generated CSS, visual assertions for default, emphasized XL thick precise, default value, and fill offset states.     | Browser proof compares current Solid rendering against current React Spectrum for root dimensions, label/output placement, track/thumb/fill geometry, emphasized size styling, and fill offset movement.                                 |
| React-Vs-Solid Comparison Harness Parity | passing | React/Solid styled fixtures, shared serialized route props, component controls, visual-state matrix.                                                | Both fixtures import public APIs, receive the same serialized demo props, serialize the same route state, and render matching controlled/default, label, contextual help, name/form, fill offset, and keyboard branches.                 |
| Evidence And Handoff                     | passing | Focused commands listed below.                                                                                                                      | Slider is accepted for this component pass; remaining gaps are listed below.                                                                                                                                                             |

## Fixed In This Pass

- Exported `SliderContext` from solid-spectrum and merged context props,
  `styles`, `UNSAFE_className`, `UNSAFE_style`, and refs into the root slider.
- Added root ref forwarding to the headless Solidaria `Slider` so the S2 wrapper
  can honor local and context refs.
- Added form/provider integration so `name`, `form`, and `Form` disabled state
  reach the underlying range input.
- Matched S2's localized output width calculation and `fillOffset` style
  handling, including RTL-aware horizontal positioning.
- Added contextual help wiring next to the field label.
- Added shared Slider route data for parsing, normalization, serialization,
  defaults, controlled/default value source, label placement, fill offset,
  name/form, and contextual help options.
- Expanded viewer controls for controlled/default values, value bounds, step,
  size, emphasis, track/thumb style, fill offset, label position/alignment,
  name/form, contextual help, and disabled state.
- Updated React and Solid fixtures to pass the same controlled or uncontrolled
  value props, serialized route props, form props, contextual help, label
  layout props, and change handling.
- Added package coverage for uncontrolled `defaultValue`, hidden input
  `name`/`form`, disabled inheritance from `Form`, and `SliderContext` merges.
- Added browser coverage for default visual geometry, emphasized XL geometry,
  uncontrolled default value initialization, fill offset movement, form props,
  keyboard changes, and expanded interactive controls.
- Replaced the visual-state caveat with explicit default and default-value
  evidence rows.

## Covered States

- Default slider state against current React Spectrum.
- Emphasized XL thick precise styling.
- Controlled `value` route updates and keyboard ArrowRight changes.
- Uncontrolled `defaultValue` initialization.
- Fill offset shifting the visual fill start.
- Top and side label placement with start/end alignment controls.
- Hidden range input `name` and `form` participation.
- Disabled state through direct props and inherited `Form` disabled state.
- Context prop, class, style, and ref merging.
- Contextual help prop wiring from the viewer route.

## Commands

- `vp test run packages/solid-spectrum/test/Slider.test.tsx`
  - `1` file, `6` tests passed.
- `vp run comparison:build`
  - comparison build produced `70` static pages including
    `/components/slider/index.html`.
- `COMPARISON_BASE_URL=http://127.0.0.1:4333 vp exec --filter @proyecto-viviana/comparison playwright test e2e/slider-visual.spec.ts e2e/modeled-controls-contract.spec.ts --grep Slider --reporter=line --workers=1`
  - `6` browser tests passed after running outside the sandbox because
    Chromium launch hit the local sandbox restriction.
- `vp run comparison:report:gaps`
  - report passed; Slider now lists explicit default and emphasized evidence
    rows instead of the previous default-state coverage gap.
- `vp run comparison:report:exports`
  - report passed; `SliderContext` is no longer listed as a missing
    solid-spectrum support export.
- `vp run check`
  - formatting, lint, and typecheck passed after `vp check --fix`.

## Remaining Gaps

- Assistive-technology transcript rows are not yet captured for Slider.
- Pointer drag and focus/hover/pressed visuals are covered through React Aria
  slider behavior, current geometry checks, and shared style parity, not a
  dedicated exhaustive screenshot grid.
- Opening the contextual help popover remains covered by the ContextualHelp
  component pass; this Slider pass covers prop wiring and route serialization.
