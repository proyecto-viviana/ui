---
id: 584
type: task
title: "The picker trigger's state attributes are on the wrong element, and half of them serialise to an empty string"
created: 2026-09-21
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-21,
      note: "graded by the conductor from shard 5 of Certification Gates run 35556441049. Two D13 rows, one file, and that file already contains the correct idiom forty lines below the wrong one. Not folded into #497: that one is the combobox checkmark accent and this is Select's data attributes",
    }
---

## The defect

`D13 journeys — Picker trigger`, both cases —
`open-arrow-enter-reopen-scroll-escape` and `keyboard-only` — failing at step 0,
`click trigger`, field `dom`, at `journeys.ts:275`.

Two halves of one story.

On the `<button>` (`aria-haspopup: "listbox"`, `aria-expanded: "true"`), ours
carries `data-focused: "true"` and `data-open: "true"`. Upstream carries
`data: {}` — nothing at all.

On the root `<div>`, ours carries `data-focused: ""` and `data-open: ""`.
Upstream carries `"true"` and `"true"`.

RAC puts these on the root only. `react-aria-components/src/Select.tsx:284` is
`data-open={state.isOpen || undefined}`, and there is no other `data-open` in
the file. So `data-open` on our trigger button is an attribute upstream does not
render anywhere, and `data-focused` surviving on it after the click says our
focus tracking does not release the trigger when focus moves into the listbox.

The empty strings are the second half, and they are a serialisation bug.
`packages/solidaria-components/src/Select.tsx:776-782` builds the root props
with raw booleans — `"data-focused": isFocused() || undefined` — and a boolean
spread onto an element writes `""`, where React writes `"true"`. Forty lines
down, `:943-947` does it correctly with the helper this repository already has:
`dataAttr` at `packages/solidaria-components/src/utils.tsx:442`, typed
`"true" | undefined`. One file, two idioms, and the wrong one is on the element
the oracle reads.

## Scope

`packages/solidaria-components/src/Select.tsx`.

1. Root props at `:776-782`: route every `data-*` through `dataAttr` so the
   attribute is `"true"` or absent, never `""`.
2. Trigger button at `:943-947`: drop `data-open`, which RAC does not render on
   this element.
3. `data-focused` on the trigger: find why it is still true after the popover
   takes focus, and make it follow the focused element the way RAC's does.
   Fixing this by deleting the attribute is not the fix — `data-focused` is a
   documented RAC selector and consumers style on it.

Non-goal: the other emitters. `Menu.tsx:1681`, `DatePicker.tsx` (four sites),
`ComboBox.tsx` and `ActionBar.tsx:202` already use `dataAttr`; check them for
the same raw-boolean shape while here, but do not change behaviour that the
certified roster is not calling out.

## Done when

`certified/picker` D13 is green on both journeys, the root carries `"true"`,
and the trigger button carries what RAC's does and nothing more.

## Proof

`certified/picker`, with the counts recorded here, and the D13 `dom` field
diffed to empty on both cases. Mutation-prove the serialisation half by putting
a raw boolean back on one attribute and watching the `""` return.

## Relationship

Child of #544. One of the fourteen components in
`.agents/certified-169-census-2026-09-21.md`. Sibling of #585, which is the
same component's list box and a different cause; sibling of #497, which is the
combobox checkmark and neither of these.
