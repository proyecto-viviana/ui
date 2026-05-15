# DatePicker Follow-Up Plan

This file is intentionally short. Older DatePicker inventories were useful
during repair work, but current source and tests are now the authority.

Last refreshed: 2026-05-15.

## Current State

DatePicker has a live comparison route and focused Playwright coverage. The S2
gap report still marks DatePicker visual pair parity as planned, not complete.

Related date/time entries are still blocked or missing in the styled S2 report:

- Calendar
- DateField
- DateRangePicker
- RangeCalendar
- TimeField

Treat DatePicker as part of this cluster. Shared segmented-input, calendar,
popover, validation, focus, and theme behavior should be fixed once and reused
across the cluster.

## Evidence To Keep Current

```bash
vp run comparison:test:datepicker
vp run comparison:report:gaps
vp run --filter @proyecto-viviana/solidaria-components build
vp run --filter @proyecto-viviana/solid-spectrum build
```

If Chromium cannot run inside the sandbox on this host, rerun the focused
Playwright command outside the sandbox and record that in validation notes.

## Remaining Work

- Convert DatePicker closed-field and open-popover visual rows from `planned`
  to committed strict pair-diff coverage.
- Extract shared segmented input styling and behavior into DateField/TimeField
  work instead of duplicating fixes in DatePicker.
- Validate Calendar branches used by DatePicker: disabled dates, unavailable
  dates, today, selected, focused, hover, press, min/max, multi-month layout,
  narrow weekday headers, and dark mode.
- Validate DateRangePicker against the same popover, focus-return, theme, and
  segmented-input contracts.
- Keep route controls wired to public S2 prop names and assert that controls
  update both React and Solid fixtures.

## Acceptance

DatePicker is not done until:

- the comparison gap report no longer lists DatePicker planned visual rows;
- strict React-vs-Solid pair-diff tests cover the stable closed and open states;
- Playwright replays keyboard open, Escape dismiss, selection commit, outside
  dismiss, focus return, disabled, invalid, required, light theme, and dark
  theme;
- shared DateField/TimeField work does not regress DatePicker.
