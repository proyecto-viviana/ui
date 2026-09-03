---
id: 259
type: task
title: "Make the comparison app production-ready"
created: 2026-09-02
parent: 26
status: in-progress
history:
  - {
      state: open,
      at: 2026-09-02,
      note: "opened from the owner request to production-ready the comparison page before the functional pass",
    }
  - {
      state: in-progress,
      at: 2026-09-02,
      note: "page audit started: routes, security, production performance, copy, chrome",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "landed headers, 404, robots, skip link, trailingSlash always, Docs→/coverage/, noindex on internal routes, demo href sanitizer, Cache-Control; filed #261 CSS hoist, #262 lazy demos, #263 CSP",
    }
---

Make the published comparison app (`apps/comparison`) a production site, not
only a local harness. This is the docs/harness surface users and CI hit. It is
not the per-component parity bar (#24) and not the `astro dev` module-graph
lag (#255).

## Why

The comparison app is the public proof surface. Landing, coverage, component
routes, chrome, headers, and copy have to hold before a React-vs-Solid
functional pass can be trusted. #136 named the functional pass; this ticket
owns the page around the fixtures.

## Work

Audit and close production gaps on the page itself:

- **Routes.** Catalogue slugs, explicit `src/pages/components/*.astro` files,
  `[slug].astro` catch-all, sidebar, coverage, experiments, D12, keyboard
  shortcuts. Trailing slashes, 404, dead links, missing pages.
- **Security.** Worker headers (the fetch handler is a bare
  `env.ASSETS.fetch`), CSP vs Typekit and inline theme boot, referrer,
  nosniff, frame options, robots, sitemap. Confirm no admin/write API leaks
  into this worker (that hole is #137 on `apps/web`).
- **Performance.** Production preview, not `astro dev`. Fonts, islands-mounted,
  chunk sizes after #250, CLS (chrome spec already samples layout shift),
  LCP. Do not implement #255's structural options without the owner.
- **Styling and copy.** Marketing hero/CTA, coverage copy, component chrome,
  titles, meta description, theme boot. Match S2 docs chrome where we claim
  to. Do not patch S2 component styling in this app (ADR 0001).
- **Page e2e.** Landing, coverage, 404, headers, and chrome must have
  Playwright coverage that would fail if they drifted.

## Done when

The production worker serves security headers; unknown routes render a real
404; landing and coverage copy match the published packages; meta/title/theme
boot are complete; a preview-backed Playwright spec covers those page
contracts; `vp run comparison:build` is current with the tree.

## Relationship

Child of #26. Sibling of #88 (collection docs pages) and #255 (dev-server
graph). The functional pass is #260. Follow-ons from the page audit: #261
(fixture CSS hoist), #262 (lazy demo modules), #263 (CSP).
