---
id: 411
type: task
title: "Move ColorSwatchPicker PageDown and PageUp like S2"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 colorswatchpicker functional pass: after Tab onto Rose, S2 PageDown focuses Pink (last) without changing selection; Solid PageDown is a no-op. From End/Pink, S2 PageUp returns to Rose; Solid stays on Pink. Home/End/arrows already match. createColorSwatchPicker never passes a listbox ref into createListBox, so ListKeyboardDelegate getKeyPageBelow/Above returns null (or skips the non-scrollable getLastKey/getFirstKey shortcut). Numbered 411 to stay past ProgressCircle #410",
    }
---

ColorSwatchPicker `PageDown` / `PageUp` should move focus the way S2
does, without committing selection (`selectionBehavior` default
`toggle`). On the seven-swatch comparison grid the listbox is not
scrollable, so RAC `ListKeyboardDelegate.getKeyPageBelow` returns
`getLastKey()` and `getKeyPageAbove` returns `getFirstKey()`.

Solid's headless picker implements grid arrows itself, then forwards
other keys to `createListBox`. That `createListBox` call omits the
collection `ref`, so the delegate has no element: `getItemRect` is
empty and the non-scrollable last/first shortcut never runs.
`Home` / `End` already match because they do not need geometry.

## Evidence

`http://127.0.0.1:4341/components/colorswatchpicker/`, islands
mounted. Other `.s2-framework-panel` `visibility:hidden` + `inert`.
Focus Before, `Tab` onto Rose, then `PageDown`. From a remount,
`Tab` / `End` / `PageUp`.

| | React | Solid |
|---|---|---|
| Tab | Rose focused, selected Rose | same |
| PageDown | **Pink** focused, selected still Rose | **Rose** focused (no-op) |
| End then PageUp | **Rose** focused | **Pink** focused (PageUp no-op) |

Selection overlay stays on Rose both stacks. ArrowRight/Left/Home/End
and Enter/Space already match.

## Done when

Focused ColorSwatchPicker `PageDown` on this route lands on the last
enabled swatch and `PageUp` on the first, without changing
`aria-selected`, matching S2. A comparison-route walk fails if Solid
stays on Rose after PageDown. Home/End must keep working. Do not
start #254.

## Relationship

Child of #24. Found by #260. Wiring is
`packages/solidaria-components/src/Color.tsx` `createColorSwatchPicker`
(`createListBox(props, state)` with the default `ref: () => null`)
and `packages/solidaria/src/selection/ListKeyboardDelegate.ts`
`getKeyPageBelow`. Distinct from Virtualizer #129 (page keys with a
layout delegate). Do not start #254.
