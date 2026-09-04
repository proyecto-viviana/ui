---
id: 228
type: task
title: "Port NavigationTree"
created: 2026-09-02
parent: 34
status: open
history:
  - { state: open, at: 2026-09-02, note: "opened from the 2026-09 upstream train source diff" }
---

## Cause

RAC 1.21.0 adds NavigationTree, a hierarchical link tree for sidebars. Source
is new at `packages/react-aria-components/src/NavigationTree.tsx:130` on
`f56660b` (481 lines) with exports `NavigationTree`, `NavigationTreeItem`,
`NavigationTreeItemContent`, `NavigationTreeSection`, `NavigationTreeHeader`,
`NavigationTreeContext`, `NavigationTreeItemStateContext`. Tests:
`packages/react-aria-components/test/NavigationTree.test.tsx` (584 lines).
Release note: "Add NavigationTree component". S2 SideNav now wraps this
primitive (`packages/@react-spectrum/s2/src/SideNav.tsx`); that rewrite is a
note on #126, not this ticket. `guard:rac-export-gap` reports all seven
value exports missing. `guard:upstream-test-parity` added unmatched suite
`navigationtree`.

## Work

Port the headless NavigationTree family in solidaria-components from the
pinned RAC source. Reuse the shared collection, keyboard, and focus spine.
Do not stub the barrel. S2 SideNav consumption stays on #126.

## Done when

Every NavigationTree export and every observable branch has strict API, ARIA,
keyboard, focus, SSR, hydration, and browser evidence against
`NavigationTree.test.tsx` at `f56660b`. `guard:rac-export-gap` no longer lists
these names.

## Relationship

Child of #220. Unblocks #126 (SideNav now composes NavigationTree).
