---
id: 507
type: task
title: "Keep Tabs mouse-click tabindex stable"
created: 2026-09-07
parent: 136
status: merged
history:
  - {
      state: open,
      at: 2026-09-07,
      note: "filed from #493 inventory of Certification Gates run 34155176389 on 0d84b016 (1998 passed / 165 failed / 4 skipped / 0 waived)",
    }
  - {
      state: in-progress,
      at: 2026-09-08,
      note: "implement tabs-mouse-click-tabindex: keep RAC selected→focused predicate; defer setFocusedKey past paint so D4 mouse-click capture still reads tabindex -1",
    }
  - {
      state: merged,
      at: 2026-09-08,
      note: "createTabListState copies selectedKey onto focusedKey from requestAnimationFrame after createEffect subscribe, same RAC predicate including init. Same-turn setSelectedKey does not move focusedKey. Prove cwd /home/emoporemilio/projects/viviana-hub/ui WSL COMPARISON_CHROMIUM_ARGS=--disable-software-rasterizer: createTabListState.test 12 passed (new same-turn red on createComputed then green); comparison:build pass; Tabs D4 horizontal-regular mouse-click 1 passed; touch-tap + arrow-next-from-selected 2 passed; D5 arrow-roving 1 passed. Waivers []. Did not start #504/#511. Did not write mouseClickGesture or createTab press.",
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
