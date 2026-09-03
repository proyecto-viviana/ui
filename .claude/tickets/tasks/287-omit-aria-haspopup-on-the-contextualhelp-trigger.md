---
id: 287
type: task
title: "Omit aria-haspopup on the ContextualHelp trigger to match S2 DialogTrigger"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 contextualhelp functional pass: React S2 trigger omits aria-haspopup; Solid hardcodes aria-haspopup=dialog",
    }
  - {
      state: open,
      at: 2026-09-03,
      note: "#260 searchfield: composed ContextualHelp trigger is the same. React omits aria-haspopup; Solid aria-haspopup=dialog. No new id.",
    }
  - {
      state: open,
      at: 2026-09-03,
      note: "#260 timefield: composed ContextualHelp trigger is the same. React omits aria-haspopup; Solid aria-haspopup=dialog. No new id.",
    }
  - {
      state: open,
      at: 2026-09-03,
      note: "#260 datefield: composed ContextualHelp trigger is the same. React omits aria-haspopup; Solid aria-haspopup=dialog. No new id.",
    }
  - {
      state: open,
      at: 2026-09-03,
      note: "#260 checkboxgroup: composed ContextualHelp trigger is the same. React omits aria-haspopup; Solid aria-haspopup=dialog. No new id.",
    }
---

On `/components/contextualhelp/`, the quiet icon trigger's accessible name,
size, and `aria-expanded` match. React omits `aria-haspopup`. Solid sets
`aria-haspopup="dialog"` on the ActionButton.

Upstream S2 `ContextualHelp` wraps `DialogTrigger` + quiet `ActionButton`
and does not set `aria-haspopup`. RAC `useOverlayTrigger({ type: "dialog" })`
omits it (same as the comparison Popover trigger). Solid
`packages/solid-spectrum/src/contextualhelp/index.tsx` hardcodes
`aria-haspopup="dialog"`. Assistive tech then announces a dialog popup on
Solid and a plain button on React.

This is not the Menu `true` vs `menu` token drift. DatePicker/DateRangePicker
calendar buttons already match `dialog` on both stacks.

## Evidence

`http://127.0.0.1:4341/components/contextualhelp/`,
`data-islands-mounted`. Closed default and after open:

- React: `button` name "Contextual help Help", `aria-expanded` false/true,
  no `aria-haspopup`.
- Solid: same name and expanded, `aria-haspopup="dialog"`.

Installed S2 `ContextualHelp.tsx` ActionButton has no `aria-haspopup`.
Open AX of the dialog subtree is otherwise identical.

## Done when

The comparison ContextualHelp trigger omits `aria-haspopup` on both stacks,
matching S2 DialogTrigger. A route walk fails if Solid still has
`aria-haspopup="dialog"` while React has none.

## Relationship

Child of #24. Found by #260. Distinct from Menu/ActionMenu `true` vs `menu`
(accepted on those routes) and from ComboBox input `aria-haspopup` (#248).
Do not start #254.
