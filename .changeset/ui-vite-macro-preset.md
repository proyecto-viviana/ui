---
"@proyecto-viviana/ui": minor
---

Add a supported Vite macro preset for app-authored `style()` calls

Apps that consume the pre-built components need no macro plugin — those
`style()` calls are already expanded in the published build. But an app that
authors its own `style()` against `@proyecto-viviana/ui/style` (the macro seam)
must run the macro at its own build, and until now there was no shipped way to
do that: downstream apps hand-copied a wrapper around `unplugin-parcel-macros`
to make the macro's emitted `import "macro-<hash>.css"` virtual modules resolve
and load under rolldown-vite.

A new `@proyecto-viviana/ui/vite` export ships that wrapper as a supported
preset, `vivianaMacros()`:

```ts
import { vivianaMacros } from "@proyecto-viviana/ui/vite";
// vivianaMacros() must come before vite-plugin-solid (and framework plugins):
plugins: [vivianaMacros(), solid({ ssr: true })],
```

`vivianaMacros()` wraps `macros.rolldown()` and teaches Vite to resolve/load the
macro-emitted CSS (caching it on transform, serving it through a `.css` virtual
module, and stripping the JS import from the server bundle so SSR builds don't
fail to resolve it). `unplugin-parcel-macros` is declared as an optional peer
dependency so the app's own instance is used; it stays external in the helper's
build. The `optimizeDeps` / `ssr.noExternal` lists stay app-owned and are
documented in `README.md`.

`scripts/macro-preset-smoke.mjs` is an executable reference: it builds an
app-authored `style()` call through `vivianaMacros()` for both DOM and SSR,
asserting the macro generates CSS (the sentinel lands in the DOM CSS asset) and
that the `style()` runtime class expands in the SSR-rendered HTML.
