---
id: 506
type: task
title: "Stop preventing default on Link activation"
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

Certification Gates run 34155176389 on `0d84b016`: **3** unwaived D4 titles.

Link `default · mouse-click`, `keyboard-enter`, `touch-tap`. Solid `defaultPrevented: true` on the activating event; React `false`. Keyboard-enter also emits an extra `focusout` on Solid.

Not the ActionButton pending class (#505) and not Tabs tabindex (#507).

## Work

Match RAC Link press `preventDefault` behavior in the lowest layer. Prove with focused D4 on link. Do not invent navigation.

## Done when

Those 3 titles match.

## Relationship

Triage class of #493. Sibling under #136.
