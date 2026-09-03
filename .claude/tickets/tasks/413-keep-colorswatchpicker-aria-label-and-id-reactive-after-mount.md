---
id: 413
type: task
title: "Keep ColorSwatchPicker aria-label and id reactive after mount"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: 'filed from the #260 colorswatchpicker functional pass: live {ariaLabel:""} updates Solid fixture JSON but the listbox stays named Accent color (S2 injects Color swatches); live {id:"contract-colorswatchpicker"} leaves Solid on solidaria-cl-169 (S2 forwards the id). URL ?ariaLabel= and ?id= remount and match. createListBox createId snapshots id at setup; ColorSwatchPicker cleanListBoxProps() destructures listBoxProps into a plain object during render, so later fieldProps aria-label never reach the div. Numbered 413 to stay past ProgressCircle #410',
    }
---

ColorSwatchPicker `aria-label` and `id` should follow the live props
the way S2 does. After mount, a `comparison:controls-change` that
clears `ariaLabel` or sets `id` updates Solid's fixture JSON and
leaves the listbox on the mount-time name and generated id.

URL remount of the same params already matches. Live labelledby still
wins the AX name (`External label` both) even while Solid keeps a
stale `aria-label="Accent color"` attribute — the unlabeled case is
the user-visible name fork.

`createListBox` calls `createId(getProps().id)` once. Headless
`ColorSwatchPicker` then snapshots `listBoxAria.listBoxProps` through
`cleanListBoxProps()` and spreads the plain object onto the listbox
div, so later `createLabel` fieldProps never replace `aria-label`.

## Evidence

`http://127.0.0.1:4341/components/colorswatchpicker/`, islands
mounted. From the default route, `comparison:controls-change` with
defaults plus `{ariaLabel:""}` or
`{id:"contract-colorswatchpicker", slot:"color"}`.

| live             | React                           | Solid                                         |
| ---------------- | ------------------------------- | --------------------------------------------- |
| `{ariaLabel:""}` | listbox name **Color swatches** | fixture `ariaLabel:""`, name **Accent color** |
| `{id, slot}`     | `id=contract-colorswatchpicker` | fixture id set, DOM id **solidaria-cl-169**   |

AX unlabeled: React `listbox "Color swatches"`; Solid
`listbox "Accent color"`.

`?ariaLabel=` rest: both `"Color swatches"`.
`?id=contract-colorswatchpicker&slot=color` rest: both forward the
explicit id (S2 `slot` stays context-only, no DOM slot).

## Done when

A live `ariaLabel` / `id` change on the comparison route updates
Solid's listbox name and id to match S2 (empty label injects
`Color swatches`; explicit id replaces the generated one). A walk
fails if the fixture JSON is unlabeled and the host is still Accent
color. URL remount must keep working. Do not start #254.

## Relationship

Child of #24. Found by #260. Wiring is
`packages/solidaria-components/src/Color.tsx` `cleanListBoxProps()`
and `packages/solidaria/src/listbox/createListBox.ts`
`createId(getProps().id)`. Same frozen-`fieldProps` class as
ProgressCircle #410, different host. Not #412 (size/rounding context).
Do not start #254.
