---
id: 118
type: task
title: "Port TokenField"
created: 2026-08-20
parent: 25
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from upstream Train 8 item T-82" }
---

Port the pinned RAC TokenField surface: `Token`, `TokenField`,
`TokenFieldContext`, and `TokenInput`.

Read source, tests, and official docs before the owner steers public names and
types. Reuse the shared collection, selection, keyboard, and focus spine.

## Done when

All four exports and every observable branch have strict API, ARIA, keyboard,
focus, forms, validation, SSR, hydration, and browser evidence. Part of #82.
