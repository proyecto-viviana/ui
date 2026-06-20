---
"@proyecto-viviana/solidaria": patch
---

Type-to-select: mirror upstream `useTypeSelect` keydown semantics

`createTypeSelect` now follows `@react-aria/selection`'s pinned (1.19) keydown
behavior more faithfully:

- Alt combinations are ignored alongside Ctrl/Meta (upstream bails on
  `altKey`), so AltGr-only layouts no longer drive type-select.
- A matching character now calls `preventDefault()`/`stopPropagation()`, so the
  keystroke doesn't also reach the collection's own keydown handlers.
- When a keystroke fails to match anything, the search buffer is reset and the
  debounce timer cancelled immediately, so the next keystroke starts a fresh
  search instead of extending a stale buffer.
- The pending debounce timer is cleared on unmount.

The capture-phase Spacebar handler and the bubble-phase character handler are
now split to match upstream's two-handler shape. In Solid a capture listener
delivered through a `{...props}` spread is inert, so the live bubble handler
also covers a mid-search Spacebar (its bail only rejects a *leading* Space).
