---
id: 267
type: task
title: "Contain Tab inside an open Menu overlay"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 menu functional pass: Tab and Shift+Tab leave the open Solid menu for document.body while the overlay stays open; React keeps focus on the current menuitem",
    }
  - {
      state: open,
      at: 2026-09-03,
      note: "reproduced on ActionMenu (#260): Enter then Tab — React stays on first menuitem, Solid focus is body, overlay still open (menuCount 1, aria-expanded true). RAC Popover contains for MenuTrigger; Solid shouldContainFocus excludes MenuTrigger.",
    }
  - {
      state: open,
      at: 2026-09-03,
      note: "#260 breadcrumbs: overflow More items open, Tab from last menuitem — React stays on Files in the menu; Solid focus is BODY, aria-expanded stays true, menuCount 1. Same MenuTrigger contain miss. Menu length on URL remount still #429; do not file a second id.",
    }
---

On `/components/menu/`, open either panel with ArrowDown. Press Tab (or
Shift+Tab).

React keeps `document.activeElement` on the focused `menuitem` and the overlay
stays open. Solid leaves focus on `document.body` while the overlay remains
open (`aria-expanded="true"`, `role="menu"` still in the tree,
`data-comparison-last-open-state="true"`). A keyboard user can type into the
page behind the menu.

Headless Popover turns FocusScope `contain` off for `trigger === "MenuTrigger"`
(`packages/solidaria-components/src/Popover.tsx` `shouldContainFocus`). React
Aria's menu popover does not leak Tab this way on the same route.

## Repro

1. Open `http://127.0.0.1:4341/components/menu/` (production preview).
2. Wait for `data-islands-mounted="true"`.
3. Focus the Solid "Layer actions" trigger and press ArrowDown.
4. Press Tab.
5. Diff `document.activeElement` against the React panel after the same keys.

## Done when

Tab and Shift+Tab from an open Menu keep focus inside the overlay (or close it
and restore the trigger) on both stacks, matching React on this route. A
Playwright walk on `/components/menu/` fails if Solid focus lands on `body`
while `role="menu"` is still visible.

## Relationship

Child of #24. Found by #260. Not #235 (null restore target) and not #251
(enter/exit animation). Confirmed on ActionMenu: same Popover `shouldContainFocus`
exclusion for `MenuTrigger`.
