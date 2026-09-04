# Color Family Validation Notes

Date: 2026-09-04
Status: pre-pass

This is a composition note for two public names that have no S2 catalogue
page. It does not accept ColorEditor or ColorPicker. It does not walk the
ten gates. FileTrigger, Landmark, and Alert are not in this file; they stay
exceptions on #177.

## Target

- Component family: ColorEditor and ColorPicker
- Slugs: none. There is no comparison route, fixture, or certified spec for
  either name.
- Family or direct subcomponents: headless `ColorPicker` /
  `ColorPickerContext` / `ColorPickerStateContext`; headless `ColorEditor`;
  styled `solid-spectrum` / `viviana-ui` `ColorEditor`.
- Pass goal: record the composition obligation from #177. ColorEditor is a
  documented local addition (Rule #2), not S2 parity. ColorPicker is RAC
  composition. Primitive certification is inherited from the accepted color
  notes, not re-run here.
- Date: 2026-09-04

## Classification

| Export      | Layer                    | Classification                         | Note obligation                          |
| ----------- | ------------------------ | -------------------------------------- | ---------------------------------------- |
| ColorEditor | SAC + solid-spectrum + `@proyecto-viviana/ui` barrels | documented local addition (no S2 page or `src/`) | this file                                |
| ColorPicker | SAC barrel only          | RAC composition                        | this file                                |

Owner 2026-09-01: ColorEditor is composition, not S2 parity. There is no
upstream S2 ColorEditor. Vendored S2 `src/` has none. Styled
`packages/solid-spectrum/src/color/ColorEditor.tsx` lines 13–21 say the
same.

## Composition Map

### ColorPicker (RAC composition)

RAC `ColorPicker` (`react-aria-components/src/ColorPicker.tsx`) is a value
sync wrapper. It calls `useColorPickerState` and provides that color into
child contexts: `ColorSliderContext`, `ColorAreaContext`,
`ColorWheelContext`, `ColorFieldContext`, `ColorSwatchContext`,
`ColorSwatchPickerContext`, plus `ColorPickerStateContext`. There is no S2
ColorPicker.

Solid `ColorPicker` lives in `packages/solidaria-components/src/Color.tsx`
(`ColorPicker`, `ColorPickerContext`, `ColorPickerStateContext`; still
concatenated with the primitives — #175 is open and is not this ticket).
There is no `createColorPickerState`. The component keeps color in a
signal and provides `ColorPickerContext` (`value` / `onChange`) and
`ColorPickerStateContext` (`color` / `setColor`). Children read
`pickerContext` themselves:

| RAC provider target        | Solid child that reads `ColorPickerContext` |
| -------------------------- | ------------------------------------------- |
| `ColorAreaContext`         | `ColorArea`                                 |
| `ColorSliderContext`       | `ColorSlider`                               |
| `ColorWheelContext`        | `ColorWheel`                                |
| `ColorFieldContext`        | `ColorField`                                |
| `ColorSwatchContext`       | `ColorSwatch` (also `ColorSwatchContext`)   |
| `ColorSwatchPickerContext` | `ColorSwatchPicker`                         |

Public SAC exports: `ColorPicker`, `ColorPickerContext`,
`ColorPickerStateContext`. Not on the `solid-spectrum` or
`@proyecto-viviana/ui` package barrels.

### ColorEditor (local composition)

Headless `packages/solidaria-components/src/ColorEditor.tsx` wraps
`ColorPicker` and, in the default layout, renders:

- `ColorArea` (+ `ColorAreaGradient`, `ColorAreaThumb`)
- `ColorSlider` hue
- optional `ColorSlider` alpha (`hideAlphaChannel`)
- native `<select>` for hex / rgb / hsl / hsb
- `ColorField` hex or per-channel fields, plus optional alpha field

Styled `packages/solid-spectrum/src/color/ColorEditor.tsx` (and the
viviana-ui twin) wraps that headless tree and styles it with the `css()`
macro hatch — descendant selectors, not the single-element `style()`
macro. Values mirror the S2 neutral palette. That is styling of a local
composition, not an S2 component port.

Owner names ColorSwatch as a composee. ColorSwatch is context-only for
this family: `ColorSwatch` reads `pickerContext?.value` when rendered as a
child of `ColorPicker`. The default ColorEditor layout does not render a
ColorSwatch.

v3 oracle `@adobe/react-spectrum/src/color/ColorEditor.tsx` composes
ColorArea + vertical hue/alpha ColorSliders + a Spectrum `Picker` for
format + ColorFields, and is meant to sit *inside* a v3 ColorPicker
(dialog + swatch trigger). Solid ColorEditor wraps ColorPicker internally
as the value provider and uses a native `<select>` for format. The native
select is a local addition, not a v3 Picker.

### Not this ColorPicker

`packages/solid-spectrum/src/color/index.tsx` also defines a local
complete-picker (`showInput` / `showSliders`) that composes ColorArea +
ColorSlider + optional ColorField. That function is **not** RAC
ColorPicker, **not** on the `solid-spectrum` package barrel, and is not
the export this note covers.

## Inherited Primitive Notes

This file does not re-certify the composees. Citation only:

- [ColorArea](./colorarea-validation-notes.md) — accepted
- [ColorField](./colorfield-validation-notes.md) — accepted
- [ColorSlider](./colorslider-validation-notes.md) — accepted
- [ColorSwatch](./colorswatch-validation-notes.md) — accepted
- [ColorSwatchPicker](./colorswatchpicker-validation-notes.md) — accepted
- [ColorWheel](./colorwheel-validation-notes.md) — accepted

Open later children on those primitives stay on their tickets. Do not
walk them from this note: ColorField #237 / #369; ColorArea #391;
ColorSlider #393 / #394; ColorWheel #395 / #396; ColorSwatchPicker
#411–#415.

## Out Of Scope

- FileTrigger, Landmark, Alert — ticket exceptions on #177. No 10-gate
  pages. Do not fold Alert into InlineAlert / AlertDialog.
- Comparison routes, `*-demo.ts`, fixtures, certified specs, a comparison
  slug.
- S2 ColorEditor parity (no upstream).
- `#175` Color.tsx split.
- `#176` nine catalogue notes. README 69/69 is catalogue inventory, not
  this Files index.
- `#454` ClientRouter / prefetch.

## Task Status

| Task                   | Status      | Evidence                                                                 | Blocker or next action                                      |
| ---------------------- | ----------- | ------------------------------------------------------------------------ | ----------------------------------------------------------- |
| 0 Research             | done        | RAC ColorPicker source; v3 ColorEditor; SAC Color.tsx / ColorEditor.tsx; solid-spectrum ColorEditor.tsx and color/index.tsx; accepted primitive notes | Composition recorded. Catalogue march is later, not this ticket |
| 1 Baseline             | not-started | no comparison route                                                      | none for this composition slice                             |
| 2 Route harness        | not-started | repo has zero ColorEditor / ColorPicker comparison routes                | do not add a slug from this ticket                          |
| 3 Source map/API       | done        | composition map above                                                    | inherit primitive notes; do not claim S2 API parity         |
| 4 Cross-layer audit    | not-started |                                                                          | later if a catalogue or RAC ColorPicker pass starts         |
| 5 Transitions          | not-started |                                                                          |                                                             |
| 6 State                | n/a         | no `createColorPickerState`; ColorPicker is a context wrapper            |                                                             |
| 7 ARIA hooks           | n/a         | ColorEditor comment: pure composition, no new ARIA hooks                 | primitive ARIA stays on those notes                         |
| 8 Headless             | not-started | map recorded; gates not walked                                           |                                                             |
| 9 Styled S2            | n/a         | no S2 ColorEditor / ColorPicker                                          | styled ColorEditor is local `css()` hatch                   |
| 10 Runtime lifecycle   | not-started |                                                                          |                                                             |
| 11 Harness integrity   | not-started | no harness                                                               |                                                             |
| 12 Comparison evidence | not-started | no route                                                                 |                                                             |
| 13 Acceptance          | not-started | composition note only                                                    | do not mark accepted                                        |

## Gate Outcome Summary

Composition obligation only. Do not treat these rows as a catalogue pass.

| Gate                                     | Outcome     | Evidence                                                                                         | Blockers/owner |
| ---------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------ | -------------- |
| Official Docs And Viewer Parity          | not-started | no S2 ColorEditor or ColorPicker page; no comparison route                                       | none           |
| External Authority And Standards         | not-started | RAC ColorPicker docs exist; APG not applicable; v3 ColorEditor is the composition oracle         | none           |
| Upstream React Source Parity             | not-started | ColorEditor has no S2 source; ColorPicker RAC map is recorded above, not gate-closed             | none           |
| Solid Idiomatic Implementation           | not-started |                                                                                                  | none           |
| Accessibility And I18n                   | not-started | inherit primitive notes; ColorEditor format control is a native select, not a Picker             | none           |
| Behavior State Machine                   | not-started |                                                                                                  | none           |
| Style Source-To-Computed Parity          | not-started | no S2 ColorEditor style oracle; styled wrapper uses `css()` hatch                                | none           |
| React-Vs-Solid Comparison Harness Parity | not-started | no ColorEditor / ColorPicker comparison slug                                                     | none           |
| Known Defects And Regression Protection  | not-started | open primitive children listed above; #175 still concatenates ColorPicker in `Color.tsx`         | none           |
| Evidence And Handoff                     | not-started | this file names both exports; ten gates remain `not-started`                                     | none           |

## Sources

- RAC: `react-aria-components/src/ColorPicker.tsx` (vendored
  `react-spectrum/packages/react-aria-components/src/ColorPicker.tsx`)
- v3 ColorEditor: `react-spectrum/packages/@adobe/react-spectrum/src/color/ColorEditor.tsx`
- v3 ColorPicker (dialog + swatch; not RAC ColorPicker, not on the Solid
  Spectrum barrel): `react-spectrum/packages/@adobe/react-spectrum/src/color/ColorPicker.tsx`
- Solid headless: `packages/solidaria-components/src/Color.tsx`,
  `packages/solidaria-components/src/ColorEditor.tsx`
- Styled local ColorEditor: `packages/solid-spectrum/src/color/ColorEditor.tsx`
- Local complete-picker, not barrel: `packages/solid-spectrum/src/color/index.tsx`
- S2 ColorEditor / ColorPicker: none found

## Remaining Gaps

- Ten gates stay `not-started`. This note is not acceptance.
- No comparison route. Do not add one from #177.
- ColorSwatch is an owner-required composee via ColorPicker context, not
  default ColorEditor DOM.
- Format control is a native `<select>`, not v3 `Picker`.
- `#175` still owns splitting `Color.tsx`.
- Primitive open tickets stay on those components.
