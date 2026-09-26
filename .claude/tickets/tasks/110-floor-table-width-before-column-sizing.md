---
id: 110
type: task
title: "Floor Table width before column sizing"
created: 2026-08-20
parent: 31
status: verified
history:
  - { state: open, at: 2026-08-20, note: "migrated from upstream Train 8 item T-63" }
  - {
      state: verified,
      at: 2026-09-26,
      note: "floored availableWidth before column sizing and allocated fractional remainder to the last column matching upstream TableUtils",
    }
---

Match upstream fractional Table column sizing.

`TableUtils.calculateColumnSizes` floors `availableWidth`. The local
`createTableColumnResizeState` passes the fractional width through.

## Done when

The state calculation matches upstream for fractional container widths and
browser evidence proves stable column sizes during layout and resize. Part of
#82; keep the Table structure decision in #89.
