---
id: 389
type: task
title: "Paint the disabled SegmentedControl indicator with gray-25, not GrayText"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 segmentedcontrol functional pass: URL ?isDisabled=true and live isDisabled both keep labels rgb(198,198,198) and indicator border rgb(218,218,218); React indicator fill stays gray-25 rgb(255,255,255) and Solid paints GrayText rgb(128,128,128). S2 slider backgroundColor uses GrayText only under forcedColors.isDisabled; Solid selectionIndicator puts isDisabled:GrayText at the top level",
    }
---

S2 `SegmentedControl` `slider` fill is `gray-25` in the default
scheme. `GrayText` is only the forced-colors disabled branch.
Solid Spectrum puts `isDisabled: "GrayText"` on
`backgroundColor` at the top level, so a disabled group in light
theme paints the selected plate system GrayText (`rgb(128, 128,
128)`) instead of white.

Disabled label ink and the indicator _border_ already match
(`color: disabled` / `borderColor: disabled` →
`rgb(198, 198, 198)` / `rgb(218, 218, 218)`). AX, Tab skip, and
force-click no-op already match. The fork is the selected-item
plate.

S2 `react-spectrum/packages/@react-spectrum/s2/src/SegmentedControl.tsx`
`slider`:

```ts
backgroundColor: {
  default: 'gray-25',
  forcedColors: {
    default: 'Highlight',
    isDisabled: 'GrayText'
  }
}
```

Solid `packages/solid-spectrum/src/segmentedcontrol/index.tsx`
`selectionIndicator`:

```ts
backgroundColor: {
  default: "[light-dark(rgb(255, 255, 255), rgb(17, 17, 17))]",
  forcedColors: "Highlight",
  isDisabled: "GrayText",
}
```

`packages/viviana-ui/src/segmentedcontrol/index.tsx` already
drops `isDisabled` from that map and comments the forced-colors
trap; that is a different design system, not the S2 port.

## Evidence

`http://127.0.0.1:4341/components/segmentedcontrol/?isDisabled=true`,
islands mounted. Same fork on live
`comparison:controls-change` `{isDisabled:true}` and on an
isolated remount (other `.s2-framework-panel`
`visibility:hidden` + `inert`).

|                       | React                                                                             | Solid                             |
| --------------------- | --------------------------------------------------------------------------------- | --------------------------------- |
| group `aria-disabled` | `true`                                                                            | `true`                            |
| items                 | native `disabled`, color `rgb(198, 198, 198)`                                     | same                              |
| indicator size        | 43×32 on List                                                                     | same                              |
| indicator border      | `2px solid rgb(218, 218, 218)`                                                    | same                              |
| indicator fill        | `rgb(255, 255, 255)` (`gray-25`)                                                  | `rgb(128, 128, 128)` (`GrayText`) |
| AX                    | `radiogroup "View mode" [disabled]` + three `[disabled]` radios, List `[checked]` | same                              |
| Tab from Before       | After (skip)                                                                      | same                              |
| force-click Grid      | stays List                                                                        | same                              |

Live `{isDisabled:false}` restores white fill on both.

## Done when

A disabled SegmentedControl paints the selection indicator with
the same `gray-25` fill as S2 in the default scheme. Forced
colors still use `GrayText` only under `forcedColors`. A
comparison walk on `/components/segmentedcontrol/?isDisabled=true`
fails if Solid's indicator background is GrayText while React's
is white. Label ink and the disabled border stay matched.

## Relationship

Child of #24. Found by #260. Distinct from #371 / #377 (live
disabled _paint stale_ on Switch / RadioGroup — this fill is
wrong on URL remount too). Do not start #254.
