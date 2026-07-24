---
"@proyecto-viviana/solid-spectrum": patch
---

Let `Flex` take an inline `style`, the way `Grid` already does.

The same gap that was just closed in `@proyecto-viviana/ui`'s `Flex`, in the
register that shipped it first. `Grid` splits `style` out of its props and merges
it into the declarations it generates; `Flex` declared no such prop, so anything
passed landed in `rest` and was then overwritten by the `style={flexStyle()}`
assignment on the container — it vanished with no type error and no warning.

`style` is now merged first and the derived flex declarations are applied after
it, mirroring `Grid`'s ordering, so `direction`, `gap`, `wrap`, `alignItems` and
`justifyContent` still win over a hand-written override of the same property.
