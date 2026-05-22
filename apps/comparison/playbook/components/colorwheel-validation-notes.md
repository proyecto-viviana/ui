# ColorWheel Validation Notes

Date: 2026-05-22
Status: accepted

## Target

- Component: ColorWheel
- Slug: `colorwheel`
- Family or direct subcomponents: `ColorWheel`, `ColorWheelContext`,
  `ColorWheelTrack`, `ColorWheelThumb`, hidden hue range input,
  `createColorWheel`, and `createColorWheelState`.
- Pass goal: accept ColorWheel under the current full gate model with parity
  for the S2 ring geometry, default and controlled color values, size, form
  forwarding, ARIA labels/references, disabled state, keyboard hue changes,
  ring pointer updates, and public package exports.

## Task Status

| Task                   | Status   | Evidence                                                                                                       |
| ---------------------- | -------- | -------------------------------------------------------------------------------------------------------------- |
| 0 Research             | complete | React Spectrum S2 ColorWheel docs/source, React Aria ColorWheel source, React Stately color wheel state.       |
| 1 Baseline             | complete | `comparison:report:gaps`, `comparison:report:exports`, current color package tests.                            |
| 2 Route harness        | complete | `apps/comparison/e2e/colorwheel-visual.spec.ts` and modeled controls contract coverage.                        |
| 3 Source map/API       | complete | Upstream S2 `ColorWheel.tsx`, S2 `ColorHandle.tsx`, React Aria `useColorWheel`, Solid owner files below.       |
| 4 Cross-layer audit    | complete | State, ARIA hook, headless component, styled S2 wrapper, fixtures, controls, and reports mapped.               |
| 5 Transitions          | complete | Keyboard, pointer, disabled, form, labeling, explicit id, generated id, and route-control transitions covered. |
| 6 State                | complete | `packages/solid-stately/test/color.test.ts`.                                                                   |
| 7 ARIA hooks           | complete | `packages/solidaria/src/color/createColorWheel.ts` and color tests.                                            |
| 8 Headless             | complete | `packages/solidaria-components/src/Color.tsx` and component tests.                                             |
| 9 Styled S2            | complete | `packages/solid-spectrum/src/color/index.tsx`, generated CSS, regression snapshot, browser contracts.          |
| 10 Runtime lifecycle   | complete | Pointer/mouse listeners, drag state, focus transfer, hidden input sync, and cleanup audited.                   |
| 11 Harness integrity   | complete | React imports real S2 ColorWheel; Solid imports public S2 package/subpath.                                     |
| 12 Comparison evidence | complete | Focused package, typecheck, build, Playwright, gaps, exports, and root check gates listed below.               |
| 13 Acceptance          | complete | No accepted ColorWheel blockers remain; remaining catalogue/export gaps belong to other components.            |

## Agent Workflow

No subagents were used for this component pass.

| Agent role | Files read                                                                                                                     | Files changed                                                                                                                                            | Evidence added                                                                                                                                     | Commands run                                                                        | Blockers | Next owner |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------- | ---------- |
| main       | S2/React Aria docs through MCP/skills; installed S2/RAC source; ColorWheel state/headless/styled source; route fixtures/tests. | Color state/hook/headless/styled files, ColorWheel comparison route data/tests/fixtures, generated CSS, regression snapshot, package exports, this note. | API controls, hidden range input contract, ring clipping/geometry, computed S2 style, keyboard/pointer/browser assertions, export-surface cleanup. | Focused package, typecheck, build, Playwright, gaps, exports commands listed below. | none     | none       |

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

| Gate                                     | Outcome  | Evidence                                                                                                                                                                                                                        | Blockers/owner |
| ---------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| Official Docs And Viewer Parity          | complete | S2 ColorWheel docs/source checked on 2026-05-22. Route controls cover `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-details`, `id`, `slot`, controlled/default value source, `size`, `name`, `form`, and disabled. | none           |
| External Authority And Standards         | complete | React Aria ColorWheel source defines the hidden range input model, hue value text, form forwarding, localized channel name fallback, ring pointer behavior, and keyboard hue increments.                                        | none           |
| Upstream React Source Parity             | complete | Installed S2 `ColorWheel.tsx` and `ColorHandle.tsx`, RAC/React Aria color-wheel source, and Solid owners were mapped. Solid S2 exports now match the S2 ColorWheel public wrapper/context surface.                              | none           |
| Solid Idiomatic Implementation           | complete | Provider values and render props remain accessor-backed; props are normalized in live fixtures; listeners clean up; root/thumb refs use Solid ref semantics; generated ids remain local.                                        | none           |
| Accessibility And I18n                   | complete | Browser contract compares input role/name/reference ids, hidden input `name`/`form`, value text, explicit id, disabled state, generated ids, and localized hue labelling against React Spectrum.                                | none           |
| Behavior State Machine                   | complete | Package and browser tests cover controlled/default value, HSL/HSB/default normalization, keyboard arrows, ring pointer drag, disabled suppression, `onChange`, and `onChangeEnd`.                                               | none           |
| Style Source-To-Computed Parity          | complete | Browser tests compare 192px/224px S2 root sizing, outer/inner radii, conic ring clip path, inner border, disabled track, thumb geometry, thumb color, outline, and screenshot pair evidence.                                    | none           |
| React-Vs-Solid Comparison Harness Parity | complete | React fixture imports `@react-spectrum/s2/ColorWheel`; Solid fixture imports public `@proyecto-viviana/solid-spectrum`; both receive the same serialized route props and provider locale/theme.                                 | none           |
| Known Defects And Regression Protection  | complete | Fixed and covered: missing S2 wrapper/export, missing comparison route controls, wrong track/thumb roles, React Aria ring clip path mismatch, inner border `aria-hidden` drift, form/id forwarding gaps.                        | none           |
| Evidence And Handoff                     | complete | Commands below are green; `comparison:report:gaps` lists ColorWheel as asserted visual evidence, and `comparison:report:exports` has no ColorWheel root export gap.                                                             | none           |

