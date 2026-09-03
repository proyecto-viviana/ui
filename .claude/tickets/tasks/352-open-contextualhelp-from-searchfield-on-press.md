---
id: 352
type: task
title: "Open ContextualHelp from SearchField on press"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 searchfield functional pass: isolated Enter/Space/pointer/force-click open React dialog Search syntax; Solid stays aria-expanded=false, no role=dialog, focus BODY, and the help button remounts (solidaria-cl-241→246→251→256→261)",
    }
---

S2 SearchField puts `contextualHelp` through `FieldLabel`, which wraps
it in `ContextualHelpContext.Provider` and keeps the trigger stable
across field updates. Pointer, Enter, and Space on the quiet help
button open a `role=dialog` popover ("Search syntax…") and set
`aria-expanded=true`.

Solid Spectrum `SearchField` renders `{local.contextualHelp}` in a
`<span data-slot="contextualHelp">` inside the headless SearchField
render-prop children. Pressing the trigger remounts the button (new
`id` each activation) and never opens the overlay. Focus lands on
`BODY` because the focused node was disposed. Standalone
`/components/contextualhelp/` opens on both stacks.

## Evidence

`http://127.0.0.1:4341/components/searchfield/?withContextualHelp=true`,
`data-islands-mounted`. Other `.s2-framework-panel` `visibility:hidden`.
Help is 20×20, `pointer-events:auto`, Tab order Before → Help → input
→ After on both.

| | React | Solid |
|---|---|---|
| Enter / Space / force-click | `aria-expanded=true`, dialog opacity 1, "Search syntaxUse project names…" | `aria-expanded=false`, dialogs 0, focus BODY |
| trigger `id` across activations | stable | remounts (`solidaria-cl-241` → `246` → `251` → `256` → `261`) |

S2 `Field.tsx:175-184` provides `ContextualHelpContext`. Solid
`packages/solid-spectrum/src/searchfield/index.tsx` does not.

## Done when

A SearchField with `contextualHelp` opens and dismisses the help
popover on pointer and keyboard the same as S2, without remounting the
trigger. A comparison-route walk fails if Solid stays closed while
React shows `role=dialog`.

## Relationship

Child of #24. Found by #260. Distinct from standalone ContextualHelp
open (already equivalent), #287 (`aria-haspopup`), #286 (live
placement), and #70 (FieldLabel extraction; URL invalid already
matches). Same `data-slot="contextualHelp"` span exists on other
fields; this route is the one that wires the control. Do not start
#254.
