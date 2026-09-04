---
id: 317
type: task
title: "Honor TagGroup selectionBehavior replace"
created: 2026-09-03
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 taggroup functional pass: ?selectionBehavior=replace pointer click and ArrowRight replace-select on React and always toggle-add on Solid; Ctrl-click additive matches the replace-plus-modifier contract only on React",
    }
  - {
      state: merged,
      at: 2026-09-03,
      note: "createTag uses createSelectableItem (selectItem honors replace and modifiers) and arrow selectOnFocus calls replaceSelection.",
    }
---

S2 TagGroup `selectionBehavior="replace"` replace-selects on click and
on arrow `selectOnFocus`. Solid TagGroup still toggle-selects: click
adds, Space adds, arrows move focus without changing selection.

`solidaria-components` TagGroup defaults `selectionBehavior` to
`"toggle"` and does not drive replace / selectOnFocus the way S2
`useGridList` does for this collection.

## Evidence

`http://127.0.0.1:4341/components/taggroup/?selectionBehavior=replace&allowsRemoving=false`,
islands mounted, one panel at a time. Default selectedKeys `landscape`.

Pointer:

|                   | React       | Solid                                                                     |
| ----------------- | ----------- | ------------------------------------------------------------------------- |
| click Portrait    | `portrait`  | `landscape,portrait`                                                      |
| click Night       | `night`     | still additive                                                            |
| Ctrl-click Travel | adds Travel | adds Travel (first-pass: React `portrait,night`; Solid `landscape,night`) |

Keyboard, Tab onto Landscape then ArrowRight:

|                   | React                      | Solid                       |
| ----------------- | -------------------------- | --------------------------- |
| after ArrowRight  | `portrait`, focus Portrait | `landscape`, focus Portrait |
| Space on Portrait | stays `portrait`           | `landscape,portrait`        |

Default `selectionBehavior=toggle` click/Space already match (not this
bug).

## Done when

`selectionBehavior="replace"` click replace-selects the pressed tag,
arrows selectOnFocus, and a modifier click adds, matching React. A
comparison-route walk on `?selectionBehavior=replace` fails if click
Portrait leaves `landscape,portrait`.

## Relationship

Child of #24. Found by #260. Distinct from #296 (GridList default
replace vs toggle — opposite default) and from #238 (`selectOnFocus`
on autoFocus). Do not start #254.
