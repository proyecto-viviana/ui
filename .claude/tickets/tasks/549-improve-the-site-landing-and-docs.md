---
id: 549
type: task
title: "Improve the site landing and docs, then deploy"
created: 2026-09-20
parent: 544
status: open
blocked: true
history:
  - {
      state: open,
      at: 2026-09-20,
      note: "opened under #544 for ui.proyectoviviana.org, blocked on #545: the site does not build on Solid 2 until then. Owner gave standing deploy authority for this campaign, conditional on a green Site Gate for the exact revision. Write paths: apps/web only",
    }
---

## Scope

1. Landing: say what the family is, show live components above the fold, give
   the Solid 2 install line, and route to docs, the theme studio, and the
   comparison evidence.
2. Docs: a getting-started path that works on Solid 2 from an empty project,
   a package-choice page, SSR and styling setup, and a status page generated
   from the certification data rather than typed by hand.
3. Keep the Glasselated register and the library's tokens. The app never
   redeclares a library token name. Demos of `solid-spectrum` keep Spectrum.
4. Every page passes the site's axe and contrast gate. Fix contrast at the
   token, not per page.
5. Deploy with the guarded target only.

## Done when

The getting-started steps work when followed literally in a clean directory.
Site Gate is green on the revision. The deployed site serves that revision.

## Proof

The clean-directory transcript, the Site Gate run id, `guard:deploy-target`
output, and the deployed revision marker.

## Relationship

Child of #544. Blocked by #545. Shares its claim list with #548.
