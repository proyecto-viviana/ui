# Scripts

Root scripts are maintenance guards that are still useful outside the visual
comparison app. The command inventory and how to run the gates live in
`.claude/current/tooling.md` and `.claude/current/certification.md`. Do not copy
guard counts into this file.

## Guards that are easy to misuse

- `check-rac-parity.ts` checks a **narrow required export set**, not RAC
  parity. `check-rac-export-gap.ts` is the broader headless export-name gap.
  Ticketed missing names live in `scripts/rac-export-gap-pending.json`.
- `check-layer-boundary.ts` freezes the solid-spectrum ↔ viviana-ui dual-tree
  inventory. New forks of baselined-identical Spectrum files into viviana-ui,
  or new unbaselined dual paths, exit 1. Rewrite the inventory with
  `--write-baseline` only after intentional dual-path review.
- `report-layer-imports.ts` inventories type imports, runtime imports, and
  re-exports from each styled library into the three headless layers. It is a
  review aid, not a pass/fail guard.

## Comparison App

Visual and behavioral parity for Spectrum 2 styled components belongs in
`apps/comparison`. Add new component state coverage there first; add a root
script only when the invariant is cross-cutting and cannot be expressed well as
a comparison route or Playwright test.

## Local Tarball Chain

`pack-local-chain.mjs` builds publish-shaped tarballs for the local package
chain:

- `@proyecto-viviana/solid-stately`
- `@proyecto-viviana/solidaria`
- `@proyecto-viviana/solidaria-components`
- `@proyecto-viviana/kumo`
- `@proyecto-viviana/solid-spectrum`
- `@proyecto-viviana/ui`

Use `vp run pack:local-chain` from the repo root to rebuild and pack them into
`/tmp/viviana-ui-packs-chain`. The script stages package copies under `/tmp`,
rewrites staged `workspace:*` dependencies to package versions, packs the
staged packages, and prints dependency/override snippets for the current
consumers.

Private workspace-only test helpers are removed from staged `devDependencies`
so consumer installs do not depend on unpublished test packages. Runtime
workspace dependencies still have to be part of the packed chain.

- `apps/comparison` consumes `solid-spectrum` (and builds `kumo` for the Button
  experiment), so it exercises the lower `solidaria-components` chain.
- Pokeforos consumes `viviana-ui`, so it exercises the wrapper plus SolidStart
  SSR and routing integration.

## Out-of-workspace Consume Smoke (UC-00)

`consume-pack-smoke.mjs` is the out-of-workspace consumer contract. It proves
that a real external consumer can install `@proyecto-viviana/ui` from packed
tarballs without workspace symlinks. It then builds both targets:

- Scaffolds a throwaway app under `/tmp/viviana-ui-consume-smoke`, depending on
  `@proyecto-viviana/ui` via a `file:` tarball, with `overrides` redirecting the
  whole closure to their `file:` tarballs (the rewritten concrete versions aren't
  on any registry).
- Runs a DOM `vite build` and an SSR `vite build --ssr` + render, asserting the
  rendered `<button>` keeps its macro-expanded style classes.
- Verifies export-map coherence (UC-01): every file referenced by every export
  condition (`types`/`solid`/`import`/`default` + CSS) exists in the installed
  package, and Node's resolver honors every JS subpath specifier.
- Encodes two facts every consumer needs: a dual-target build uses
  `solid({ ssr: true })`, and the SSR resolver must include the `solid` condition
  (otherwise it grabs the DOM-compiled `.js` and crashes calling `template()` on
  the server).

Run `vp run ui:smoke` to pack the chain then consume it, or
`vp run ui:consume-smoke` to reuse existing tarballs. Needs network (installs
`vite` + `vite-plugin-solid` + `solid-js` into the throwaway app).
