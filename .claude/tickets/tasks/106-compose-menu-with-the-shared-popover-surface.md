---
id: 106
type: task
title: "Compose Menu with the shared Popover surface"
created: 2026-08-20
parent: 24
status: verified
history:
  - { state: open, at: 2026-08-20, note: "migrated from the completed Menu recertification record" }
  - {
      state: in-progress,
      at: 2026-10-07,
      note: "Menu and ActionMenu already render the shared Popover (hideArrow, padding none, viewport cap, enter/exit). Certified menu and actionmenu specs now measure that dialog for sizes and placements. The certified suite was not run.",
    }
  - {
      state: verified,
      at: 2026-10-07,
      note: "Menu and ActionMenu certified specs measure the shared Popover dialog for S/M/L and top, left, right, and end, including the viewport cap and D2 enter motion. 108 passed.",
    }
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
