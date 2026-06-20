---
"@proyecto-viviana/solid-stately": patch
"@proyecto-viviana/solidaria": patch
---

Selection: restore upstream's two-layer onSelect split

Selection state previously resolved modifier keys (`ctrlKey || metaKey`,
`shiftKey`) inside `SelectionState.select()` — a divergence from React Spectrum,
where `react-stately`'s `SelectionManager.select` only consults `pointerType` +
`selectionBehavior`, and the modifier/shift decision lives in the aria layer's
`useSelectableItem.onSelect`. That divergence also blocked platform-aware ctrl
resolution, since `solid-stately` can't reach `isMac`.

This mirrors the upstream split:

- **`solid-stately`** `select(key, e?)` is thinned to the `SelectionManager.select`
  shape: single-mode toggle/replace, then `selectionBehavior === 'toggle'` or a
  `touch`/`virtual` `pointerType` toggles, otherwise replace. It no longer reads
  modifier keys or takes a `collection` argument. A new `SelectionPressEvent`
  type describes the press/pointer interaction it consults.
- **`solidaria`** gains the aria-layer decision `selectItem` (mirroring
  `useSelectableItem.onSelect`) plus the `isCtrlKeyPressed` and
  `isNonContiguousSelectionModifier` helpers. `createMenu`'s keyboard activation
  now routes selection through `selectItem`, so the non-contiguous modifier is
  platform-aware (Command/Alt on macOS, Control elsewhere) and the shift-extend
  path is applied.

No user-visible behavior change for the existing menu/listbox/actiongroup paths
beyond making keyboard modifier selection platform-correct; the foundational
work unblocks the collection item-hook press-path migration.
