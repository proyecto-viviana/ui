---
"@proyecto-viviana/solidaria": patch
---

ListBox: only skip disabled options during navigation under `disabledBehavior: "all"`

`createListBox`'s `findNextEnabledKey` previously skipped every disabled option
during arrow/Home/End navigation regardless of `disabledBehavior`, so a
`"selection"`-disabled option could not be focused. It now gates the skip on the
resolved `disabledBehavior` (default `"all"`), mirroring React Aria's
`ListKeyboardDelegate.isDisabled`: under `"selection"` disabled options stay
focusable, and their selection remains blocked by the selection state
(`SelectionManager.canSelectItem` semantics).
