# A11y Audit — Forms, Inputs, Dates, Color (Lane 08)

Reviewer lane: accessibility correctness vs. WEB standards (WAI-ARIA APG, ARIA 1.2,
accname 1.2, WCAG 2.2), cross-referenced with vendored upstream React Spectrum / React Aria.
Read-only audit. Each finding cites our `path:line` and the governing standard.

Scope packages:

- Hooks (a11y source of truth): `packages/solidaria/src/*`
- RAC-style components: `packages/solidaria-components/src/*`
- Spectrum-styled components: `packages/solid-spectrum/src/*`

---

## Severity summary

| Severity | Count |
| -------- | ----- |
| Critical | 0     |
| High     | 4     |
| Medium   | 5     |
| Low      | 3     |

The form-validation, labeling, progress/meter, switch, checkbox, radio, color, and base
slider/spinbutton primitives are faithful ports and mostly correct. The real defects cluster
in **date/time segment labeling**, **calendar grid/cell naming and localization**, and a few
**hardcoded-English accessible names** that regress non-English locales.

---

### [High] Date/Time segments — segment accessible name drops the field label (iOS VoiceOver gap)

- Evidence: our `packages/solidaria/src/datepicker/createDateSegment.ts:336`
  (`"aria-label": getSegmentLabel(type, locale().locale)`) and
  `packages/solidaria/src/datepicker/createTimeSegment.ts:245` set each spinbutton's
  `aria-label` to ONLY the segment-type word ("Year"/"Month"/"Day"/"Hour"…). Upstream
  deliberately prepends the field's label to every segment:
  `react-spectrum/packages/@react-aria/datepicker/src/useDateSegment.ts:342-348`
  (`'aria-label': \`${name}${ariaLabel ? \`, ${ariaLabel}\` : ''}…\``) with the comment
*"This is needed because VoiceOver on iOS does not announce groups."* APG Spinbutton
pattern + accname 1.2: each spinbutton must have its own accessible name; relying on the
ancestor `role="group"`/`aria-labelledby`(wired only on the input container at`createDateField.ts:194-208`) is exactly what fails on iOS VO.
- Why: A `DateField label="Birth date"` announces its segments as bare "Month", "Day",
  "Year" with no connection to "Birth date". On iOS VoiceOver (which ignores the group),
  the user has no idea which field they are editing. Standards-level naming regression vs upstream.
- Fix: Mirror upstream — build each segment's `aria-label` as `${segmentName}, ${fieldAriaLabel}`
  (and pass `aria-labelledby` through), threading the field label/labelledby from
  `createDateField`/`createTimeField` into `createDateSegment`/`createTimeSegment`.

### [High] Calendar cell — accessible name hardcodes English "selected" and omits "Today"

- Evidence: our `packages/solidaria/src/calendar/createCalendarCell.ts:169-171` builds the
  cell label via `formatter.format(d)` then appends the literal string `" selected"`; there is
  no "Today" indication anywhere in the name. Upstream localizes the entire label through a
  string formatter with dedicated keys:
  `react-spectrum/packages/@react-aria/calendar/src/useCalendarCell.ts:125-148`
  (`selectedDateDescription`, `'todayDate'` / `'todayDateSelected'`). WCAG 1.3.1 / 4.1.2 +
  accname 1.2 (name must be accurate and, in this stack, localized; the rest of the library
  localizes via `createStringFormatter`).
- Why: In a Spanish locale a selected cell announces e.g. _"lunes, 15 de junio de 2026 selected"_ —
  English leaks into the accessible name — and today's date is never announced as "today", losing
  orientation information that sighted users get visually. Inconsistent, non-localized naming.
- Fix: Replace the hardcoded `" selected"` with localized strings (reuse the i18n string
  formatter already in the repo); add a localized "today" form; prefer upstream's
  `aria-describedby → selectedDateDescription` pattern over inlining state into the name.

### [High] Calendar grid — `role="grid"` has no accessible name

- Evidence: our `packages/solidaria/src/calendar/createCalendarGrid.ts:146-154` returns
  `gridProps` with `role: "grid"` but NO `aria-label`/`aria-labelledby`. Upstream merges a
  computed label into the grid:
  `react-spectrum/packages/@react-aria/calendar/src/useCalendarGrid.ts:139-158`
  (`useLabels({'aria-label': [ariaLabel, visibleRangeDescription].filter(Boolean).join(', ')…})`
  → e.g. "June 2026"). WCAG 1.3.1 / ARIA 1.2 `grid` naming guidance; APG Grid pattern expects
  the grid to be identifiable.
