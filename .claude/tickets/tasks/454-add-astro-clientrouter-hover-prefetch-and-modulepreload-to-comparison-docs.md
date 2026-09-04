---
id: 454
type: task
title: "Add Astro ClientRouter, hover prefetch, and modulepreload to comparison docs"
created: 2026-09-04
parent: 136
status: merged
history:
  - {
      state: open,
      at: 2026-09-04,
      note: "filed as #255 slice (f); owner-confirmed title. Absorbs #450 client-nav Done-when once this ticket exists. Parent is #136 (a task cannot parent a task).",
    }
  - {
      state: next,
      at: 2026-09-04,
      note: "Git v2 implement; slice (f) after #261 CSS coalesce. No ticket-session. Fold #450 here, not into #255.",
    }
  - {
      state: in-progress,
      at: 2026-09-04,
      note: "HEAD 4f527857. #261 already coalesced chrome CSS (79→1). prefetchAll stays false.",
    }
  - {
      state: merged,
      at: 2026-09-04,
      note: "ClientRouter in docs/marketing layouts; hover prefetch of one slug; example remounts on astro:after-swap. #450 folded here.",
    }
---

Comparison docs are an MPA today: sidebar `<a>` click is a full
`navigation`. Add Astro 7 `<ClientRouter />` in DocsPageLayout /
MarketingLayout, `prefetch: { prefetchAll: false, defaultStrategy: "hover" }`,
and modulepreload. Default ClientRouter `prefetchAll: true` is forbidden
until CSS coalesce (#261) has shrunk the HTML. Do not persist the example
section across swaps; remount on `astro:after-swap`.

## Done when

Click tableview → button: `performance.getEntriesByType("navigation").length
=== 1`; CDP does not re-request chrome CSS; `data-islands-mounted` toggles
then true. Pair/contract/certified via hard `page.goto` stay green. Hover a
sidebar link after #261: HTML prefetch of the next slug, not 78 pages.
Record islands remount; do not invent remount timings.

## Relationship

Child of #136. Slice (f) of #255. Absorbs #450 client-nav Done-when
(`duplicate of #454`). Do not fold #450 into #255. After #261
(CSS coalesce). Distinct from #250, #261, #262, #452, #453. Did not land
#453 (chrome `import` condition) or retry #452 (optimizeDeps parked).

## Evidence

Artifacts: `.agents/vivianastack/comparison-app-route-load/` (`plan.md` slice
(f), `grill.md` verdict `go`). Cwd
`/home/emoporemilio/projects/viviana-hub/ui`. Baseline HEAD `4f527857`.

Source: `<ClientRouter />` in `DocsPageLayout.astro` / `MarketingLayout.astro`.
`prefetch: { prefetchAll: false, defaultStrategy: "hover" }` in
`astro.config.mjs`. Sidebar `<a data-astro-prefetch="hover">`. Manual mounts
re-run on `astro:after-swap` via `mountOnAstroPage`; example clears
`data-islands-mounted` before remount; `transition:animate="none"` on the
example frame. `history.replaceState` for control query params waits for
`astro:page-load`. `optimizeDeps` unchanged (`exclude: localSolidPackages`).
No changeset (comparison app is not published). Not #453 / #452.

Local: `vp run comparison:test:client-router` 8 passed. `vp run --filter
@proyecto-viviana/comparison guard:client-router` `client router: ok`.
`git diff --check` exit 0.

Live measure: implementer `astro dev` `http://127.0.0.1:4378` (not owner
`:4321`; did not touch pid 15315 `:4350`). Playwright
`e2e/client-router.spec.ts` with `COMPARISON_BASE_URL`:

| Mode | Reqs | Nav entries | Chrome CSS re-req | Notes |
| --- | --- | --- | --- | --- |
| hard-goto `/components/tableview/` | 507 | 1 | n/a (first load) | islands mounted |
| hover Button from tableview | 1 HTML path | 1 | — | `/components/button/` only, not 78 slugs |
| click tableview → button | **13** | **1** | **0** | islands-mounted cleared then true; heading Button |

`link[rel=modulepreload]` count **0** under astro dev (Vite dev). Production
Vite/Astro `modulePreload: { polyfill: false }` left default; did not set
`modulePreload: false`. Remount timings not invented.

Pair / contract / certified (hard `page.goto`) not re-run. `comparison:build`
/ preview not run. `sidebar-navigation.spec.ts` against `:4378` failed on a
pre-existing Disclosure locator; live sidebar is the flat list
(`component-detail-chrome.spec.ts`). ClientRouter spec does not click that
disclosure.
