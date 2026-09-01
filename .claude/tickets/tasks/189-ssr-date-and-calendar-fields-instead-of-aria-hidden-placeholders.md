---
id: 189
type: task
title: "SSR date and calendar fields instead of aria-hidden placeholders"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
---

## Cause

Public RAC `DateField`, `TimeField`, `DatePicker`, `Calendar`, and
`RangeCalendar` wrap the whole field or grid in
`<Show when={isHydrated()} fallback={<div class="…--placeholder" aria-hidden="true" />}>`
(`packages/solidaria-components/src/DateField.tsx:273-286`,
`TimeField.tsx:174-187`, `DatePicker.tsx:334-347, 680-696`,
`Calendar.tsx:234-248`, `RangeCalendar.tsx:220-240`). Server HTML is an empty
`aria-hidden` box; the real field mounts client-only after `onMount`. Styled
date components inherit it. First paint and no-JS have no segments and no
accessible name; `HiddenDateInput` (commented as the SSR-safe form value) is
not in the server HTML, so a no-JS form submit drops the date. Upstream
React Aria emits the field on the server. Overlays (Popover/Modal) correctly
gate only the portal on `useIsHydrated()`; in-flow fields must not.

## Work

Render the field/grid on the server and hydrate it, keeping the hydration
gate only where a portal or DOM measurement requires it. Add DateField /
DatePicker / Calendar SSR + hydrate suites that assert segments and
`HiddenDateInput` are in server HTML and interactive after hydration.

## Done when

A DateField under `renderToString` contains its segments and hidden input;
hydrate over that markup reports no mismatch; the placeholder class is gone.

## Relationship

F-SSR-003. Not #56/#57/#58 (describedby slots). Feeds #160's suite list.
