---
kind: process
status: current
---

# `@proyecto-viviana/ui` client-readiness backlog (UC-NN)

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

## UC-00 ◑ — Promote `@proyecto-viviana/ui` into the release matrix + out-of-workspace install smoke

**The spine.** Everything else assumes a client can actually install the package.

> **Decision approved 2026-06-20 (owner): promote `ui`.** Recorded in
> `release-policy.md` (matrix row: `releasable / npm / public`) and `steering.md`
> (open decision resolved). What remains under this ticket is the *implementation*
> of that promotion: Changesets scope, coherent closure publish, and the
> out-of-workspace install smoke.

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
- Add `@proyecto-viviana/ui` to the Changesets scope; confirm `pnpm`/`vp`
  rewrites `workspace:*` → the concrete version on publish for `ui`'s deps.
- Confirm the `Release` workflow versions/publishes the **closure** coherently
  when `ui` changes (a `ui` bump that needs a new `solidaria` subpath — see
  UC-05 — must republish `solidaria` too).
- **Build the out-of-workspace fixture** (the keystone, reused by UC-01/03/04/05):
  `vp pack` the closure → install `@proyecto-viviana/ui` into a throwaway app
  *outside* the workspace → assert it builds in **DOM and SSR** and renders a
  styled `Button`. Wire it as a script (e.g. `ci:pack-consume`).

### Out of scope
- Component behavior, token re-theming, app migration (UC-06).

### Acceptance
- `ui` is in the `release-policy.md` matrix with an explicit status; `steering.md`
  open decision resolved.
- A coherent version/publish of the five-package closure is demonstrated (dry-run
  ok).
- The out-of-workspace fixture installs `@proyecto-viviana/ui` from packed
  tarballs and builds DOM + SSR, with **no** reliance on workspace symlinks.

---

## UC-01 ⛔ — Export parity: deep subpaths for the full Spectrum surface + `./style/runtime`

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

---

## UC-02 ⛔ — `./style` Viviana-owned tokens + reconcile the built-CSS inventory

*Shares the `./style*` export surface with UC-01 — same work-stream.*

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
- `./style` no longer bare-re-exports `solid-spectrum/style`.
- Macro smoke proves `style({ backgroundColor: "accent" })` / `style({ color:
  "accent" })` compile to Viviana-owned values/variables; existing
  `[var(--color-*)]` colors keep working.
- The set of built stylesheets equals the set of exported-or-intentionally-internal
  stylesheets (no orphans).

---

## UC-03 ⛔ — CSS + Provider contract, incl. the `default` export-condition hazard

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

---

## UC-04 ⛔ — Supported Vite macro preset for app-authored `style()`

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

---

## UC-05 ⛔ — Kill the transitive root-barrel bloat (subpath exports in lower packages)

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
| **UC-00** ◑ | Release-matrix promotion (decided) + out-of-workspace install smoke | — | **The spine. Do first.** Promotion approved 2026-06-20; install-smoke impl pending. Unblocks verifiable acceptance for all others. |
| **UC-01** | Deep subpath export parity + `./style/runtime` | UC-00 (for tarball smoke) | One work-stream with **UC-02** (shared `./style*` surface); coupled to **UC-05**. |
| **UC-02** | `./style` Viviana tokens + CSS-inventory reconcile | UC-00 | Pair with **UC-01**. |
| **UC-03** | CSS + Provider contract + `default`-condition fix | UC-00 | Genuinely independent. |
| **UC-04** | Vite macro preset + in-repo SSR/DOM fixture | UC-00 | Genuinely independent. |
| **UC-05** | Lower-package subpath exports (kill barrel bloat) | UC-00 | Design with **UC-01**. |
| **UC-06** | `viviana-social` app migration | UC-00…UC-05 | Downstream, other repo. |

**Waves:** (0) UC-00. (1) UC-01⊕UC-02 as one stream, UC-03, UC-04, UC-05 in
parallel — all validated through the UC-00 fixture. (2) UC-06 in `viviana-social`.
After UC-05 lands, resume the parity loop at `upstream-release-audit.md` T-57.
