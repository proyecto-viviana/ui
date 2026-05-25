# RangeSlider Validation Notes

Date: 2026-05-25
Status: accepted

## Current-Gate Closeout

- Scope: styled S2 `RangeSlider`, `RangeSliderContext`, package root exports,
  comparison route controls, modeled route data, visual-state matrix evidence,
  package tests, and browser parity checks.
- Sources rechecked: React Spectrum S2 RangeSlider docs/API, installed S2
  RangeSlider source, React Aria Slider multi-thumb value docs, Solid
  RangeSlider source, comparison fixtures, controls, visual matrix, and focused
  e2e specs.
- Result: accepted for this component pass. Solid now exposes the S2 public
  range shape (`{start, end}`), default min/max semantics, S2 size,
  `trackStyle`, `thumbStyle`, label placement, formatting, contextual help,
  disabled/form integration, start/end form names, context merging, and
  two-thumb keyboard behavior.

## Acceptance Gate Checklist

- [x] Official docs and viewer parity: S2 docs/API/source were checked. The
      route exposes the official viewer-style controls first (`size`,
      `trackStyle`, `thumbStyle`, `labelPosition`, `formatOptions`,
      `contextualHelp`, `isEmphasized`, `isDisabled`) and keeps API/source
      extras separate for controlled/default values, min/max/step,
      `labelAlign`, `startName`, `endName`, and `form`.
- [x] External authority and standards: React Aria Slider multi-thumb docs were
      used for the underlying value/keyboard/accessibility model; S2 source is
      the authority for public `RangeSlider` object values and thumb labels.
- [x] Upstream React source parity: Solid matches the S2 wrapper defaults for
      `[minValue, maxValue]`, localized `Minimum`/`Maximum` thumb labels,
      label/output composition, S2 style branches, and range fill positioning.
- [x] Solid idiomatic implementation: props stay reactive through context and
      provider/form merges; local refs merge with context refs; no global
      listeners or timers are retained after pointer cancellation/release.
- [x] Accessibility and i18n: package and browser tests cover the group label,
      two slider roles, generated thumb labels, keyboard updates, disabled
      state, form forwarding, localized output formatting, and RTL-aware fill
      placement via the shared style state.
- [x] Behavior state machine: controlled value, uncontrolled default value,
      keyboard ArrowRight, min/max/step clamping, form names, disabled state,
      context defaults, and route-control resets are covered.
- [x] Style source-to-computed parity: browser evidence compares default and
      emphasized XL thick precise states against React Spectrum for label/output
      text, colors, track/fill dimensions, and both thumb geometries.
- [x] React-vs-Solid comparison harness parity: React and Solid fixtures use
      the same serialized route props, event channel, defaults, formatting
      presets, value-source branching, and form-name wiring.
- [x] Known defects and regression protection: the prior missing control group,
      missing validation note, and missing visual/asserted evidence gaps are
      closed; no open RangeSlider TODO/skipped-test gap was found in this pass.
- [x] Evidence and handoff: focused package tests, comparison typecheck/build,
      focused Playwright, visual-state matrix rows, this note, and parity report
      evidence are refreshed.

## Source Packet

| Source              | Files or docs                                                 | Finding                                                                                                                                                                                               |
| ------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S2 docs MCP         | `RangeSlider` page/API                                        | Public API uses object values, `defaultValue`, `onChange`, `onChangeEnd`, min/max/step, S2 size/track/thumb styles, formatting, contextual help, label layout, disabled, form names, and style props. |
| S2 source           | `@react-spectrum/s2/src/RangeSlider.tsx`                      | Upstream converts `{start, end}` to an internal array, defaults to `[minValue, maxValue]`, renders two thumbs, labels them minimum/maximum, and forwards `startName`, `endName`, and `form`.          |
| React Aria docs MCP | `Slider` value section                                        | Multi-thumb sliders use controlled/default arrays, emit `onChange` during interaction, `onChangeEnd` on release, and require per-thumb labels.                                                        |
| Solid source        | `packages/solid-spectrum/src/slider/RangeSlider.tsx`          | Solid implements the S2 wrapper surface with object values, label/output composition, S2-derived style macros, pointer/keyboard updates, hidden form inputs, and context/provider/form merging.       |
| Comparison harness  | fixtures, `rangeslider-demo.ts`, controls, visual matrix, e2e | Both stacks receive the same route props, expose matching side-panel controls, and now have visual/asserted evidence rows.                                                                            |

## Official Docs And Viewer Parity

