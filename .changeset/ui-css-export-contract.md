---
"@proyecto-viviana/ui": patch
---

Fix the CSS export contract and drop a redundant built stylesheet

Each CSS subpath (`styles.css`, `components.css`, `theme.css`, `font-faces.css`)
previously exported `{ import: ./dist/X.css, default: ./src/X.css }`. The
`src/*.css` are build *sources* — `src/styles.css` is only the unresolved
`@import "@proyecto-viviana/solid-spectrum/styles.css"` and is missing the macro
CSS that the build inlines — so any consumer or tool resolving via the `default`
condition silently got an incomplete sheet. Each CSS subpath now resolves to its
single built `dist/*.css` target, so every resolution path yields the complete
stylesheet.

The build also dropped the redundant `dist/style.css` sidecar that `vp pack`
emits for the `style` entry: its atomic rules are already inlined into
`styles.css` and nothing imports it. The built CSS inventory now equals the
exported set (plus `viviana-tokens.css`, which is intentionally internal and
reachable only through `theme.css`'s relative `@import`).

`README.md` documents the styling contract: apps import the UI CSS explicitly
(`theme.css` + `components.css`), and `Provider` establishes runtime context but
injects no CSS.