- Why: A screen-reader user who arrows into the day grid receives no month/year context from
  the grid itself. The component layer adds a `VisuallyHidden <h2>`
  (`solidaria-components/src/Calendar.tsx:295-296`), but that is a sibling heading, not the
  grid's computed accessible name, so AT grid-summary/announcement still reports an unnamed grid.
- Fix: Compute and set `aria-label` (calendar label + visible-range description) on `gridProps`,
  matching upstream. Allow `aria-labelledby` passthrough.

### [High] Base Slider hook is single-thumb only — cannot model two-thumb constraints

- Evidence: `packages/solidaria/src/slider/createSlider.ts:309-371` exposes exactly one
  `thumbProps`/`inputProps` bound to scalar `state.value()`; `SliderState`
  (`packages/solid-stately/src/slider/createSliderState.ts:144-194`) is scalar (`value`, not
  `values[]`). There is no `createSliderThumb(index)` and no per-thumb
  `getThumbMinValue`/`getThumbMaxValue`. APG Slider (Multi-Thumb): each thumb needs its own
  `role="slider"` with `aria-valuemin`/`aria-valuemax` _dynamically constrained by the adjacent
  thumb_. The mitigation is that the real range control (`solid-spectrum/src/slider/RangeSlider.tsx`)
  is a 925-line bespoke implementation that does NOT use `createSlider` (see next item).
- Why: Any consumer attempting a range with the base primitive would get two overlapping
  full-range sliders. The headless layer cannot express the multi-thumb pattern; correctness is
  delegated to one hand-rolled component instead of the shared accessible primitive.
- Fix: Either add a `useSliderThumb`-equivalent (per-thumb index, constrained min/max, per-thumb
  label) to the headless layer, or explicitly document that range is only supported via the
  bespoke component. Mirroring upstream's `useSlider` + `useSliderThumb` split is the standards-aligned path.

### [Medium] Date/Time segments — `aria-valuenow`/`aria-valuetext` wrong (and mutually inconsistent) for placeholders

- Evidence: `createDateSegment.ts:339-340` emits `"aria-valuenow": seg.value` and
  `"aria-valuetext": seg.isPlaceholder ? "" : seg.text`; `createTimeSegment.ts:246,249` emits
  `"aria-valuenow": seg.value` and `"aria-valuetext": seg.isPlaceholder ? seg.placeholder : seg.text`.
  Upstream sets placeholder/non-editable segments to `aria-valuenow: null` and `aria-valuetext: null`
  (and falls back to `role="textbox"` on iOS/timeZone):
  `useDateSegment.ts:326-330`. APG Spinbutton: `aria-valuenow` should represent the _current_
  value; a placeholder has none.
- Why: Empty/placeholder segments announce a spurious numeric `aria-valuenow` (the placeholder
  number), and the two hooks disagree on placeholder `aria-valuetext` (`""` vs the placeholder
  string), producing inconsistent SR output between date and time fields.
