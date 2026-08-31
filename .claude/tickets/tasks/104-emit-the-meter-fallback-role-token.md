---
id: 104
type: task
title: "Emit the Meter fallback role token"
created: 2026-08-20
parent: 24
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from the completed recertification program" }
---

Match upstream Meter semantics in the port and in the comparison fixture.

Upstream emits `role="meter progressbar"` so older browsers can fall back to
`progressbar`. The port emits only `role="meter"`. The React fixture currently
normalizes the upstream value to hide this difference.

## Done when

`createMeter` emits the upstream token list, the fixture no longer rewrites the
role, and headless, browser, axe, and certified D6 evidence pass.
