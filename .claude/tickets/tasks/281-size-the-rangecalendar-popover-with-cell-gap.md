---
id: 281
type: task
title: "Size the RangeCalendar popover with cell-gap"
created: 2026-09-03
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 daterangepicker functional pass: one-month RangeCalendar popover is 256×294 on Solid and 304×294 on React; the grid itself is 224×190 on both",
    }
  - {
      state: merged,
      at: 2026-09-03,
      note: "rangeCalendarRoot and rootStyle use 7*cellMaxWidth + 12*cell-gap (272px) for one month, fit-content for multi-month. Test fails if the calendar stays 224px.",
    }
---

S2 RangeCalendar sets the calendar root width to
`calc(7 * var(--cell-max-width) + var(--cell-gap) * 12)` (size M: 7×32 +
12×4 = 272). The popover pads 16px each side → 304
(`react-spectrum/packages/@react-spectrum/s2/src/RangeCalendar.tsx:85-88`).
Multi-month switches that root to `width: fit`.

Solid `rangeCalendarRoot` is always `width: "fit"`
(`packages/solid-spectrum/src/calendar/RangeCalendar.tsx:201`) and each
grid is inline `width: cellMaxWidth * 7` (`:852` → 224). Popover frame
padding 16×2 → 256. `--cell-gap: 4` is set but never added into the
width.

## Evidence

`http://127.0.0.1:4341/components/daterangepicker/?value=2025-02-03/2025-02-14`
— isolate one panel, open Calendar, opacity 1.

Grid 224×190, 35 cells, heading February 2025 on both.

- React overlay: 304×294.
- Solid overlay: 256×294.

`?maxVisibleMonths=2`: both overlays 504×326 (two 224 grids).
`?granularity=hour`: both overlays 304 wide (time fields force the
width); Solid is then 440 tall vs React 375 (#285). Do not patch the
comparison app (ADR 0001).

## Done when

One-month DateRangePicker / RangeCalendar popover matches React (~304px
here: 272 calendar + padding). A test fails if the dialog stays 224 +
padding while S2 is 272 + padding. Multi-month already matches.

## Relationship

Child of #24. Found by #260. Distinct from #276 (DatePicker stamps a
272px cap that clips `maxVisibleMonths=2`; DateRangePicker two-month is
already 504). Distinct from #280 (placement). `viviana-ui` RangeCalendar
copies the same `width: "fit"` / `cellMaxWidth * 7`.
