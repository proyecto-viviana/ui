---
id: 69
type: task
title: "Delegate ContextualHelp popovers to one component"
created: 2026-08-20
parent: 33
status: open
history:
  - {
      state: open,
      at: 2026-08-20,
      note: "migrated from legacy task contextualhelp-popover-delegation",
    }
---

Make `ContextualHelp` render its sibling `ContextualHelpPopover` instead of
duplicating the popover frame and context wiring inline.

Remove the `SubmenuTrigger` and `end top` placement defaults from the general
`ContextualHelpPopover`. Those defaults belong to the unavailable-menu-item
path, not the plain upstream Popover. Preserve the standalone trigger defaults
for `ContextualHelp`: `bottom start`, container padding 8, and offset 8.

## Done when

Both paths share one upstream-aligned implementation and their behavior,
structure, and visual evidence pass.

## Relationship

Replaces `contextualhelp-popover-delegation` from
`.claude/current/tech-debt.md`.
