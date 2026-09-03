---
id: 261
type: task
title: "Stop hoisting every fixture CSS onto comparison component pages"
created: 2026-09-03
parent: 26
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "measured on the #259 production-preview pass: every component page ships 158 render-blocking CSS files",
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

## Do not

- Implement #255's owner-gated `astro dev` options.
- Patch S2 component CSS (ADR 0001).
- Reopen the fixture JS split.

## Done when

A Button or Picker production page no longer waits on CSS for unrelated
fixtures. Coverage no longer loads 94 sheets. A measurement on production
preview records the new request count and `loadEventEnd`.

## Relationship

Child of #26. Sibling of #250 (JS split, landed) and #255 (dev graph, owner).
Surfaced by #259.
