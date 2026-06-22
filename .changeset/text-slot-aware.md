---
"@proyecto-viviana/solidaria-components": minor
---

Make `Text` slot-aware, the foundational slice of `migrate-describedby-slots`.
`TextContext` now defaults to `{}` and `Text` resolves its slot through
`useContextProps`, so a field can provide the `id` (and other props) for a named
slot and a `<Text slot="description">` child picks it up — mirroring
react-aria-components' `Text`. The logical `slot` prop is excluded from the DOM
spread. Additive and behavior-preserving: no field provides `TextContext` slots
yet, so an unprovided `<Text>` renders exactly as before.
