---
id: 375
type: task
title: "Update Slider fill when emphasized or disabled changes after mount"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 slider functional pass: URL ?isEmphasized=true / ?isDisabled=true paint fill accent-900 / disabled on both; live isEmphasized leaves Solid fill gray-700 rgb(80,80,80) (React accent rgb(59,99,251)); live isDisabled updates Solid upperTrack/label/thumb/input.disabled and Tab skip but leaves fill gray-700 (React disabled rgb(233,233,233)). Live maxValue=50 leaves Solid output 24px (3ch from mount-time max 100) vs React 16px. SliderTrackContent passes filledTrack({isDisabled,isEmphasized}) as a one-shot class string into SliderFill",
    }
---

S2 Slider restyles the nested fill when `isEmphasized` or
`isDisabled` changes after mount, and it sizes the output from the
current min/max. URL remount of those props already matches. A live
`comparison:controls-change` updates Solid's upperTrack, label,
thumb, and native `input.disabled`, and leaves the fill on the
mount-time token. Live `maxValue=50` leaves the output column at the
mount-time 3ch width.

`SliderTrackContent` computes
`class={filledTrack({ isDisabled, isEmphasized, trackStyle })}` as a
string and passes it into `HeadlessSliderFill`. `SliderFill` does
not re-read that class when the style state changes. Output width is
an inline `${maxLabelLength()}ch` object on `HeadlessSliderOutput`.

## Evidence

`http://127.0.0.1:4341/components/slider/`, islands mounted.

`?isEmphasized=true` remount: both fill `rgb(59, 99, 251)`.
`?isDisabled=true` remount: both fill and upperTrack
`rgb(233, 233, 233)`, thumb border `rgb(218, 218, 218)`, Tab skips.

From the default route, live `{isEmphasized:true}`:

| | React | Solid |
|---|---|---|
| fill | `rgb(59, 99, 251)` | `rgb(80, 80, 80)` |
| upperTrack | `rgb(218, 218, 218)` | same |

Live `{isDisabled:true}`:

| | React | Solid |
|---|---|---|
| fill | `rgb(233, 233, 233)` | `rgb(80, 80, 80)` |
| upperTrack / label / thumb border | disabled | disabled |
| `input.disabled` / Tab skip | true / skip | true / skip |

Live `{label:"Gain", step:5, maxValue:50, value:10}`: values 10 and
ArrowRight→15 match; output box 16×18 vs 24×18.

`packages/solid-spectrum/src/slider/index.tsx` `SliderTrackContent`
`filledTrack(...)`. `packages/solidaria-components/src/Slider.tsx`
`SliderFill` class.

## Done when

Live `isEmphasized` / `isDisabled` on the comparison Slider restyle
the fill like S2, and live min/max restyle the output width. URL
remount stays matched. A walk fails if Solid fill stays gray-700
while React is accent or disabled.

## Relationship

Child of #24. Found by #260. Distinct from #74 (native input
semantics) and from #371 (Switch live disabled paint). Do not start
#254.
