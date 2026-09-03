---
id: 280
type: task
title: "Anchor the DateRangePicker popover to the FieldGroup"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 daterangepicker functional pass: settled overlay sits under the calendar-button wrapper (dxField=166, 256×294) while React aligns to the FieldGroup (dxField=0, 304×294)",
    }
---

S2 DateRangePicker (and DatePicker) pass `triggerRef: groupRef` into the
calendar Popover — the FieldGroup, `placement: 'bottom start'`
(`react-aria-components/src/DatePicker.tsx:341`). Solid
`DateRangePickerContent` (and `DatePickerContent`) set

```
triggerRef={() => context.triggerRef()?.parentElement ?? context.triggerRef()}
```

(`packages/solidaria-components/src/DatePicker.tsx:1344` and `:1369`).
`context.triggerRef` is the Calendar button
(`DateRangePickerButton` `:1181`). Its `parentElement` is the ~36×20
icon wrapper, not the 208×32 FieldGroup.

## Evidence

`http://127.0.0.1:4341/components/daterangepicker/?value=2025-02-03/2025-02-14`
— one panel at a time, `data-islands-mounted`, click Calendar, wait until
opacity 1.

FieldGroup 208×32 both stacks. Overlay `data-trigger=DateRangePicker`,
`placement=bottom`, opacity 1.

- React: overlay 304×294, `dxField=0`, `dyField=40`.
- Solid: overlay 256×294, `dxField=166`, `dyField=33` (left edge under the
  calendar button).

Same `dxField=166` with `maxVisibleMonths=2` (both overlays 504×326) and
with `granularity=hour` (Solid `dxField=172`). Width 256 vs 304 is #281.

## Done when

The comparison DateRangePicker popover aligns to the FieldGroup the way
React does (`dxField=0`, `placement=bottom start`). A test fails if the
overlay is positioned against the calendar button. DatePickerContent uses
the same `parentElement` line; fix both.

## Relationship

Child of #24. Found by #260. Distinct from #275 (standalone Popover
`customAnchor` stuck at origin) and from #281 (RangeCalendar width). Do
not start #254.
