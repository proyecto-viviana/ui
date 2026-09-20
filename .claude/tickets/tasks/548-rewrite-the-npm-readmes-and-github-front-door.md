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
