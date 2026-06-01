# 07 · Build-Time CSS Strategy — Research

Research into how to compile `solid-spectrum`'s `style()` system properly,
prompted by the defect in [`06`](06-solid-spectrum-css-defect.md). Question
asked: how do other systems do this, is it like Tailwind, and is there a
Vite/Vite Plus-viable path? Performance is a stated priority.

**Headline answer:** there is an official, verified path —
**`unplugin-parcel-macros`** — by the same author as both Parcel and React
Spectrum. It runs the exact `style()` macro `solid-spectrum` already vendored,
at build time, on Vite/Rollup, Rolldown/tsdown, esbuild, and webpack. It is
strictly faster than the current runtime model and, adopted in the comparison
app, it fixes the [`06`](06-solid-spectrum-css-defect.md) defect _and_ the
chrome-CSS question from [`02`](02-style-and-build.md) in one move.

Important correction from the package spike: **tsup is not the package path for
`solid-spectrum`'s S2 macro CSS.** Direct esbuild macro use is real, but
`solid-spectrum`'s tsup
pipeline rejected the macro's virtual CSS asset. Vite Plus packaging
(`vp pack`, powered by tsdown/Rolldown) accepted the same macro path with
`macros.rolldown()` and `@tsdown/css`, so package migration to Vite Plus is now
part of the macro work, not an unrelated later cleanup.

## 1. The CSS-tooling landscape — three families

| Family                                       | Mechanism                                                                                                                                 | Examples                                                          |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **Scanner / utility**                        | Scan source _text_ for known class-name tokens; generate CSS for what is found. Never executes your code.                                 | Utility-first CSS engines, UnoCSS                                 |
| **Build-time eval / zero-runtime CSS-in-JS** | A bundler plugin _executes_ style declarations at build time, emits static CSS, replaces calls with class strings. No style engine ships. | StyleX, vanilla-extract, Linaria / WyW-in-JS, Panda CSS, Compiled |
| **Runtime CSS-in-JS**                        | A style engine serializes and injects CSS in the browser at render time.                                                                  | Emotion, styled-components, stitches                              |

React Spectrum's `style()` belongs to family 2. So does what `solid-spectrum`
_should_ be. Today `solid-spectrum` is an accidental hybrid: a family-2 function
shipped with no compiler, so it executes at runtime (family 3 cost) while the
browser still depends on a prebuilt file (family 2 delivery) — the worst mix,
as [`06`](06-solid-spectrum-css-defect.md) describes.

## 2. Is it like Tailwind?

**Only in the output, not the mechanism.** Both produce _atomic_ CSS (many
tiny single-purpose classes, heavily shared). But:

- Tailwind **scans text** for static class tokens (`"px-4 flex"`). It cannot
  see through a function call.
- The S2 macro **executes** `style({padding: 16, ...})` — an arbitrary function
  with an object argument. There is no class string in the source to scan.

So Tailwind's model cannot drive `style()`. The genuinely close system is
**StyleX** (Meta): `stylex.create({...})` compiled by a build plugin to atomic
classes. S2-`style()` and StyleX are siblings — same idea, same era. StyleX
even ships its own unplugin (`@stylexjs/unplugin`) that works across Vite /
esbuild / webpack / Rollup / Rspack, and its Vite setup uses the _same_
`manualChunks` trick to merge atomic CSS — strong corroboration that the
approach below is the standard one for this family.

`vanilla-extract` is the other close reference: its Vite plugin evaluates
`.css.ts` modules at build time via the bundler. Same principle (run code →
emit CSS), different surface (separate `.css.ts` files vs inline calls).

## 3. The viable path: `unplugin-parcel-macros`

### What it is

