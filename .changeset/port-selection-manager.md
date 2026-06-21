---
"@proyecto-viviana/solid-stately": minor
---

Port the two-layer selection model from React Stately (spine keystone)

Upstream splits collection selection into two layers, and our engine had
collapsed them into one. This restores the upstream shape so the rest of the
headless spine (the selectable-collection keyboard delegate, context slots, the
autocomplete bridge) can build on a faithful base.

- **`createMultipleSelectionState`** — the raw lower layer (port of
  `useMultipleSelectionState`): owns selected keys, focus, selection behavior,
  and disabled keys, but is *not* collection-aware. Includes the faithful
  `selectionBehavior` sync rules (long-press-to-select reset, prop changes).
- **`SelectionManager`** — the collection-aware upper layer (port of the
  `SelectionManager` class): toggle / replace / extend-range / select-all /
  `firstSelectedKey` / `lastSelectedKey` / `withCollection`, etc., built on top
  of the raw state. Now exported publicly (`SelectionManager`,
  `SelectionManagerOptions`, `LayoutDelegate`).
- **`createListState`** now builds `createMultipleSelectionState` +
  `SelectionManager` internally and exposes the manager as
  `ListState.selectionManager` (matching upstream `useListState`). The flattened
  surface is kept as a delegating shim for back-compat.
- **`ComboBoxState` / `SelectState`** expose `selectionManager` too, mirroring
  upstream `useComboBoxState` / `useSelectState` (the combobox manager stays
  bound to the unfiltered collection; filtering is display-only).

Faithful behavior change: `onSelectionChange` now receives a `Selection` (a
`Set` subclass carrying `anchorKey` / `currentKey`) instead of a plain `Set`,
exactly as upstream does. A `Selection` *is* a `Set`, so `.has`, iteration,
`.size`, spread and `instanceof Set` all behave identically — the anchor/current
metadata is what lets controlled consumers continue shift-click ranges across a
round-trip. Tests that asserted an exact plain-`Set` instance now compare
contents.
