# Scripts

Root scripts are maintenance guards that are still useful outside the visual
comparison app.

## Active Guards

- `check-doc-routes.ts` verifies generated web docs routes.
- `check-rac-parity.ts` checks a narrow required export set for
  `solidaria-components` against `react-aria-components`.
- `check-rac-export-gap.ts` reports the broader headless export gap. As of the
  2026-05-12 local report, this has `0` missing RAC named exports and only
  reports Solid extras.
- `check-dnd-keyboard-parity.ts` guards keyboard DnD invariants that are hard to
  see in static screenshots.
- `check-virtualizer-keyboard-parity.ts` guards virtualizer keyboard navigation
  invariants.
- `check-changeset-required.mjs` enforces changesets for releasable packages.

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
- `@proyecto-viviana/solid-spectrum`
- `@proyecto-viviana/ui`

Use `vp run pack:local-chain` from the repo root to rebuild and pack them into
`/tmp/viviana-ui-packs-chain`. The script stages package copies under `/tmp`,
rewrites staged `workspace:*` dependencies to package versions, packs the
staged packages, and prints dependency/override snippets for the current
consumers:

Private workspace-only test helpers are removed from staged `devDependencies`
so consumer installs do not depend on unpublished test packages. Runtime
workspace dependencies still have to be part of the packed chain.

- `apps/comparison` consumes `solid-spectrum` directly, so it exercises the
  lower `solidaria-components` chain.
- Pokeforos consumes `viviana-ui`, so it exercises the wrapper plus SolidStart
  SSR and routing integration.

## Out-of-workspace Consume Smoke (UC-00)

`consume-pack-smoke.mjs` is the keystone of the client-readiness track
(`.claude/current/ui-client-contract.md`). It proves a real external consumer can
install `@proyecto-viviana/ui` from the packed tarballs — with no workspace
symlinks — and build it for both targets:

- Scaffolds a throwaway app under `/tmp/viviana-ui-consume-smoke`, depending on
  `@proyecto-viviana/ui` via a `file:` tarball, with `overrides` redirecting the
  whole closure to their `file:` tarballs (the rewritten concrete versions aren't
  on any registry).
- Runs a DOM `vite build` and an SSR `vite build --ssr` + render, asserting the
  rendered `<button>` keeps its macro-expanded style classes.
- Encodes two facts every consumer needs: a dual-target build uses
  `solid({ ssr: true })`, and the SSR resolver must include the `solid` condition
  (otherwise it grabs the DOM-compiled `.js` and crashes calling `template()` on
  the server).

Run `vp run ui:smoke` to pack the chain then consume it, or
`vp run ui:consume-smoke` to reuse existing tarballs. Needs network (installs
`vite` + `vite-plugin-solid` + `solid-js` into the throwaway app).
