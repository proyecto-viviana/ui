---
id: 384
type: task
title: "Apply live Form size and labelPosition to the form grid"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 form functional pass: URL ?size=XL / ?labelPosition=side remount match row-gap 40 / named columns [label] 77px [field] 224.297px on both; live {size:'XL'} updates React row-gap 40 formH 206 and leaves Solid row-gap 24 formH 190 (children both XL fonts/button 48); live {labelPosition:'side'} updates React form grid to the named columns and groupW 223.7 and leaves Solid form grid [field] 92.6562px 208.641px groupW 208 (child fieldAreas already side, formH 113 both). formStyles({size,labelPosition}) is joined into a static class string in Form()",
    }
---

S2 Form restyles its own CSS grid when `size` or `labelPosition`
changes after mount (row-gap S 20 / M 24 / L 32 / XL 40; top
`[field] 1fr` vs side `[label] auto [field] 1fr`). URL remount of
those props already matches. A live `comparison:controls-change`
updates Solid _children_ through S2 FormContext (`useFormProps`
getters: label font, button min-height, field areas) and leaves the
form host on the first-paint `formStyles` class.

`packages/solid-spectrum/src/form/index.tsx` `Form()` computes

```
formStyles({ size: size(), labelPosition: labelPosition() }, local.styles)
```

as a one-shot string on `HeadlessForm` `class`. The context value
already uses getters; the host class does not.

## Evidence

`http://127.0.0.1:4341/components/form/`, islands mounted.

URL `?size=XL` remount: both `rowGap` 40px, `formH` 206, label 18px,
button min-height 48px.

URL `?labelPosition=side` remount: both form grid
`[label] 77px [field] 224.297px`, `formH` 113, `groupW` 223.7.

Live from a fresh default route, `{size:"XL"}`:

|                                | React       | Solid       |
| ------------------------------ | ----------- | ----------- |
| `rowGap` / `formH`             | 40px / 206  | 24px / 190  |
| label font / button min-height | 18px / 48px | 18px / 48px |

Live `{size:"S"}`: React 20px / 108; Solid 24px / 112; children both S
(12px / 24px).

Live `{labelPosition:"side"}`:

|                              | React                            | Solid                         |
| ---------------------------- | -------------------------------- | ----------------------------- |
| form `grid-template-columns` | `[label] 77px [field] 224.297px` | `[field] 92.6562px 208.641px` |
| `groupW`                     | 223.7                            | 208                           |
| `fieldAreas` / `formH`       | side / 113                       | side / 113                    |

Live `labelAlign=end` after a fresh side dispatch keeps the same
stale form columns; child `labelAlign` is already `end` on both.

## Done when

Live `size` / `labelPosition` after mount restyle the Form host grid
(row-gap and named columns) like S2, without a remount. Children
already inherit. URL remount stays matched. A comparison-route walk
fails if Solid form `rowGap` stays 24px at XL or the side-label
named columns never appear.

## Relationship

Child of #24. Found by #260. Same one-shot class pattern as #339
(Card title/description) and #375 (Slider fill), but this is Form's
own grid. Side-label half-pixel y-rects stay on #77. Do not start
#254.
