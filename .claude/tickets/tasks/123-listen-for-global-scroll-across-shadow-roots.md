---
id: 123
type: task
title: "Listen for global scroll across shadow roots"
created: 2026-08-20
parent: 31
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from upstream Train 8 item T-92" }
---

Port `addGlobalScrollListener` and use it for overlay `closeOnScroll` behavior.

The local overlay paths listen on `document` or `window` and do not observe
scroll events across Shadow DOM boundaries.

## Done when

Nested shadow-root browser tests prove close, cleanup, nested overlay, and
non-scroll behavior. Do not treat the separate `ariaHideOutside` fix as this
evidence. Part of #82.
