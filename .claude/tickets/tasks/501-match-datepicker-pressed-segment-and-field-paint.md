---
id: 501
type: task
title: "Match DatePicker pressed segment and field paint"
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
      note: "implement datepicker-pressed-segment: RAC nested createPress stopPropagation so trigger press does not focusLast; restore DateRangePicker invalid data-pressed from createPress",
    }
  - {
      state: merged,
      at: 2026-09-07,
      note: "createPress stopPropagates an already-pressed pointerdown like RAC usePress, so FieldGroup focusLast does not run on calendar-button press. DateRangePicker invalid data-pressed stays createPress.isPressed. S2 calendarButton takes ...renderProps. Prove cwd /home/emoporemilio/projects/viviana-hub/ui WSL COMPARISON_CHROMIUM_ARGS=--disable-software-rasterizer: datepicker+daterangepicker D1/D3/D7/D9 72 passed (the 32 + already-green value/invalid/disabled/readonly); datefield D1 10/10. Waivers []. git diff --check clean. Did not start #502/#511. Did not edit visual-diff.ts or pressLocator.",
    }
---

Certification Gates run 34155176389 on `0d84b016`: **32** unwaived titles. Leftover D1s that #489 did not close.

DatePicker placeholder D1 (2): inner `pressed · monthSegment` — React `background-color: rgba(0,0,0,0)` vs Solid accent fill (`rgb(75, 117, 255)` light). DateRangePicker placeholder D1 (2): same on `pressed · startMonthSegment`. DateRangePicker invalid D1 (2): walk never sees `data-pressed="true"` on the Solid calendar button.

D3 (12): all inner state `pressed`; mismatchRatio 0.012–0.016 except DateRangePicker invalid ~0.059; `maxChannelDelta` 236. D7 value/invalid (8): pressed contrast 18.58 vs 3.97 light, 16.87 vs 4.51 dark. D9 placeholder (and DateRangePicker invalid) repeats the pressed segment/target miss, including `transform: matrix3d(...)` vs `none` on invalid.

## Work

Match S2 date-segment and field-button pressed styles (macro, not comparison CSS). Restore `data-pressed` on the invalid DateRangePicker calendar button so the walk can capture. Prove with focused D1/D3/D7/D9 on datepicker and daterangepicker. D2 open-enter is #502. D10 is #503.

## Done when

Those 32 titles are green or a named remaining miss. Field-root / form / FieldError D1s stay 0-failed.

## Relationship

Triage class of #493. Sibling under #136. Owns the leftover DatePicker/DateRangePicker D1s. Distinct from #502 and #503.
