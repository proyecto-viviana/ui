---
id: 507
type: task
title: "Keep Tabs mouse-click tabindex stable"
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

Certification Gates run 34155176389 on `0d84b016`: **1** unwaived D4 title.

`Tabs › horizontal-regular · mouse-click`. During the event log the clicked tab is `tabindex: -1` on React and `tabindex: 0` on Solid. Same `pointerType: mouse`. Not a preventDefault miss (#506).

## Work

Match RAC Tabs roving tabindex at mouse-click time. Prove with focused D4 on tabs `horizontal-regular · mouse-click`.

## Done when

That title matches.

## Relationship

Triage class of #493. Sibling under #136.
