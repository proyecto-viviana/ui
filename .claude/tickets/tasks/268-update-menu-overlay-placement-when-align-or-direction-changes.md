---
id: 268
type: task
title: "Update Menu overlay placement when align or direction changes"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 menu functional pass: live direction/align controls update data-comparison-control-props on both stacks, but Solid still opens at the mount-time bottom/start placement",
    }
---

MenuTrigger `direction` and `align` work when they are present on first
render (URL `?direction=top|left|right` and `?align=end` match React geometry
exactly: top `dy=-171`, left `dx=-257`, right `dx=109`, end `dx=-148`).

Changing the same props after mount does not. On `/components/menu/`, set
direction to `top` (or `left` / `right` / `end`) in the viewer controls, then
open the menu. React places on that axis. Solid still opens `bottom` /
`dx=0` even though `data-comparison-control-props` already shows the new
direction/align. A consumer that updates `direction` or `align` on a closed
MenuTrigger and then opens it hits the same stale placement.

## Repro

1. Open `http://127.0.0.1:4341/components/menu/` with no query string.
2. Wait for `data-islands-mounted="true"`.
3. In the prop controls, set `direction` to `top`.
4. Click Solid "Layer actions", then React "Layer actions" (one at a time).
5. Diff the overlay `[data-placement]`: React `top`, Solid `bottom`.
6. Reload with `?direction=top` — both panels place `top`. That is the
   mount-time path, not a fix.

## Done when

Changing `direction` or `align` on a closed MenuTrigger, then opening, places
the Solid overlay on the same axis and offset as React. A route walk that
toggles the comparison controls and opens the menu fails if Solid
`data-placement` stays at the mount-time value.

## Relationship

Child of #24. Found by #260. Not owned by #257 (Popover composition; Menu
already renders `solid-spectrum` Popover and passes `placement`) or #106
(surface nesting — default bottom geometry already matches).
