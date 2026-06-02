---
"@proyecto-viviana/solid-stately": minor
"@proyecto-viviana/solidaria": minor
"@proyecto-viviana/solidaria-components": minor
"@proyecto-viviana/solid-spectrum": minor
"@proyecto-viviana/viviana-ui": minor
---

Build with tsdown (Rolldown/Oxc) and adopt the standard Solid-library
JSX-preserve layout.

The `solid` export condition now resolves to a built, JSX-preserved `dist/*.jsx`
entry that the consumer compiles per-environment, alongside a compiled
`dist/*.js` `default` fallback — replacing the dual DOM+SSR bundle (whose SSR
half was never wired into `exports`). SSR consumers can now resolve the packages
from `node_modules` without recompiling first-party source. solid-spectrum's
`style()` macro still runs at build time (emitting `styles.css`), so consumers
don't need the macro plugin. viviana-ui ships its first real dist (a thin
re-export of solid-spectrum).
