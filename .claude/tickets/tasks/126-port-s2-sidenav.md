---
id: 126
type: task
title: "Port S2 SideNav"
created: 2026-08-20
parent: 25
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from upstream Train 8 item T-96" }
---

Port the pinned S2 SideNav component family: `SideNav`, `SideNavHeader`,
`SideNavItem`, `SideNavItemContent`, `SideNavItemLink`, and `SideNavSection`.

Read upstream source, tests, and docs before the owner steers public names and
types. Build on the shared headless spine.

## Done when

All six exports and every applicable API, ARIA, keyboard, focus, style, visual,
i18n, SSR, hydration, and browser branch match upstream. Part of #82.

## Train 9 note (2026-09-02, via #220)

S2 1.7.0 rewrote SideNav onto RAC NavigationTree
(`packages/@react-spectrum/s2/src/SideNav.tsx` at `f56660b`, −300 / +61).
Port NavigationTree first (#228), then compose SideNav from that primitive
instead of from Tree. This ticket still owns the six S2 exports.
