---
"@proyecto-viviana/solidaria": patch
---

CalendarYearPicker: match upstream `visibleYears` defaulting

`createCalendarYearPicker` now defaults the window size with
`props.visibleYears || 20` instead of `?? 20`, mirroring `@react-aria/calendar`
`useCalendarYearPicker`. The two only differ for a falsy `visibleYears` (`0` or
`NaN`), which upstream coerces to the default 20-year window; previously a `0`
produced an effectively empty window. The rest of the year-window math
(`Math.ceil(visibleYears / 2) - 1`, the `visibleYears - 1` min/max clamps, and
the inclusive `<= maxDate` loop, so the window includes the `maxValue` /
`minValue` year) was already faithful, so this is the last remaining divergence
in the hook.
