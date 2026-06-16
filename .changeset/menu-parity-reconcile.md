---
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/solidaria-components": patch
"@proyecto-viviana/solid-spectrum": patch
---

Menu parity fixes: shouldCloseOnSelect, mouse pressed state, ActionMenu rich items, roving focus

**solidaria / createMenu**: gate `onClose` on `shouldCloseOnSelect !== false` so keyboard-activated items with that prop set do not close the menu — mirrors `@react-aria/menu` `useMenuItem` line 231.

**solidaria / createMenuItem**: rename `_ref` to `ref` and wire a `createEffect` that imperatively calls `focusSafely` when the item becomes the focused key and real DOM focus has not already landed there. Completes the roving-tabindex loop: the declarative tabIndex 0/-1 swap is now backed by an actual focus call, matching `@react-aria/selection` `useSelectableItem`.

**solidaria-components / Menu**: fix `shouldCloseOnSelect` splitProps grouping (was in `local`, now in `stateProps`) so the value reaches `createMenu`; add `MenuItemCloseRegistryContext` for per-item override; add `get shouldCloseOnSelect()` getter on `ariaProps`; wire mouse-pressed signal into `MenuTriggerContextValue` so `MenuButton` reflects pointer-down state correctly.

**solid-spectrum / ActionMenu**: replace the internal `HeadlessMenuItem` usage with the full `MenuItem` component; surface description, shortcut, icon, `isDisabled`, and link props (`href`/`target`/`rel`/`download`) matching the upstream S2 `ActionMenu` API.

**solid-spectrum / menu/index**: extract `MenuItemContents` as a named SolidJS component to allow reuse by `ActionMenu`.
