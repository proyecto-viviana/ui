---
id: 189
type: task
title: "SSR date and calendar fields instead of aria-hidden placeholders"
created: 2026-09-01
parent: 136
status: merged
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
  - {
      state: in-progress,
      at: 2026-09-04,
      note: "Git v2 implement. Drop the isHydrated Show gate on DateField, TimeField, DatePicker, DateRangePicker, Calendar, and RangeCalendar. Overlays still gate portals. SSR + hydrate suites assert segments, HiddenDateInput, and grid cells.",
    }
  - {
      state: merged,
      at: 2026-09-04,
      note: "Public date/calendar fields render on the server. Placeholder class gone. SSR 8 passed; hydrate 4 passed; DateField/TimeField/Calendar/DatePicker/RangeCalendar client 210 passed.",
    }
---

## Cause

Public RAC `DateField`, `TimeField`, `DatePicker`, `Calendar`, and
`RangeCalendar` wrap the whole field or grid in
`<Show when={isHydrated()} fallback={<div class="…--placeholder" aria-hidden="true" />}>`.
Server HTML was an empty `aria-hidden` box; the real field mounted
client-only after `onMount`. Styled date components inherited it. First
paint and no-JS had no segments and no accessible name; `HiddenDateInput`
was not in the server HTML, so a no-JS form submit dropped the date.
Upstream React Aria emits the field on the server. Overlays (Popover/Modal)
correctly gate only the portal on `useIsHydrated()`; in-flow fields must
not.

## Work

Render the field/grid on the server and hydrate it, keeping the hydration
gate only where a portal or DOM measurement requires it. Add DateField /
DatePicker / Calendar SSR + hydrate suites that assert segments and
`HiddenDateInput` are in server HTML and interactive after hydration.

## Done when

A DateField under `renderToString` contains its segments and hidden input;
hydrate over that markup reports no mismatch; the placeholder class is gone.

## Proof

```bash
vp test run --config vitest.ssr.config.ts packages/solidaria-components/test/DateField.ssr.test.tsx packages/solidaria-components/test/TimeField.ssr.test.tsx packages/solidaria-components/test/Calendar.ssr.test.tsx packages/solidaria-components/test/DatePicker.ssr.test.tsx
# 8 passed

vp test run --config vitest.hydrate.config.ts packages/solidaria-components/test/DateField.hydrate.test.tsx packages/solidaria-components/test/TimeField.hydrate.test.tsx packages/solidaria-components/test/Calendar.hydrate.test.tsx packages/solidaria-components/test/DatePicker.hydrate.test.tsx
# 4 passed after the matching SSR run writes output/*.html

vp test run packages/solidaria-components/test/DateField.test.tsx packages/solidaria-components/test/TimeField.test.tsx packages/solidaria-components/test/Calendar.test.tsx packages/solidaria-components/test/DatePicker.test.tsx packages/solidaria-components/test/RangeCalendar.test.tsx
# 210 passed | 2 skipped
```

## Relationship

F-SSR-003. Not #56/#57/#58 (describedby slots). Feeds #160's suite list.
