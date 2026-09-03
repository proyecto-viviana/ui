---
id: 394
type: task
title: "Keep ColorSlider hue 360 at End"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 colorslider functional pass: isolated End on a focused hue slider at 50 → React 360° thumb left 192px / onChangeEnd hsla(360); Solid 0° thumb left 0px. RGB End 128→255 thumb 192px matches, so this is hue modulo, not the #393 remount. HSLColorImpl/HSBColorImpl store clamp(hue % 360, 0, 360) so 360 becomes 0.",
    }
---

S2 ColorSlider End on a hue channel sets the value to 360 and parks
the thumb at the end of the track (`left: 192px`, output `360°`).
Solid's `HSLColorImpl` / `HSBColorImpl` constructors store
`clamp(hue % 360, 0, 360)`, so 360 becomes 0 and the thumb jumps to
the start (`left: 0px`, output `0°`). Both paints are red; the
thumb position and output are not.

RGB End already matches (128→255, thumb `left: 192px`). Home from
50 reaches 0° on both.

## Evidence

`http://127.0.0.1:4341/components/colorslider/`, islands mounted.
Other `.s2-framework-panel` `visibility:hidden` + `inert`. Focus
the default hue range input at 50, press End.

| | React | Solid |
|---|---|---|
| value / output | 360 / `360°` | 0 / `0°` |
| thumb `left` | `192px` | `0px` |
| `onChangeEnd` | `hsla(360, 100%, 50%, 1)` | still `hsl(50, 100%, 50%)` (#393) |

`?channel=red&colorSpace=rgb&value=rgb(128,0,0)` End is 255 / thumb
`192px` on both.

`packages/solid-stately/src/color/Color.ts` `HSLColorImpl` and
`HSBColorImpl`: `this.hue = clamp(hue % 360, 0, 360)`.

## Done when

End on a comparison-route hue ColorSlider sets 360° and `left: 192px`,
matching S2. RGB/alpha max is unchanged. A walk fails if Solid's
hue End output is `0°` while React's is `360°`.

## Relationship

Child of #24. Found by #260. Wiring is
`packages/solid-stately/src/color/Color.ts` hue constructors.
Distinct from #393 (input remount / focus; RGB End already moves
the thumb). Distinct from #392 (hue valuetext fraction digits, not
the 360 wrap). Distinct from #396 (ColorWheel End should wrap to 0;
this linear hue track should stay at 360). Do not start #254.
