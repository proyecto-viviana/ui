---
"@proyecto-viviana/solidaria": patch
---

Menu: only skip disabled items during navigation under `disabledBehavior: "all"`

`createMenu`'s keyboard navigation (arrow keys, Home/End, and PageUp/PageDown)
skipped every disabled item regardless of `disabledBehavior`, so a
`"selection"`-disabled item could never be focused. The navigation skip is now
gated on the resolved `disabledBehavior` (default `"all"`), mirroring React
Aria's `ListKeyboardDelegate.isDisabled`. Under `"selection"` disabled items
stay focusable. Activation (Enter/Space) keeps the raw disabled check, so a
disabled item is never activated regardless of `disabledBehavior`, matching
`SelectionManager.canSelectItem`.
