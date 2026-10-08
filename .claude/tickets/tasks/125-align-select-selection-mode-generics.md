---
id: 125
type: task
title: "Align Select selection-mode generics"
created: 2026-08-20
parent: 33
status: in-progress
history:
  - { state: open, at: 2026-08-20, note: "migrated from upstream Train 8 item T-95" }
  - {
      state: in-progress,
      at: 2026-10-08,
      note: "Select<T, M> uses value, defaultValue, and onChange. Site picker and select JSON plus the comparison picker fixture still pass selectedKeys (public-face seat).",
    }
---

Match the pinned RAC Select type contract:
`Select<T, M extends SelectionMode = 'single'>`.

The current Solid component has only `Select<T>`. The owner must steer the public
type change.

## Done when

Types, default single mode, multiple mode, values, callbacks, forms, docs, and
runtime behavior match upstream. Part of #82.
