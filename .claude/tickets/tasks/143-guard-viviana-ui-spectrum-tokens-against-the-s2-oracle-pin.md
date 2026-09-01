---
id: 143
type: task
title: "Guard viviana-ui spectrum-tokens against the S2 oracle pin"
created: 2026-09-01
parent: 136
status: verified
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
  - {
      state: in-progress,
      at: 2026-09-01,
      note: "owner 2026-09-01: pin both styled packages to the S2 oracle (14.0.0); theming stays in viviana-tokens.css; extend the guard to both packages",
    }
  - {
      state: merged,
      at: 2026-09-01,
      note: "pinned viviana-ui to 14.0.0 and extended guard:spectrum-tokens-pin to both styled packages",
    }
  - { state: verified, at: 2026-09-01, note: "owner 2026-09-01" }
---

## Cause

`solid-spectrum` pins `@adobe/spectrum-tokens` 14.0.0 and
`guard:spectrum-tokens-pin` watches only that package. `viviana-ui` pins
15.0.0. Both `tokens.ts` files import the same JSON path. Generated CSS for
the flagship package can drift from the S2 pin without a red gate.

## Decision

Owner 2026-09-01: pin both styled packages to the S2 oracle version. Do not
keep an ungoverned 15 pin. Glasselated theming lives in `viviana-tokens.css`.
Advancing Spectrum to 15 is an upstream-train decision (#82 / #34), not a
quiet UI-only bump.

## Work

Extend `guard:spectrum-tokens-pin` so it fails if either styled package
drifts from the recorded pin. Align `viviana-ui` to 14.0.0.

## Done when

The pin guard fails if either styled package drifts from the recorded
decision.

## Relationship

F-ARCH-003 / F-PACKAGING-006. Delta on #1, not a restatement of identical-copy
debt. Ticket #94 is unrelated dependency ceilings. Steering records the pin
policy.
