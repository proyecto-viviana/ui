# 02 · Style System & Build Model

The style-system decision is now settled: `solid-spectrum` should follow the
React Spectrum S2 build-time macro model. Component sources import S2 style
helpers with `with {type: "macro"}`; the bundler executes those calls, inlines
the returned class strings, and emits CSS assets.

This supersedes the old runtime bridge described in earlier notes. The local
CSS registry, manual generator script, and prebuilt generated stylesheet were
removed because they were incomplete, slow, and easy to drift from the
component set.

## 1. Source Of Truth

- Upstream React Spectrum S2 style declarations remain the source for tokens,
  conditions, forced-colors branches, and atomic class output.
- Solid ports may adapt JSX, owner state, ARIA wiring, and import paths, but
  style declarations should stay structurally copied from S2.
- Token values should type-check directly. Component-side token casts are a
  style-system bug unless they are proven to be a non-style Solid adapter.

## 2. Package Build

`packages/solid-spectrum` uses Vite Plus package builds for the JS/CSS output:

```bash
vp run --filter @proyecto-viviana/solid-spectrum build
```

The package build runs `vp pack` with the Parcel macro plugin through
Rolldown. `tsc -p tsconfig.build.json` still owns declarations for this
checkpoint. The package Vite config contains a small adapter around
`macros.rolldown()` because upstream S2 packages with Parcel, while this repo
packages with Vite Plus/Rolldown.

That adapter is allowed build glue, not component-source divergence. Component
style imports should still look like upstream S2 macro imports.

## 3. Comparison App Build

The comparison app should run the macro over source where source components are
compiled by the app. Root Vite config includes `macros.vite()` so new app-side
S2 style calls can compile instead of relying on package-time side effects.

Remaining app work is tracked in the phasing docs: wire source-condition
consumption and CSS chunking for the comparison app, then prove the same macro
path through visual and computed-style gates.

## 4. Gates

Every component pass that touches S2 styling must leave evidence for:

- upstream style declaration located and linked in the component note,
- Solid owner style declaration identified,
- token-sensitive states covered by computed style, geometry, or visual proof,
- package build passing,
- no leaked virtual macro CSS imports in built JS,
- no reintroduced manual CSS registry or generated stylesheet path.

Useful checks:

```bash
vp run --filter @proyecto-viviana/solid-spectrum build
rg -n "macro-[a-f0-9]+\\.css" packages/solid-spectrum/dist -g '*.{js,css,d.ts}'
```
