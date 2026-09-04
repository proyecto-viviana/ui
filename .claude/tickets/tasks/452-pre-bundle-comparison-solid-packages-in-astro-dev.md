---
id: 452
type: task
title: "Pre-bundle comparison Solid packages in astro-dev (`optimizeDeps.include`)"
created: 2026-09-04
parent: 136
status: open
history:
  - {
      state: open,
      at: 2026-09-04,
      note: "filed as #255 slice (d); owner-confirmed title. Parent is #136 (a task cannot parent a task).",
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
