---
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/solidaria-components": patch
"@proyecto-viviana/solid-spectrum": patch
---

Menu/ActionMenu: restore SR-operable focus + item descriptions (D5/D6 backfill)

Three faithful parity fixes surfaced by adding the focus-trail (D5) and
AX-tree (D6) pair-oracle drivers to the Menu/ActionMenu certifications:

- **Roving tabindex** (`createMenu`): the menu container's `tabIndex` was
  hard-coded to `0`; upstream `useMenu` binds `focusedKey == null ? 0 : -1`.
  Restored as a getter that survives `mergeProps`, so real DOM focus follows
  `focusedKey` instead of leaving a phantom tab stop on the container.
- **Item accessible description** (`createMenuItem` + `Menu` + solid-spectrum
  `menu`): menu items exposed no accessible description — the item's
  `aria-describedby` was stripped and the description/keyboard-shortcut elements
  never received ids. Restored via `createSlotId` (matching upstream
  `useSlotId`, so a description-less item drops the reference instead of
  dangling) with the ids threaded through the render-props data channel into the
  S2 `TextContext`/`KeyboardContext` slots. Shared `Text`/`Keyboard` untouched,
  so no field-family regression.
- **Element-type parity**: the menu list/items render as `div`s (role-driven),
  matching upstream, instead of `ul`/`li`.
