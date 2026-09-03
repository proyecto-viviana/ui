---
id: 387
type: task
title: "Honor useActionGroupItem onPress in the React ActionGroup fixture"
created: 2026-09-03
parent: 26
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 actiongroup functional pass: the React oracle strips onPress from useActionGroupItem so pointer/Space/Enter never call selectionManager.select. Isolated ?selectionMode=single&defaultSelectedKeys=italic click/Space Bold: React stays Italic checked, Solid moves aria-checked to Bold. Multiple click Italic: React stays bold+underline, Solid toggles italic on. selectionMode=none click/Space/Enter match (no aria-checked). D5/D6 never press; the functional pass does. useActionGroupItem only returns onPress, not a DOM onClick",
    }
---

The ActionGroup React panel is the react-aria
`useActionGroup` / `useActionGroupItem` hook oracle, hand-wired as
bare `<button>`s because S2 1.5.x ships no ActionGroup. The fixture
drops `onPress` (`onPress` is not a DOM listener; spreading it is a
React unknown-prop) and never calls `useButton` / `usePress`, so
`selectionManager.select` never runs.

Solid `createActionGroupItem` wires `createButton` `onPress` and
does select. Keyboard roving (arrows, wrap, Home/End no-op, RTL
horizontal flip, disabled-key skip on URL remount) already pair-diffs
without this.

## Evidence

`http://127.0.0.1:4341/components/actiongroup/`, islands mounted.
Other `.s2-framework-panel` `visibility:hidden` + `inert`.

`?selectionMode=single&defaultSelectedKeys=italic` rest: both Italic
`aria-checked=true`. Isolated click Bold / Tab then Space:

| | React | Solid |
|---|---|---|
| Bold `aria-checked` | `false` | `true` |
| Italic `aria-checked` | `true` | `false` |
| focus | Bold | Bold |

`?selectionMode=multiple&defaultSelectedKeys=bold,underline` isolated
click Italic: React stays `true,false,true`; Solid
`true,true,true`. Solid Space on Italic and Enter on Underline also
toggle; React Space/Enter leave the rest selection.

`selectionMode=none` click/Space/Enter: both stay unnamed buttons,
focus follows the press. `onAction` is not routed.

`apps/comparison/src/components/react/fixtures/styled/actiongroup.js`
`ReactActionGroupItem` strips `onPress` by design for D5/D6.

## Done when

The React ActionGroup fixture activates `useActionGroupItem`'s
`onPress` (via `useButton` / `usePress` or an equivalent DOM press)
so click, Space, and Enter call `selectionManager.select` like the
hook. A comparison walk fails if Solid selects Bold and React leaves
Italic checked. Roving focus stays on D5. Do not start #254.

## Relationship

Child of #26. Found by #260. Not a Solid port bug: isolated Solid
pointer and Space/Enter already match `useActionGroupItem`. The
oracle just never fires that callback.
