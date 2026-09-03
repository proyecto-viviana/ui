---
id: 285
type: task
title: "Lay out DateRangePicker start and end time fields in a row"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 daterangepicker functional pass: granularity=hour popover is 304×375 on React (time fields in one row) and 304×440 on Solid (fields wrap under a 272px max-width)",
    }
---

S2 DateRangePicker time fields sit in one row under the calendar:

```
display: 'flex',
gap: 16,
contain: 'inline-size',
marginTop: 24
```

(`react-spectrum/packages/@react-spectrum/s2/src/DateRangePicker.tsx:203-209`).
No wrap, no 272px cap.

Solid invents wrap and a cap:

```
display: "flex",
gap: 16,
alignItems: "start",
flexWrap: "wrap",
maxWidth: "[272px]",
```

(`packages/solid-spectrum/src/calendar/DateRangePicker.tsx:502-508`).
That is not an S2 token. The second TimeField wraps, so the popover is
65px taller. Labels already match (`datepicker.startTime` /
`datepicker.endTime`).

## Evidence

`http://127.0.0.1:4341/components/daterangepicker/?value=2025-02-03/2025-02-14&granularity=hour`
— isolate one panel, open Calendar, opacity 1.

Both: overlay width 304, `Start time` / `End time`, 4 time spinbuttons,
calendar grid 224×190.

- React overlay: 304×375.
- Solid overlay: 304×440. `dxField=172` is #280.

Do not patch the comparison app (ADR 0001). Drop the invented
`flexWrap` / `maxWidth` and match S2 `contain: 'inline-size'` +
`marginTop: 24`.

## Done when

Hour (and minute) DateRangePicker popover lays Start/End time in one row
and matches React height on the comparison route. A test fails if the
time row wraps under a 272px cap. `viviana-ui` copies the same style.

## Relationship

Child of #24. Found by #260. Distinct from #281 (one-month calendar
width without time fields) and #198 (start/end time _strings_, already
wired).
