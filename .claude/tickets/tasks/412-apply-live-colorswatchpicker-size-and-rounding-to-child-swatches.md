---
id: 412
type: task
title: "Apply live ColorSwatchPicker size and rounding to child swatches"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 colorswatchpicker functional pass: live comparison:controls-change {size:'XS'|'L'} / {rounding:'full'} updates Solid data-comparison-control-props but swatches stay 32×32 / radius 0px; React remounts via renderKey and paints 16/40 / 9999px. URL ?size=XS and ?size=L&rounding=full remount and match. Live density already updates gap 4→6 on both (listbox class callback). InternalColorSwatchContext stores size()/rounding() as static fields; ColorSwatch reads pickerContext?.size from that snapshot. Numbered 412 to stay past ProgressCircle #410",
    }
---

ColorSwatchPicker `size` and `rounding` should restyle the child
swatches when the props change after mount, the way S2 does. Live
`comparison:controls-change` updates the Solid fixture JSON and
leaves the painted squares at the mount-time M / none tokens.

URL remount of the same props already matches. Live `density` already
matches because it is read inside the listbox `class` callback, not
through `InternalColorSwatchContext`.

Styled `ColorSwatchPicker` provides `{ size: size(), rounding:
rounding(), useWrapper }` as a plain context object. `ColorSwatch`
reads `pickerContext?.size` / `rounding` once for
`colorSwatchRoot({ size, rounding })`. Changing the picker prop
does not rebuild those child classes.

## Evidence

`http://127.0.0.1:4341/components/colorswatchpicker/`, islands
mounted. From the default route, `comparison:controls-change` with
defaults plus one of `{size:"XS"}`, `{size:"L"}`, `{rounding:"full"}`.

| live                   | React                                    | Solid                                                   |
| ---------------------- | ---------------------------------------- | ------------------------------------------------------- |
| `{size:"XS"}`          | listbox 136×16, swatches 16×16           | props `size:XS`, listbox **248×32**, swatches **32×32** |
| `{size:"L"}`           | 304×40 / 40×40                           | props `size:L`, **248×32** / **32×32**                  |
| `{rounding:"full"}`    | radius 9999px on option, swatch, overlay | props `rounding:full`, radius **0px**                   |
| `{density:"spacious"}` | gap 6px, 260×32                          | same                                                    |

`?size=XS` rest: both 136×16 / 16×16. `?size=L&rounding=full` rest:
both 304×40 / 40×40 / 9999px.

## Done when

A live `size` / `rounding` after mount restyles Solid child swatches
to the S2 tokens (XS 16, L 40, rounding full 9999px) without a
remount. A comparison-route live size walk fails if Solid stays on
32×32 / 0px while the fixture JSON says XS or full. URL remount and
live density must keep working. Do not start #254.

## Relationship

Child of #24. Found by #260. Wiring is
`packages/solid-spectrum/src/color/ColorSwatchPicker.tsx`
`InternalColorSwatchContext.Provider` and
`packages/solid-spectrum/src/color/index.tsx` `ColorSwatch` (`const
size = () => local.size ?? pickerContext?.size ?? "M"`). Same live-size
class as Card #339 and Checkbox #356, different slot. Not #395 (that
is uncontrolled `defaultValue` remount). Do not start #254.
