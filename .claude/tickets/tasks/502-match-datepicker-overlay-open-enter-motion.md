---
id: 502
type: task
title: "Match DatePicker overlay open-enter motion"
created: 2026-09-07
parent: 136
status: open
history:
  - {
      state: open,
      at: 2026-09-07,
      note: "filed from #493 inventory of Certification Gates run 34155176389 on 0d84b016 (1998 passed / 165 failed / 4 skipped / 0 waived)",
    }
---

Certification Gates run 34155176389 on `0d84b016`: **4** unwaived D2 titles.

DatePicker motion and DateRangePicker motion, `open · open-enter`, both **D2 motion** and **D2 motion (reduced)**. React overlay snapshot includes extra 150 ms `background-color` transitions on selected calendar cells (e.g. name `"14"` / `"3"`); Solid does not. The reduced and normal diffs are the same shape — this is not the #488 reduced-motion budget (Toggle hover-transition).

## Work

Match S2 calendar-cell / popover enter transitions in the style macro, or stop leaking cell color transitions into the overlay motion scope if S2 does not animate them on open. Prove with focused D2 on datepicker and daterangepicker (normal and reduced). Do not pin a Solid-only reduced contract here unless the owner extends #484 to this overlay.

## Done when

Those 4 titles match React vs Solid metadata (or a named expectedMotion split the owner records).

## Relationship

Triage class of #493. Sibling under #136. Distinct from #488 and from #501 pressed paint.
