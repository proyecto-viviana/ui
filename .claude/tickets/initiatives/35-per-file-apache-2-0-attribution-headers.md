---
id: 35
type: initiative
title: "Per-file Apache-2.0 attribution headers"
created: 2026-08-20
status: verified
history:
  - { state: open, at: 2026-08-20, note: "migrated from roadmap item license-compliance" }
  - {
      state: verified,
      at: 2026-08-22,
      note: "ticket #19 completed the file review and verified notices in source and package output",
    }
---

Derivative-source attribution is complete and guarded in source and package
output.

## Done when

Each derivative source file has the required attribution and an executable check prevents regression.

## Relationship

Replaces roadmap item `license-compliance`. Ticket #19 owns the focused audit and plan cleanup.

## Round-2 note (2026-09-01)

The claim that per-file attribution is guarded in source was unenforced: `guard:attribution-headers` was red from `19ed5c48` (2026-08-30) to 2026-09-01 and was in no workflow. Round 2 made mirror results inherit review contracts and added the guard to Certification Gates (F-GATE-001). Re-verify before citing this ticket as evidence.
