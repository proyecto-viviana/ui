---
id: 450
type: task
title: "Stop the comparison app loading every component per page"
created: 2026-09-03
parent: 26
status: verified
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the 2026-09 train: comparison:dev still loads the full graph per page; not bound to #250/#255/#261/#262",
    }
  - {
      state: open,
      at: 2026-09-04,
      note: "keep open until ClientRouter child #454 exists; Relationship both ways with #454. Do not fold into #255.",
    }
  - {
      state: next,
      at: 2026-09-04,
      note: "ClientRouter child #454 exists; fold client-nav Done-when there, not into #255.",
    }
  - { state: in-progress, at: 2026-09-04, note: "walk with #454 implement; no ticket-session." }
  - { state: merged, at: 2026-09-04, note: "duplicate of #454; client-nav Done-when moved to #454" }
  - {
      state: verified,
      at: 2026-09-04,
      note: "duplicate of #454; independent review APPROVE at 3e0e50cc. Client-nav Done-when proved on #454, not #255.",
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

| Surface                     | Route                    | Requests | Bytes   | Client nav         | Notes                                                   |
| --------------------------- | ------------------------ | -------- | ------- | ------------------ | ------------------------------------------------------- |
| Dev (research 2026-09-04)   | tableview hard-goto      | 1758     | 42.6 MB | no                 | before #451/#262/#261/#454                              |
| Dev `:4378` after #261+#454 | tableview hard-goto      | 507      | —       | no                 | islands mounted; S2 floor 90 still applies to hard-goto |
| Dev `:4378` after #261+#454 | tableview → button click | 13       | —       | yes, nav entries 1 | chrome CSS 0; islands remount                           |
| Dev `:4378` after #261+#454 | hover Button             | 1 HTML   | —       | prefetch           | `/components/button/` only, not 78 pages                |

Preview bytes / request count: not run (`comparison:build` not run). Click-nav
Done-when lives on #454.

## Done when

Measured per-route requests/bytes drop to route-scoped modules,
navigation is client-side, and dev and preview are usable. The evidence
table in this ticket is filled.

## Relationship

Child of #26. Distinct from #250, #255, #261, and #262. Release train
#443 lists this as ordered work. **Folded into #454** (`duplicate of #454`;
client-nav Done-when moved to #454). Do not fold into #255.
