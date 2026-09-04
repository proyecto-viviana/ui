---
id: 450
type: task
title: "Stop the comparison app loading every component per page"
created: 2026-09-03
parent: 26
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the 2026-09 train: comparison:dev still loads the full graph per page; not bound to #250/#255/#261/#262",
    }
---

`vp run comparison:dev` locally is laggy/unusable. Every component and
stylesheet appears to load on each page.

Research artifact (untracked):
`.agents/vivianastack/comparison-app-route-load/`.

Related work already on the board does not share this Done-when: #250
split fixture JS (in-progress, parent #136), #255 cuts the astro-dev
module graph (open, parent #136, no client-side navigation), #261 stops
CSS hoist, #262 lazy-loads `*-demo` modules.

## Evidence

Record before/after per-route requests and bytes here after measurement.

| Surface | Route | Requests | Bytes | Client nav | Notes |
| ------- | ----- | -------- | ----- | ---------- | ----- |
|         |       |          |       |            |       |

## Done when

Measured per-route requests/bytes drop to route-scoped modules,
navigation is client-side, and dev and preview are usable. The evidence
table in this ticket is filled.

## Relationship

Child of #26. Distinct from #250, #255, #261, and #262. Release train
#443 lists this as ordered work.
