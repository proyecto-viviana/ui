---
id: 353
type: task
title: "Name the SearchField ContextualHelp trigger Search Help"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 searchfield functional pass: S2 FieldLabel sets aria-labelledby to label id + help id so Chromium AX is button Search Help; Solid span has no ContextualHelpContext so AX is button Help",
    }
---

S2 `FieldLabel` wraps `contextualHelp` in
`ContextualHelpContext.Provider` with `aria-labelledby` equal to
`${labelProps.id} ${contextualHelpId}`. Chromium AX of the quiet
trigger is `button "Search Help"`.

Solid SearchField renders the same child in a plain
`<span data-slot="contextualHelp">` and never provides that context.
The trigger keeps `aria-label="Help"` and no `aria-labelledby`. AX is
`button "Help"`. Assistive tech then announces a different name than
S2.

## Evidence

`http://127.0.0.1:4341/components/searchfield/?withContextualHelp=true`,
islands mounted. Rest AX:

```
React: - text: Search / - button "Search Help" / - group / searchbox "Search"
Solid: - text: Search / - button "Help"        / - group / searchbox "Search"
```

React trigger: `aria-label="Help"` plus `aria-labelledby` of the
Search label id and the help button id. Solid: `aria-label="Help"`,
`aria-labelledby` omitted. Both 20×20, visible, `tabIndex=0`.

Installed S2 `Field.tsx:175-184`. Solid
`packages/solid-spectrum/src/searchfield/index.tsx` label wrapper.

## Done when

The comparison SearchField help trigger's accessible name is
`Search Help` on both stacks, matching S2 FieldLabel. A route walk
fails if Solid stays `Help` while React is `Search Help`.

## Relationship

Child of #24. Found by #260. Distinct from #287 (`aria-haspopup`
dialog vs omitted) and from #352 (press never opens). Distinct from
#70 (shared FieldLabel extraction; this is the observable name on
SearchField). Do not start #254.
