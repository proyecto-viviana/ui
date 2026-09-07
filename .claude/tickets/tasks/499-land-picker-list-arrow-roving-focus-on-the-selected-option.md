---
id: 499
type: task
title: "Land Picker list arrow-roving focus on the selected option"
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

Certification Gates run 34155176389 on `0d84b016`: **1** unwaived title.

`D5 focus trail — Picker list › size-m · arrow-roving`. After open, React `active` is `dialog` named `"Plan"` (`tabindex: -1`); Solid `active` is `option` named `"Pro"` (`tabindex: 0`). ArrowUp/ArrowDown then walk different roving tabindexes.

This is not the #497 checkmark paint and not the #498 RTL routing miss. #482 captured Calendar D5 trails (verified); it explicitly left Picker list D5 to #111/#481. Those are merged/verified; this remainder is a new class.

## Work

Capture the trail JSON. If Solid focus never lands on the listbox option React uses as start, fix the open/focus delivery in the lowest layer. Do not add a document-level key listener.

## Done when

Picker list D5 `arrow-roving` matches React vs Solid, or a dated `knownDivergence` names the remaining start-node miss.

## Relationship

Triage class of #493. Sibling under #136. Do not bind #481/#482 (verified). Do not bind #490.
