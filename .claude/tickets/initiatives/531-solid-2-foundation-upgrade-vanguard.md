---
id: 531
type: initiative
title: "Solid 2.0 foundation upgrade vanguard"
created: 2026-09-13
status: open
history:
  - {
      state: open,
      at: 2026-09-13,
      note: "opened to prepare the ui foundation as the vanguard for the ecosystem upgrade to Solid 2.0",
    }
  - {
      state: open,
      at: 2026-09-19,
      note: "Mechanical Solid 2 APIs through all seven pack packages; unit tests green; vp pack:local-chain + ui:consume-smoke (DOM+SSR, vite-plus-core CLI) green. #532 merged. #533–#537 (MaybeAccessor, SlotContext, one-read, 2118 recert) still open. @solidjs/diagnostics declared so vp dev auto-enables /__solid/diagnostics.",
    }
---

Upgrade the shared foundation (`solid-stately`, `solidaria`, `solidaria-components`)
and styled libraries to Solid 2.0.

## Done when

All four layers build, pass SSR/hydration, and satisfy the 2,118 certified
interaction parity tests on the Solid 2.0 reactive runtime without Solid 1.x
hydration context counter workarounds.

## Relationship

Orchestrates #532 through #537. Prepares the vanguard foundation before rolling
out changes across the broader Viviana ecosystem.
