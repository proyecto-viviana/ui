---
id: 323
type: task
title: "Show a keyboard focus ring on TagGroup tags"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 taggroup functional pass: isolated Tab onto Landscape sets React data-focus-visible and outline rgb(75, 117, 255) solid 2px; Solid has data-focused but outline none 2px and rest background",
    }
---

S2 Tag keyboard focus paints `isFocusVisible` as a 2px spectrum focus
ring. Solid `createTag` uses `createFocusable`, not `createFocusRing`,
so styled Tag never sees `data-focus-visible` and the ring stays
`outline: none`.

## Evidence

`http://127.0.0.1:4341/components/taggroup/`, islands mounted, one panel
at a time. Focus Before, Tab onto Landscape:

|                      | React                                          | Solid                           |
| -------------------- | ---------------------------------------------- | ------------------------------- |
| `data-focused`       | true                                           | empty string / present          |
| `data-focus-visible` | true                                           | omitted                         |
| outline              | `rgb(75, 117, 255) solid 2px`                  | `rgb(75, 117, 255) none 2px`    |
| selected bg          | darker (`rgb(25, 25, 25)` / `rgb(30, 30, 30)`) | rest selected `rgb(41, 41, 41)` |

Same missing ring after ArrowRight (Portrait). Pointer focus on React
does not show the ring (modality). `allowsRemoving=false` Tab is the
same class. Not a screenshot-threshold issue: the token is already on
the S2 style, the port never sets the render-prop.

## Done when

Keyboard Tab/arrow onto a tag sets `data-focus-visible` and a 2px
solid focus ring matching React. A comparison-route isolated Tab walk
fails if Solid Landscape outline is `none 2px`.

## Relationship

Child of #24. Found by #260. Distinct from #209 (RAC render-prop
fields / `data-selection-mode`) — this is the visible ring, not the
attribute table. Do not start #254. Do not patch the ring in the
comparison app (ADR 0001).