- Fix: For placeholder segments, omit `aria-valuenow` (set undefined) and align `aria-valuetext`
  handling between both hooks (match upstream's `''`/null behavior).

### [Medium] Date segments — `aria-describedby` and `role` not adapted (per-segment description noise; iOS spinbutton focus)

- Evidence: `createDateSegment.ts:344-345` applies `aria-controls`/`aria-describedby` to EVERY
  segment, and `:334` always uses `role: "spinbutton"`. Upstream applies `aria-describedby` only
  to the first editable segment unless invalid
  (`useDateSegment.ts:332-337`) and overrides to `role="textbox"` (nulling value props) on iOS or
  for `timeZoneName` because _"spinbuttons cannot be focused with VoiceOver on iOS"_
  (`useDateSegment.ts:323-330`).
- Why: (a) The field description/error is re-announced on every segment the user arrows to —
  verbose and against upstream's deliberate behavior. (b) On iOS VoiceOver, `role="spinbutton"`
  segments can be unfocusable, making the date field partly inoperable with VO.
- Fix: Restrict `aria-describedby` to the first editable segment (or when invalid); add the
  iOS / `timeZoneName` `role="textbox"` override with nulled `aria-value*`.

### [Medium] Calendar weekday header cells expose only abbreviated names

- Evidence: `packages/solidaria-components/src/Calendar.tsx:517` and `:570` render
  `<th scope="col">{day}</th>` where `day` is the narrow/short weekday from
  `createCalendarGrid.ts:40-51` (default `weekdayStyle: "narrow"` → "M", "T", "W"). There is no
  full-name `aria-label`/VisuallyHidden long name on the column header. WCAG 1.3.1: header
  semantics should be understandable; a column header named "M" is ambiguous (Monday? March?).
- Why: Screen-reader users hear single letters ("M", "T", "T") as the column context for each
  date, which is ambiguous and inferior to announcing "Monday".
- Fix: Give each `<th scope="col">` an `aria-label` with the full localized weekday name (long
  format) while keeping the abbreviated visible text, as React Spectrum's calendar header does.

### [Medium] RangeSlider thumbs — hardcoded English "Minimum"/"Maximum", no field-label context

- Evidence: `packages/solid-spectrum/src/slider/RangeSlider.tsx:802`
  (`aria-label={isStart ? "Minimum" : "Maximum"}`). The literal English strings are not
  localized, and because an explicit `aria-label` on the thumb wins over any inherited name, the
  thumb's accessible name is just "Minimum"/"Maximum" with no slider-label context (the group's
  `aria-labelledby` at `:831` names the group, not the thumb). APG Slider (Multi-Thumb) +
  accname 1.2: thumbs should be distinctly and meaningfully named (e.g. "Minimum, Price").
  (Positive: per-thumb `aria-valuemin`/`aria-valuemax` ARE correctly constrained by the adjacent
  thumb at `:803-804`, and `aria-valuetext` is set — the multi-thumb value model is correct.)
- Why: Non-English users hear English thumb labels; all users lose the field's subject ("Price",
  "Budget") on the thumb. The rest of the library localizes via `createStringFormatter`, so this
  is an inconsistency as well as an i18n defect.
