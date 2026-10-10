---
"@proyecto-viviana/solidaria-components": patch
---

Document TableCell children authoring in Solid: read the stable state object's live getters inside reactive JSX, such as `(state) => <span>{state.isFocused ? "Focused" : ""}</span>`. Unlike React render callbacks, the cell child callback does not rerun on state changes to refresh destructured booleans; destructuring outside reactive expressions snapshots those values. Add preservation controls for live getter reads and stateful children on default and custom hosts. This documents the existing runtime behavior.
