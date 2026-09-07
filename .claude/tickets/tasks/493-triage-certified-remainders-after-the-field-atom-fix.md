---
id: 493
type: task
title: "Triage certified remainders after the field-atom fix"
created: 2026-09-07
parent: 136
status: open
history:
  - {
      state: open,
      at: 2026-09-07,
      note: "filed after #489 (ec181d92): field D1s were the ~600-of-732 class; remaining ~130 reds are a separate triage",
    }
---

#489 made comparison compile solid-spectrum JSX subpaths from source and
added `guard:comparison-atom-css`. That class was every field D1 plus
FieldError D3 (`grid-template-areas: none`). The first sharded certified
run on `2de33553` was 1431 passed / 732 failed / 4 skipped. After the
field fix the remainder is the non-field group: Button and ActionButton D3
pressed-state deltas near one percent, plus D9, D7, D10, and D4 clusters.

`1af6eb71` (reduced-motion transitions on Button / ActionButton) may
interact with the pressed D3 deltas. Do not patch S2 styling in the
comparison app (ADR 0001).

#194 still records postcard `0f1e1198`. Do not print that SHA as HEAD.
Re-pin only after a complete certified run at this HEAD is green or the
remaining reds have named tickets.

## Work

1. Rebuild comparison. Run `vp run guard:comparison-atom-css`.
2. Collect the remaining certified failures by slug and driver.
3. Classify each: real port defect, reduced-motion interaction, LSB
   raster, harness, or knownDivergence already ticketed.
4. File or bind one child per real defect class. Fix structural defects
   here only when they share one cause.

## Done when

Every remaining certified failure is either green, a dated
`knownDivergence` with an open ticket, or a new child with a named
failure mode. #194 may re-pin only against a HEAD run of that inventory.

## Relationship

Child of #136. Follows #489. Feeds #194 and the #443 release train.
Does not absorb #490 TableView structure.
