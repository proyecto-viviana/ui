---
id: 449
type: task
title: "Open the VIVIANA UI docs page from the landing"
created: 2026-09-03
parent: 26
status: merged
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the 2026-09 train: landing VIVIANA UI entry hits a broken /showcase; not bound to #40/#45/#88",
    }
  - {
      state: in-progress,
      at: 2026-09-04,
      note: "shrunk plan grill go: copy Spectrum chrome, Button + two hooks, no catalogue",
    }
  - {
      state: merged,
      at: 2026-09-04,
      note: "Add /viviana-ui/docs, retarget landing/header/showcase brand off /showcase; a11y:smoke + route/seo subset",
    }
---

On https://ui.proyectoviviana.org the "VIVIANA UI" entry
(`apps/web/src/routes/index.tsx` → `/viviana-ui/docs`) opens a docs page
equivalent to `/solid-spectrum/docs`, rendered with viviana-ui's own
visual language and components. `/showcase` stays the Playground.

Research artifact (untracked): `.agents/vivianastack/viviana-ui-docs-entry/`.

## Evidence

cwd `/home/emoporemilio/projects/viviana-hub/ui`, parent `0b55a494`.
Plan/grill: `.agents/vivianastack/viviana-ui-docs-entry/` (grill `go`).
`pages.json` untouched. No wrangler/deploy.

`vp run --filter @proyecto-viviana/web typecheck` PASS.

`vp run a11y:smoke` PASS (49), including `e2e/viviana-ui-docs.spec.ts`
(header/CTA/brand href `/viviana-ui/docs`, not `/showcase`; sidebar
Getting Started, Installation, Button, both hooks; Playground `/showcase`;
API `/docs`).

`playwright test e2e/route-sweep.spec.ts e2e/seo.spec.ts -g "the route list is derived|/viviana-ui"`
PASS (12): parsed floor 155 (160 routes); `/viviana-ui` redirects to
`/viviana-ui/docs`; new pages render; each has its own head.

Full `ci:site` (`a11y:check` axe/contrast/comparison, full route-sweep,
full `test:seo`) not run. Catalogue pages deferred.

## Done when

The landing/header/showcase-brand links open `/viviana-ui/docs` (Getting
Started + Installation + live Button + two hooks), route tests and the
SEO floor are updated, and those three controls no longer point at
`/showcase`. Playground stays `/showcase`. Full catalogue is out of scope.

## Relationship

Child of #26. Not bound to #40 (deploy the Kumo-aware landing), #45
(catalogue coverage), or #88 (collection docs pages) — those Done-when
clauses differ. Release train #443 lists this as ordered work.
Dual wipe / Header theme toggle is T9, not this ticket.
