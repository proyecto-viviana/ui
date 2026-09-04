---
id: 369
type: task
title: "Paint the ColorField FieldGroup hover and keyboard focus ring"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 colorfield functional pass: isolated group.hover darkens React border 218→198 with data-hovered=true; Solid stays 218 and omits hovered. Tab onto the input: both settle border rgb(19,19,19); React outline solid 2px + data-focus-visible; Solid outline none and data-focused only. Label click same ring gap. Pointer click omits the ring on both",
    }
---

S2 ColorField FieldGroup is a RAC `Group`. Hover darkens the
`baseColor("gray-300")` border and keyboard focus paints the 2px
Spectrum ring (`isFocusVisible`).

Solid ColorField hand-rolls a `role="presentation"` div with a local
`isFocusWithin` signal and no `createHover` / `isFocusVisible`.
`groupClass` never receives those render props, so `baseColor` and
`focusRing()` stay on the rest branch. TextField's styled group
already forwards `renderProps.isFocusVisible` from the headless
field.

## Evidence

`http://127.0.0.1:4341/components/colorfield/`, islands mounted,
one panel at a time.

Hover the FieldGroup:

|                | React                | Solid                |
| -------------- | -------------------- | -------------------- |
| border         | `rgb(198, 198, 198)` | `rgb(218, 218, 218)` |
| `data-hovered` | `true`               | omitted              |

Tab from an injected Before (400ms settle):

|                      | React                         | Solid             |
| -------------------- | ----------------------------- | ----------------- |
| focus                | input                         | input             |
| border               | `rgb(19, 19, 19)`             | `rgb(19, 19, 19)` |
| outline              | `rgb(75, 117, 255) solid 2px` | `none 2px`        |
| `data-focus-visible` | `true`                        | omitted           |

Label click matches that keyboard ring on React and omits it on
Solid. Pointer click on the input omits the ring on both.

## Done when

A comparison-route ColorField matches S2: hover darkens the group
border, keyboard/label focus paints the 2px ring, pointer focus does
not. A walk fails if Tab onto the Solid input leaves `outline-style:
none`.

## Relationship

Child of #24. Found by #260. Wiring is
`packages/solid-spectrum/src/color/index.tsx` FieldGroup (no hover /
focus-visible) plus ColorField render props. TextField already
forwards `isFocusVisible`. Distinct from TagGroup #323. Do not
start #254.
