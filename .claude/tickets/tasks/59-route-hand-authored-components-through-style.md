---
id: 59
type: task
title: "Route hand-authored components through style()"
created: 2026-08-20
parent: 32
status: verified
history:
  - { state: open, at: 2026-08-20, note: "migrated from legacy task macro-route-styled" }
  - {
      state: merged,
      at: 2026-08-20,
      note: "source audit confirmed the hand-authored library migration already landed",
    }
  - {
      state: verified,
      at: 2026-08-20,
      note: "invented-utility guard and packed installed-consumer CSS contract pass",
    }
---

The original work routed the hand-authored styled components through their
authoritative styling source. The group included ListBox, Select, Toolbar,
Well, StepList, and Separator.

## Verified evidence

- The app-local utility backfill no longer exists.
- The guard finds no invented utility tokens in library source.
- The packed installed-consumer CSS contract passes.

## Relationship

Part of #46. Replaces the stale legacy macro-routing task.
