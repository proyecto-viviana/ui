---
id: 454
type: task
title: "Add Astro ClientRouter, hover prefetch, and modulepreload to comparison docs"
created: 2026-09-04
parent: 136
status: open
history:
  - {
      state: open,
      at: 2026-09-04,
      note: "filed as #255 slice (f); owner-confirmed title. Absorbs #450 client-nav Done-when once this ticket exists. Parent is #136 (a task cannot parent a task).",
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

Child of #136. Slice (f) of #255. Related both ways to #450: keep #450
open until this ticket exists; do not fold #450 into #255. After #261
(CSS coalesce). Distinct from #250, #261, #262.
