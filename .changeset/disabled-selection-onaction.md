---
"@proyecto-viviana/solidaria": patch
---

Tree, GridList, ListBox, Menu: fire `onAction` for a `disabledBehavior: "selection"` item on activation

Activation (Enter, plus Space for Menu and ListBox) was gated on the raw disabled
check, so a `"selection"`-disabled item — which stays focusable under that
behavior — never fired its `onAction`. The activation branch now uses the
navigation-disabled gate (`disabledBehavior === "all"`), mirroring React Aria's
`useSelectableItem` `allowsActions`, which depends on `SelectionManager.isDisabled`
(itself gated on `"all"`). Selection stays blocked regardless of behavior: the
selection mutators (`select` / `toggleSelection` / `replaceSelection`) self-guard
on the raw disabled check, matching `SelectionManager.canSelectItem`. Under the
default `"all"` behavior the item is unreachable in keyboard navigation, so its
behavior is unchanged.
