---
id: 506
type: task
title: "Stop preventing default on Link activation"
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
      note: "implement link-prevent-default: host-native createPress/createLink click; delete onPress preventDefault; keyboard-click stopPropagates like RAC",
    }
  - {
      state: merged,
      at: 2026-09-08,
      note: "createLink no longer preventDefaults when onPress is set. createPress attaches host-native on:click and keyboard-click stopPropagates like RAC (no ignoreClickAfterPress early return). Headless Link uses the same click channel; handleLinkClick still only if !isNative. Slice-1 spy: Astro ClientRouter.astro document bubble, not createLink p.onPress and not handleLinkClick. Prove cwd /home/emoporemilio/projects/viviana-hub/ui WSL COMPARISON_CHROMIUM_ARGS=--disable-software-rasterizer: createLink 14 passed; createPress 87 passed; Link.test 30 passed; comparison:build pass; Link D4 default mouse-click|keyboard-enter|keyboard-space|touch-tap 4 passed. Waivers []. Button accent-fill D4 4 passed (blast). Did not start #507/#511. Did not write Button.tsx or createTabListState.ts.",
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
