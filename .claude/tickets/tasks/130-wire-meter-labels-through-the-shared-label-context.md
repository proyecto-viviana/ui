---
id: 130
type: task
title: "Wire Meter labels through the shared Label context"
created: 2026-08-20
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-08-20,
      note: "found while reconciling the S2 1.6.0 and RAC 1.20.0 test oracle",
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
