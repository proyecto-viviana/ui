---
id: 288
type: task
title: "Filter Autocomplete ListBox options as the user types"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 autocomplete functional pass: React drops non-matching fruits from the listbox; Solid keeps all eight visible while virtual focus still walks the filtered set",
    }
---

Standalone Autocomplete on `/components/autocomplete/` must hide options that
fail the `contains` filter as the user types, the same as RAC Autocomplete +
ListBox. Solid's list state is filtered (keyboard Home/End/Arrow and
`aria-activedescendant` walk the matching keys), but the ListBox still
renders every `items` row.

`packages/solidaria-components/src/ListBox.tsx` already wraps Autocomplete
collections in `createFilteredListState`, then iterates `stateProps.items` /
`visibleItems()` for the option DOM (`isEmpty()` also uses
`stateProps.items.length`). RAC Collection renders the filtered collection.

## Evidence

`http://127.0.0.1:4341/components/autocomplete/`, one panel at a time,
`data-islands-mounted`. Type into `input[type=search]`, wait 600ms for the
activedescendant delay.

| step | React | Solid |
|---|---|---|
| type `a` | 6 options Apple/Banana/Grape/Mango/Orange/Peach, Cherry/Lemon unmounted | **8 options**, Cherry and Lemon still `display:block` height 23 |
| type `a` then ArrowDown ×2 | activedescendant Grape | activedescendant Grape (keyboard uses the filtered set) |
| type `an` | 3 options Banana/Mango/Orange | **8 options** |
| type `zzz` | 0 options, `data-empty` | **8 options**, no `data-empty` |
| ArrowDown then Space | input ` `, 0 options, activedescendant cleared | input ` `, **8 options**, activedescendant Apple |

Default rest, Tab, pointer selection, and `?selectionMode=single|multiple`
already match.

## Done when

Typing `a` on the comparison Autocomplete leaves the same six visible
options as React (Cherry and Lemon gone). `zzz` leaves an empty listbox on
both stacks. A package or comparison test fails if Solid still shows a
non-matching fruit while React has unmounted it.

## Relationship

Child of #24. Found by #260. Distinct from #86 (shared-spine wiring; filter
state and Autocomplete contexts already exist) and from #245 (ComboBox
`items` vs `defaultItems`, both stacks unfiltered). Do not start #254.
