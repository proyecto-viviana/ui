---
id: 319
type: task
title: "Fire TagGroup onAction on Enter, not on selection press"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 taggroup functional pass: default/single pointer fires Solid onAction and not React; Enter on a selected tag keeps React selection and toggles Solid off; selectionMode=none Enter fires React onAction and not Solid",
    }
---

S2 Tag `onAction` fires on Enter (and on press when `selectionMode` is
`none`). Pointer selection press does not fire it. Solid
`solidaria-components` Tag always calls `onAction` from the row
`onClick`, and Enter is treated as a selection press (toggle) instead
of an action.

## Evidence

`http://127.0.0.1:4341/components/taggroup/`, islands mounted.

Default multiple, click Portrait (selection already `landscape`):

|              | React                | Solid                |
| ------------ | -------------------- | -------------------- |
| selectedKeys | `landscape,portrait` | `landscape,portrait` |
| actionCount  | 0                    | 1                    |

Single `?selectionMode=single` click Portrait: same action split
(React 0, Solid 1); selection matches (`portrait`).

Keyboard, Tab → ArrowRight → Space → Enter (isolated):

|             | React                             | Solid                                     |
| ----------- | --------------------------------- | ----------------------------------------- |
| after Space | `landscape,portrait`, act 0       | `landscape,portrait`, act 0               |
| after Enter | stays `landscape,portrait`, act 0 | toggles Portrait off (`landscape`), act 0 |

`?selectionMode=none`, Tab → ArrowRight → Space → Enter:

|       | React            | Solid            |
| ----- | ---------------- | ---------------- |
| Space | no select, act 0 | no select, act 0 |
| Enter | act 1            | act 0            |

`selectionMode=none` pointer click Portrait fires `onAction` on both
(not this bug).

## Done when

Enter fires `onAction` without toggling selection; a selection press
does not. `selectionMode=none` Enter still fires `onAction`. A
comparison-route walk fails if default click Portrait increments Solid
`actionCount` or if none-mode Enter leaves it at 0.

## Relationship

Child of #24. Found by #260. Distinct from #54. Do not start #254.
