---
id: 51
type: task
title: "Port submenu state into createMenuState"
created: 2026-08-20
parent: 31
status: verified
history:
  - { state: open, at: 2026-08-20, note: "migrated from legacy task port-submenu-state" }
  - {
      state: verified,
      at: 2026-10-08,
      note: "createMenuTriggerState keeps the upstream expandedKeysStack, and createSubmenuTriggerState freezes its level against that stack. collections.test.ts covers sibling replace, mismatched close, root close, toggle, and closeAll.",
    }
---

Mirror the upstream submenu state in `createMenuState` at the state layer.

## Done when

Submenu state and its transitions match upstream and have regression evidence.

## Relationship

Replaces `port-submenu-state` from the retired tech-debt note.
