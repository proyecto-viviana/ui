---
id: 269
type: task
title: "Wrap ActionMenu keyboard focus from the last item"
created: 2026-09-03
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 actionmenu functional pass: ArrowDown from Paste wraps to Copy on React and stays on Paste on Solid; RAC useMenu defaults shouldFocusWrap true, createMenu defaults false",
    }
  - {
      state: open,
      at: 2026-09-03,
      note: "#260 breadcrumbs: overflow More items, End then ArrowDown — React wraps Annual report→Files; Solid stays on Projects (last of the two-item menu). Same createMenu shouldFocusWrap default. URL remount menu length is #429; do not file a second id.",
    }
  - {
      state: merged,
      at: 2026-09-03,
      note: "createMenu defaults shouldFocusWrap to true like RAC useMenu. Package tests fail if the unset default does not wrap.",
    }
---

On `/components/actionmenu/`, open the menu from the keyboard (focus the
More actions trigger, Enter). Focus lands on Copy. ArrowDown moves Copy →
Cut → Paste on both stacks. One more ArrowDown wraps to Copy on React and
stays on Paste on Solid (`tabindex="0"` stays on the last item).

RAC `useMenu` defaults `shouldFocusWrap` to `true`
(`react-aria@3.52.0` `dist/private/menu/useMenu.js`). Solid `createMenu`
defaults the same prop to `false`
(`packages/solidaria/src/menu/createMenu.ts`). Neither comparison fixture
passes `shouldFocusWrap`, so the ActionMenu route shows the default miss.
The same default applies to Menu.

Home / End / ArrowUp from the last item still match. This is only wrap.

## Evidence

Preview `http://127.0.0.1:4341/components/actionmenu/`, both panels live
after `data-islands-mounted="true"`. Isolated per stack (fresh goto, open
with Enter, ArrowDown ×3):

| after     | React focusedItem | Solid focusedItem |
| --------- | ----------------- | ----------------- |
| open      | 0 Copy            | 0 Copy            |
| ArrowDown | 1 Cut             | 1 Cut             |
| ArrowDown | 2 Paste           | 2 Paste           |
| ArrowDown | **0 Copy**        | **2 Paste**       |

Pass-1 `keyboard-roving` on the same route showed the same wrap miss at
step `[3]` (`items[0].focused` React vs `items[2].focused` Solid).

## Repro

1. Open `http://127.0.0.1:4341/components/actionmenu/` (production preview).
2. Wait for `data-islands-mounted="true"`.
3. Focus Solid More actions, press Enter, then ArrowDown three times.
4. Repeat on React. Diff which menuitem has `tabindex="0"`.

## Done when

ArrowDown from the last ActionMenu item focuses the first item, matching
React, when `shouldFocusWrap` is omitted. A `createMenu` test fails if the
unset default does not wrap. Menu on `/components/menu/` must wrap the same
way.

## Relationship

Child of #24. Found by #260. Not #17 (menu-trigger open/focus-entry, verified)
and not #267 (Tab leaving the overlay).
