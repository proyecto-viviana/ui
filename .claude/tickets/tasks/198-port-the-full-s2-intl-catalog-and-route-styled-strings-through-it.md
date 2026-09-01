---
id: 198
type: task
title: "Port the full S2 intl catalog and route styled strings through it"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
---

## Cause

`solid-spectrum` and `viviana-ui` ship two locales (`en-US`, `es-ES`) and 26
keys (`packages/solid-spectrum/src/intl/index.ts:41-52`, `en-US.json`).
Pinned S2 ships 34 locales and 47 keys
(`react-spectrum/packages/@react-spectrum/s2/intl/en-US.json`). Missing and
used in pinned source: `calendar.invalidSelection`, `combobox.noResults`,
`datepicker.time/startTime/endTime`, `label.(optional)/(required)`,
`picker.placeholder/selectedCount`, `slider.minimum/maximum`, `table.*`,
`tag.*`. Because they are absent the styled layer inlines English: necessity
text `"(required)"` / `"(optional)"` across TextField, TextArea, NumberField,
ComboBox, SearchField, DateField, TimeField, Checkbox, Radio, Picker
(`picker/index.tsx:710-717`); Picker `"Loading more"` / `"Loading"`
(`:796-797`); DatePicker popover `label="Time"`
(`calendar/DatePicker.tsx:814-817`); DateRangePicker `"Start time"` /
`"End time"`. Keys we do ship drift (`menu.unavailable`, `actionbar.selected`
plural). `createStringFormatter(s2IntlStrings, "@react-spectrum/s2")` asks
for a global dictionary nothing registers.

## Work

Generate the 34-locale S2 catalog from the pinned oracle the same way the
headless catalogs are generated; route every styled English literal through
the formatter; add a test that fails on a hardcoded necessity/loading/time
string under `ar-AE`.

## Done when

Under `ar-AE` the necessity marker, Picker loading, DatePicker time labels,
and ActionBar count render the S2 catalog string; both styled packages share
one generated catalog.

## Relationship

F-I18N-001. Not #73 (NumberField) or #179 (D10 registration). #202 makes
D10 see it.
