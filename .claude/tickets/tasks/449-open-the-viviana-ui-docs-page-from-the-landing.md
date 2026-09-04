---
id: 449
type: task
title: "Open the VIVIANA UI docs page from the landing"
created: 2026-09-03
parent: 26
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the 2026-09 train: landing VIVIANA UI entry hits a broken /showcase; not bound to #40/#45/#88",
    }
---

On https://ui.proyectoviviana.org the "VIVIANA UI" entry
(`apps/web/src/routes/index.tsx` ~line 222 → `/showcase`) must open a
docs page equivalent to `/solid-spectrum`, rendered with viviana-ui's
own visual language and components. `/showcase` is broken in production.

Research artifact (untracked): `.agents/vivianastack/viviana-ui-docs-entry/`.

## Evidence

Production landing "VIVIANA UI" → `/showcase` is a dead link.
`/solid-spectrum` is the equivalent docs page to match.

## Done when

The link opens a working viviana-ui docs page in production styling,
route tests and the SEO manifest are updated, and there is no
`/showcase` dead link.

## Relationship

Child of #26. Not bound to #40 (deploy the Kumo-aware landing), #45
(catalogue coverage), or #88 (collection docs pages) — those Done-when
clauses differ. Release train #443 lists this as ordered work.
