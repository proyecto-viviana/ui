---
id: 255
type: task
title: "Cut the comparison dev-server module graph (1 757 modules, ~31 s to islands-mounted)"
created: 2026-09-02
parent: 136
status: open
history:
  - {
      state: open,
      at: 2026-09-02,
      note: "measured by #250 after the fixture split: the lag the owner reported is the package graph under astro dev, not the fixture registries",
    }
  - {
      state: open,
      at: 2026-09-03,
      note: "production leftover of static *-demo imports is #262; do not fold that into this owner-gated astro-dev ticket",
    }
---

## Finding

#250 split the fixture registries per slug (production bundle: no chunk over
300 KB, picker preview 3.81 MB → 2.12 MB JS). Under `astro dev` the picker
page still requests **1 757 modules / 67.6 MB** and takes **~31 s** to
`data-islands-mounted` (#250 `## Landed`, "astro dev picker"). Only two fixture
modules are among them, so the owner-reported lag ("all files are fetched in
all pages") is the dependency graph the dev server serves unbundled:

- The Solid packages resolve through the `solid` export condition to per-file
  `dist/*.jsx` transformed by vite-plugin-solid on every request:
  `solidaria` 264 files, `solidaria-components` 152, `solid-spectrum` 311,
  `viviana-ui` 384 (`find packages/*/dist -name '*.js*'`). Fixtures import the
  `@proyecto-viviana/solid-spectrum` barrel
  (`apps/comparison/src/components/solid/fixtures/styled/picker.tsx:4-10`), so
  one component pulls the whole package.
- `@react-spectrum/s2/dist` is 272 `.mjs` files; whether Vite pre-bundles it
  in this app (Astro's React renderer sets `optimizeDeps.include` only to its
  client entrypoint, `astro.config.mjs:241-244`) is unmeasured.
- `apps/comparison/src/data/component-controls.ts` statically imports all 64
  `*-demo.ts` modules for the props panel on every page (#250 `## Landed`).

## Work

1. Measure first: per-origin module counts for one page under `astro dev`
   (`packages/*/dist`, `@react-spectrum/s2`, `react-aria-components`, demos,
   app), from the Vite dev server log or the Playwright request list. Record
   the table in this ticket.
2. Bring the owner the structural options with the measured effect of each,
   in their terms (Rule #3), before implementing: pre-bundling the Solid
   packages in dev (vite-plugin-solid's `esbuild-plugin-solid` path via
   `optimizeDeps.include`; must keep one `solid-js` instance and the `solid`
   condition semantics), consuming the packages' bundled `import` condition in
   the harness only, deep imports in fixtures instead of the barrel, and
   loading the per-slug demo module in `component-controls.ts` the way the
   fixture registries now do.
3. Implement what the owner picks; the acceptance number is the same page's
   dev-server `data-islands-mounted` time and module count, before/after, on
   an idle machine.

## Done when

`astro dev` picker page module count and time-to-`data-islands-mounted` are
recorded before/after in this ticket and the after is the owner-accepted
target; `vp run comparison:build` chunk sizes unchanged or better; pair,
contract and certified green on the dev-served harness as well as preview.

## Relationship

Child of #136. Follows #250. Blocks nothing; unblocks day-to-day use of the
harness for the D13 work (#245, #246).
