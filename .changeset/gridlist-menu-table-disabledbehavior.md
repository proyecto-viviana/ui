---
"@proyecto-viviana/solidaria-components": patch
---

GridList, Menu, Table: forward the `disabledBehavior` prop to collection state

`GridList` and `Menu` now expose `disabledBehavior` (`"selection" | "all"`), and all
three wrappers forward it to their `createGridState` / `createMenuState` /
`createTableState` call. `Table` already accepted the prop but dropped it before it
reached the state, so it was silently ignored. The default stays `"all"`, leaving
existing behavior unchanged; under `"selection"` a disabled item stays focusable and
fires `onAction` while remaining unselectable, matching React Aria's `RACGridList`,
`Menu`, and `Table`.
