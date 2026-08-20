---
id: 87
type: task
title: "Close every remaining audit item in order"
created: 2026-08-20
parent: 24
status: in-progress
history:
  - { state: in-progress, at: 2026-08-20, note: "migrated from legacy task remaining-work-ladder" }
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "absorbed the full remaining-work census and retired the duplicate queue document",
    }
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "absorbed the open recertification and 2026-08 upstream branches through ticket 129",
    }
---

Work through the numbered census below. Do not skip an open item because a later
item is easier.

## Current evidence

- The first complete 2,176-case certified run on 2026-08-19 had 2,164 passes,
  six failures, and six named `knownDivergence` skips.
- `comparison-axe` passed 80/80, contrast passed 154/154, smoke passed 44/44,
  and the Kumo pair passed 15/15 twice.
- Train 8 classification is complete. No `?` entries remain.

## Resume here

Start with #11. Complete canonical note vocabulary, structured `{ file, title }`
literals, and the live three-count. Then continue in the order below.

Keep overlay/focus source work separate from the existing audit and Kumo
changes. Do not expand Kumo. Do not patch S2 styling in the comparison app.

## Ordered census

1. Complete the acceptance-evidence model in #11.
2. Resolve owner decisions in #89, #1, and #9.
3. Complete hygiene work in #90, #3, #22, #13, #15, #91, #92, #23, and #93
   through #129.
4. Use `vp run report:layer-imports` to select the lowest-layer ownership work.
   Dispatch implementation through #50 through #76 and #84 through #86 as
   applicable. The report is an inventory, not a verdict.
5. Run the complete 2,176-case certified lane again after the focused fixes.
   Report passes, expected fixmes, and deferred obligations separately.
6. Run `vp run ci:site` as one sequential lane after package builds are stable.

Train 8 classification is complete. Port its confirmed gaps through #82 in
dependency order. Dependency remediation remains #81. Clean-checkout gate
preconditions remain #83. Keep the Kumo pilot bounded through #42.

## Done when

Each numbered item is closed, explicitly owner-blocked, or has dated evidence.
The generated status view reports the resulting board state.

## Relationship

Replaces the legacy `remaining-work-ladder` record and the retired work queue.
