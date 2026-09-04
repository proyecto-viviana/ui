---
id: 200
type: task
title: "Port remaining react-aria intl catalogs for search table and tag"
created: 2026-09-01
parent: 136
status: in-progress
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
  - {
      state: in-progress,
      at: 2026-09-02,
      note: "searchfield/table/tag catalogs (34 locales) wired at hook call sites; remaining react-aria JSON sets copied; pending orchestrator verification",
    }
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

## Landed

Upstream catalogs live at `react-spectrum/packages/react-aria/intl/<hook>/*.json`
(34 locales), not under `src/<hook>/intl`. JSON attribution is the
`index.ts` comment list expected by `guard:attribution-headers`.

| hook                              | locales before                       | locales after | wired at call site                                                                                |
| --------------------------------- | ------------------------------------ | ------------- | ------------------------------------------------------------------------------------------------- |
| searchfield                       | 0 JSON (English `"Clear search"`)    | 34            | `createSearchField` `"Clear search"`                                                              |
| table                             | 0 JSON (English `"sortable column"`) | 34            | `createTableColumnHeader` `"sortable"`; `createTableSelectAllCheckbox` `"select"` / `"selectAll"` |
| tag                               | 0 JSON (English `"Remove"`)          | 34            | `createTag` `"removeButtonLabel"`                                                                 |
| grid                              | 0 JSON                               | 34            | `createTableSelectionCheckbox` `"select"` (upstream `useGridSelectionCheckbox`)                   |
| tree                              | 0 JSON                               | 34            | `createTreeItem` `"expand"` / `"collapse"`                                                        |
| autocomplete                      | 0 JSON                               | 34            | catalog + formatter tests only                                                                    |
| breadcrumbs                       | 0 JSON                               | 34            | catalog + formatter tests only                                                                    |
| gridlist                          | 0 JSON                               | 34            | catalog + formatter tests only                                                                    |
| overlays                          | 0 JSON                               | 34            | catalog + formatter tests only                                                                    |
| toast                             | 0 JSON                               | 34            | catalog + formatter tests only                                                                    |
| calendar / color / menu / tooltip | already inlined TS (34)              | unchanged     | already wired                                                                                     |
| combobox                          | 2 JSON + `generated-locales.ts`      | unchanged     | already wired                                                                                     |
| dnd                               | 34 JSON                              | unchanged     | already wired                                                                                     |
| datepicker / spinbutton           | already inlined `intl.ts`            | unchanged     | already wired                                                                                     |
| numberfield                       | not copied                           | —             | #73                                                                                               |
| steplist                          | not copied                           | —             | #98                                                                                               |
| previewtrigger                    | no solidaria hook                    | —             | no port                                                                                           |
