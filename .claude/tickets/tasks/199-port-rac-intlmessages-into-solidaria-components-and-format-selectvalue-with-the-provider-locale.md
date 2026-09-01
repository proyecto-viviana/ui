---
id: 199
type: task
title: "Port RAC intlMessages into solidaria-components and format SelectValue with the provider locale"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
---

## Cause

Pinned RAC loads `intl/*.json` (34 locales; `selectPlaceholder`,
`tableResizer`, `dropzoneLabel`, `colorSwatchPicker`) through
`useLocalizedStringFormatter`. `solidaria-components` has no such table.
`DropZone` defaults to `"Drop files"`
(`packages/solidaria-components/src/DropZone.tsx:69`); RAC en-US is
`"DropZone"`. `SelectValue` falls back to `""` with no `selectPlaceholder`
(`Select.tsx:869-871`). `ColumnResizer` / `ColorSwatchPicker` fall back to
English literals. `SelectValue` also builds
`new Intl.ListFormat(undefined, …)` for multiple selection
(`Select.tsx:906-910`); RAC uses `useListFormatter()` and styled
`LabeledValue` already passes `locale().locale`.

## Work

Add the RAC catalog (generated from the pin) and a formatter in
`solidaria-components`; use it at the four sites; format the SelectValue
list with the provider locale.

## Done when

DropZone, SelectValue placeholder, ColumnResizer, and ColorSwatchPicker
names follow `I18nProvider`; a multi-select value under `es-ES` uses the
Spanish conjunction; tests fail on the English literals.

## Relationship

F-I18N-002/007. Headless layer per Rule #4.
