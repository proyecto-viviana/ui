---
id: 536
type: task
title: "Re-architect SSR hydration and retire the One-Read Rule"
created: 2026-09-13
parent: 531
status: open
history:
  - {
      state: open,
      at: 2026-09-13,
      note: "opened under #531 to adopt Solid 2 marker-based streaming hydration and retire context ID workarounds",
    }
---

## Cause

Solid 1.x's sequential context ID counter (`sharedConfig.getNextContextId()`)
forces the brittle "One-Read Rule" for `props.children` to prevent client/server
hydration desynchronization. Solid 2.0 introduces element-anchored / marker-based
streaming hydration.

## Work

1. Update SSR and hydration harness tests (`vitest.ssr.config.ts`,
   `vitest.hydrate.config.ts`).
2. Test complex component trees with conditional children and render props under
   Solid 2.0 streaming hydration.
3. Remove defensive one-read memo wrappers where Solid 2.0 hydration handles
   multiple reads natively.

## Done when

All SSR and hydrate test suites pass without hydration key desynchronization
errors or context ID counter leaks.

## Relationship

Child of #531. Sibling of #535.
