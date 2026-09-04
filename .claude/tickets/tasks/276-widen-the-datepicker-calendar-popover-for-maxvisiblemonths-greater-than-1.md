---
id: 276
type: task
title: "Widen the DatePicker calendar popover for maxVisibleMonths greater than 1"
created: 2026-09-03
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 datepicker functional pass: maxVisibleMonths=2 and pageBehavior=visible both render two month grids, but Solid popover stays 304px while React grows to 504px so the second month sits outside the chrome",
    }
  - {
      state: merged,
      at: 2026-09-03,
      note: "Calendar owns S2 one-month 272px vs multi-month fit-content; DatePicker no longer stamps 272px on the popover Calendar.",
    }
---

S2 DatePicker `maxVisibleMonths={2}` sizes the calendar popover to both
months. S2 Calendar uses `width: fit` / `maxWidth: unset` when
`isMultiMonth` (`react-spectrum/packages/@react-spectrum/s2/src/Calendar.tsx`).
The S2 DatePicker popover itself has no 272px cap.

Solid DatePickerPopup always stamps `UNSAFE_style={{ width: "272px",
"max-width": "100%" }}` on Calendar
(`packages/solid-spectrum/src/calendar/DatePicker.tsx`
`datePickerCalendarPopoverStyle`). The second month still mounts, but it
paints outside the dialog.

## Evidence

`http://127.0.0.1:4341/components/datepicker/?value=2025-02-14&maxVisibleMonths=2`
— isolate one panel, `data-islands-mounted`, open Calendar, wait until
opacity 1.

Both: heading `February to March 2025`, two grids (February 224×190 at
x=534, March 224×222 at x=782), focus on `Friday, February 14, 2025
selected`.

- React overlay: 504×326, opacity 1.
- Solid overlay: 304×326, opacity 1. March grid is 248px to the right of
  the popover's left edge, past the 304px chrome.

Same 504 vs 304 split with
`?value=2025-02-14&maxVisibleMonths=2&pageBehavior=visible`. Single-month
open is 304×294 on both.

The package test that expects `calendar.style.width === "272px"` is the
one-month case (`packages/solid-spectrum/test/DatePicker.test.tsx`).

## Done when

`maxVisibleMonths={2}` on the comparison DatePicker grows the Solid
popover to both month grids the way React does (~504px here). A test
fails if the dialog width stays the one-month 272px while two grids are
visible. One-month DatePicker stays 272px.

## Relationship

Child of #24. Found by #260. Do not patch the comparison app (ADR 0001).
`viviana-ui` DatePicker copies the same 272px style; out of this ticket
unless the owner expands it.
