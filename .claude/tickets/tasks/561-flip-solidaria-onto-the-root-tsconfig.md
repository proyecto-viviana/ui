---
id: 561
type: task
title: "Flip packages/solidaria onto the root tsconfig so noUnusedLocals cannot come back"
created: 2026-09-20
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-20,
      note: "#555 item 8.3 cleared all 73 unused bindings (65 TS6133 + 8 TS6196) and then measured the flip the brief asked for: `packages/solidaria/tsconfig.json` extends `../../tsconfig.typecheck.json`, which sets `noUnusedLocals: false`, so the class only surfaces when a downstream package compiles solidaria. With the 73 gone, `tsc --noEmit -p packages/solidaria/tsconfig.json --noUnusedLocals` is clean, but the flip itself does cascade beyond the 73 - six errors, listed in Scope - so the brief's own instruction applies: stop, log what it cascaded into, leave the flip here. The 73 are landed either way",
    }
---

## Scope

Change `packages/solidaria/tsconfig.json` to extend `../../tsconfig.json` and
clear the six errors the flip exposes. Measured on the post-cleanup tree:

Five are `noUnusedParameters`, which the root config also turns on and the
typecheck config also disables - all unused _parameters_, not locals:

- `packages/solid-stately/src/calendar/createTimeFieldState.ts:125` - `T` in
  `TimeFieldState<T extends TimeValue = Time>`.
- `packages/solid-stately/src/dnd/createDraggableCollectionState.ts:46` - `T`
  in `DraggableCollectionStateOptions<T = object>`.
- `packages/solidaria/src/combobox/createComboBox.ts:56` - `T` in
  `getItemCount<T>`.
- `packages/solidaria/src/table/createTable.ts:90` - the `collection`
  parameter of `findNextNavigableKey`.
- `packages/solidaria/src/calendar/createCalendarCell.ts:179` - `e` in
  `handlePointerDown`.

Read each against upstream before renaming it: an unused type parameter on a
published interface is part of its signature, and dropping it is a breaking
change to every consumer that writes `TimeFieldState<MyTime>`.

The sixth is not an unused binding at all:

- `packages/solidaria/src/utils/dom.ts:617` - `Cannot find name 'process'`.
  The typecheck config carries `"types": ["node"]`, the root config does not.
  Decide whether the package tsconfig keeps `types` of its own or whether that
  `process.env.NODE_ENV !== "test"` branch belongs in library source.

## Done when

`packages/solidaria/tsconfig.json` extends the root config and
`tsc --noEmit -p packages/solidaria/tsconfig.json` is clean.

## Proof

The command above, before and after.

## Relationship

Child of #544. Split out of #555 item 8.3 under that brief's own stop rule.
