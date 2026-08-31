---
id: 86
type: task
title: "Wire autocomplete into the shared collection spine"
created: 2026-08-20
parent: 34
status: open
blocked: true
history:
  - {
      state: open,
      at: 2026-08-20,
      note: "migrated from legacy task autocomplete-collection-bridge",
    }
---

Connect `SearchField`, `ListBox`, and `Menu` to the autocomplete contexts.
Do not add separate per-widget consumers.

## Blocker

The shared collection spine does not yet provide all required behavior:

- a shared selectable-collection controller must receive the autocomplete
  focus and clear-focus events and apply `autoFocus` on mount;
- filtered list state must accept the autocomplete filter;
- collection consumers must read the existing autocomplete contexts.

The context providers and controller exist. The hard gaps are the shared
selectable-collection behavior and filtered list state. Resume this task after
the applicable shared-spine tasks land.

## Done when

The collection consumers use the shared upstream-shaped primitives. Focus,
virtual focus, filtering, and context/ref merging have regression evidence.

## Relationship

Replaces `autocomplete-collection-bridge`. The detailed 2026-06-21 source
reconciliation remains in Git history.
