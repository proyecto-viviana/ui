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
