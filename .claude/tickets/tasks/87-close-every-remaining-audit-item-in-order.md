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
  - {
      state: in-progress,
      at: 2026-08-21,
      note: "made ticket #11 the single next task after the release and documentation reorganization closed",
    }
  - {
      state: in-progress,
      at: 2026-09-01,
      note: "owner 2026-09-01: #11 is verified; resume-here no longer starts there; dropped verified hygiene rows #13, #15, #22, #23",
    }
  - {
      state: in-progress,
      at: 2026-09-01,
      note: "sibling of #136; current work is the Solid Spectrum API; #62 verified",
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

#11 is verified. Next open census items are the standing owner decisions #89,
#1, and #9. Then hygiene, starting at #90.

Current product work is the Solid Spectrum API. Do not add viviana-native
components (#62 / #145). Keep overlay/focus source work separate from the
existing audit and Kumo changes. Do not expand Kumo. Do not patch S2 styling
in the comparison app.

## Ordered census

1. Complete the acceptance-evidence model in #11. **Verified.**
2. Resolve owner decisions in #89, #1, and #9.
3. Complete hygiene work in #90, #3, #91, #92, and #93 through #129 except
   verified Train-8 rows #108 and #122. Verified and dropped from the original
   hygiene list: #13, #15, #22, #23.
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
Sibling of #136 (2026-09 full-repo audit). #136 owns the new findings. Do not
copy those children into this census.