| Docs item          | Official setting/example                                 | Route/control                                                                   | Status  | Evidence                                           |
| ------------------ | -------------------------------------------------------- | ------------------------------------------------------------------------------- | ------- | -------------------------------------------------- |
| Value              | `value`/`defaultValue` are `{start, end}`                | `valueSource`, `startValue`, `endValue`, `defaultStartValue`, `defaultEndValue` | matched | package tests, e2e default/controlled/defaultValue |
| Value scale        | default percentage range, `minValue`, `maxValue`, `step` | text controls with numeric normalization                                        | matched | package tests, modeled controls contract           |
| Style controls     | S2 `size`, `trackStyle`, `thumbStyle`, `isEmphasized`    | radio/switch controls in official-first order                                   | matched | e2e emphasized XL thick precise                    |
| Label layout       | `label`, `labelPosition`, `labelAlign`, `contextualHelp` | text/radio/switch controls                                                      | matched | fixtures and modeled controls contract             |
| Formatting         | `formatOptions`                                          | select presets for decimal, percent, currency, unit                             | matched | package formatting test, route serialization       |
| Form participation | `startName`, `endName`, `form`                           | API-extra controls                                                              | matched | package tests, e2e form-name test                  |
| Accessibility      | two localized thumbs, labelled group                     | generated `Minimum` and `Maximum` slider names                                  | matched | package tests, e2e role locators                   |

The comparison default intentionally uses `label="Range"` and
`defaultValue={start: 30, end: 60}` so the React and Solid canvases have a
stable, accessible, inspectable harness. S2 source still supplies the public
component default of `[minValue, maxValue]` when neither `value` nor
`defaultValue` is supplied; that behavior is covered in package tests.

## Behavior State Machine

- Stable states: default range, controlled range, uncontrolled default range,
  disabled range, S/M/L/XL sizes, thin/thick tracks, default/precise thumbs,
  emphasized fill, top/side label placement, and start/end label alignment.
- Interaction states: keyboard ArrowRight updates the focused start thumb,
  keeps focus, updates the controlled route marker, and moves the visible thumb
  geometry in both stacks.
- Form states: start/end names and shared `form` id are preserved. Solid uses
  hidden inputs for submitted public values while React Spectrum uses its
  internal slider inputs; the public names/values/form attributes are asserted.
- Cleanup states: pointer capture is released on pointerup/cancel; RangeSlider
  owns no global listeners, observers, timers, portals, or async work.

## Accessibility And I18n

- Root semantics are a labelled group with two labelled slider thumbs.
- Thumb names are localized S2 strings: `Minimum` and `Maximum`.
- Slider values expose min/max/current values and respond to keyboard changes.
- Disabled state sets group/thumb disabled semantics and disables submitted
  inputs.
- Output formatting uses `Intl.NumberFormat` with the current locale and the
  route-selected `formatOptions` preset.
- The filled range positioning uses the current text direction; RTL is covered
  by the same direction-aware style branch as Slider.

## Style Source-To-Computed

- S2 style branches covered in browser evidence: M default thin/default,
  emphasized XL thick/precise, label/output color, track background, fill
  background, two thumb border/background colors, track/fill dimensions, and
  thumb centerline.
- Comparison app CSS does not patch RangeSlider geometry; fixtures only set a
  stable stack width so React and Solid render under the same canvas conditions.
- Remaining style caveat: pointer drag, hover, focus-ring, forced-colors, and
  exhaustive size/style grids are not expanded into a separate screenshot
  matrix in this pass. The default/emphasized computed geometry and package
  state tests are the durable regression coverage.

## Evidence

```bash
vp test run packages/solid-spectrum/test/RangeSlider.test.tsx packages/solid-spectrum/test/regression.test.tsx --reporter=dot -u
vp run comparison:typecheck
vp run comparison:build
vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/rangeslider-visual.spec.ts --reporter=line
vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/modeled-controls-contract.spec.ts --grep RangeSlider --reporter=line
vp run comparison:report:parity
```

Results:

- Focused RangeSlider package/regression tests: `58` tests passed; regression
  snapshot updated for S2 thumb labels and wrapper shape.
- Comparison typecheck: passed with only existing unused `collectionDocuments`
  hints in React/Solid styled fixtures.
- Comparison build: passed and generated `/components/rangeslider/`.
- RangeSlider Playwright visual suite: `4` tests passed.
- Modeled controls RangeSlider contract: `1` test passed.
- Component parity report: RangeSlider is no longer listed in missing controls,
  missing validation notes, or missing current visual/asserted evidence.

## Handoff

- Current-gate status: RangeSlider is accepted as of 2026-05-25.
- Closed comparison audit gaps: modeled controls, validation note, and current
  visual/asserted evidence.
- Remaining catalogue work should continue with the next component that lacks
  controls, notes, or evidence in the parity report.
