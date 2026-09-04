---
id: 288
type: task
title: "Filter Autocomplete ListBox options as the user types"
created: 2026-09-03
parent: 24
status: verified
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 autocomplete functional pass: React drops non-matching fruits from the listbox; Solid keeps all eight visible while virtual focus still walks the filtered set",
    }
  - {
      state: in-progress,
      at: 2026-09-04,
      note: "ListBox option DOM still iterates stateProps.items; createFilteredListState already walks the filtered collection",
    }
  - {
      state: merged,
      at: 2026-09-04,
      note: "ListBox empty/visible/sectioned/For/virtualizer count from state.collection() node.value. SearchField+ListBox fruits test fails if Cherry stays mounted after typing a.",
    }
  - {
      state: verified,
      at: 2026-09-04,
      note: "independent review APPROVE at ff02dc06; ListBox renders filtered state.collection(). Tester Autocomplete 98/98.",
    }
---

Standalone Autocomplete on `/components/autocomplete/` must hide options that
fail the `contains` filter as the user types, the same as RAC Autocomplete +
ListBox. Solid's list state is filtered (keyboard Home/End/Arrow and
`aria-activedescendant` walk the matching keys), but the ListBox still
renders every `items` row.

`packages/solidaria-components/src/ListBox.tsx` already wraps Autocomplete
collections in `createFilteredListState`. Option DOM, `data-empty`, and
virtualizer length now iterate `state.collection()` item `value`s, matching
RAC Collection. No Autocomplete-only render fork: without that context,
`state === baseState` and ComboBox stays unfiltered.

## Evidence

`http://127.0.0.1:4341/components/autocomplete/`, one panel at a time,
`data-islands-mounted`. Type into `input[type=search]`, wait 600ms for the
activedescendant delay.

| step                       | React                                                                   | Solid                                                           |
| -------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------- |
| type `a`                   | 6 options Apple/Banana/Grape/Mango/Orange/Peach, Cherry/Lemon unmounted | **8 options**, Cherry and Lemon still `display:block` height 23 |
| type `a` then ArrowDown ×2 | activedescendant Grape                                                  | activedescendant Grape (keyboard uses the filtered set)         |
| type `an`                  | 3 options Banana/Mango/Orange                                           | **8 options**                                                   |
| type `zzz`                 | 0 options, `data-empty`                                                 | **8 options**, no `data-empty`                                  |
| ArrowDown then Space       | input ` `, 0 options, activedescendant cleared                          | input ` `, **8 options**, activedescendant Apple                |

Default rest, Tab, pointer selection, and `?selectionMode=single|multiple`
already match.

Local (2026-09-04), cwd `/home/emoporemilio/projects/viviana-hub/ui`,
parent `db6ac74f`. Source: `isEmpty` / `visibleItems` /
`sectionedRenderEntries` / virtualizer count / persisted row read
`state.collection()` item nodes (`node.value`). Empty sections dropped.
Named SearchField+ListBox fruits test failed on `stateProps.items`
(Cherry/Lemon still mounted after `a`). After collection-driven render:

`vp test run packages/solidaria-components/test/Autocomplete.test.tsx packages/solidaria-components/test/ListBox.test.tsx`
PASS (98): type `a` leaves Apple/Banana/Grape/Mango/Orange/Peach;
Cherry/Lemon unmounted; `zzz` 0 options + `data-empty`. Stub `TestList`
filter stayed green. ListBox empty-state / section tests stayed green.

Owned-file `vp check` PASS. `git diff --check` PASS on named paths.
Repo-wide `vp run check` not run. Comparison walk not run. #289 SearchField
native attrs not started.

## Done when

Typing `a` on the comparison Autocomplete leaves the same six visible
options as React (Cherry and Lemon gone). `zzz` leaves an empty listbox on
both stacks. A package or comparison test fails if Solid still shows a
non-matching fruit while React has unmounted it.

## Relationship

Child of #24. Found by #260. Distinct from #86 (shared-spine wiring; filter
state and Autocomplete contexts already exist) and from #245 (ComboBox
`items` vs `defaultItems`, both stacks unfiltered). Do not start #254.
