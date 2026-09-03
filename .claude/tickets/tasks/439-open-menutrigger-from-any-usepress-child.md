---
id: 439
type: task
title: "Open MenuTrigger from any usePress child as RAC PressResponder does"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #257 menu-focus follow-up; found alongside, not blocking :20",
    }
---

`<MenuTrigger><Button>…</Button>` (S2 `Button`, not `ActionButton` /
`MenuButton`) does not open the menu on click in jsdom.

RAC `MenuTrigger` wraps children in `PressResponder` (`Menu.tsx:166`). Any
`usePress` child, including S2 `Button`, opens the menu. The port puts
`triggerProps` on `MenuTriggerContext` only. `ActionButton` / `MenuButton` /
`ToggleButton` consume it. Headless and S2 `Button` do not; S2 `Button`
skips toggle when `popoverTriggerContext.trigger === "MenuTrigger"`.

Not the `menu-focus.spec.ts:20` failure (that e2e uses `MenuButton`). Do not
block #437 on this.

## Done when

Clicking an S2 `Button` inside `MenuTrigger` opens the menu, matching RAC
`PressResponder`. A package test fails if it does not.

## Relationship

Child of #24. Found on #257. Distinct from #437 (MenuInner lifecycle).
