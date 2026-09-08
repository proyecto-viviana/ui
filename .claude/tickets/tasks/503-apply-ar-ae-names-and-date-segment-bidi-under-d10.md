---
id: 503
type: task
title: "Apply ar-AE names and date-segment bidi under D10"
created: 2026-09-07
parent: 136
status: merged
history:
  - {
      state: open,
      at: 2026-09-07,
      note: "filed from #493 inventory of Certification Gates run 34155176389 on 0d84b016 (1998 passed / 165 failed / 4 skipped / 0 waived)",
    }
  - {
      state: in-progress,
      at: 2026-09-07,
      note: "implement ar-ae-date-segment-bidi: DateFieldState access(locale), DatePicker locale getters, shared I18nContext, date-segment rtl embed",
    }
  - {
      state: merged,
      at: 2026-09-07,
      note: "Provider ar-AE reaches Aria date/combo strings and numeric segment bidi. DateFieldState MaybeAccessor+access; DatePicker locale getters; I18nContext Symbol.for share across duplicate graphs; createDateSegment rtl embed/ltr. Prove cwd /home/emoporemilio/projects/viviana-hub/ui: vp test run packages/solidaria/test/createDateSegment.test.tsx packages/solid-stately/test/createDateFieldState.test.ts packages/solidaria/test/createComboBox.test.tsx — 3 files, 75 passed. Focused D10 RTL datefield/timefield/datepicker/daterangepicker/calendar/rangecalendar — 26 passed. ComboBox field D10 (grep ComboBox field) — 3 passed. Overlay list D10 not run (#498). git diff --check clean.",
    }
---

Certification Gates run 34155176389 on `0d84b016`: **27** unwaived D10 titles.

Focus trails: React accessible names are Arabic (`الشهر`, `السبت، 15 فبراير 2025`, `عرض المقترحات`); Solid stays English (`month`, `Saturday, February 15, 2025`, `Show suggestions`). Components: DateField (5 trails), TimeField (5 trails), DatePicker (3 trails), DateRangePicker (3 trails), Calendar grid-nav (1), RangeCalendar grid-nav (1), ComboBox field tab-cycle (1).

State matrix: DateField/DatePicker/DateRangePicker `direction` on segments is React `ltr` + `unicode-bidi: embed` vs Solid `rtl` + `normal` (S2 isolates numeric segments). TimeField target width 51px vs 53px under the same locale (English vs Arabic metrics).

#198/#199 are the catalog ports; they do not yet own this classified remainder. #202 extends D10 coverage — do not bind it as the fix. #201 is four keyboard mappers — not these names.

## Work

Route date/time/calendar/combobox strings through the provider locale (RAC + S2 catalogs). Match S2 segment `direction` / `unicode-bidi`. Prove with focused D10 on datefield, timefield, datepicker, daterangepicker, calendar, rangecalendar, combobox-field.

## Done when

Those 27 titles match, or a named remaining string/bidi miss. Overlay list D10 dir is #498.

## Relationship

Triage class of #493. Sibling under #136. Points at #198/#199; does not bind them. Does not bind #201/#202.
