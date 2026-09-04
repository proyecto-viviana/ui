---
id: 452
type: task
title: "Pre-bundle comparison Solid packages in astro-dev (`optimizeDeps.include`)"
created: 2026-09-04
parent: 136
status: in-progress
blocked: true
history:
  - {
      state: open,
      at: 2026-09-04,
      note: "filed as #255 slice (d); owner-confirmed title. Parent is #136 (a task cannot parent a task).",
    }
  - {
      state: in-progress,
      at: 2026-09-04,
      note: "Git v2 implement; slice (d) after #451. No ticket-session. HEAD 30d22af1. Rolldown extractExportsData cannot parse solid .jsx; did not land optimizeDeps.include.",
    }
---

`optimizeDeps.exclude: localSolidPackages` is why Solid stays unbundled
under `astro dev` while `@react-spectrum/s2` is already in the dep cache.
Move local Solid packages to `optimizeDeps.include`. After #451, include
subpaths (or drop the exact-package alias). Do not include the package
root. Keep one `solid-js` instance and the `solid` condition. Do not pass
`optimizeDeps.esbuildOptions`.

## Done when

`.vite/deps/_metadata.json` lists Solid subpaths. Button request count is
at least the measured S2 origin (~90) plus recorded Solid leftover; do not
invent a cap below that 90. One `solid-js`. Fixtures still load `.jsx`.
Dev-only; `vp run comparison:build` unchanged or better.

## Relationship

Child of #136. Slice (d) of #255. After #451. Before optional #453.
Distinct from #261 and #262.

## Evidence

Artifacts: `.agents/vivianastack/comparison-app-route-load/` (`plan.md` slice
(d), `grill.md` verdict `go`). Cwd
`/home/emoporemilio/projects/viviana-hub/ui`. Baseline HEAD `30d22af1`.
Did not edit `packages/solidaria`. Did not land import-condition or
ClientRouter. Did not include aliased package roots / barrels. Did not
pass `optimizeDeps.esbuildOptions`. Did not push. Did not touch pid 15315
`:4350`.

Source: not landed. `apps/comparison/astro.config.mjs` restored to HEAD.
`exclude: localSolidPackages` still in force.

Local: failed. `ASTRO_DEV_BACKGROUND=0 astro dev --port 4377 --host 127.0.0.1 --ignore-lock`
from `apps/comparison` (not `:4321`). Subpath include without
`optimizeDeps.extensions` → Vite `Cannot optimize dependency` for all 206
`solid` export keys (OPTIMIZABLE_ENTRY_RE is `/\.[cm]?[jt]s$/`; entries are
`.jsx`). With `extensions: [".jsx"]` (and a `rolldownOptions.transform.jsx`
automatic/`solid-js` override) → `extractExportsData` `Parse error` then
hung `[optimizer] bundling dependencies...`. Plugin scan stays
`jsx: "preserve"`; esbuild-plugin-solid is rejected on this Vite 8 tree.
`_metadata.json` listed 0 `@proyecto-viviana/*` keys (36 optimized, S2
still present, `solid-js` + `/web`/`/h`/`/html`/`/store`). Button HTML on
`:4377` was 200 / 2.54 MB before the hang. `comparison:build` not run.
Button CDP request count not measured.

Unblock needs a Vite-plus path that parses `solid` `.jsx` in optimizeDeps
without `esbuildOptions` and without slice (e) `import` condition.
