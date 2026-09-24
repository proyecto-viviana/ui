---
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/solidaria-components": patch
"@proyecto-viviana/ui": patch
---

TextField and SearchField resolve a `prefix`/`suffix` adornment once. A JSX prop
compiles to a getter that re-runs the component body on every read, and the
input's `aria-labelledby` thunk is read again from inside the input's ref
callback, which Solid 2 applies with no owner — a context-reading adornment
(`suffix={<Keyboard/>}`) threw there and blanked the page. `children()` resolves
each node under the field's own owner, so the later reads are safe.

`Input` and `TextArea` read the context's `inputProps.ref` in the component body
instead of inside the ref callback, for the same reason.

`createComboBox` builds its announcement string formatter unconditionally, as
`useComboBox` does upstream, instead of on the client only. Solid 2 hydration
keys are a per-owner path, so the client-only formatter shifted every sibling key
after it and the combobox's help text — which claims through `ElementTag` and has
no fallback — threw a hydration mismatch.
