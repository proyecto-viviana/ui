---
id: 130
type: task
title: "Wire Meter labels through the shared Label context"
created: 2026-08-20
parent: 24
status: verified
history:
  - {
      state: open,
      at: 2026-08-20,
      note: "found while reconciling the S2 1.6.0 and RAC 1.20.0 test oracle",
    }
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "moved the Label context into the headless layer and routed both styled Meters through it",
    }
  - {
      state: merged,
      at: 2026-08-20,
      note: "added shared Label composition and D12 comparison coverage for every Meter layer",
    }
  - {
      state: verified,
      at: 2026-08-20,
      note: "unit, SSR, hydration, browser, comparison, type, and layer checks pass",
    }
---

Match the pinned RAC `Meter` and `Label` composition.

Upstream gives a `Label` child an ID and uses that ID in the Meter root's
`aria-labelledby` attribute. The local Meter accepts an explicit label, but it
does not provide the shared Label context to a child.

Read the pinned `Meter.tsx`, `Label.tsx`, and tests before changing the shared
context. Keep the solution in `solidaria-components`; styled packages must use
the headless behavior.

## Done when

A child `Label` renders the upstream element type, labels the Meter root through
`aria-labelledby`, and keeps explicit `aria-label` and `aria-labelledby`
precedence. Add headless, styled, SSR, hydration, browser, and comparison
evidence that fails if the relationship breaks.

## Verified evidence

- The headless, `solid-spectrum`, and `viviana-ui` focused suites pass 46 tests.
- The headless server suite passes 2 tests.
- The headless hydration suite passes 1 test for the render-child path.
- The comparison build emits the `/d12/meter/` server surface.
- The Meter browser run passes all 50 D1, D3, D6, D7, and D12 cases.
- Repository and application type checks pass.
- The layer-boundary guard passes.
- The upstream-test-parity guard reports no new findings.
- The full export-gap guard reports five existing Train 8 gaps. Tickets #117
  and #118 own those gaps.
- Ticket #131 records the separate direct-static-child hydration gap.
