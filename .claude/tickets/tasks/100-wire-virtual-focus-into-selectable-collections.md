---
id: 100
type: task
title: "Wire virtual focus into selectable collections"
created: 2026-08-20
parent: 31
status: open
history:
  - {
      state: open,
      at: 2026-08-20,
      note: "recovered from the completed press-path epic and current selection source comments",
    }
---

`solidaria` contains a faithful `moveVirtualFocus` implementation. The shared
selection hooks do not use it in two upstream branches.

`createSelectableItem` updates the focused key but does not move the assistive
technology cursor to the item. `createSelectableCollection` also omits the
cursor reset when a filtered collection has no focusable item.

## Scope

- Compare both branches with the pinned upstream selection source.
- Use the existing focus-layer primitives. Do not add a second implementation.
- Keep real DOM focus on the input when a consumer uses virtual focus.
- Dispatch the upstream virtual focus and blur events in the same order.
- Cover the empty, loading, disabled-item, and first-focusable-item branches.
- Prove the observable behavior in Autocomplete, ComboBox, and other applicable
  virtual-focus consumers.

## Done when

Focused tests and browser evidence fail if the assistive technology cursor does
not move or reset. Real DOM focus must not move to a collection item.

## Relationship

This task preserves the virtual-focus gap from the retired
`press-path-epic.md`. It uses the focus primitives that already live in
`packages/solidaria/src/focus/virtualFocus.ts`.
