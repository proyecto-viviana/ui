---
id: 308
type: task
title: "Open ActionMenu from a ListView item on pointer press"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 listview functional pass: Playwright click and force-click on Project brief.pdf menu open RAC Copy overlay; Solid expanded stays false, no role=menu. Enter on the focused trigger and a synthetic click do open Solid",
    }
---

ListView item `ActionMenu` opens from a pointer press on RAC. Solid paints
the trigger (`aria-label="Project brief.pdf menu"`, 24×24, `pointer-events:
auto`) but a real pointer click does not set `aria-expanded` or mount a
`role=menu`. Keyboard Enter on the focused trigger and a dispatched
`click` both open Copy at opacity 1, so the overlay path works; the press
path inside the row does not.

ActionMenu on its own comparison route opens from click. This is the
ListView item slot.

## Evidence

`http://127.0.0.1:4341/components/listview/?itemActionSlot=actionMenu`,
islands mounted, one panel at a time. Click
`getByRole("button", { name: /Project brief.pdf menu/ })`, wait 400ms:

|                 | React                  | Solid |
| --------------- | ---------------------- | ----- |
| `aria-expanded` | true                   | false |
| `role=menu`     | Copy, opacity 1, 71×48 | none  |
| focus           | `role=menu`            | BODY  |

Solid `click({ force: true })` still does not open. `button.click()` via
`dispatchEvent` opens Copy (opacity 1, 61×40, focus menuitem Copy). Focus
the trigger then Enter: same open.

No D13 ListView journeys (#249). Distinct from #267 (Tab contain on an
already-open overlay).

## Done when

A pointer click on Project brief.pdf menu opens the Copy overlay at
opacity 1 with `aria-expanded=true`, matching React. A comparison-route
walk fails if Solid stays closed after click.

## Relationship

Child of #24. Found by #260. Unrelated to the standalone ActionMenu route.
Do not start #254.
