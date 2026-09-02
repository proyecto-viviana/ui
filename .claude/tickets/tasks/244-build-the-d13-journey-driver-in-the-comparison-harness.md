---
id: 244
type: task
title: "Build the D13 journey driver in the comparison harness"
created: 2026-09-02
parent: 243
status: open
history:
  - {
      state: open,
      at: 2026-09-02,
      note: "opened for the D13 interaction-journeys certification (owner decision 2026-09-02)",
    }
---

## Work

`apps/comparison/e2e/drivers/journeys.ts` on the existing `walk` /
`scenario` / `dom-oracle` model. A `Journey` is `{ id, setup?, steps[] }`;
a `Step` is a real input (mouse click / hover / move / wheel / drag, keyboard
press / type, touch tap, viewport resize, page scroll, mocked-clock advance,
`settle`) with an optional per-step `expect` hook. After each step the driver
collects the ten observations listed on #243 for the driven panel, then
diffs React vs Solid step by step; the first divergence fails with the journey
id, step index, and step label. Observation descriptors reuse the oracle's
stack-agnostic normalization (no ids, no framework `data-*` that differ by
design — list the allowed `data-*` set explicitly).

Also: `registerJourneyDriver(scenario, journeys)` for certified specs;
`journeyFuzz(scenario, alphabet, { seed, budgetMs })` that generates steps
from a component alphabet, runs the same collect/diff, and on failure
delta-minimizes the sequence and writes it as a journey JSON under
`apps/comparison/e2e/journeys/minimized/`; a D13 row + gate text in
`.claude/current/certification.md`; a `journeys-nightly.yml` workflow.

## Done when

Two seed journeys on ComboBox and Picker (open by click → ArrowDown → Enter →
reopen → page scroll → Escape) run under `comparison:test:certified`, fail on
a deliberately broken Solid step in a /tmp experiment, and pass on the real
pair; the fuzz mode reproduces a seeded failure deterministically.

## Relationship

Child of #243. Uses `dom-oracle.ts`, `walk.ts`, `focus.ts`, `ax.ts`,
`events.ts`. Does not edit `playwright.config.ts` (#194–#196 own CI shape).
