---
id: 191
type: task
title: "Reset sharedConfig in a shared hydrate helper and add the Kumo Button hydrate reader"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
---

## Cause

`packages/viviana-ui/test/Tree.hydrate.test.tsx:26-41` documents that a
mid-hydration throw leaves Solid's module-global `sharedConfig` dirty, and
the next `hydrate()` silently client-renders instead of claiming server
nodes, so every later assertion passes without testing hydration. Only that
file resets `sharedConfig.context / done / registry`. Form, Collections
(#134's file), Button, Meter, Breadcrumbs, Picker, TextField, and TagGroup
only install `_$HY`. Phase 0 Form.hydrate is `7 tests | 1 failed`: the
TextField case threw (#184), then Form+TextArea / Picker / two-Buttons
reported green. Those greens are not evidence.

Separately, `packages/kumo/test/Button.ssr.test.tsx:1-5` says a companion
`Button.hydrate.test.tsx` hydrates over `output/kumo-button-ssr.html`. That
companion does not exist, so a Kumo Button SSR/hydrate mismatch cannot
redden any suite even after #160.

## Work

Move `installHydrationGlobals` plus the Tree reset into one shared hydrate
helper (test-utils) and use it from every `*.hydrate.test.*`. Add
`packages/kumo/test/Button.hydrate.test.tsx` that hydrates over the SSR
writer's output and asserts no mismatch plus a press after hydration.

## Done when

No hydrate file installs `_$HY` by hand; a deliberately thrown first case no
longer lets later cases pass; the Kumo reader exists and is in #160's
ordered run.

## Relationship

F-SSR-006/007. Prerequisite for #160 to mean anything. Not #134's selection
bug.
