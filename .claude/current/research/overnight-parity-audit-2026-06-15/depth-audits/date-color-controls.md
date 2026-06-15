---
kind: research
status: current
---

Status: Current source of truth.
Update when: this research pack is revised, superseded, or relocated.

# Depth audit slice: date, calendar, time, and color controls

## Scope and authority

This slice records the first xhigh line-oriented read-only pass for `Calendar`, `RangeCalendar`, `DateField`, `TimeField`, `DatePicker`, `DateRangePicker`, `ColorArea`, `ColorField`, `ColorSlider`, `ColorSwatch`, `ColorSwatchPicker`, and `ColorWheel`. It compares local Solid sources against installed S2/React Aria/Stately packages and APG/WCAG obligations. It is a queue of proof tasks, not certification.

## Findings

### DCC-001 — Date component exports and contexts are incomplete

Upstream S2 exposes date/time picker contexts such as `DateFieldContext`, `TimeFieldContext`, `DatePickerContext`, and `DateRangePickerContext`; local root exports focus on components/types and do not expose equivalent contexts/subpath exports for the date family. This is an API parity blocker until the missing exports are either implemented or recorded as an explicit local omission.

### DCC-002 — Calendar invalid-message fallback diverges

Upstream Calendar and RangeCalendar render invalid-message fallback text from localized calendar validation strings. Local Calendar/RangeCalendar only render the error message when invalid state and an explicit local error message are both present. That leaves invalid selections without guaranteed visible/announced error text and intersects WCAG 3.3.1/3.3.3 proof obligations.

### DCC-003 — Calendar sizing/responsive behavior has local drift

Upstream Calendar does not expose the same public `size` surface; local Calendar/RangeCalendar expose legacy sizes and pin responsive sizing differently. Any visual parity claim must separate certified S2 behavior from local size additions and add computed contracts for cell responsive size, fit-content/max-width, and range-calendar layout.

### DCC-004 — DatePicker and DateRangePicker omit S2 API branches

Local DatePicker/DateRangePicker wrappers are narrower than upstream: missing branches include `UNSAFE_style`, `UNSAFE_className`, `styles`, label positioning/alignment, necessity indicator, `shouldFlip`, public contexts, contextual help for ranges, and explicit commit behavior. These omissions affect both public API parity and the proof matrix for forms, validation, overlays, and i18n.

### DCC-005 — DatePicker validation resolution does not match upstream

Upstream resolves function `errorMessage` values from display validation or joined validation errors. Local code derives invalidity mostly from explicit `isInvalid` and forwards string error messages only. Tests must prove function error messages, native validation errors, display-validation timing, and range validation for both React and Solid.

### DCC-006 — Required/optional/time labels are hard-coded English

DateField/TimeField render literal `(required)` and `(optional)` strings; DatePicker popup time labels use literal `Time`; DateRangePicker uses literal `Start time` and `End time`. These must use the same localized strings as upstream or be proven intentionally local. Required proof includes non-English locale routes and accessible-name/description snapshots.

### DCC-007 — ColorArea has a duplicate-ID risk

When callers pass `id`, local ColorArea can assign that same id to the root and to hidden range inputs before fallback ids are applied. This violates DOM id uniqueness and can corrupt label/description relationships.

### DCC-008 — ColorArea provider/context behavior is not S2-equivalent

Upstream ColorArea merges context props, DOM refs, locale direction, and Spectrum form/provider props. Local code directly splits style/unsafe props and renders the headless ColorArea, so slotted context, form-provider inheritance, and direction-sensitive behavior need explicit parity proof.

### DCC-009 — Color controls contain hard-coded accessibility strings

ColorArea uses literal `Color picker` and `2D slider`; ColorField channel names use `en-US`; ColorSwatch and ColorSwatchPicker use literal transparent/role/label strings; ColorSlider fallback ARIA text is English. These are i18n and accessible-name blockers for certification.

### DCC-010 — ColorField public ref parity is missing or undocumented

Upstream ColorField exposes a TextField-style ref contract for focus/select/input access. Local ColorField is a plain wrapper without an equivalent documented public ref contract. This needs either implementation or a documented non-parity decision.

### DCC-011 — Local color public additions need classification

Local exports/additions such as `ColorSwatchPickerItem`, `ColorWheel.Track`/`Thumb` statics, and deprecated `ColorSlider` size/showValue aliases have no direct S2 counterpart. They must be marked as local additions and excluded from certified S2 parity unless the owner wants them included in Viviana-native API scope.

### DCC-012 — DateRangePicker time editing uses custom reconstruction

Local range time editing reconstructs date/time values instead of delegating to the upstream state time setter shape. That needs focused proof for zoned dates, DST boundaries, non-Gregorian calendars, min/max constraints, and partial invalid edits.

### DCC-013 — Assistive-technology transcript evidence is missing

The date/time and color families need live AT transcripts or equivalent accessibility-tree proof for segmented date fields, calendars, range calendars, color two-dimensional sliders, hue sliders, color swatches, validation messages, and popup focus return. Axe and screenshots are not enough for these controls.

## Priority proof queue

1. Fix/prove invalid-message fallback for Calendar and RangeCalendar.
2. Remove hard-coded English labels from date/time/color paths or document local additions.
3. Add duplicate-id regression for `<ColorArea id="...">`.
4. Add non-English locale and RTL routes for DatePicker, DateRangePicker, ColorArea, ColorSlider, ColorSwatchPicker, and ColorField.
5. Add DatePicker/DateRangePicker API-surface comparison rows for unsafe props, styles, label positioning, necessity indicators, contexts, `shouldFlip`, and commit behavior.
6. Add DST/zoned/non-Gregorian range time-edit tests.
