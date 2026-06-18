---
"@proyecto-viviana/solid-stately": patch
"@proyecto-viviana/solidaria": patch
---

Tree: align disabled-key keyboard and selection semantics with upstream

Disabled tree keys now follow React Aria's split between navigation and
selection, instead of conflating the two:

- **Keyboard navigation skips disabled rows under the default `disabledBehavior:
  "all"`.** `createTree`'s `ArrowDown`/`ArrowUp`/`Home`/`End` handlers (and the
  focus-in entry point) previously landed on disabled rows; they now walk past
  them to the next/previous/first/last enabled row, mirroring
  `ListKeyboardDelegate.getKeyBelow`/`getKeyAbove`/`getFirstKey`/`getLastKey`.
  Under `disabledBehavior: "selection"` disabled rows stay focusable, matching
  upstream (only their selection is suppressed). `TreeState` now exposes the
  resolved `disabledBehavior` so the navigation layer can apply this gate, the
  same way upstream reads it from the selection manager.
- **Disabled keys are never selectable, regardless of `disabledBehavior`.**
  `toggleSelection`/`replaceSelection`/`extendSelection` previously only blocked
  disabled keys under `"all"`, so a `"selection"`-disabled key could still be
  selected. They now block disabled keys unconditionally, mirroring
  `SelectionManager.canSelectItem`, which ignores `disabledBehavior`.

Expansion behavior is unchanged.
