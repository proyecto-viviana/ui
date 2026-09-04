---
id: 202
type: task
title: "Extend D10 to message catalogs RTL paint and NumberField"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
---

## Cause

D10 re-runs D1 (plus `direction`) and D5 focus trails under `ar-AE`
(`apps/comparison/e2e/drivers/rtl.ts:14-42, 79-174`). Focus snapshots carry
the focused node's name; visible labels off the trail, closed-popover strings
(DatePicker `Time`), loading text, necessity markers, and stepper labels are
never compared. Calendar and RangeCalendar pass `{ focusOnly: true }`, so
week start, weekday headers, and nav chevrons under `ar-AE` — the i18n paint
`certification.md:159` lists for D10 — are uncertified. NumberField's cert
registers no D10 and `numberfield-demo.ts` has no locale param; Menu,
ActionMenu, Tabs, TreeView, ListView, Breadcrumbs, ColorSwatchPicker demos
also lack `?locale`, so #179 cannot register D10 on them yet.

## Work

Extend the RTL driver to diff visible text of the target subtree (or a named
string set) against React under `ar-AE`, drop `focusOnly` from the calendars
once paint is stable, thread `?locale` through the listed demos, and register
D10 on NumberField.

## Done when

An English literal that React renders in Arabic fails D10 on the affected
spec; Calendar D10 diffs RTL paint; NumberField registers D10.

## Relationship

F-I18N-006 (confirms F-A11Y-006 / #179 and adds what the driver cannot see).
Depends on #198–#201 to go green.
