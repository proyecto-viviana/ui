---
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/solidaria-components": patch
---

Menu: pass the activated item's value as the second `onAction` argument

Menu-level `onAction` now fires `(key, value)` instead of `(key)`, matching
React Aria 1.19. Upstream `@react-aria/menu` `useMenu` types it as
`onAction?: (key: Key, value: T) => void` and threads `props.onAction` into the
shared, type-erased `MenuData` (`utils.ts`: `onAction?: (key, value: any)`),
where both `useMenuItem` `performAction` (press/keyboard) and the menu's own
keyboard activation invoke `onAction(key, item?.value)`.

- **solidaria / createMenu**: `AriaMenuProps` is now generic (`AriaMenuProps<T>`),
  its `onAction` typed `(key, value: T)`. The keyboard activation path passes
  `collection.getItem(focusedKey)?.value`, and `MenuData.onAction` is type-erased
  (`value: unknown`) like upstream's `MenuData`.
- **solidaria / createMenuItem**: the press path now calls
  `data.onAction(key, item?.value)` after the item-level `onAction()`, mirroring
  `useMenuItem` `performAction`.
- **solidaria-components / Menu**: `MenuProps.onAction` is typed `(key, value: T)`.
  For dynamic collections the forwarded `value` is the user's data item (the node
  `value`); static JSX children are modeled with an internal item descriptor that
  upstream React Aria Components does not expose as `value` (RAC `Menu.tsx`
  auto-sets `MenuItem.value` only for dynamic collections), so it is suppressed to
  `undefined` there to match.

The new `value` argument also flows transparently through the S2 `ActionMenu` and
`Menu` (`@proyecto-viviana/solid-spectrum`), which forward the underlying
collection's `onAction`.
