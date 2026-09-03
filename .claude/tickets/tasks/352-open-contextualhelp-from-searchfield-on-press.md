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
  - {
      state: open,
      at: 2026-09-03,
      note: "#260 timefield: same remount/never-open. Isolated pointer and Enter on ?withContextualHelp=true open React dialog Time help… opacity 1, aria-expanded=true, stable id; Solid aria-expanded=false, dialogs 0, focus BODY, ids solidaria-cl-246→258→263. TimeField also uses span data-slot=contextualHelp. No new id.",
    }
  - {
      state: open,
      at: 2026-09-03,
      note: "#260 datefield: same remount/never-open. Isolated pointer on ?withContextualHelp=true opens React dialog Date help 268×99 opacity 1 placement bottom dy8, aria-expanded=true, focus overlay; Solid aria-expanded=false, overlay absent, focus BODY. DateField.tsx also uses span data-slot=contextualHelp. No new id.",
    }
  - {
      state: open,
      at: 2026-09-03,
      note: "#260 checkboxgroup: same remount/never-open. Isolated Enter/Space/dispatch click on ?withContextualHelp=true open React dialog 268×120 opacity 1, aria-expanded=true, stable id; Solid aria-expanded=false, overlay absent, focus BODY, ids solidaria-cl-257→268. CheckboxGroup.tsx also uses span data-slot=contextualHelp. Playwright locator.click intercepts (same remount). No new id.",
    }
  - {
      state: open,
      at: 2026-09-03,
      note: "#260 slider: same remount/never-open. Isolated click and Enter on ?withContextualHelp=true open React dialog Volume helpChoose an output level. 268×99 opacity 1, aria-expanded=true, focus DIV; Solid aria-expanded=false, dialogs 0, focus BODY. Slider.tsx also uses span data-slot=contextualHelp. No new id.",
    }
  - {
      state: open,
      at: 2026-09-03,
      note: "#260 radiogroup: same remount/never-open. ?withContextualHelp=true click/Enter open React dialog Plan help… 268×120 opacity 1 placement bottom, aria-expanded=true, stable id react-aria…-_r_6_; Solid aria-expanded=false, overlay absent, focus BODY, ids solidaria-cl-233→247. packages/solid-spectrum/src/radio/index.tsx also uses span data-slot=contextualHelp. No new id.",
    }
  - {
      state: open,
      at: 2026-09-03,
      note: "#260 rangeslider: same remount/never-open. Isolated click and Enter on ?withContextualHelp=true open React dialog Range helpChoose minimum and maximum values. 268×120 opacity 1, aria-expanded=true, focus DIV; Solid aria-expanded=false, dialogs 0, focus BODY. RangeSlider.tsx also uses span data-slot=contextualHelp. No new id.",
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

|                                 | React                                                                     | Solid                                                         |
| ------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Enter / Space / force-click     | `aria-expanded=true`, dialog opacity 1, "Search syntaxUse project names…" | `aria-expanded=false`, dialogs 0, focus BODY                  |
| trigger `id` across activations | stable                                                                    | remounts (`solidaria-cl-241` → `246` → `251` → `256` → `261`) |

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
