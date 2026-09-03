---
id: 392
type: task
title: "Keep HSL/HSB hue valuetext at the upstream fraction digits"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: 'filed from the #260 colorarea functional pass: ?colorSpace=hsl and hsb aria-valuetext Hue: 252.76° (S2) vs 253° (Solid). Chromium AX snapshot still slider "100" / "50" both. RGB valuetext matches. Color.ts HSL/HSB getChannelFormatOptions sets maximumFractionDigits: 0; upstream omits it.',
    }
---

HSL and HSB `formatChannelValue('hue')` rounds to an integer on Solid.
S2 leaves the formatter default, so `#9B80FF` announces `Hue: 252.76°`.

Upstream `react-stately` `HSLColor` / `HSBColor`
`getChannelFormatOptions('hue')` is `{ style: 'unit', unit: 'degree',
unitDisplay: 'narrow' }` with no `maximumFractionDigits`.

Solid `packages/solid-stately/src/color/Color.ts` adds
`maximumFractionDigits: 0` on both HSL and HSB hue options, so
`Intl.NumberFormat` emits `253°`.

The rest AX tree still shows `slider "Color, Color picker": "100"`
(saturation) on both stacks — Chromium does not surface
`aria-valuetext`. Screen readers that read `aria-valuetext` do.

## Evidence

`http://127.0.0.1:4341/components/colorarea/?colorSpace=hsl`, islands
mounted. Same on `?colorSpace=hsb` and on live `colorSpace` after mount.

Default `#9B80FF` converted into the space:

|                      | React                                                             | Solid            |
| -------------------- | ----------------------------------------------------------------- | ---------------- |
| hsl `aria-valuetext` | `Saturation: 100%, Lightness: 75%, Hue: 252.76°, vibrant purple`  | `… Hue: 253°, …` |
| hsb `aria-valuetext` | `Saturation: 50%, Brightness: 100%, Hue: 252.76°, vibrant purple` | `… Hue: 253°, …` |
| AX                   | slider `"100"` / `"50"`                                           | same             |

RGB default valuetext `Red: 155, Green: 128, Blue: 255, vibrant purple`
matches.

## Done when

HSL/HSB hue `aria-valuetext` uses the same fraction digits as S2
(`252.76°` for `#9B80FF`). A comparison-route hsl rest walk fails if
Solid says `253°`. Integer hues (210°) stay integer on both.

## Relationship

Child of #24. Found by #260. Wiring is
`packages/solid-stately/src/color/Color.ts`
`getChannelFormatOptions` on `HSLColor` and `HSBColor`. Shared color
layer — ColorSlider / ColorWheel hue text will inherit the same fix.
Distinct from #391 (hidden-input focus). Do not start #254.
