---
id: 106
type: task
title: "Compose Menu with the shared Popover surface"
created: 2026-08-20
parent: 24
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from the completed Menu recertification record" }
---

Replace the hand-built Menu and ActionMenu overlay frames with the upstream S2
Popover composition.

The current surface has different nesting, lacks the upstream viewport width
cap, and does not share Popover enter and exit behavior. Keep ARIA and state in
the lower layers and keep S2 styling in `solid-spectrum`.

## Done when

Menu and ActionMenu use the shared surface, all placements and sizes match the
upstream structure and computed styles, D2 motion is covered, and the certified
tests no longer exclude the surface.
