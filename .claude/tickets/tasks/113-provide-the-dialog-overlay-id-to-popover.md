---
id: 113
type: task
title: "Provide the Dialog overlay id to Popover"
created: 2026-08-20
parent: 31
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from upstream Train 8 item T-71" }
---

Match RAC DialogTrigger context wiring.

The local trigger exposes `overlayProps` through `DialogTriggerContext`, but it
does not provide `overlayProps.id` through `PopoverContext`.

## Done when

The overlay id reaches the composed Popover, DOM and ARIA references match
upstream, and SSR, hydration, and browser regressions pass. Part of #82.

## Round-2 note (2026-09-01)

Round 2 (F-UP-010, #208): local DialogTrigger also uses `createOverlayTriggerState` where RAC uses `useMenuTriggerState` and provides four contexts; the overlay id is one of several gaps. `Heading` default level and Dialog-only scope are in #208.
