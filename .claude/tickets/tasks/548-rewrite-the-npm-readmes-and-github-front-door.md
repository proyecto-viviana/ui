---
id: 548
type: task
title: "Rewrite the npm READMEs and the GitHub front door"
created: 2026-09-20
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-20,
      note: "opened under #544. Drafting may run in parallel outside the checkout; landing takes the writer seat. Write paths: README.md, CREDITS.md, CONTRIBUTING.md, packages/*/README.md",
    }
  - {
      state: open,
      at: 2026-09-21,
      note: "2026-09-21 round-1 audit, receipt `.agents/audit-2026-09-21/round-1-results.md`. Four fact-level findings on the copy this ticket owns; under the 2026-09-20 owner rule the words are Fable's, so these are facts to fix, not prose to rewrite. `public-face/contributing-names-a-disabled-gate`: CONTRIBUTING tells contributors the release gate runs on every PR and every push to main, and Release Readiness is `disabled_manually`. `public-face/sideeffects-false-is-wrong`: `packages/viviana-ui/README.md:156` says `sideEffects` is `false`; the manifest says `[*.css]`, and so do solid-spectrum, kumo and geist - only solidaria, solidaria-components and solid-stately are `false`. The error is seeded in `.agents/drafts-548/claims.md:46`, marked PROVEN, so correct the claim row too or the next rewrite repeats it. `public-face/each-package-two-builds`: false for solid-stately. `public-face/a11y-evidence-overstated`, and the skeptic cut this one down hard - `every route` and `a different package` are both wrong, because `a11y:contrast` runs color-contrast over ALL_ROUTES in both themes and `a11y:smoke` includes `viviana-ui-docs.spec.ts`, and `a11y:axe:aa` does set `AXE_INCLUDE_CONTRAST=1`. What survives: no leg is AA-on-every-route, and `PLAYGROUND_TARGET_SIZE_EXEMPTIONS` selectors are excluded. State what the commands cover. The install-tag half of this ticket's findings is #600.",
    }
---

## Scope

A stranger lands on npm or GitHub and must learn in one screen what the
package is, whether it fits, how to install it on Solid 2, and what is proven.

1. Root `README.md`: the family in one diagram, which package to pick, install
   for Solid 2 with the `next` tag, one working example, the honest status
   table, and links to the docs and comparison sites.
2. Seven package READMEs from one shared shape: purpose, install and peers,
   smallest working example, what it depends on in the chain, status, license.
   Kumo and Geist say plainly that they are unpublished.
3. `CREDITS.md` and `CONTRIBUTING.md`: upstream pins, licenses, the `vp`
   commands, and how a port is certified.
4. Every count and every "certified" or "supported" claim carries a proof
   from #546 lens 4, or it goes.

## Done when

Each example in a README compiles against the packed packages. `vp run
docs:check` passes. No README names a version, count, or capability the tree
cannot prove.

## Proof

A script or test that extracts and type-checks the README examples, the
`docs:check` output, and the claim table from #546.

## Relationship

Child of #544. Consumes #546 lens 4. Should land before #547 publishes, since
npm freezes the README into the tarball.
