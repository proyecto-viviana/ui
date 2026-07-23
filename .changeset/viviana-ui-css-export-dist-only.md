---
"@proyecto-viviana/ui": patch
---

Resolve every CSS subpath export to `dist`, so a consumer can never be handed a
build source instead of the built sheet.

The five CSS entries were conditional — `{ "import": "./dist/X.css", "default":
"./src/X.css" }` — and `src/styles.css` is no longer a real sheet: since the
macro started emitting one flat atomic file, it is a 64-byte comment, against
73KB of shipped CSS in `dist/styles.css`. Any resolver that fell through to
`default` (a CSS-level `@import` of the package, a `require`-conditioned
bundler) therefore got no component styling at all, and `components.css` — the
single-file convenience entry — inherited the same hole through its relative
`@import`. The subpaths are now plain strings pointing at `dist`, which resolves
identically under every condition.

The out-of-workspace consume smoke also stops fingerprinting the retired
`inline-macro-css.mjs` mechanism (a marker comment plus a nested
`@proyecto-viviana/solid-spectrum` `@import`, neither of which the current build
emits) and asserts the actual contract instead: the shipped sheet carries no
unresolvable bare `@import`, and every class the SSR render emits has a matching
rule in it.
