---
id: 142
type: task
title: "Remove the leftover Overlay primitive from the S2 styled layer"
created: 2026-09-01
parent: 136
status: verified
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
  - {
      state: in-progress,
      at: 2026-09-27,
      note: "routed Overlay through style() in both styled packages and stopped Wave 4 from mounting it",
    }
  - {
      state: verified,
      at: 2026-09-27,
      note: "Overlay tests reject fixed/z-50, emit the macro class, and keep the identical dual copy; OpenTransition had no Tailwind classes",
    }
---

## Cause

`Overlay` is an RSP v3 leftover that renders `class={\`fixed z-50 ...\`}`.
Those Tailwind utilities do not ship. `StyledModal`and`Tray`already use`style()`. `Overlay` is kept out of the public barrel but Wave4 still mounts
it.

## Work

Delete the leftover Overlay/OpenTransition RSP path, or route it through
`style()` if it must stay. Stop mounting it from Wave4 tests if it is not a
product export.

## Done when

No styled-package overlay uses non-shipping Tailwind layout classes.

## Relationship

F-ARCH-002. Delta on verified #46.
