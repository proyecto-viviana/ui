# 07 · Build-Time CSS Strategy — Research

Research into how to compile `solid-spectrum`'s `style()` system properly,
prompted by the defect in [`06`](06-solid-spectrum-css-defect.md). Question
asked: how do other systems do this, is it like Tailwind, and is there a
Vite/tsup-viable path? Performance is a stated priority.

**Headline answer:** there is an official, verified path —
**`unplugin-parcel-macros`** — by the same author as both Parcel and React
Spectrum. It runs the exact `style()` macro `solid-spectrum` already vendored,
at build time, on Vite, esbuild (→ tsup), Rollup, and webpack. It is strictly
faster than the current runtime model and, adopted in the comparison app, it
fixes the [`06`](06-solid-spectrum-css-defect.md) defect _and_ the chrome-CSS
question from [`02`](02-style-and-build.md) in one move.

## 1. The CSS-tooling landscape — three families

| Family                                       | Mechanism                                                                                                                                 | Examples                                                          |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **Scanner / utility**                        | Scan source _text_ for known class-name tokens; generate CSS for what is found. Never executes your code.                                 | Tailwind (v4 = Rust "Oxide" engine + `@tailwindcss/vite`), UnoCSS |
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
Rollup starter uses `macros.rollup()` "before babel". **tsup is esbuild-based**
and accepts esbuild plugins via its `esbuildPlugins` option — so
`solid-spectrum`'s own build can run the macro too.

### Why this fits `solid-spectrum` with near-zero rewrite

`solid-spectrum`'s `s2-style/` is a verbatim copy of `@react-spectrum/s2`'s
style folder ([`06`](06-solid-spectrum-css-defect.md) §"What solid-spectrum
did"). The `style()` function is already a Parcel macro — it was _built_ to run
under exactly this plugin. Adopting `unplugin-parcel-macros` means:

- **No rewrite of `style-macro.ts`.** Use it as the macro it always was.
- **Delete the local divergence:** the `addS2CssAsset` registry, `getS2CssAssets`,
  `clearS2CssAssets`, and `scripts/generate-solid-spectrum-s2-css.ts` all go
  away. `s2-style/` reverts to pure upstream.
- The prebuilt `s2-generated.css` is no longer needed — the macro emits CSS per
  build, exhaustively, because the bundler traverses every module.

## 4. Performance analysis

Build-time evaluation is **strictly faster** than the current state. What it
removes from the browser:

| Today (runtime)                                                                                             | With the macro (build-time)                                                 |
| ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `style-macro.ts` (~1.1k LOC), `spectrum-theme.ts`, `tokens.ts`, `properties.json` all ship in the JS bundle | All of it is macro-only → tree-shaken out; **never ships**                  |
| Every component module runs `style()` on load (CPU)                                                         | `style()` calls are gone; replaced by literal class strings                 |
| Dynamic styles run `new Function('props', js)` — needs CSP `unsafe-eval`, unminifiable, deopt               | Dynamic styles inlined as ordinary, minifiable source                       |
| `assetRegistry` `Set` fills on every load and is never read (dead memory/CPU)                               | No registry                                                                 |
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
     `import`/`default` conditions, for non-Solid/Node consumers). With the
     current tsup build that is `macros.esbuild()` in `esbuildPlugins`; after
     the planned tsup → tsdown migration it is the unplugin entry in tsdown's
     `plugins` (see §8).
   - Drop `addS2CssAsset`/`getS2CssAssets`/`clearS2CssAssets`, the generation
     script, and the committed `s2-generated.css`. Revert `s2-style/` to
     upstream.
2. **Comparison app (Astro)**
   - Add `macros.vite()` to `astro.config.mjs`'s `vite.plugins`, ordered before
     `@astrojs/solid-js` / `@astrojs/react`.
   - Add the `manualChunks` rule for `macro-*.css` and set
     `cssMinify: 'lightningcss'`.
   - Consume `solid-spectrum` **source** (via the `solid` condition) instead of
     the `dist/index.js` alias, so component `style()` calls and the new chrome
     `style()` calls compile in one macro pass into one atomic bundle.

This single change resolves three things at once:

- the [`06`](06-solid-spectrum-css-defect.md) missing-CSS defect (collection is
  now bundler-driven and exhaustive),
- the [`02`](02-style-and-build.md) §3 "how do we collect chrome CSS" question
  (the macro collects it — approach A and B both become moot),
- the runtime performance overhead (§4).

## 6. Caveats & risks

- **Maturity.** `unplugin-parcel-macros` is published at `0.0.x` versions.
  Mitigant: it is authored by the Parcel/React-Spectrum author and is the
  documented production path; Adobe ships docs telling every S2 user to use it.
  Still — pin the version and prove it in the spike.