## Research

- React Spectrum S2 docs: ColorWheel page API and examples checked through the
  S2 skill/MCP and installed source.
- React Aria source: ColorWheel behavior checked through the React Aria
  skill/MCP and installed source.
- Installed upstream source:
  - `apps/comparison/node_modules/@react-spectrum/s2/src/ColorWheel.tsx`
  - `apps/comparison/node_modules/@react-spectrum/s2/src/ColorHandle.tsx`
  - React Aria Components ColorWheel source in the installed package.
  - React Aria and React Stately color wheel/color source in the installed
    packages.
- Source disagreement resolved: the visual track and thumb do not carry
  presentation roles; the hidden input owns the range semantics.
- Source disagreement resolved: S2's decorative inner ring does not set
  `aria-hidden`; Solid now matches this DOM contract.

## Official Docs And Viewer Parity

| Docs item     | Official setting/example                                 | Route/control                                          | Status  |
| ------------- | -------------------------------------------------------- | ------------------------------------------------------ | ------- |
| Default value | Default hue wheel with S2 192px circular layout.         | Default route props, screenshot, DOM/style contract.   | passing |
| Value source  | Controlled and default value modes.                      | `valueSource`, `value`, `defaultValue`.                | passing |
| Size          | Numeric `size` with minimum 175px S2 radius behavior.    | `size` radio controls and 224px disabled contract.     | passing |
| Forms         | Hidden range input can receive name and form owner.      | `name`, `form`, browser DOM assertions.                | passing |
| ARIA          | Label, labelledby, describedby, details, id, slot state. | Side-panel controls and DOM contract.                  | passing |
| Disabled      | Disabled wheel suppresses input and pointer changes.     | `isDisabled`, disabled browser and package assertions. | passing |
| Viewer state  | React and Solid examples use the same serialized props.  | `colorwheel-demo.ts`, React/Solid fixtures, controls.  | passing |

## Source Map And Public Contract

| Layer               | Upstream files                                             | Solid files                                                                        | Status                                                                                                            |
| ------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| State               | React Stately color wheel state                            | `packages/solid-stately/src/color/createColorWheelState.ts`, `Color.ts`            | Matched default HSL red, HSB preservation, HSL normalization, hue math, keyboard increments, and events.          |
| ARIA hooks          | React Aria `useColorWheel` and color interaction source    | `packages/solidaria/src/color/createColorWheel.ts`, `types.ts`                     | Matched hidden input props, generated ids, labels, form/name props, ring hit testing, keyboard, and pointer drag. |
| Headless components | RAC ColorWheel, Track, Thumb                               | `packages/solidaria-components/src/Color.tsx`                                      | Matched provider state, render props, default styles, track/thumb refs, and composable lower API.                 |
| Styled S2           | `@react-spectrum/s2/src/ColorWheel.tsx`, `ColorHandle.tsx` | `packages/solid-spectrum/src/color/index.tsx`, `src/ColorWheel.ts`, `src/index.ts` | Matched public S2 ColorWheel API, ring/inner border/thumb/loupe styling, generated CSS, and export surface.       |

## Behavior State Machine

| State/input      | Trigger                            | Expected React                                                                  | Expected Solid | Evidence                                               |
| ---------------- | ---------------------------------- | ------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------ |
| Official default | Route mount                        | 192px hue ring, conic clipped track, inner border, thumb, hidden range input.   | Same.          | `colorwheel-visual.spec.ts`.                           |
| Controlled value | ArrowRight on range input          | Hue value increases, thumb position and route value update.                     | Same.          | Browser keyboard test and package tests.               |
| Pointer drag     | Drag on visual ring                | Hue updates from ring angle, thumb moves, final value records on release.       | Same.          | Browser pointer test and component `onChangeEnd` test. |
| Center hole      | Pointer target inside inner hole   | No hue update from invalid center target.                                       | Same.          | Component ring-only tests.                             |
| Disabled         | Route mount with `isDisabled=true` | Root/track/thumb disabled data state, input disabled, disabled S2 colors.       | Same.          | Disabled browser contract and tests.                   |
| Form names       | `name` and `form` route props      | Hidden range input exposes matching `name` and `form`.                          | Same.          | Browser DOM contract.                                  |
| ARIA references  | Description/details route props    | Hidden input receives references; visual track/thumb keep visual-only contract. | Same.          | Browser DOM contract and component tests.              |
| Side controls    | Modeled comparison control event   | React and Solid remount/update with valid size/value/form/ARIA prop sets.       | Same.          | Modeled controls contract.                             |