`unplugin-parcel-macros` exposes **Parcel's macro implementation** as an
[unplugin](https://unplugin.unjs.io/), so the `with {type: 'macro'}` import
attribute works on **webpack, Vite, Rollup, esbuild, and Next.js** — not just
Parcel. It is the officially documented way to use the React Spectrum S2 style
macro outside Parcel.

> Note: this is **not** the generic `unplugin-macros` (unjs). That one only
> inlines return values. The S2 `style()` macro needs the Parcel
> `MacroContext` — specifically `this.addAsset({type:'css', content})` to emit
> CSS — which only `unplugin-parcel-macros` provides. Use the Parcel one.

### Verified — it is real and it handles CSS

The vendored `react-spectrum/examples/` directory contains working starters:
`s2-vite-project`, `s2-esbuild-starter-app`, `s2-rollup-starter-app`,
`s2-webpack-5-*`. From `examples/s2-vite-project/vite.config.ts` (verbatim):

```ts
import macros from "unplugin-parcel-macros";

export default defineConfig({
  plugins: [
    macros.vite(), // must come before the framework plugin
    react(),
  ],
  build: {
    cssMinify: "lightningcss", // smaller atomic CSS bundle
    rollupOptions: {
      output: {
        manualChunks(id) {
          // The macro emits CSS assets named `macro-*.css`.
          if (/macro-(.*)\.css$/.test(id) || /@react-spectrum\/s2\/.*\.css$/.test(id)) {
            return "s2-styles"; // one chunk for all atomic CSS
          }
        },
      },
    },
  },
});
```

The `macro-*.css` pattern is the proof that the macro **emits CSS as real
bundler assets** via `addAsset` — exactly the side-channel `solid-spectrum`'s
vendored `style()` already calls (`style-macro.ts:482`, the
`this.addAsset({type:'css'})` branch that currently never fires).

The esbuild starter uses `macros.esbuild()` in the esbuild `plugins` array; the
Rollup starter uses `macros.rollup()` "before babel". The current package spike
confirmed the esbuild plugin reaches the S2 macro, including token validation,
but it also confirmed that the tsup/PostCSS pipeline then attempts to read the
macro's virtual `macro-*.css` asset from disk and fails.

The accepted package path is Vite Plus:

- Vite Plus documents `vp pack` as its library packaging command, backed by
  tsdown, and keeps package config in `vite.config.ts`.
- tsdown documents migration from tsup to Rolldown/unplugin plugins, with
  `external` becoming `deps.neverBundle`.
- tsdown CSS extraction is provided by `@tsdown/css`; with that package
  installed, macro CSS assets are emitted through the bundler instead of the
  old runtime registry.

Local spike evidence:

```bash
vp pack # in packages/solid-spectrum, with macros.rolldown() and @tsdown/css
```

That build completed for the browser and SSR package entries. A separate
negative smoke with `borderColor: "neutral"` failed at build time with the S2
macro's upstream token error, which is the desired behavior: `neutral` is valid
for foreground/background-style color properties, but not for `borderColor`.

### Why this fits `solid-spectrum` with near-zero rewrite

`solid-spectrum`'s `style/` is a verbatim copy of `@react-spectrum/s2`'s
style folder ([`06`](06-solid-spectrum-css-defect.md) §"What solid-spectrum
did"). The `style()` function is already a Parcel macro — it was _built_ to run
under exactly this plugin. Adopting `unplugin-parcel-macros` means:

- **No rewrite of `style-macro.ts`.** Use it as the macro it always was.
- **Delete the local divergence:** the old CSS registry and manual generation
  bridge go away. CSS emission belongs to the macro/bundler traversal.
- The prebuilt generated stylesheet is no longer needed; the macro emits CSS
  per build, exhaustively, because the bundler traverses every module.

## 4. Performance analysis

Build-time evaluation is **strictly faster** than the current state. What it
removes from the browser:

| Today (runtime)                                                                                             | With the macro (build-time)                                                 |
| ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `style-macro.ts` (~1.1k LOC), `spectrum-theme.ts`, `tokens.ts`, `properties.json` all ship in the JS bundle | All of it is macro-only → tree-shaken out; **never ships**                  |
| Every component module runs `style()` on load (CPU)                                                         | `style()` calls are gone; replaced by literal class strings                 |
| Dynamic styles run `new Function('props', js)` — needs CSP `unsafe-eval`, unminifiable, deopt               | Dynamic styles inlined as ordinary, minifiable source                       |
| Local registry fills on every load and is never read (dead memory/CPU)                                      | No registry                                                                 |
| Non-prod `setInterval` GC on `window.__styleMacroDynamic__`                                                 | None                                                                        |
| CSS: a hand-collected, **incomplete** static file                                                           | CSS: complete, atomic, emitted per build, Lightning-CSS-minified, one chunk |

CSS payload stays small by design: atomic CSS overlaps heavily across
components, so — per the Adobe Vite example's own comment — bundling it all
into one up-front chunk beats code-splitting (no cross-page duplication).
Lightning CSS then dedupes and minifies.

Exact KB savings should be **measured in the Phase 0 spike** (bundle diff
before/after), but the categories above are not in doubt: the macro removes an
entire styling engine from the runtime.

## 5. Recommended architecture

Adopt `unplugin-parcel-macros`, with the **consumer-runs-macro** model — the
same model React Spectrum itself uses, and a natural fit because
`solid-spectrum` already ships source via its `"solid"` export condition
(`exports["."].solid → ./src/index.ts`) and Solid consumers already compile
that source.

1. **`solid-spectrum`**
   - Keep `style()` calls in components; ensure imports use
     `with {type: 'macro'}` (they are the upstream form already).
   - Run the macro in the package build for the `dist` outputs (the
     `import`/`default` conditions, for non-Solid/Node consumers) through Vite
     Plus `vp pack`, `macros.rolldown()`, and `@tsdown/css`.
   - Current checkpoint: source imports use the macro attribute and the manual
     registry/generation bridge is removed.
   - Keep the Vite Plus/Rolldown adapter documented as packaging glue. It
     preserves macro CSS assets across Rolldown load timing; component sources
     should not depend on package-specific workarounds.
2. **Comparison app (Astro)**
   - Run the app-side Parcel macro plugin before Astro's JSX renderers. The
     comparison app uses a small `comparisonS2Macros()` adapter over
     `macros.raw()` so Astro query-suffixed client script ids and delayed virtual
     CSS loads resolve correctly; this is the app equivalent of `macros.vite()`
     for Astro.
   - Let Astro/Vite emit macro CSS as linked assets. Keep leak scans for
     unresolved `macro-*.css` ids, macro import attributes, and
     `__styleMacroDynamic__` references in built JS.
   - Consume `solid-spectrum` **source** (via `packages/solid-spectrum/src`)
     instead of the `dist/index.js` alias, so component `style()` calls and the
     new chrome `style()` calls compile in one app macro pass.
   - Current checkpoint: the app consumes `packages/solid-spectrum/src/index.ts`,
     imports only `font-faces.css` globally from Solid Spectrum, the comparison
     build passes, built output has no `components.css`/`styles.css` references,
     and the focused 30-test visual suite passes.

This single change resolves three things at once:

- the [`06`](06-solid-spectrum-css-defect.md) missing-CSS defect (collection is
  now bundler-driven and exhaustive),
- the [`02`](02-style-and-build.md) §3 "how do we collect chrome CSS" question
  (the macro collects it — approach A and B both become moot),
- the runtime performance overhead (§4).

## 6. Caveats & risks

- **Maturity.** `unplugin-parcel-macros` is still young (`0.x` versions).
  Mitigant: it is authored by the Parcel/React-Spectrum author and is the
  documented production path; Adobe ships docs telling every S2 user to use it.
  Still — pin the version and prove it in the spike.
- **tsdown CSS maturity.** tsdown documents CSS support as experimental. Treat
  `@tsdown/css` updates as gated: package build, CSS asset presence, export
  surface, and visual smoke before upgrading.
- **Astro pipeline.** Astro is Vite-based, but its integration pipeline needs an
  app adapter around `macros.raw()` instead of the plain Vite plugin. Keep the
  macro before the Solid/React JSX transform and keep dist leak scans in the
  build proof.
- **Solid JSX interaction.** `vite-plugin-solid`'s JSX transform must run
  _after_ the macro. Confirm in the spike.
- **Import-attribute tooling.** `with {type:'macro'}` needs a recent TypeScript
  and may need ESLint/Jest config. Low effort, well-documented.
- **Static analyzability.** Macro arguments must be build-time-evaluable. The
  vendored S2 `style()` calls already satisfy this; new chrome `style()` calls
  must be written the same way (static objects, no runtime-only references).
- **Consumer burden.** Every downstream consumer must add the plugin — less
  "batteries included" than shipping a CSS file. But the current shipped file
  is broken and slow, and this matches the React Spectrum model.
- **Rolldown virtual CSS timing.** The package build needs a small adapter
  around `macros.rolldown()` so virtual macro CSS assets remain loadable when
  Rolldown asks for them later. Keep this checked by package builds and a leak
  scan for unresolved `macro-*.css` ids in built JS.

## 7. Migration outline & fallback

**Primary (recommended):** wire `unplugin-parcel-macros` per §5. Sequence:
Vite Plus package build checkpoint → migrate `solid-spectrum` style imports to
the macro form → measure package JS/CSS diff → update the comparison app to run
the macro over source exports → publish from the Vite Plus/tsdown flow with
macro-emitted CSS.

**Fallback** (if the app-side macro path regresses on maturity/Astro grounds):
temporarily ship package-emitted CSS while keeping the package macro build
green. Do not restore a hand-maintained component list as a long-term answer;
that was the original drift vector.

## 8. `solid-spectrum` build tool — tsup → Vite Plus/tsdown

The package build now moves from **tsup** to **Vite Plus `vp pack`** (tsdown).
This is no longer just complementary to the macro strategy; it is the verified
package route for macro CSS assets in this repo:

- **tsdown** is the "spiritual successor to tsup, powered by Rolldown instead of
  esbuild." It is built for library bundling (`.d.ts`, multi-format, etc.).
- It **supports unplugin plugins** natively, plus most Rollup/Rolldown plugins.
  `unplugin-parcel-macros` is an unplugin → it plugs into tsdown's `plugins`
  array directly through `macros.rolldown()`.
- The repo is already in the Vite Plus ecosystem (`vp run …` task runner), so
  `vp pack` keeps package builds inside the same command layer.
- Declarations stay on the existing `tsc -p tsconfig.build.json` path for the
  first checkpoint (`dts: false` in the pack config). tsdown auto-enables
  declarations when a package has a `types` field, but the initial migration
  should not change JS bundling and declaration bundling at the same time.

### 8a. "Vite is moving to Rolldown" — is that a blocker? No.

Current local baseline (2026-05-26): the comparison app does not ride Vite
directly — it rides **Astro**. `apps/comparison` resolves **Astro 5.18.1 →
Vite 6.4.1**, and Vite 6 is still **Rollup**-based. The package-build path uses
Vite Plus/tsdown/Rolldown, and the current lockfile still resolves Rolldown RC
builds in that toolchain. Do not make the comparison app depend on future Vite
or Rolldown release state; verify any external release claim against primary
release notes before updating this section.

**This blocks nothing**, for three reasons:

1. `unplugin-parcel-macros` is an **unplugin** — bundler-agnostic by design. It
   can run on Vite/Rollup, Vite/Rolldown, and tsdown/Rolldown. The verified
   Adobe `s2-vite-project` example runs on Vite 5 / Rollup, so the macro route
   does not require the comparison app to be on Rolldown.
2. tsdown is Rolldown-based and works today, independent of Vite's version.
3. In the consumer-runs-macro model (§5), the comparison app's own Vite
   compiles `solid-spectrum`'s **source** with its own macro plugin —
   `solid-spectrum`'s build tool never enters the comparison app's pipeline.
   The two engines are fully decoupled; a mixed state
   (comparison app on Rollup, `solid-spectrum` on Rolldown) has no interaction
   surface.

So engine convergence is **not a precondition**. Do **not** force a newer Vite
under Astro 5.18: Astro pins Vite 6, overriding it is unsupported, and it buys
nothing because the macro is engine-agnostic.

### 8b. Sequencing

The sequencing decision is now fixed:

1. Move `solid-spectrum` package JS/CSS bundling to Vite Plus `vp pack`, keeping
   `tsc` declarations unchanged.
2. Convert `style` imports from the runtime bridge to upstream macro import
   attributes.
3. Wire the comparison app's Vite/Astro pipeline to run the app-side macro
   adapter over source exports.
4. Prove the publishing path from Vite Plus/tsdown output, including
   macro-emitted CSS and declarations.

Caveat: tsdown / `vp pack` is newer than tsup and tsdown CSS is explicitly
experimental. Keep the migration at package scope first, with an easy rollback
until the macro source migration and visual gates pass.

## Sources

- [`unplugin-parcel-macros`](https://github.com/devongovett/unplugin-parcel-macros)
- [Vite Plus `pack`](https://viteplus.dev/guide/pack)
- [tsdown migration from tsup](https://tsdown.dev/guide/migrate-from-tsup),
  [CSS support](https://tsdown.dev/options/css), and
  [declaration files](https://tsdown.dev/options/dts)
- [React Spectrum — Styling](https://react-spectrum.adobe.com/styling)
- Vendored `react-spectrum/examples/s2-vite-project`, `s2-esbuild-starter-app`,
  `s2-rollup-starter-app` (primary source — verified configs).
- [StyleX `@stylexjs/unplugin`](https://stylexjs.com/docs/api/configuration/unplugin)
  and [unplugin-stylex](https://github.com/eryue0220/unplugin-stylex) — sibling
  system, corroborating the build-time-eval + `manualChunks` pattern.
