---
id: 261
type: task
title: "Stop hoisting every fixture CSS onto comparison component pages"
created: 2026-09-03
parent: 26
status: merged
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "measured on the #259 production-preview pass: every component page ships 158 render-blocking CSS files",
    }
  - {
      state: in-progress,
      at: 2026-09-04,
      note: "Git v2 implement; slice (c) after (a) #451 and (b) #262. No ticket-session. HEAD 026016ac.",
    }
  - {
      state: merged,
      at: 2026-09-04,
      note: "coalesce generated chrome style() macros onto virtual:comparison-chrome.css; fixture CSS stays per-module.",
    }
---

Every live comparison component page `<head>` lists **158** `<link rel="stylesheet">`
tags (94 on `/coverage/`). Dist has 167 CSS files under `_astro/`; a Button
page still pulls Calendar, TableView, ColorHandle, `react-mount`, and dozens
of `macro-*.css` sheets it never paints.

## Why

#250 split fixture **JS**. Vite still hoists fixture CSS onto the shared
component-page graph, plus `solid-spectrum` `"sideEffects": ["*.css"]` and
`assetsInlineLimit: 0`. Picker `loadEventEnd` got worse after the JS split
(296.7 ms → 480.7 ms) because request count exploded.

This is a production leftover of #250, not the `astro dev` graph (#255).
After #451 / #262 the leftover chrome cost is ~80 `style()` macros in
`chrome/styles.ts`. Slice (c) coalesces that generated output.

## Do not

- Implement #255's owner-gated `astro dev` options.
- Patch S2 component CSS (ADR 0001).
- Reopen the fixture JS split.
- `cssCodeSplit: false`, raise `assetsInlineLimit`, optimizeDeps, import-condition, or ClientRouter.

## Done when

A Button or Picker production page no longer waits on CSS for unrelated
fixtures. Coverage no longer loads 94 sheets. A measurement on production
preview records the new request count and `loadEventEnd`.

## Relationship

Child of #26. Sibling of #250 (JS split, landed) and #255 (dev graph, owner).
Surfaced by #259. Slice (c) of comparison-app-route-load. After #451 and #262.
Distinct from #255 (d)(e)(f).

## Evidence

Artifacts: `.agents/vivianastack/comparison-app-route-load/` (`plan.md` slice
(c), `grill.md` verdict `go`). Cwd
`/home/emoporemilio/projects/viviana-hub/ui`. Baseline HEAD `026016ac`.

Source: `comparisonS2Macros` rewrites chrome-only `macro-*.css` imports onto
one `virtual:comparison-chrome.css`. Cache-first load and two-pass eviction
guard stay. Coalesce is gated to `/components/solid/chrome/` so Calendar /
fixture CSS cannot ride the chrome sheet (ADR 0001: bundling generated
macros, not handwritten S2). `cssCodeSplit` stays on; `assetsInlineLimit`
stays 0. `sideEffects: ["*.css"]` untouched. Chrome styles still use the S2
style macro. `apps/web` untouched. Not optimizeDeps, import-condition, or
ClientRouter.

Local: `vp run comparison:test:chrome-css-coalesce` 6 passed (cwd ui).
`vp run --filter @proyecto-viviana/comparison guard:chrome-css-coalesce`
`chrome css coalesce: ok (79 macro CSS → 1 virtual:comparison-chrome.css)`.
`vp test run` fixture-registry-split + demo-control-split + chrome-css-coalesce
17 passed. `git diff --check` exit 0.

Live measure: `:4321` closed; did not start astro. Production preview HTML
stylesheet count / `loadEventEnd` not run (`comparison:build` not run).
CSS n drop proved at the macro transform: 79 chrome sheets → 1 virtual sheet.