- Fix: Use localized "Minimum"/"Maximum" strings and incorporate the slider's label
  (e.g. `aria-label="Minimum"` + thumb `aria-labelledby` referencing the slider label, matching
  React Spectrum's RangeSlider thumb labeling).

### [Low] Calendar cell button uses `aria-pressed` (toggle-button semantics on a grid cell)

- Evidence: `createCalendarCell.ts:184` adds `"aria-pressed": isPressed() || undefined` to the
  cell's `role="button"`. Upstream's cell `buttonProps` does NOT include `aria-pressed`
  (`react-spectrum/packages/@react-aria/calendar/src/useCalendarCell.ts:324-339`); selection is
  conveyed by `aria-selected` on the parent `gridcell`. ARIA 1.2: `aria-pressed` denotes a
  toggle button; a date in a selection grid is not a toggle button.
- Why: AT may announce dates as toggle buttons ("pressed"), conflicting with the
  grid/`aria-selected` model and diverging from upstream. Low impact (only transiently true on
  active press) but non-standard.
- Fix: Remove `aria-pressed` from the calendar cell button; rely on `aria-selected` (already set
  at `:155`) and `data-pressed` for styling.

### [Low] ColorSlider hidden input emits empty-string `aria-describedby`/`aria-details`

- Evidence: `packages/solidaria/src/color/createColorSlider.ts:376-377`
  (`"aria-describedby": p["aria-describedby"] ?? ""`, `"aria-details": p["aria-details"] ?? ""`).
  ARIA: an empty IDREF list is meaningless; these attributes should be omitted when there is no
  target, not rendered as `=""`.
- Why: Pollutes the accessibility tree with empty relationship attributes; some AT/validators
  flag empty IDREF lists. Cosmetic but avoidable.
- Fix: Use `?? undefined` so the attributes are dropped when absent (as ColorWheel/ColorArea
  already do, e.g. `createColorWheel.ts:298-299`).

### [Low] NumberField group lacks an accessible name on `role="group"`

- Evidence: `packages/solidaria/src/numberfield/createNumberField.ts:294-300` — `groupProps`
  is `role="group"` with `aria-disabled`/`aria-invalid` only; no `aria-labelledby`/`aria-label`.
  The labeled element is the inner spinbutton input (`:308-323`, which does carry
  `aria-labelledby` via `fieldProps`), so the field is still usable. ARIA 1.2 `group` naming is
  a SHOULD, not a MUST; impact is minor because the focusable spinbutton is named.
- Why: The wrapping group is unnamed; only a minor verbosity/structure nicety versus upstream.
- Fix: Optionally pass the field's `aria-labelledby` onto `groupProps` for parity; low priority.

---

## What is correct (verified, no action needed)

- **Form validation core**: `createFormValidation.ts` faithfully ports upstream — sets custom
  validity, handles the `invalid` event, focuses the first invalid input, forces keyboard focus
  ring (WCAG 4.1.3 announcement-on-submit via focus), and patches `form.reset`.
- **Error association**: `createField.ts:100-128` associates errors via `aria-describedby` (not
  `aria-errormessage`) with an in-code citation to the upstream VoiceOver/NVDA support issue —
  intentional and standards-defensible. Spectrum `Field.tsx:71` / `HelpText.tsx:33` add
  `role="alert"` for live announcement; `DateField`/`TimeField` error props also use
  `role="alert"` (`createDateField.ts:284`).
- **Checkbox / CheckboxGroup**: native `<input type=checkbox>`; group is `role="group"` +
  `createField` labeling; `aria-required` only in `aria` mode, native `required` otherwise
  (`createCheckbox.ts:117-118`). Correct per APG Checkbox.
- **Radio / RadioGroup**: `role="radiogroup"`, roving `tabIndex` (`createRadio.ts:244-264`),
  arrow-key selection wrapping, `aria-required`/`aria-invalid`/`aria-errormessage`. Read-only is
  safely a no-op because `setSelectedValue` guards `isReadOnly`/`isDisabled`
  (`createRadioGroupState.ts:177-180`). Correct per APG Radio.
- **Switch**: native checkbox + `role="switch"` + `checked` (APG explicitly permits `checked`
  instead of `aria-checked`) — `createSwitch.ts:50-57`.
- **Base Slider (single thumb)**: thumb `role="slider"` with `aria-valuemin/max/now` +
  `aria-valuetext` (non-numeric exposed), `aria-orientation`, full keyboard incl. PageUp/Down,
  Home/End; group is `role="group"` labeled via `createLabel` (`createSlider.ts:309-337`).
- **Color (1.4.1 — not by color alone)**: ColorSlider/ColorArea/ColorWheel all expose channel
  values AND color/hue names through `aria-valuetext`
  (`createColorSlider.ts:343-356`, `createColorArea.ts:49-65`, `createColorWheel.ts:301`);
  ColorArea uses `aria-roledescription="2D slider"` and per-axis hidden range inputs.
- **Meter / ProgressBar**: `role="meter"` / `role="progressbar"` with
  `aria-valuenow/min/max` + `aria-valuetext`; indeterminate correctly omits `aria-valuenow`
  (`createProgressBar.ts:116-121`, `createMeter.ts:52-56`).
- **NumberField input**: `role="spinbutton"` with `aria-valuenow/min/max/text`, `aria-required`,
  `aria-invalid`, and full Arrow/Page/Home/End keyboard (`createNumberField.ts:301-341`).
- **StatusLight (1.4.1)**: the color dot is `aria-hidden` and meaning comes from the visible
  text; warns if labeled without a role (`solid-spectrum/src/statuslight/index.tsx:175-209`).
- **NotificationBadge**: `role="img"` + `aria-label` when an accessible label is provided
  (`solid-spectrum/src/notificationbadge/index.tsx:182-183`).

---

## Suspected (unconfirmed)

- **Calendar weekday VisuallyHidden long name**: React Spectrum's RAC `CalendarGridHeader`
  may render abbreviated text as `aria-hidden` with a VisuallyHidden full name inside each
  columnheader. I confirmed our `<th>` lacks a full-name `aria-label` and that upstream's grid
  uses the consumer-provided weekday style, but did not load the exact RS component layer to
  confirm the VisuallyHidden pattern. The Medium finding above is conservative (recommends
  full-name `aria-label`); the exact upstream mechanism is unverified.
- **RangeCalendar live region**: `solidaria-components/src/RangeCalendar.tsx:310` has an
  `aria-live="polite"` region; whether its content matches upstream's
  range-selection announcements (start/end descriptions) was not diffed in detail.
- **DateField/DatePicker calendar-button accessible name and `aria-describedby` to the field
  value** (Date Picker Dialog APG: combobox-button + dialog wiring): the DatePicker is large
  (1203 lines) and was not fully traced; the trigger-button naming and dialog `aria-label`
  parity should be verified separately.
- **Spinbutton "Enter commits" / printable-character handling on NumberField** matches APG
  optional behaviors; not exhaustively diffed against upstream `useNumberField` keyboard.
