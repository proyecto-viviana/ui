---
id: 533
type: task
title: "Transition solid-stately to standard signal accessors"
created: 2026-09-13
parent: 531
status: open
history:
  - {
      state: open,
      at: 2026-09-13,
      note: "opened under #531 to retire the MaybeAccessor runtime tax and align with Solid 2 push-pull reactivity",
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
