---
id: 332
type: task
title: "Drag all selected ListBox items on keyboard pickup"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 dnd-listbox functional pass: Space Read+Write then Enter only marks Write data-dragging on Solid; after ArrowDown×2 Enter order is write,read,admin vs React read,write,admin. Selected options stay described Press Enter to start dragging instead of Press Enter to drag N selected items. createDraggableItem getKeysForDrag is stubbed to the focused key",
    }
---

When a selected option is picked up with Enter, RAC drags every
selected key (`useDraggableCollectionState.getKeysForDrag`) and
describes the item as "Press Enter to drag N selected items." Solid
`createDraggableItem` always returns `new Set([key])` ("For now, just
return the single key"), so `numKeysForDrag` is 1, the selected
description never fires, and only the focused option moves.

## Evidence

`http://127.0.0.1:4341/components/dnd-listbox/`, islands mounted, one
panel at a time, `selectionMode=multiple` (default). Tab from Before,
Space on Read, ArrowDown, Space on Write (focus Write):

| | React | Solid |
|---|---|---|
| selected | Read, Write | Read, Write |
| described (selected) | Press Enter to drag 2 selected items. | Press Enter to start dragging. |
| described (Admin) | Press Enter to start dragging. | Press Enter to start dragging. |

Enter then ArrowDown ×2 then Enter:

| | React | Solid |
|---|---|---|
| `data-dragging` at pickup | Read and Write | Write only |
| drop target at pickup | Insert between Write and Admin | same label (duplicate indicators, #256) |
| order after drop | `read,write,admin` (group drop at insert-before-read is a no-op) | `write,read,admin` (only Write moved before Read) |

Ctrl+A then Enter: React marks all three `data-dragging` and focuses
Insert before Read. Solid marks only Write.

Root: `packages/solidaria/src/dnd/createDraggableItem.ts` `getKeysForDrag`.
RAC is `react-stately/src/dnd/useDraggableCollectionState.ts:getKeys`.
The selected description is `dragSelectedKeyboard` in
`useDraggableItem.ts` (`MESSAGES.keyboard.selected` when
`numKeysForDrag > 1 && isSelected`).

## Done when

Keyboard pickup of a selected option drags the same key set as RAC
(all selected keys, minus selected ancestors) and the selected items'
`aria-describedby` is "Press Enter to drag N selected items." A
comparison-route walk of Space Read+Write → Enter → drop fails if
Solid's order or dragging keys differ from React.

## Relationship

Child of #24. Found by #260. Distinct from #256 (keyboard-drag focus
trail / option remount). Broader DnD export/host gaps stay on #84.
Do not start #254. Do not waive D-reorder (#256).
