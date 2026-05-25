# 06 · `solid-spectrum` CSS Collection Defect

> **Scope: this is a general `solid-spectrum` library bug.** It is _not_ part of
> the comparison-docs overhaul — it affects every consumer of the package. It
> lives in this directory only because the overhaul surfaced it and depends on
> the fix. Treat it as its own issue/PR against `packages/solid-spectrum`.

## Summary

`solid-spectrum` ships several components — confirmed `Disclosure`,
`Accordion`, and very likely `Table`, `Card`, `Tabs` — whose CSS is **absent
from the published stylesheet**. A consumer importing one of these components
plus the package's CSS gets an unstyled or under-styled component.

Root cause: the package vendors React Spectrum's `style` **macro** but runs it
as a plain runtime function, then re-collects its CSS with a **hand-maintained
list of modules** that has drifted out of sync with the component set.

|              |                                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------------- |
| Severity     | High — visibly broken components for any downstream consumer.                                           |
| Affected     | `Disclosure`, `Accordion` (verified); `Table`, `Card`, `Tabs` (same mechanism, not yet 100% confirmed). |
| Surfaced by  | The comparison-docs overhaul ([`02-style-and-build.md`](02-style-and-build.md) §2a).                    |
| Fix location | `scripts/generate-solid-spectrum-s2-css.ts` (+ optionally the style layer).                             |

## Background: how React Spectrum's `style` macro works

Upstream React Spectrum styles components with a **build-time macro**:

```tsx
import { style } from "@react-spectrum/s2/style" with { type: "macro" };
const styles = style({ padding: 8, backgroundColor: "layer-1" });
```

The `with {type: 'macro'}` import attribute is a **Parcel** feature. When
Parcel's JS transformer sees a call to a macro-imported function, it:

1. **Evaluates the function at build time**, in Node, during compilation.
2. Binds `this` to a `MacroContext` — an object with an
   `addAsset({type, content})` method (the interface is literally in the
   vendored code, `style-macro.ts:293`).
3. `style()` computes the class names _and_ the CSS, then calls
   `this.addAsset({type: 'css', content: css})` — handing the CSS to Parcel as
   a brand-new asset attached to that module. Parcel bundles it like any other
   imported `.css`.
4. The macro's return value (the class-name string) is **inlined** into the JS,
   replacing the `style(...)` call. For dynamic styles (conditions /
   render-props), the macro instead emits a small JS function as **source
   code** that Parcel inlines.

The crucial property: **CSS collection is exhaustive by construction.** The
bundler already walks every module in the dependency graph; every `style()`
call it encounters emits its CSS automatically. Nothing can be missed, and
there is no list to maintain. After the build, `style()` does not exist at
runtime at all — it has been compiled away.

## What `solid-spectrum` did

Per `packages/solid-spectrum/src/style/UPSTREAM.md`, the entire `style/`
directory is a **verbatim vendored copy** of `@react-spectrum/s2@1.3.0`'s
`style/` folder — `style-macro.ts`, `spectrum-theme.ts`, `tokens.ts`, etc. The
`style()` function (`createTheme()` in `style-macro.ts:314`) is byte-for-byte
the same macro function.

The one relevant "local change" listed in `UPSTREAM.md`:

> Parcel macro asset emission is mirrored into a local CSS asset registry.

In code (`style-macro.ts:481`):

```js
addS2CssAsset(css); // <-- the local change
if (this && typeof this.addAsset === "function") {
  this.addAsset({ type: "css", content: css }); // <-- original Parcel path
}
```

`addS2CssAsset` pushes the CSS string into an in-memory `Set` (`assetRegistry`);
`getS2CssAssets()` reads it, `clearS2CssAssets()` resets it.

But `solid-spectrum` was built with **tsup/esbuild** and consumed by
**Vite/Astro** without the Parcel macro plugin configured. So:

- `style()` is **never** called as a macro. `this` is always `void`; the
  `this.addAsset` branch never runs. Only `addS2CssAsset(css)` runs.
- `style()` is **never compiled away**. It ships in the bundle and executes at
  **module-evaluation time** — i.e. at runtime in the browser, or whenever a
  Node script `import`s the module.

## Root cause

The macro provided two things at once: (a) class-name generation, and (b)
**automatic, total CSS collection driven by the bundler's traversal.**
`solid-spectrum` kept (a) but lost (b), and replaced it with a manual
substitute.

The substitute is `scripts/generate-solid-spectrum-s2-css.ts`, run as the first
step of the package build. It:

```js
clearS2CssAssets();
generatePageStyles();
await import(".../src/provider");
await import(".../src/divider");
await import(".../src/picker");
// …a hand-written list of ~18 component modules…
writeFileSync("s2-generated.css", getS2CssAssets().join("\n\n"));
```

