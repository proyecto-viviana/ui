---
"@proyecto-viviana/ui": patch
---

Let `Flex` take an inline `style`, the way `Grid` already does.

`Grid` splits `style` out of its props and merges it into the declarations it
generates, so a consumer can add a margin or a min-width without giving up the
primitive. `Flex` declared no such prop: anything passed landed in `rest` and
was then overwritten by the `style={flexStyle()}` assignment on the container,
so it vanished with no type error and no warning. The two primitives are meant
to be interchangeable, and the gap forced every decorated row back onto a bare
`div`.

`style` is now merged first and the derived flex declarations are applied after
it — mirroring `Grid`'s ordering — so `direction`, `gap`, `wrap`, `alignItems`,
and `justifyContent` still win over a hand-written override of the same
property.
