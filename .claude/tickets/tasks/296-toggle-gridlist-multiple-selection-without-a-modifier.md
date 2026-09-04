---
id: 296
type: task
title: "Toggle GridList multiple selection without a modifier"
created: 2026-09-03
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 gridlist functional pass: RAC multiple click/Space toggles add (Read+Write); Solid replace-selects the last row. GridList/createGridList default selectionBehavior to replace instead of the state-layer toggle default",
    }
  - {
      state: merged,
      at: 2026-09-03,
      note: "Omitted selectionBehavior no longer forces replace; createGridState toggle default applies. Click Read then Write keeps both selected.",
    }
---

RAC GridList multiple selection defaults to `selectionBehavior="toggle"`:
a second click or Space adds the focused row. Solid
`solidaria-components` GridList passes
`selectionBehavior: props.selectionBehavior ?? "replace"` into
`createGridState`, and `createGridList` repeats the same replace default,
so an omitted prop locks replace instead of the state-layer toggle
default.

## Evidence

`http://127.0.0.1:4341/components/gridlist/?selectionMode=multiple`,
islands mounted, one panel at a time.

Pointer: click Read, then click Write (no modifier).

|          | React       | Solid |
| -------- | ----------- | ----- |
| selected | Read, Write | Write |

Keyboard: Tab → Space on Read → ArrowDown → Space on Write.

|                    | React       | Solid |
| ------------------ | ----------- | ----- |
| after first Space  | Read        | Read  |
| after second Space | Read, Write | Write |

Shift-click range and Ctrl-click additive both match. Single-mode click
toggle-off matches. `createGridState` itself still defaults to `toggle`
when the prop is omitted.

## Done when

Default multiple GridList click and Space add to the selection without a
modifier, matching React. A comparison-route walk on
`?selectionMode=multiple` fails if click Read then Write leaves only
Write selected. Do not hardcode `replace` when the consumer omits
`selectionBehavior`.

## Relationship

Child of #24. Found by #260. Distinct from #101 (prove replace↔toggle
state transitions) and #238 (`selectOnFocus` replace). Do not start #254.