Importing a module evaluates its top-level `style()` calls, which fill the
registry; the script then flushes the registry to a file. **That manual
`import` list is the bug.** It enumerates ~18 modules and omits `disclosure`,
`accordion`, `table`, `card`, and `tabs` — and none of the 18 transitively
import them. Their CSS therefore never enters `s2-generated.css`.

This is the macro connection the question asked about: **yes, the bug is a
direct consequence of de-macro-ifying.** The macro made "collect every
component's CSS" a free, unmissable side effect of bundling. Dropping the macro
turned it into a list someone has to remember to update — and it drifted.

## Why the missing CSS is fatal (no runtime safety net)

`solid-spectrum` ships 4 CSS files, but `theme.css`, `styles.css`, and
`components.css` are one-line `@import` chains that all resolve to
`s2-generated.css`. That prebuilt file is the _entire_ stylesheet.

There is **no runtime fallback**. Repo-wide, `getS2CssAssets()` is called in
exactly one place — the build script. No component, no `Provider`, and no
consumer app reads the registry to inject `<style>` at runtime (verified across
`packages/` and `apps/`). So:

- In the browser, the `assetRegistry` is **dead weight**: every component module
  re-runs `style()` on load, rebuilds CSS strings, and stuffs them into a `Set`
  that nothing ever reads. Wasted CPU and memory.
- The browser is **100% dependent** on `s2-generated.css`. If a component's CSS
  isn't in that file, the component is unstyled. Full stop.

### Secondary smell: runtime `new Function`

For dynamic styles, `style()` builds a JS string and returns
`new Function('props', js)` (`style-macro.ts:519-522`). Under the macro this
generated code was inlined as ordinary, minifiable, CSP-safe source. Run at
runtime instead, it becomes `eval`-class code: it needs CSP `unsafe-eval`,
cannot be minified or analyzed, and pays a per-call deopt. Non-production
builds additionally spin up a `setInterval` garbage-collector on
`window.__styleMacroDynamic__`. All of this is macro-era machinery executing in
the browser because the macro was removed but its output shape was kept.

## Recommended fixes

Tiered; do at least #1.

1. **Stop hand-maintaining the list (recommended).** Replace the ~18 explicit
   `import`s in `generate-solid-spectrum-s2-css.ts` with a single import of the
   package barrel (`packages/solid-spectrum/src/index.ts`) — or a glob over
   `src/*/index.tsx`. Importing the barrel evaluates _every_ component module
   for its side effects, so every `style()` call runs and the registry becomes
   exhaustive again — restoring the macro's "visit everything" guarantee
   without a macro. Then regenerate `s2-generated.css` and diff.
   - Verify nothing in the barrel breaks under Node evaluation (e.g. modules
     touching `document`/`window` at top level). `generatePageStyles()` and the
     existing imports suggest top-level evaluation is already expected to be
     safe.
2. **Regression guard.** Add a check (test or CI step) that fails if a
   component's class names appear in built JS but not in `s2-generated.css`.
   Cheaper proxy: assert the generated CSS covers every `src/*/index.tsx`.
3. **Address the runtime cost (larger, required endpoint).** The follow-up
   research in [`07`](07-build-time-css-strategy.md) verified the genuine
   build-time path: `unplugin-parcel-macros` through Vite Plus `vp pack`/tsdown
   for package output, and `macros.vite()` for the comparison app. The tsup
   package path was rejected by local evidence because it failed on the macro's
   virtual CSS asset. Until the macro migration is complete, the current state
   (ship a prebuilt file _and_ keep the runtime registry running and unread) is
   the worst of both.

## Relationship to the comparison-docs overhaul

The overhaul's chrome dogfoods `Disclosure` (sidebar nav) and `Table` (prop
tables), so fix #1 is a **prerequisite** — it is listed in Phase 0 of
[`05-phasing.md`](05-phasing.md). The overhaul also adds _new_ chrome `style()`
calls; [`02-style-and-build.md`](02-style-and-build.md) §3 covers collecting
those; [`07`](07-build-time-css-strategy.md) supersedes that with the
build-time macro endpoint. Both are the same underlying concern: with the macro
gone, every
`style()` call needs a deliberate collection path.

## Verification status

- **Verified:** `disclosure/index.tsx` has 7 `style()` calls and no `.css`
  import; `accordion` re-exports from `disclosure`; the 4 shipped CSS files all
  chain to `s2-generated.css`; the generator's import list omits the 5 modules
  and the listed 18 do not transitively import them; `getS2CssAssets()` has
  exactly one caller repo-wide.
- **Not yet verified:** that `table`/`card`/`tabs` are affected (same mechanism,
  high likelihood); the result of actually running the generator with the
  barrel-import fix. Both should be confirmed when the fix is implemented.
