---
"@proyecto-viviana/solidaria": minor
---

Port the selectable-collection keyboard spine from React Aria (spine keystone 2)

Builds the keyboard/focus/selection engine on top of keystone 1's
`SelectionManager`, faithful to `@react-aria/selection`. This is the layer the
collection components (menu, listbox, combobox, grid) will migrate onto, and it
unblocks the autocomplete bridge.

- **`ListKeyboardDelegate`** — port of upstream's delegate: first/last/next/
  previous resolution, disabled skipping (honoring `disabledBehavior`),
  typeahead search via a collator, and orientation/RTL-aware horizontal
  navigation. Horizontal `getKeyLeftOf` / `getKeyRightOf` are present only for
  horizontal (or non-stack) layouts, exactly as upstream deletes them for a
  vertical stack so Left/Right no-op. Row navigation degrades to next/previous
  when item elements can't be measured (no DOM).
- **`DOMLayoutDelegate`** (+ `LayoutDelegate` / `Rect` / `Size`) — reads item
  geometry from the DOM for page up/down and 2D navigation; virtualized
  collections pass their own `layoutDelegate`.
- **`createSelectableCollection`** — port of `useSelectableCollection`: arrow /
  Home / End / PageUp / PageDown navigation, Ctrl+A select-all, Escape to clear,
  Tab handling, typeahead, select-on-focus, link behavior, a roving `tabIndex`,
  autofocus, and scroll-into-view. React's per-render effects become
  `createEffect`s reading the manager's reactive getters; bubbling
  `onFocus`/`onBlur` map to native `onFocusIn`/`onFocusOut`.
- **`createSelectableList`** — port of `useSelectableList`: derives a default
  `ListKeyboardDelegate` from the selection manager (recreated in a `createMemo`
  as collection / disabled keys / behavior change) and forwards the reactive
  collection props.
- A stable `data-collection` id is shared between a collection container and its
  items so `getItemElement` can scope its lookup. Keyed by the (stable)
  `SelectionManager` rather than upstream's collection object, since a Solid
  collection is rebuilt with a new identity when its items change. Unregistered
  items render no attribute, so unmigrated paths are unchanged.
