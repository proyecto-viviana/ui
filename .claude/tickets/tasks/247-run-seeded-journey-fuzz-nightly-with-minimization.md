---
id: 247
type: task
title: "Run seeded journey fuzz nightly with minimization"
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

Wire `journeyFuzz` (#244) into `.github/workflows/journeys-nightly.yml`:
one job per certified component with journeys, fixed seed derived from the
date, a time budget, artifacts for minimized failures, and a summary table.
A minimized failure opens or updates a ticket body draft under
`output/` for the orchestrator to file. Never runs on PRs.

## Done when

The workflow parses, a local dry run with a tiny budget completes, and a
seeded failure injected in /tmp is minimized to a stable journey.

## Relationship

Child of #243. Depends on #244.
