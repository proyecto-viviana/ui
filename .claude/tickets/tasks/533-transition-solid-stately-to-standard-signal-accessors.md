---
id: 533
type: task
title: "Transition solid-stately to standard signal accessors"
created: 2026-09-13
parent: 531
status: in-progress
history:
  - {
      state: open,
      at: 2026-09-13,
      note: "opened under #531 to retire the MaybeAccessor runtime tax and align with Solid 2 push-pull reactivity",
    }
  - {
      state: in-progress,
      at: 2026-09-27,
      note: "createListState and createSingleSelectListState resolve a props object or accessor once. Later reads call that accessor, so getKey stays a field. A standard accessor updates the collection. collections.test.ts passes 45/45 and direct list callers pass 170/170. Table, tree, and the rest of MaybeAccessor remain",
    }
  - {
      state: in-progress,
      at: 2026-10-07,
      note: "Collection state resolves a props object or accessor once. Grid, table, tree, tree grid, menu, selection, select, combobox, and tabs keep getKey, filters, and callbacks as fields, and a standard accessor updates the collection. vp test run of the nine touched solid-stately files passes 277/277. Calendar field accessors and the remaining bag-level access() calls stay open",
    }
---

## Cause

`solid-stately` currently wraps almost all props in `MaybeAccessor<T> = T | (() => T)`
and calls `access(prop)` on every read. This incurs repeated runtime type checks
and creates ambiguity when prop values are themselves functions (formatters,
render props, filter predicates).

## Work

1. Audit `MaybeAccessor` usage across `packages/solid-stately/src`.
2. Standardize on Solid 2.0 signal accessors / prop getters.
3. Align collection state hooks (`createTableState`, `createTreeState`,
   `createListState`) with Solid 2.0 push-pull reactivity.

## Done when

`access()` calls are eliminated from hot loops in `solid-stately` and state
helpers accept standard reactive accessors.

## Relationship

Child of #531, sibling of #532.
