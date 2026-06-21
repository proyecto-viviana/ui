---
kind: process
status: current
---

# `@proyecto-viviana/ui` client-readiness backlog (UC-NN)

Status: Current source of truth.
Update when: a UC-NN ticket changes state or a new client-readiness gap is found.

The actionable ticket set for making **`@proyecto-viviana/ui`** consumable by
external client apps (the `viviana-social` repo's `pokeforos` / `bord` /
`tortafritapp`). This supersedes the `ticket/ui-contract-plan` planning PR (#12):
its six planning docs are folded in here, refined against an antagonistic review
that checked every premise against the actual package and found the plan was
organized around export/CSS/macro polish while the load-bearing question — **how
the multi-package closure is actually delivered and versioned** — went unasked.

**Priority:** this track is worked **before** resuming the parity loop
(`upstream-release-audit.md` T-57+). The parity "continue in order" directive is
paused until UC-00…UC-05 land; UC-06 is downstream in another repo.

## Target contract

- Social apps consume the design system through `@proyecto-viviana/ui` and
  `@proyecto-viviana/ui/style` only — never reaching back to `solid-spectrum` or
  `solidaria` except while intentionally debugging a lower layer.
- `@proyecto-viviana/ui` behaves like `@proyecto-viviana/solid-spectrum` from a
  public-API/build standpoint, but owns the Viviana token/theme layer.
- Built UI components ship their own macro-expanded CSS; apps that **author**
  `style()` calls still install the macro plugin in their Vite build.
- A consumer **outside this workspace** can install the package and build it
  (DOM + SSR) from published/packed artifacts — that, not internal `vp` linking,
  is the definition of "usable for clients."

## How to work it

- **UC-00 first — it is the spine.** Until the closure publishes coherently and
  an out-of-workspace fixture installs and builds, UC-01…UC-05 are polishing a
  package no client can install, and UC-03/04/06's app-side acceptance can't be
  verified here. UC-00 also stands up the fixture the rest reuse as their oracle.
- **Be honest about parallelism.** UC-01 and UC-02 both rewrite the `./style*`
  export surface — they are **one work-stream**, not independent. UC-05 is the
  same "deep-subpath" fix as UC-01 one layer down — design them together. UC-03
  and UC-04 are the genuinely independent ones.
- **Verify against the packed tarball, not `src`.** Every "smoke test" acceptance
  runs against the UC-00 fixture (installed from `vp pack` output), because the
  bugs here live in `package.json` `exports`/conditions and dist layout — things
  that only manifest once resolved as an installed dependency.
- **Changeset every published-package `src`/manifest change** (`release-policy.md`).

**Status legend:** ⛔ not started · ◑ in progress · ✔ done · ⤓ downstream (other repo).

---

## UC-00 ✔ — Promote `@proyecto-viviana/ui` into the release matrix + out-of-workspace install smoke

**The spine.** Everything else assumes a client can actually install the package.

> **Done 2026-06-20.** Owner approved promoting `ui`; recorded in
> `release-policy.md` (matrix row `releasable / npm / public`) and `steering.md`
> (open decision resolved). Changesets already covers `ui` (it is publishable and
> absent from `.changeset/config.json` `ignore`). The out-of-workspace install
> smoke is built (`scripts/consume-pack-smoke.mjs`, scripts `ui:consume-smoke` /
> `ui:smoke`) and **passes**: `@proyecto-viviana/ui` installs from packed tarballs
> into a throwaway app outside the workspace and builds **DOM + SSR**; the SSR
> render emits a real `<button>` carrying its macro-expanded atomic style classes.
> The `solidaria` / `solidaria-components` barrel-bloat warning the smoke once
> reproduced is resolved by **UC-05** (thin re-export barrels); the residual
> `solid-spectrum` barrel + `./style` over-size is resolved by **UC-07**, so a
> root-barrel `@proyecto-viviana/ui` import no longer trips the deopt either.

### Problem
`@proyecto-viviana/ui@0.3.6` depends on `@proyecto-viviana/solid-spectrum` and
`@proyecto-viviana/solidaria-components` via `workspace:*`, which transitively
pull `solidaria` + `solid-stately`. A client needs that **whole five-package
closure** published/packed at compatible versions. The delivery machinery already
exists — `release-policy.md` has all four lower packages as `releasable → npm →
public` with Changesets and an auto-publishing `Release` workflow — but **`ui` is
deliberately absent from the release matrix; its status is the open decision in
`steering.md` ("Release readiness threshold").** No planning ticket touched this.
This is partly an **owner decision**: the North Star is "parity is the product…
until the release policy says otherwise," so promoting `ui` for client apps is
exactly the call steering left open.

### Scope
- ~~**Decide `ui`'s release status** (owner)~~ ✔ 2026-06-20: `releasable → npm →
  public`, recorded in `release-policy.md` (matrix) and `steering.md` (open
  decision). Certification floor for the first publish: TBD with owner.
- ~~Add `@proyecto-viviana/ui` to the Changesets scope~~ ✔ already covered — `ui`
  is publishable (`publishConfig.access: public`, not `private`) and not in
  `.changeset/config.json` `ignore`, so Changesets versions it. `updateInternal​Dependencies: "patch"` keeps its `workspace:*` ranges in step on publish.
- ~~Confirm the closure packs coherently~~ ✔ `scripts/pack-local-chain.mjs`
  rewrites every `workspace:*` → the concrete version and packs all five
  tarballs. (The live `Release`-workflow publish ordering is exercised by CI, not
  this script.)
- ~~**Build the out-of-workspace fixture**~~ ✔ `scripts/consume-pack-smoke.mjs`
  (reused by UC-01/03/04/05): scaffolds a throwaway app *outside* the workspace,
  installs `@proyecto-viviana/ui` from the packed tarballs (with `overrides`
  redirecting the whole closure to `file:` tarballs), then runs a DOM `vite build`
  and an SSR `vite build --ssr` + render, asserting a styled `<button>`. Two
  realities it encodes for any consumer: a dual-target build needs
  `solid({ ssr: true })`, and the SSR resolver needs the `solid` condition.

### Out of scope
- Component behavior, token re-theming, app migration (UC-06).

### Acceptance — all met (2026-06-20)
- ✔ `ui` is in the `release-policy.md` matrix with an explicit status;
  `steering.md` open decision resolved.
- ✔ The five-package closure packs coherently with `workspace:*` rewritten to
  concrete versions (`pack:local-chain`).
- ✔ The out-of-workspace fixture installs `@proyecto-viviana/ui` from packed
  tarballs and builds DOM + SSR with **no** workspace symlinks; SSR render shows a
  styled `<button>`.

---

## UC-01 ✔ — Export parity: deep subpaths for the full Spectrum surface + `./style/runtime`

### Problem
Precisely stated (the planning doc was slightly off): the root barrel is already
`export * from "@proyecto-viviana/solid-spectrum"`, so `import { Calendar } from
"@proyecto-viviana/ui"` **works today**. The real gaps are (a) **no deep
subpaths** — only ~13 of 32 Spectrum components have a `@proyecto-viviana/ui/*`
entry (missing `Calendar`, `Tabs`, `Menu`, `ListView`, `TreeView`, color
components, …), (b) **`./style/runtime` is not exported** though `solid-spectrum`
exports it, and (c) leaning on the root barrel is exactly what triggers UC-05's
bloat. So "parity" here means **prefer deep subpaths**, not "rely on the barrel."

### Scope
- Add passthrough barrels under `packages/viviana-ui/src` for every public
  `solid-spectrum` subpath; matching `vite.config.ts` entries; matching
  `package.json` `exports` (incl. `./style/runtime`).
- Decide top-level `main`/`module`/`types` — the `.` / subpath `exports` already
  carry `types`/`solid`/`import` conditions (TS clients **do** get root types
  today), so bare fields are a legacy-resolver nicety, not a blocker; add or
  document the call.
- Keep Viviana-native subpaths (`Chip`, `Conversation`, cards, layout); decide
  per orphan native component: export or delete.

### Out of scope
- Component behavior; token re-theming; app migration.

### Acceptance
- Every public `solid-spectrum` subpath has a `@proyecto-viviana/ui/*`
  counterpart or is documented as intentionally withheld; `./style/runtime`
  exported.
- A built-package import smoke (run against the **UC-00 tarball**) imports every
  UI subpath and fails on export-map/dist drift.

### Resolution (2026-06-20)
- Added passthrough barrels under `packages/viviana-ui/src` for every previously
  missing `solid-spectrum` subpath (`ActionMenu`, `Breadcrumbs`, `Calendar`,
  `Card`, `CardView`, `CenterBaseline`, the five `Color*` components,
  `ColorSwatch*`, `ColorWheel`, `Disclosure`, `GitHubIcon`, `ListView`, `Menu`,
  `RangeCalendar`, `Tabs`, `TreeView`) **plus `src/style/runtime.ts`** — each a
  one-line `export * from "@proyecto-viviana/solid-spectrum/<X>"`.
- Wired them into `vite.config.ts` (dual `.js`/`.jsx` packs) and regenerated
  `package.json` `exports` (48 subpaths + `.` + `./package.json`); added top-level
  `main`/`module`/`types` mirroring `solid-spectrum` for legacy resolvers.
- **Parity proven by tooling, not eyeball:** a set-diff of the two `exports` maps
  shows **0** `solid-spectrum` subpaths missing from `ui`; the 9 extras are
  viviana's own product components (`CalendarCard`, `Chip`, `Conversation`,
  `EventCard`, `Logo`, `PageLayout`, `ProfileCard`, `ProjectCard`,
  `TimelineItem`) — no orphan native components, all build and export.
- **Built-package smoke extended** (`scripts/consume-pack-smoke.mjs`): against the
  real out-of-workspace tarball install it now asserts **every** file referenced
  by **every** export condition (`types`/`solid`/`import`/`default` + CSS) exists
  on disk (185/185) and that Node's own resolver honors **every** JS subpath
  specifier (44/44). It deliberately checks *resolution + file presence*, not
  evaluation — importing a DOM-compiled `.js` in bare Node would run its hoisted
  top-level `template()` under `solid-js/web`'s **server** build and throw, a
  runtime artifact, not export drift (the DOM+SSR build/render already proves real
  evaluation). Latest run: green.
- Changeset: `.changeset/ui-export-parity.md` (`@proyecto-viviana/ui` minor —
  additive subpaths).

---

## UC-02 ◑ — `./style` Viviana-owned tokens + reconcile the built-CSS inventory

*Shares the `./style*` export surface with UC-01 — same work-stream.*

> **Split state (2026-06-20).** This ticket has two independent halves:
> **Part A — inventory reconciliation (✔ done)** and **Part B — the Viviana-owned
> macro token map (⛔ deferred, needs a product decision).** Part A is shipped;
> Part B is blocked on a design call (see *Part B status* below) — it is the one
> place the port deliberately diverges from Spectrum, and there is **nothing
> existing to mirror** (apps/web uses arbitrary `[var(--color-*)]`, not a macro
> token override), so it cannot be resolved by the usual "copy upstream" rule.

### Problem
`packages/viviana-ui/src/style.ts` bare-re-exports `solid-spectrum/style`, so app
code importing `@proyecto-viviana/ui/style` still compiles `accent` / `neutral` /
`heading` / `backgroundColor:"base"` through the **Spectrum** token map; Viviana
variables only apply via arbitrary `[var(--color-*)]`. Separately, the build is
**inconsistent with the export map**: `dist/` emits **six** stylesheets but only
**four** are exported — `viviana-tokens.css` (9 KB, the actual Viviana token
variables) and `style.css` (50 KB) are **built-but-unreachable**. The CSS audit
must match what the build emits.

### Scope
- Add a package-local `style/` for `viviana-ui` preserving the macro API shape
  (`style`, `css`, `color`, `baseColor`, `lightDark`, `colorMix`, `size`,
  `space`, `fontRelative`, `focusRing`, `setColorScheme`, `centerPadding`, runtime
  helpers); keep Spectrum spacing/radius/sizing/type ramp; resolve **semantic
  color tokens through Viviana variables**.
- **Reconcile the inventory:** export `viviana-tokens.css` / `style.css` (if
  clients need them) or delete them (if build cruft). No stylesheet may be
  simultaneously built, needed, and unexported.
- Make `theme.css` and generated macro CSS agree on `data-color-scheme`.

### Acceptance
- `./style` no longer bare-re-exports `solid-spectrum/style`. *(Part B — pending.)*
- Macro smoke proves `style({ backgroundColor: "accent" })` / `style({ color:
  "accent" })` compile to Viviana-owned values/variables; existing
  `[var(--color-*)]` colors keep working. *(Part B — pending.)*
- The set of built stylesheets equals the set of exported-or-intentionally-internal
  stylesheets (no orphans). *(Part A — ✔ done.)*

### Part A resolution — inventory reconciliation (✔ 2026-06-20)
- **Dropped the `style.css` orphan:** `vp pack` emits a per-entry CSS sidecar
  `dist/style.css` (50 KB) for the `style` entry whose atomic rules are already
  inlined into `styles.css`; nothing imports it (solid-spectrum ships the same
  unexported 572 KB sidecar). `scripts/inline-macro-css.mjs` now `rm`s it, so the
  built CSS set is `{components, font-faces, styles, theme, viviana-tokens}`.
- **Classified `viviana-tokens.css` as intentionally internal:** it ships in
  `dist` only so `theme.css`'s relative `@import "./viviana-tokens.css"` resolves;
  it is **not** a public subpath (documented in the README). So: 4 exported sheets
  + 1 intentionally-internal = the 5 built sheets, **zero orphans**.
- Guarded by the smoke (asserts `dist/style.css` is absent from the install).

### Part B status — Viviana-owned macro token map (⛔ deferred — design decision)
Not a "copy upstream" task: the S2 `style()` macro bakes in its own color
vocabulary (`accent`/`neutral`/`negative`/`positive`/`notice`/`gray`), while the
Viviana palette (`viviana-tokens.css`) uses a *different* vocabulary
(`accent`/`primary`/`danger`/`success`/`warning`/`text`/`surface`/…). Delivering
this needs **two** decisions/efforts with real ambiguity and no existing override
to mirror:
1. **The cross-vocabulary mapping** — e.g. does S2 `accent` bind to Viviana
   `--color-accent` or `--color-primary`? `negative→danger`, `positive→success`,
   `notice→warning` are likely, but `neutral`/`gray` ramp and the bg/text/border
   semantics are genuine product calls.
2. **The implementation** — overriding the macro's baked-in color resolver (forking
   or parameterizing the S2 `style()` color map in solidaria/solid-spectrum), a
   non-trivial change to a published macro that changes token semantics for every
   consuming app (hard to reverse).
**→ Surfaced to the user as a decision before any token values are invented.**

---

## UC-03 ✔ — CSS + Provider contract, incl. the `default` export-condition hazard

### Problem
`Provider` sets context/attributes/classes but **loads no CSS** (verified: zero
`.css` imports). `pokeforos`/`bord` import `@proyecto-viviana/ui/styles.css`
explicitly; `tortafritapp` implies the design system arrives just by mounting
`<Provider>` — an incorrect contract. Worse, each CSS export is `{ import:
./dist/X.css, default: ./src/X.css }`, and the `src/*.css` are build **sources**
(`src/styles.css` is `@import "@proyecto-viviana/solid-spectrum/styles.css"` and is
**missing** the Viviana macro CSS that `inline-macro-css.mjs` appends at build).
A consumer/tool resolving via `default` (some SSR/CJS paths) silently gets an
**incomplete, bundler-`@import`-dependent** stylesheet.

### Scope
- Document the required app import + the file roles in
  `packages/viviana-ui/README.md`: `styles.css` (macro/atomic, no font faces),
  `components.css` (font faces + styles), `theme.css` (theme + Viviana token
  variables), `font-faces.css`; `Provider` = runtime context, **not** CSS
  injection.
- **Close the condition footgun:** drop the `default → src` condition, or make
  `src/*.css` self-contained, so no resolution path yields a partial sheet.

### Out of scope
- Automatic stylesheet injection; changing app theming defaults.

### Acceptance
- README is unambiguous: UI consumers import the UI CSS explicitly.
- Export-map tests (against the **UC-00 tarball**) cover `styles.css`,
  `components.css`, `theme.css`, `font-faces.css` and assert both `import` and
  `default` resolve to the **complete** sheet.
- `Provider` docs/comments no longer imply it supplies CSS.

### Resolution (2026-06-20)
- **Footgun closed:** each CSS subpath now exports a **single** string target
  (`"./dist/X.css"`) instead of `{ import: dist, default: src }`. There is no
  longer any condition that resolves to the incomplete `src/*.css` build source —
  every resolution path (import/default/style) yields the complete built sheet.
- **README rewritten** (`packages/viviana-ui/README.md`): documents the explicit
  CSS import contract (`theme.css` + `components.css`), the per-file roles table
  (theme/components/styles/font-faces), that `viviana-tokens.css` is intentionally
  internal, and that `Provider` is runtime context only — it injects **no** CSS.
  (Provider confirmed to import zero `.css`.)
- **Smoke extended** (UC-03 block in `consume-pack-smoke.mjs`): against the real
  tarball install it asserts no export target points into `src/`, the dropped
  `style.css` sidecar is absent, and the shipped `styles.css` is the *complete*
  sheet (carries the inlined viviana macro CSS **and** the solid-spectrum
  `@import`). Note: with a single target, `import` and `default` are the same
  file by construction, which is the strongest form of "both resolve complete."
- Changeset: `.changeset/ui-css-export-contract.md` (`@proyecto-viviana/ui`
  patch — shared with UC-02's inventory reconciliation below).

---

## UC-04 ✔ — Supported Vite macro preset for app-authored `style()`

### Problem
The package build pre-expands macros for the components it ships, but **cannot**
pre-expand **app-authored** macro calls. Apps import `@proyecto-viviana/ui/style`
with `{ type: "macro" }`, so their Vite configs must run the macro plugin — today
each app copies an `s2Macros()` wrapper plus internal-package exclusions.

### Scope
- Add a documented `@proyecto-viviana/ui/vite` export (or package-local helper)
  returning the macro plugin wrapper `solid-spectrum` uses — macro CSS
  resolution/loading + import stripping only.
- Document plugin order vs TanStack Start / Solid / Cloudflare; codify which
  `optimizeDeps` exclusions are app-owned vs hidden behind the helper.

### Out of scope
- Replacing Vite+/TanStack Start setup; removing the need for macros in apps that
  author `style()`.

### Acceptance
- An **in-repo** fixture (not a far-repo app) proves app-authored
  `@proyecto-viviana/ui/style` macro calls generate/load CSS in **DOM and SSR**.
- The fixture imports the helper instead of a copied wrapper; the helper is
  documented as the supported path.

### Resolution (2026-06-20)
- **Shipped helper:** new `@proyecto-viviana/ui/vite` export returns
  `vivianaMacros()` — the wrapper around `unplugin-parcel-macros`'
  `macros.rolldown()` that downstream apps used to hand-copy. It caches the
  macro-emitted CSS on transform, serves it through a `.css` virtual module
  (resolveId/loadInclude/load), and strips the JS `import "macro-<hash>.css"` from
  the server bundle (renderChunk) so SSR builds don't fail to resolve it. Lives in
  `packages/viviana-ui/src/vite.ts`; the `./vite` subpath is a plain Node build
  helper (no `solid` condition).
- **Peer dependency:** `unplugin-parcel-macros` is declared an **optional** peer
  (`peerDependenciesMeta`) and kept external in the helper's build (`neverBundle`),
  so the app's own macro instance is the one that runs.
- **In-repo fixture proves DOM + SSR:** `scripts/macro-preset-smoke.mjs`
  (`vp run ui:macro-smoke`) builds an app-authored `style()` call
  (`test/macro-preset/styled.jsx`, imported with `{ type: "macro" }` from
  `@proyecto-viviana/ui/style`) through `vivianaMacros()`. It runs **in**-workspace
  on purpose — the workspace pins `vite → @voidzero-dev/vite-plus-core`
  (rolldown-vite), the same flavor the helper's `.rolldown()` targets and the real
  apps build with. DOM build: asserts the macro sentinel (`abcdef`) lands in the
  emitted CSS asset. SSR build: asserts the build resolves the stripped macro CSS
  and the `style()` runtime class expands in the rendered HTML. The fixture imports
  the **built** helper via the package's `./vite` export (asserting it points at
  `./dist/vite.js`), not a copied wrapper.
- **README** (`packages/viviana-ui/README.md`) documents `vivianaMacros()` as the
  supported path: plugin order (before `vite-plugin-solid` and framework plugins),
  the app-owned `optimizeDeps.exclude` / `ssr.noExternal` lists, and the peer
  install. Points at the smoke as an executable reference.
- Changeset: `.changeset/ui-vite-macro-preset.md` (`@proyecto-viviana/ui` minor —
  new `./vite` export + `vivianaMacros()` preset).

---

## UC-05 ✔ — Kill the transitive root-barrel bloat (subpath exports in lower packages)

*Same "deep-subpath" fix as UC-01, one layer down — design together.*

### Problem
The Babel 500 KB deopt warning is **not** the S2 macro. `solidaria` and
`solidaria-components` ship a **single `.` barrel** as preserved-JSX
`dist/index.jsx` (only a `.` export), so any small consumer — even
`@proyecto-viviana/ui/Provider`, whose `solid` condition resolves to
`dist/Provider.jsx` — drags the whole barrel through Solid's compiler. App-level
`babel.compact = true` only hides the warning; it is a band-aid to remove.

### Scope
- Add subpath exports to `solidaria` / `solidaria-components` where small
  consumers need one primitive; rewire `solid-spectrum` + `viviana-ui` internal
  imports to those subpaths.
- A **concrete** guard: assert `dist/Provider.jsx` does **not** transitively
  import `solidaria/dist/index.jsx` (fail CI on regression).
- Republishing the lower packages → depends on UC-00 machinery.

### Out of scope
- Macro plugin behavior; component APIs; app-level log suppression.

### Acceptance
- The UC-00 out-of-workspace fixture dev build shows **no**
  `solidaria/dist/index.jsx` / `solidaria-components/dist/index.jsx` 500 KB
  warning, with **no** app-level `compact` workaround.
- The barrel-regression guard runs in CI.

### Resolution (2026-06-20)
- **Build split, not a consumer rewire.** Both lower packages now build one entry
  per public module (`solidaria` from each `src/<name>/index.ts`,
  `solidaria-components` from each barrel `from "./X"` target), shared code hoisted
  into `_chunk/`. `dist/index.jsx` is now a ~70-line thin re-export barrel and the
  largest emitted `.jsx` is ~50 KB — so the deopt fires for **no** consumer, even
  one that imports the barrel. The `consume-pack-smoke` (DOM+SSR, out-of-workspace
  tarballs) is green with **no** 500 KB warning and **no** app-level `compact`.
- **Subpath exports added:** `solidaria` (50) and `solidaria-components` (66) each
  ship per-primitive `{types,solid,import,default}` subpaths; the `.` barrel is
  preserved, so the change is additive — no consumer rewire was needed (the thin
  barrel already defeats the deopt, and `sideEffects:false` keeps tree-shaking).
- **Resolution gotcha (solidaria):** because solidaria's sources are directory
  modules (`src/<name>/index.ts`), the impl must land **inside** the type directory
  (`dist/<name>/index.jsx`), not as a flat `dist/<name>.jsx` sibling — a flat
  sibling shadows the directory when TypeScript resolves the barrel's relative
  `export … from "./<name>"`, collapsing every re-exported type to `{}`.
- **Guard (better than the planned one):** `guard:jsx-deopt-size`
  (`scripts/check-jsx-deopt-size.ts`) asserts no published `.jsx` exceeds the
  500 KB Babel deopt threshold — the *actual* failure mode, more robust than the
  "Provider.jsx must not import the barrel" import-path check (importing a thin
  barrel is now harmless). Its `KNOWN_LARGE` allowlist is **empty** once **UC-07**
  thinned the last fat barrel (`solid-spectrum`).

---

## UC-07 ✔ — Thin the `solid-spectrum` barrel + serve the JSX-free `./style` as `.js`

*Surfaced by UC-05's `guard:jsx-deopt-size`; same class of fix, one layer up.*

### Problem
`guard:jsx-deopt-size` flags two `solid-spectrum` `.jsx` over 500 KB that a
consumer would compile: `dist/index.jsx` (~520 KB) and `dist/style/index.jsx`
(~1.26 MB). `viviana-ui` imports the `solid-spectrum` barrel 11× and `./style` /
`./style/runtime`, so these reach published `@proyecto-viviana/ui` consumers.
- The barrel is fat even though `solid-spectrum` is already per-primitive: its
  `src/index.ts` re-exports **79** targets but only ~35 are build entries, so the
  ~45 non-entry re-exports inline into `dist/index.jsx`.
- `dist/style/index.jsx` is the S2 `style()` macro module (`csstype` +
  `@parcel/macros` + generated tables) — JSX-free, so it should never be served
  via the JSX-preserve `solid` condition; the pre-compiled `.js` is equivalent and
  is not re-Babel'd.

### Scope
- Derive **all 79** barrel targets as `vite.config` entries so `dist/index.jsx`
  becomes a thin re-export barrel (mirror UC-05).
- Point the `./style` and `./style/runtime` `solid` export conditions (in
  `solid-spectrum` and the re-exporting `viviana-ui`) at the `.js` output, since
  those modules carry no Solid template code. Verify the `style()` macro still
  expands at the app build (UC-04 path) after the condition change.
- Remove the two entries from `KNOWN_LARGE` in `check-jsx-deopt-size.ts` once
  resolved (the guard already fails if a listed file drops below the threshold).

### Out of scope
- Splitting the generated S2 token tables themselves; macro behavior.

### Acceptance
- `guard:jsx-deopt-size` passes with an **empty** `KNOWN_LARGE`.
- `consume-pack-smoke` stays green (DOM+SSR), and the `style()` macro still
  generates CSS through the UC-04 preset.

### Resolution (2026-06-20)
**Barrel targets derived, not hand-listed.** `vite.config.ts` now reads
`src/index.ts` and promotes every `from "./…"` target to a build entry, merged
with the curated PascalCase subpath aliases. vite keeps each entry's path relative
to `src`, so `src/provider/index.tsx` → `dist/provider/index.jsx` lands beside the
`dist/provider/index.d.ts` tsc emits — never a flat `dist/provider.jsx` sibling
(the UC-05 type-directory-shadowing trap, avoided by construction here). Shared
chunks route to `_chunk/`. Result: `dist/index.jsx` dropped from ~520 KB to ~11 KB
(82 re-export lines); largest emitted `.jsx` is now ~54 KB.

**One target stays inlined: `src/icon/index.tsx`.** It re-exports `* as s2wfIcons`
— the full **410-icon** set — which the public barrel never re-exports. Promoting
it to an entry *roots* that namespace and defeats tree-shaking (a 631 KB chunk over
the limit). Leaving it inlined lets the unused namespace drop entirely (0 refs in
any emitted `.jsx`); the individual `./icon/s2wf-icons/<Name>` icons remain their
own tiny entries. A documented `inlineIntoBarrel` set carries the exception.

**`./style` + `./style/runtime` served as `.js`.** Those modules are JSX-free, so
the `solid` condition now points at the `.js` (DOM) output and the `.jsx` pass
skips them — `dist/style/index.jsx` (1.26 MB) is no longer emitted at all. The
`style()` macro still expands at the consumer build (validated through the smoke).
`viviana-ui` needed **no** change: its own `dist/style.jsx` is a thin re-export
that doesn't approach the limit, and it resolves `solid-spectrum/style` through the
`solid`→`.js` condition.

**Validated.** `guard:jsx-deopt-size` green with empty `KNOWN_LARGE` (385 `.jsx`,
all < 500 KB). `ui:smoke` green (184/184 export files, 45/45 JS subpaths, DOM+SSR).
A root-barrel `import { Button } from "@proyecto-viviana/ui"` SSR build emits **no**
deopt warning — the original UC-00 symptom for the common import path is gone.

---

## UC-06 ⤓ — `viviana-social` app migration (downstream, other repo)

**Lives in the `viviana-social` repo, not here.** Tracked from this side only as
the dependency target; its acceptance runs in `viviana-social`'s own tracker. The
UC-00 out-of-workspace fixture is the in-repo proxy for the app validation we
cannot run here.

### Scope (in `viviana-social`)
- Update `pokeforos`, `bord`, `tortafritapp` to the published/packed `ui`
  carrying the UC-00…UC-05 contract.
- Import `@proyecto-viviana/ui/styles.css` wherever UI renders (fixes
  `tortafritapp`).
- Replace copied macro wrappers with the UC-04 helper; drop direct
  `solid-spectrum`/`solidaria` config entries the package changes make
  unnecessary; keep source imports on `@proyecto-viviana/ui` + `…/ui/style`.

### Acceptance (cross-repo)
- The three apps' dev builds start; app-authored `style()` compiles DOM + SSR;
  `tortafritapp` has the explicit UI CSS import; **no** app source imports
  `@proyecto-viviana/solid-spectrum` directly; any remaining internal-package
  config ref is documented with a removal condition.

---

## Dependency & wave map

| id | title | depends | parallel reality |
| --- | --- | --- | --- |
| **UC-00** ✔ | Release-matrix promotion + out-of-workspace install smoke | — | **The spine — done 2026-06-20.** Promotion recorded; `consume-pack-smoke` green (DOM+SSR). Unblocks verifiable acceptance for all others. |
| **UC-01** ✔ | Deep subpath export parity + `./style/runtime` | UC-00 (for tarball smoke) | **Done 2026-06-20.** Full parity (0 `solid-spectrum` subpaths missing); smoke asserts 185/185 export files + 44/44 JS subpaths resolve. Shared `./style*` surface still feeds **UC-02**; coupled to **UC-05**. |
| **UC-02** ◑ | `./style` Viviana tokens + CSS-inventory reconcile | UC-00 | **Part A (CSS inventory) done 2026-06-20**; **Part B (token map) deferred — design decision, nothing to mirror.** |
| **UC-03** ✔ | CSS + Provider contract + `default`-condition fix | UC-00 | **Done 2026-06-20.** `default→src` footgun closed (single dist target); README contract; smoke guards. |
| **UC-04** ✔ | Vite macro preset + in-repo SSR/DOM fixture | UC-00 | **Done 2026-06-20.** `@proyecto-viviana/ui/vite` → `vivianaMacros()` (optional peer on `unplugin-parcel-macros`); `ui:macro-smoke` proves app-authored `style()` generates/loads CSS in DOM + SSR through the shipped helper. |
| **UC-05** ✔ | Lower-package subpath exports (kill barrel bloat) | UC-00 | **Done 2026-06-20.** `solidaria`/`solidaria-components` `.` barrels split into per-primitive entries → thin re-export barrels (largest `.jsx` ~50 KB); 50+66 subpath exports added (barrel preserved, additive). `consume-pack-smoke` green with **no** 500 KB warning, no `compact`. New `guard:jsx-deopt-size` enforces the threshold. |
| **UC-07** ✔ | Thin `solid-spectrum` barrel + `./style` as `.js` | UC-05 | **Done 2026-06-20.** `vite.config` derives all barrel targets as entries → `dist/index.jsx` ~520 KB → ~11 KB (largest `.jsx` ~54 KB); `src/icon/index.tsx` stays inlined so its unused 410-icon `s2wfIcons` namespace tree-shakes away. `./style`/`./style/runtime` served as `.js` (the 1.26 MB `.jsx` no longer emitted). `guard:jsx-deopt-size` green with **empty** `KNOWN_LARGE`; a root-barrel `@proyecto-viviana/ui` import builds with no deopt. |
| **UC-06** | `viviana-social` app migration | UC-00…UC-05, UC-07 | Downstream, other repo. |

**Waves:** (0) UC-00. (1) UC-01⊕UC-02 as one stream, UC-03, UC-04, UC-05 in
parallel — all validated through the UC-00 fixture. (1b) UC-07 (`solid-spectrum`
barrel + `./style`), surfaced by UC-05's guard, **done**. (2) UC-06 in
`viviana-social`. With UC-05 + UC-07 landed, the barrel-bloat deopt is closed
across all five packages; resume the parity loop at
`upstream-release-audit.md` T-57.