- **Astro pipeline.** Astro is Vite-based, so `macros.vite()` should slot in,
  but Astro injects integration plugins itself; **plugin ordering** (macros
  before the Solid/React JSX transform) must be verified. Likely needs the
  plugin's `enforce: 'pre'`. Spike item.
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

## 7. Migration outline & fallback

**Primary (recommended):** wire `unplugin-parcel-macros` per §5. Sequence:
spike in a branch (one component + the comparison app) → measure bundle diff →
roll out to `solid-spectrum` → update the comparison app → delete the
generation script and `s2-generated.css`.

**Fallback** (if the spike rejects the plugin on maturity/Astro grounds): the
zero-dependency correctness fix from [`06`](06-solid-spectrum-css-defect.md) §"
Recommended fixes" #1 — make the generation script import the package barrel so
collection is exhaustive. This fixes correctness **only**; all the runtime
performance costs in §4 remain. Treat it as a stopgap, not the destination.

## 8. Related: `solid-spectrum` build tool — tsup → tsdown

A planned, separate change is moving `solid-spectrum`'s package build from
**tsup** to **tsdown** (via Vite+'s `vp pack`). This is complementary to the
macro strategy and slightly _improves_ it:

- **tsdown** is the "spiritual successor to tsup, powered by Rolldown instead of
  esbuild." It is built for library bundling (`.d.ts`, multi-format, etc.).
- It **supports unplugin plugins** natively, plus most Rollup/Rolldown plugins.
  `unplugin-parcel-macros` is an unplugin → it plugs into tsdown's `plugins`
  array directly, cleaner than the esbuild-plugin route tsup needs.
- The repo is already in the Vite+ ecosystem (`vp run …` task runner), so
  `vp pack` adoption is low-friction.

### 8a. "Vite is moving to Rolldown" — is that a blocker? No.

Current state (verified May 2026): **Vite 8** shipped stable in March 2026 with
**Rolldown as the default** bundler; **Rolldown 1.0** is stable (May 2026,
semver-locked); the temporary `rolldown-vite` opt-in package was archived
because it merged into mainline. So Vite _is_ "there" — Rolldown is the default.

But the comparison app does not ride Vite directly — it rides **Astro**.
`apps/comparison` resolves **Astro 5.18.1 → Vite 6.4.1**, and Vite 6 is still
**Rollup**-based. So the comparison app specifically will not be on Rolldown
until Astro ships a Vite 8-based release.

**This blocks nothing**, for three reasons:

1. `unplugin-parcel-macros` is an **unplugin** — bundler-agnostic by design. It
   runs on Vite 6 / Rollup (the comparison app today), Vite 8 / Rolldown
   (later), and tsdown / Rolldown. The verified Adobe `s2-vite-project` example
   runs on Vite 5 / Rollup. The macro works on the comparison app's _current_
   Vite 6 now.
2. tsdown is Rolldown-based and works today, independent of Vite's version.
3. In the consumer-runs-macro model (§5), the comparison app's own Vite
   compiles `solid-spectrum`'s **source** with its own macro plugin —
   `solid-spectrum`'s build tool (tsup or tsdown) never enters the comparison
   app's pipeline. The two engines are fully decoupled; a mixed state
   (comparison app on Rollup, `solid-spectrum` on Rolldown) has no interaction
   surface.

So engine "convergence" is **automatic and free** — it arrives whenever Astro
bumps to Vite 8 — and is **not a precondition**. Do **not** force Vite 8 under
Astro 5.18: Astro pins Vite 6, overriding it is unsupported, and it buys
nothing because the macro is engine-agnostic.

### 8b. Sequencing

The macro adoption (§5–§7) does **not** wait for the tsup → tsdown migration —
`macros.esbuild()` works under tsup today. If both are on the roadmap, doing
tsdown _first_ (or together) wires the macro once, the tsdown way, with no
interim esbuild-plugin step to unpick. Either order is valid; flag it as a
Phase 0 sequencing decision in [`05-phasing.md`](05-phasing.md).

Caveat: tsdown / `vp pack` is newer than tsup and described as alpha-stage —
treat that migration as its own spike with its own rollback path, independent
of the CSS work.

## Sources

- [`unplugin-parcel-macros`](https://github.com/devongovett/unplugin-parcel-macros)
- [tsdown](https://tsdown.dev/) · [Vite+ `pack`](https://viteplus.dev/guide/pack)
- [React Spectrum — Styling](https://react-spectrum.adobe.com/styling)
- Vendored `react-spectrum/examples/s2-vite-project`, `s2-esbuild-starter-app`,
  `s2-rollup-starter-app` (primary source — verified configs).
- [StyleX `@stylexjs/unplugin`](https://stylexjs.com/docs/api/configuration/unplugin)
  and [unplugin-stylex](https://github.com/eryue0220/unplugin-stylex) — sibling
  system, corroborating the build-time-eval + `manualChunks` pattern.
