---
id: 505
type: task
title: "Fire the pending ActionButton keyboard click"
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
      at: 2026-09-07,
      note: "implement pending-actionbutton-keyboard: gate solidaria-components Button host onKeyDown so pending skips createPress while MenuTrigger still runs",
    }
  - {
      state: merged,
      at: 2026-09-07,
      note: "Button host onKeyDown always calls MenuTrigger and calls createPress only when !isPending. Pending Enter/Space stay defaultPrevented false so the native trusted click matches React. Prove cwd /home/emoporemilio/projects/viviana-hub/ui WSL COMPARISON_CHROMIUM_ARGS=--disable-software-rasterizer: Button.test 72 passed (new pending keyboard case red on HEAD then green); Menu.test 119 passed (pending ArrowDown opens); ActionButton.test 3 passed (#381 name); comparison:build pass; ActionButton D4 pending keyboard-enter|keyboard-space 2 passed; full ActionButton D4 12/12. Waivers []. createPress has no isPending. Did not start #506/#511. Did not write createPress.ts or ActionButton.tsx.",
    }
---

Certification Gates run 34155176389 on `0d84b016`: **2** unwaived D4 titles.

`ActionButton › pending · keyboard-enter` and `pending · keyboard-space`. Solid sets `defaultPrevented: true` on the keydown/keyup and drops the `click` that React fires. The button is `disabled: true` in both logs (pending).

#381 (merged) was the pending accessible **name** / `aria-label` fork. Spec: leftover D4 pending keyboard is a new class until proven otherwise.

## Work

Match RAC pending ActionButton keyboard activation (preventDefault / click synthesis) in `solidaria` press handling. Prove with focused D4 `pending · keyboard-enter|keyboard-space`. Do not reopen #381’s name contract.

## Done when

Those 2 titles match the React event sequence.

## Relationship

Triage class of #493. Sibling under #136. Distinct from #381 (merged) and from #500 D3 pressed raster.
