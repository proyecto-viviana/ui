---
"@proyecto-viviana/solidaria": minor
"@proyecto-viviana/solidaria-components": minor
---

Split the `.` barrel into per-primitive build entries and add subpath exports

Both packages previously shipped a single bundled `dist/index.jsx` for the `solid`
export condition. Because that barrel exceeded 500 KB, any consumer — even one
importing a single primitive — dragged the whole file through `vite-plugin-solid`,
tripping Babel's `compact: "auto"` deopt ("the code generator has deoptimised …
as it exceeds 500KB"). App-level `babel.compact` only masked the warning.

The build now emits one entry per public module (shared code hoisted into
`_chunk/` chunks), so `dist/index.jsx` is a thin re-export barrel and no emitted
`.jsx` approaches the deopt threshold — the warning is gone for barrel consumers
too. Each primitive also gains a subpath export:

```ts
import { createButton } from "@proyecto-viviana/solidaria/button";
import { Button } from "@proyecto-viviana/solidaria-components/Button";
```

The `.` barrel is preserved, so existing imports keep working — this is additive.
solidaria's impl lands inside its type directory (`dist/<name>/index.jsx`) so the
barrel's relative `export … from "./<name>"` resolves to the typed directory
rather than a flat sibling file. A new `guard:jsx-deopt-size` check keeps every
published `.jsx` under the threshold.