## Accessibility And I18n

- The keyboard-focusable/native control is a hidden `input[type=range]` inside
  the thumb, with `min=0`, `max=360`, `step=1`, localized `aria-valuetext`, and
  generated or explicit reference ids.
- `aria-label`, `aria-labelledby`, `aria-describedby`, and `aria-details` are
  forwarded to the range input, matching React Aria's source behavior.
- The visual track and thumb do not expose ARIA roles; they remain geometry and
  styling surfaces for the hidden input.
- `id`, `slot`, `name`, `form`, disabled state, generated ids, and value text
  are compared to React Spectrum in browser tests.
- No component-local strings require translation beyond channel names, color
  names, and number formatting from the color/i18n layers.

## Style Source-To-Computed Parity

- S2 root style maps to `outerRadius * 2`, with `outerRadius =
max(size, 175) / 2` and 24px ring thickness.
- Track style maps full circular sizing, conic hue gradient, even-odd ring clip
  path, 1px inset outline, disabled background, touch-action, and forced-colors
  adjustment.
- Inner border style maps the 24px inset circle, pointer-events none, 1px
  outline, and no extra `aria-hidden` attribute.
- Thumb style maps S2 handle size, focus expansion, border, outline,
  checkerboard alpha pattern, current color fill, and drag loupe behavior.
- Browser assertions compare computed style and geometry, plus the default
  screenshot pair with bounded tolerance for antialiasing/gradient rendering.

## Known Defects And Regression Protection

| Finding source       | Defect or risk                                                                           | Class        | Blocking? | Regression evidence or owner                                                            |
| -------------------- | ---------------------------------------------------------------------------------------- | ------------ | --------- | --------------------------------------------------------------------------------------- |
| Current pass         | Solid S2 lacked a public ColorWheel wrapper/subpath and route fixture coverage.          | API bug      | no        | Public package export/subpath update, route controls, export report.                    |
| Current pass         | State/default format did not match React Stately's default HSL red and HSB preservation. | behavior bug | no        | `createColorWheelState` tests.                                                          |
| Current pass         | Track/thumb roles and hidden input ARIA/form/id forwarding diverged from React Aria.     | a11y bug     | no        | Component tests and browser DOM contract.                                               |
| Current pass         | Ring clip path and thumb geometry could drift from React Aria/S2 source.                 | style bug    | no        | Regression snapshot and browser computed root/track/inner-border/thumb contract.        |
| Current pass         | Disabled wheels lost conic-gradient track detection in the browser probe.                | harness bug  | no        | Probe now identifies disabled tracks by geometry and compares computed disabled styles. |
| Current-gate reports | Catalogue/export gaps could affect ColorWheel acceptance.                                | report risk  | no        | Gap report lists ColorWheel asserted; export report has no ColorWheel root export gap.  |

## Commands

- `vp test run packages/solid-stately/test/color.test.ts -t createColorWheelState`
  - `15` focused tests passed.
- `vp test run packages/solidaria-components/test/Color.test.tsx -t ColorWheel`
  - `10` focused tests passed.
- `vp test run packages/solid-spectrum/test/regression.test.tsx -t "Regression: ColorWheel" -u`
  - `1` focused regression test passed; `1` snapshot updated.
- `vp run comparison:typecheck`
  - comparison Astro check passed with `0` errors, `0` warnings, `0` hints.
- `vp run comparison:build`
  - comparison build passed and generated `70` static pages including
    `/components/colorwheel/index.html`.
- `vp exec --filter @proyecto-viviana/comparison playwright test e2e/colorwheel-visual.spec.ts e2e/modeled-controls-contract.spec.ts --grep ColorWheel --reporter=line --workers=1`
  - `4` browser tests passed.
- `vp run comparison:report:gaps`
  - report passed; ColorWheel is listed as an asserted visual state, with `69`
    official entries tracked, `54` live on both sides, and `15` remaining
    missing/gap entries outside this pass.
- `vp run comparison:report:exports`
  - report passed; `0` missing catalogue root exports, and ColorWheel has no
    root export gap.
- `vp run check`
  - formatting, lint, and root TypeScript check passed after formatting this
    checkpoint.
- `git diff --check`
  - no whitespace errors.

## Remaining Gaps

- Dedicated assistive-technology transcript capture remains process-wide
  tooling debt; this pass includes semantic DOM, keyboard, and browser parity
  assertions but not a screen-reader transcript.
- Remaining catalogue/export gaps reported by the comparison app are outside
  ColorWheel ownership.
