---
id: 200
type: task
title: "Port remaining react-aria intl catalogs for search table and tag"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
---

## Cause

Pinned `@react-aria` keeps per-package `intl/` catalogs. The port mirrored
calendar, color, combobox, datepicker, dnd, menu, spinbutton, tooltip. The
rest are English in the hook: `createSearchField` `aria-label: "Clear search"`
(`packages/solidaria/src/searchfield/createSearchField.ts:261-266`),
`createTableColumnHeader` comments that it mirrors
`stringFormatter.format('sortable')` then hardcodes `"sortable column"`
(`createTableColumnHeader.ts:45-50`), `createTag` `aria-label: "Remove"`
(`createTag.ts:303-308`). A `de-DE` consumer gets English clear, sort, and
remove chrome after #73 and #98 close.

## Work

Generate the searchfield, table, and tag catalogs from the pin and format at
the call sites.

## Done when

The three accessible names follow `I18nProvider` with tests under a
non-English locale.

## Relationship

F-I18N-003. Neighbours #73 (NumberField) and #98 (StepList); do not absorb.
