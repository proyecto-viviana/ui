---
id: 390
type: task
title: "Apply SegmentedControl pressScale to the inner content, not the radio"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 segmentedcontrol functional pass: pointer-down Grid keeps the S2 radio at 48×32 and scales the inner content DIV (24×18 → 23.51×17.63 matrix3d); Solid applies the same perspective math to the radio BUTTON (48×32 → 45.18×30.12 matrix3d) and leaves the inner SPAN transform none. During hold Solid document.activeElement is BODY / data-focused omitted; React stays on Grid. Pointerup 400ms both settle 48×32, focus Grid, selectedKey grid. Distinct from button-family 80ms matrix timing because the transformed element differs",
    }
---

S2 `SegmentedControlItem` keeps `pressScale` on the inner content
wrapper (sibling of `SelectionIndicator`). The radio host size
does not change on press. Solid Spectrum inlines the same
perspective math on the `ToggleButton` host via `getStyle`, so
the radio chrome shrinks and the indicator sibling is scaled
with it.

S2 `react-spectrum/packages/@react-spectrum/s2/src/SegmentedControl.tsx`
(inner `div`, `pressScale(divRef)({isPressed})`):

```tsx
<ToggleButton ref={domRef} style={props.UNSAFE_style} ...>
  {({isPressed, isDisabled}) => (
    <>
      <SelectionIndicator className={slider({isDisabled})} />
      <div ref={divRef} style={pressScale(divRef)({isPressed})} className={...}>
        {children}
      </div>
    </>
  )}
</ToggleButton>
```

Solid `packages/solid-spectrum/src/segmentedcontrol/index.tsx`
`getStyle` writes `perspective(...) translate3d(0, 0, -2px)` onto
the radio, and the inner wrapper is an unscaled `<span
class={itemContent}>`. `pressScale` already exists at
`packages/solid-spectrum/src/pressScale.ts` and is how Button /
ToggleButton / ActionButton attach the same transform.

Settled press (pointerup + 400 ms) already matches. The fork is
the in-press geometry: S2 shrinks only the label/icon; Solid
shrinks the whole segment, including the sliding indicator when
the pressed item is selected.

## Evidence

`http://127.0.0.1:4341/components/segmentedcontrol/`, islands
mounted. Other `.s2-framework-panel` `visibility:hidden` +
`inert`. Pointer-down Grid, sample at 80 ms and 300 ms, then
pointerup + 400 ms.

Hold 80 ms (List still checked; Grid `data-pressed=true`):

|                          | React                                   | Solid                                    |
| ------------------------ | --------------------------------------- | ---------------------------------------- |
| Grid radio               | 48×32, transform `none`                 | 45.18×30.12, `matrix3d(..., -2, 1.0625)` |
| inner content            | DIV 23.51×17.63, `matrix3d` (in-flight) | SPAN 22.59×16.94, transform `none`       |
| `data-focused`           | `true`                                  | omitted                                  |
| `document.activeElement` | Grid radio                              | `BODY`                                   |
| indicator                | 43×32 on List, fill white               | same                                     |

Hold 300 ms: React inner 22.15×16.62
`matrix3d(..., -2, 1.08333)` (settled `pressScale` on 24×18);
Solid radio still 45.18×30.12 `matrix3d(..., -2, 1.0625)`, inner
unscaled. Focus still Grid vs BODY.

Pointerup + 400 ms: both Grid 48×32 transform none, focus Grid,
`selectedMarker=grid`, `aria-checked` Grid.

Button-family 80 ms fifth-decimal matrix noise is **not** this
ticket — those components transform the same host as S2. Here the
transformed _element_ is wrong.

## Done when

`SegmentedControlItem` applies `pressScale` to the inner content
wrapper the way S2 does. The radio host stays 48×32 (Grid default)
while pressed; the inner label/icon takes the perspective
transform. Pointer-down keeps DOM focus on the radio. Settled
pointerup stays matched. A comparison hold at ≥300 ms fails if
Solid's radio bounding box shrinks while React's does not.

## Relationship

Child of #24. Found by #260. Distinct from ActionButton /
ToggleButton / LinkButton press-scale timing (same host, 80 ms
interpolation). Inner wrapper `SPAN` vs S2 `DIV` is structural
once the transform target matches. Do not start #254.
