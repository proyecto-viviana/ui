---
id: 198
type: task
title: "Port the full S2 intl catalog and route styled strings through it"
created: 2026-09-01
parent: 136
status: in-progress
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
  - {
      state: in-progress,
      at: 2026-09-02,
      note: "34×47 S2 catalog + formatter call sites in solid-spectrum/viviana-ui; ICU compiled at catalog load; pending orchestrator verification",
    }
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

## Owner decision (2026-09-01, via #219 item 4)

The locale split — mirroring RAC's `./i18n/*` plus optimize-locales structure
instead of inlining all 34 dictionaries per primitive (ComboBox today) — is
done inside this spine work with #199 and #200, as one structural pass. No
separate ticket.

## Train 9 note (2026-09-02, via #220)

RAC 1.21.0: "Apply hook filters in `optimize-locales-plugin` so unused locale
strings are removed" (`@react-aria/optimize-locales-plugin@2.0.2`). That is
#219 item 4, already assigned here. No new ticket.

## Landed

34 locales × 47 keys copied verbatim from pinned
`react-spectrum/packages/@react-spectrum/s2/intl/<locale>.json` into
`packages/solid-spectrum/src/intl/` and the `viviana-ui` twin. `index.ts`
uses the searchfield/RAC attribution convention (one `based on
packages/@react-spectrum/s2/intl/<locale>.json` comment per JSON). Dictionary
is `createStringFormatter(s2IntlStrings, "@react-spectrum/s2")`.

### Local-key decisions

All 26 previously shipped keys are in S2. None kept as local additions.
Drifted values now match S2: `menu.unavailable` → `"Unavailable, expand for
details"`; `actionbar.selected` → ICU `{count, plural, =0 {None selected}
other {# selected}}`.

### optimize-locales (shared follow-up)

