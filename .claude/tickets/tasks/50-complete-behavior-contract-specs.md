---
id: 50
type: task
title: "Complete behavior contract specs"
created: 2026-08-20
parent: 24
status: in-progress
history:
  - { state: open, at: 2026-08-20, note: "migrated from legacy task contract-spec-burndown" }
  - {
      state: in-progress,
      at: 2026-10-08,
      note: "Breadcrumbs keyboard, focus, and current-page contract landed in packages/solid-spectrum/test/Breadcrumbs.test.tsx (11 passed). Tab stays on links, Enter activates the focused crumb, the current item is aria-current=page and not a tab stop, a disabled crumb leaves the tab order, and the overflow menu opens from ArrowDown, selects on Enter, and restores focus on Escape. The remaining visual-only components stay open.",
    }
---

Add keyboard, focus, and announcement contract specs for the 59 components that
had visual evidence only when this task was filed.

## Done when

Each in-scope component has regression evidence for its user-observable
behavior branches under the component playbook.

## Relationship

Replaces `contract-spec-burndown` from the retired tech-debt note. Its
legacy spine prerequisites are complete; verify the current report before
selecting the next component.
