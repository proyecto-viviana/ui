---
id: 316
type: task
title: "Keep focus on the next tag after remove"
created: 2026-09-03
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 taggroup functional pass: Delete, Backspace, or pointer-remove Landscape moves React focus to Portrait at tabIndex 0; Solid blurs to BODY and leaves remaining rows with no focusedKey",
    }
  - {
      state: merged,
      at: 2026-09-03,
      note: "createTag removeAndRestoreFocus sets the next focusedKey and DOM-focuses that row after the collection commits, so Delete/Backspace/Remove leave tabIndex 0 on the next tag.",
    }
---

S2 TagGroup keeps roving focus on the next tag after a remove. Solid
`createTag` Delete/Backspace and `removeButtonProps.onPress` call
`onRemove` and never `state.setFocusedKey` / `.focus()` the next row, so
the removed node takes focus with it.

## Evidence

`http://127.0.0.1:4341/components/taggroup/`, islands mounted, one panel
at a time. Default: Landscape selected, four removable tags. Tab onto
Landscape, then Delete (or click Remove Landscape):

|              | React                                                                          | Solid                                      |
| ------------ | ------------------------------------------------------------------------------ | ------------------------------------------ |
| tags         | Portrait, Travel, Night                                                        | same                                       |
| selectedKeys | empty                                                                          | empty                                      |
| focus        | Portrait `role=row` `tabIndex=0` (Delete also `data-focus-visible` + 2px ring) | `BODY`; remaining rows all `tabIndex=-1`   |
| next Tab     | Portrait's Remove                                                              | a Remove with rows still all `tabIndex=-1` |

Pointer-remove is the same focus loss; remaining Solid rows stay
`tabIndex=0` because `focusedKey` is null. Both stacks drop Landscape
from the collection.

## Done when

Delete, Backspace, and Remove on the focused tag leave DOM focus and
roving `tabIndex=0` on the next remaining tag, matching React. A
comparison-route keyboard walk fails if Solid focus is `BODY` after
removing Landscape.

## Relationship

Child of #24. Found by #260. Distinct from #54 (spine rewrite) and
#63 (remove pressScale). Do not start #254.