Headless catalogs (#199–#201) also ship a single dictionary that imports all
34 JSON files. There is no per-locale `./i18n/*` entry and no
`optimize-locales-plugin` split on either layer. Not invented here for S2
only.

### ICU compile (in-lane, catalog load)

`@internationalized/string` `LocalizedStringFormatter.format`
(`node_modules/.pnpm/@internationalized+string@3.2.10/.../LocalizedStringFormatter.js:14-16`)
returns a plain string verbatim; it only interpolates when the message is a
function. Upstream compiles JSON via `@internationalized/string-compiler`.
The styled catalog compiles `{var}`, `{var, number}`, and `{var, plural, …}`
at module load (same reason as solidaria dnd `compileSimpleIcu`, extended for
the S2 ICU subset). JSON files stay verbatim.

### Key → component → Solid file:line

S2 `Field.tsx` `FieldLabel` uses `label.(required)` / `label.(optional)`
(144, 160–161). Styled fields format those keys at the matching necessity
slot:

| key                                     | S2                                          | solid-spectrum                                                                                                                                                                                                                                                                                           |
| --------------------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `label.(required)` / `label.(optional)` | `Field.tsx:144,160-161`                     | `textfield/index.tsx:442`, `textfield/TextArea.tsx:459`, `numberfield/index.tsx:559`, `picker/index.tsx:721`, `combobox/index.tsx:783`, `searchfield/index.tsx:557`, `checkbox/index.tsx:787`, `radio/index.tsx:447`, `color/index.tsx:1371`, `calendar/DateField.tsx:403`, `calendar/TimeField.tsx:397` |
| `table.loading`                         | `Picker.tsx:446`                            | `picker/index.tsx:1057`                                                                                                                                                                                                                                                                                  |
| `table.loadingMore`                     | `Picker.tsx:375`, `TreeView.tsx:736`        | `picker/index.tsx:1113`, `tree/index.tsx:864`, `tree/index.tsx:1264`                                                                                                                                                                                                                                     |
| `datepicker.time`                       | `DatePicker.tsx:264`                        | `calendar/DatePicker.tsx:820`                                                                                                                                                                                                                                                                            |
| `datepicker.startTime`                  | `DateRangePicker.tsx:212`                   | `calendar/DateRangePicker.tsx:722`                                                                                                                                                                                                                                                                       |
| `datepicker.endTime`                    | `DateRangePicker.tsx:224`                   | `calendar/DateRangePicker.tsx:738`                                                                                                                                                                                                                                                                       |
| `actionbar.selected`                    | `ActionBar.tsx:223`                         | `actionbar/index.tsx:383`                                                                                                                                                                                                                                                                                |
| `actionbar.selectedAll`                 | `ActionBar.tsx:222`                         | `actionbar/index.tsx:380`                                                                                                                                                                                                                                                                                |
| `menu.unavailable`                      | `Menu.tsx:568`                              | `menu/index.tsx:771`                                                                                                                                                                                                                                                                                     |
| `combobox.noResults`                    | `ComboBox.tsx:810`                          | `combobox/index.tsx:1017` (only when `items`/`defaultItems` is `[]`)                                                                                                                                                                                                                                     |
| `calendar.invalidSelection`             | `Calendar.tsx:522`, `RangeCalendar.tsx:149` | `calendar/index.tsx:695` (`selectedCount: 1`), `calendar/RangeCalendar.tsx:881` (`selectedCount: 2`)                                                                                                                                                                                                     |
| `slider.minimum` / `slider.maximum`     | `RangeSlider.tsx:108,133`                   | `slider/RangeSlider.tsx:872-873`                                                                                                                                                                                                                                                                         |
| `tag.noTags`                            | `TagGroup.tsx:173`                          | `tag-group/index.tsx:646`                                                                                                                                                                                                                                                                                |
| `picker.placeholder`                    | `Picker.tsx:346`                            | `picker/index.tsx:1001`                                                                                                                                                                                                                                                                                  |
| `picker.selectedCount`                  | `Picker.tsx:679`                            | `picker/index.tsx:1042`                                                                                                                                                                                                                                                                                  |

Twins: `intl/index.ts` stays byte-identical (baselined identical). Already-diverged component files received the same hunk.

### Catalog keys without a Solid call site yet

Present in the catalog; the Solid UI does not yet mount the matching S2
control: ComboBox `table.loading` / `table.loadingMore`; TableView
`table.loading`, `table.loadingMore`, `table.resizeColumn`,
`table.sortAscending`, `table.sortDescending`, `table.drag`; ListView
loading keys; TagGroup `tag.actions`, `tag.showAllButtonLabel`,
`tag.hideButtonLabel`.

### Tests

- `packages/solid-spectrum/test/intl-catalog.test.tsx` (+ viviana-ui twin):
  each of 34 locales' JSON equals the pinned file; dictionary keys match.
- `packages/solid-spectrum/test/intl-strings.test.tsx`: `I18nProvider
locale="ar-AE"` (plus one `de-DE` ActionBar) for necessity, Picker loading,
  DatePicker time, DateRangePicker start/end, ActionBar ICU count, Menu
  unavailable, ComboBox no-results.
- Existing English assertions updated to en-US catalog values (`Loading
more…` U+2026, `Unavailable, expand for details`, es-ES ActionBar one-form
  `1 seleccionado`).

Red-then-green: temporarily inlined `"(required)"` on TextField
(`textfield/index.tsx:442`); `renders the ar-AE necessity marker on
TextField` failed looking for `(مطلوب)` and found `(required)`. Restored.
ActionBar ICU under ar-AE failed on the raw template before catalog compile;
green after compile.

### Out of lane

- ComboBox filtered-empty / loading-empty: S2 `ComboBox.tsx:806-810`
  `renderEmptyState`. Headless `packages/solidaria-components/src/ComboBox.tsx`
  `ComboBoxListBox` has no `renderEmptyState`. Styled layer can only show
  `combobox.noResults` when `items`/`defaultItems` is `[]`.
- Formatter ICU: `packages/solidaria/src/i18n/createStringFormatter.ts:93-97`
  wraps `LocalizedStringFormatter`, whose `format` returns string messages
  verbatim (`LocalizedStringFormatter.js:14-16`). JSDoc claims ICU support
  that string values do not get. Proposal: compile ICU once in the headless
  formatter (or adopt `@internationalized/string-compiler`) so every catalog
  need not reimplement compile. Not patched here.
