---
"@proyecto-viviana/solid-stately": patch
"@proyecto-viviana/solidaria": patch
---

GridList: skip disabled rows during keyboard navigation under `disabledBehavior: "all"`

`createGridList`'s `ArrowDown`/`ArrowUp`/`Home`/`End`, the horizontal
`ArrowRight`/`ArrowLeft` axis, and the focus-in entry point previously landed on
disabled rows. They now walk past them to the next/previous/first/last enabled
row, mirroring React Aria's `ListKeyboardDelegate`. The skip is gated on the
default `disabledBehavior: "all"`; under `"selection"` disabled rows stay
focusable (only their selection is suppressed).

To drive this gate the shared grid state now resolves and exposes
`disabledBehavior` (default `"all"`), the same way upstream reads it from the
selection manager. `GridStateOptions` and `TableStateOptions` accept the prop,
and `createTableState` threads it through, so Table inherits the same resolved
default. Selection of disabled keys remains blocked regardless of
`disabledBehavior`, matching `SelectionManager.canSelectItem`.
