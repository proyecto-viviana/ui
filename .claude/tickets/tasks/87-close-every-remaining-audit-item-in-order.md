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
  - {
      state: in-progress,
      at: 2026-09-07,
      note: "census audited against HEAD: keep every still-open #40–#131 id; drop #89/#9 from resume-here (done at 380f5c10; work on #490/#491); standing owner decision is #1; do not copy #136/Walk children",
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

#11 is verified. #89 and #9 are done (380f5c10; work on #490 / #491, not this
census). The standing owner decision is #1. Then hygiene, starting at #90.

Current product work is the Solid Spectrum API. Do not add viviana-native
components (#62 / #145). Keep overlay/focus source work separate from the
existing audit and Kumo changes. Do not expand Kumo. Do not patch S2 styling
in the comparison app.

## Ordered census

1. Complete the acceptance-evidence model in #11. **Verified.**
2. Resolve the standing owner decision in #1. #89 and #9 are done (380f5c10);
   do not copy #490 or #491 into this census.
3. Complete hygiene work in #90, #3, #91, #92, and #93 through #129 except
   verified Train-8 rows #108 and #122, and merged #111. Verified and dropped
   from the original hygiene list: #13, #15, #22, #23.
4. Use `vp run report:layer-imports` to select the lowest-layer ownership work.
   Dispatch implementation through #50 through #76 and #84 through #86 as
   applicable. The report is an inventory, not a verdict.
5. Run the complete 2,176-case certified lane again after the focused fixes.
   Report passes, expected fixmes, and deferred obligations separately.
6. Run `vp run ci:site` as one sequential lane after package builds are stable.

Train 8 classification is complete. Port its confirmed gaps through #82 in
dependency order. Dependency remediation remains #81. Clean-checkout gate
preconditions remain #83. Keep the Kumo pilot bounded through #42.

## Still-open remainder

Walk and later HEAD did not supersede still-open rows. Do not mark them
verified from this audit. These are not new tickets.

Named-program ids still open or in-progress:

#1, #90, #3, #91, #92, #93, #94, #95, #96, #97, #98, #99, #100, #101, #102,
#103, #104, #105, #106, #107, #109, #110, #112, #113, #114, #115, #116, #117,
#118, #119, #120, #121, #123, #124, #125, #126, #127, #128, #129, #50, #51,
#52, #53, #54, #55, #56, #57, #58, #60, #61, #63, #64, #65, #66, #67, #68,
#69, #70, #71, #73, #74, #75, #76, #84, #85, #86, #81, #83, #42

In-range still open or in-progress and not named in steps 1–6:

#40, #41, #43, #44, #45, #47, #48, #49, #77, #79, #80, #88, #131

#87 remains the in-progress umbrella. Do not dispatch #87 from itself.

Finished in-range, not remainder: #11 verified; #46, #59, #62, #78, #82, #108,
#122, #130 verified; #72, #89 done; #111 merged. Already dropped from hygiene:
#13, #15, #22, #23. Layer-import range already omits verified/done #59, #62,
#72.

## Done when

Each numbered item is closed, explicitly owner-blocked, or has dated evidence.
The generated status view reports the resulting board state.

## Relationship

Replaces the legacy `remaining-work-ladder` record and the retired work queue.
Sibling of #136 (2026-09 full-repo audit). #136 owns the new findings. Do not
copy those children into this census.
