---
id: 542
type: task
title: "Correct Solid 2 SSR and hydration test compilation"
created: 2026-09-19
parent: 531
status: in-progress
history:
  - {
      state: open,
      at: 2026-09-19,
      note: "opened under #531 for the bounded Solid 2 test-mode compiler/harness defect and its Disclosure/Meter assertion-layer fallout",
    }
  - {
      state: in-progress,
      at: 2026-09-19,
      note: "explicit hydratable compilation and focused Kumo/Disclosure/Meter proof pass; complete SSR passes 47/47, while complete hydration remains 33/41 and requires separately authorized follow-up paths",
    }
  - {
      state: in-progress,
      at: 2026-09-19,
      note: "authorized helper/test extension now follows Solid 2's deferred lifecycle and passes its 10-test negative/cleanup suite; fresh SSR passes 48/48, while the fail-closed full hydrate lane exposes 17 product-owner failures (33/50 pass), documented with a named-path extension request",
    }
  - {
      state: in-progress,
      at: 2026-09-19,
      note: "review follow-up rejects structure-mismatch warnings, preserves exact falsy teardown errors, and makes registry/lifecycle tests independent; 15 helper regressions pass and the formerly dependent pair passes alone; fresh SSR is 48/48 and hydration 38/55 with the same 17 failures. Earlier direct-product-owner attribution was too broad: the extension request is narrowed to three shared hooks and Breadcrumbs; static ListView and Tabs still need diagnosis. Product edits remain unauthorized and full acceptance remains open",
    }
---

## Scope

Correct the Solid test-mode compiler/harness defect, its Disclosure/Meter
assertion-layer fallout, and the authorized test-only Solid 2 lifecycle
migration: fail-closed deferred verification, exact global/console restoration,
owned disposer cleanup, a real SSR-generated negative fixture, node-identity
adoption proof, and correct reactive/effect settlement in existing hydrate
tests.

Product behavior or API changes, dependencies, broad one-read/context-workaround
retirement, and SlotContext work are non-goals. This task does not complete #536
or #531. Product-source repair for failures revealed by the honest verifier
requires a separate named-path extension.

## Work

1. Compile both server and client test transforms with hydration markers while
   preserving their environment-specific code generation.
2. Keep the shared helper's temporary hydration state installed through Solid
   2's deferred microtask/timer work, require the installed verifier and a
   callable disposer, and preserve the primary error across verification and
   cleanup.
3. Prove setup throws, real fixture throws, falsy throws, missing verification,
   diagnostic-plus-cleanup failure, prior-global restoration, subsequent valid
   identity, and shared successful-root teardown.
4. Await the async helper throughout the hydrate corpus and replace obsolete
   marker-presence assertions with complete before/after node identity without
   weakening behavior, ARIA, focus, or reactivity expectations.

## Done when

1. Both Vitest configs explicitly compile Solid tests with
   `solid: { hydratable: true }`.
2. Focused Kumo Button SSR writes a fresh marker-bearing fixture and focused
   Kumo Button hydration passes against it.
3. Disclosure proof uses `createDisclosureState` with `createDisclosure`,
   asserting the hook's string `aria-hidden` tokens and boolean/absent `hidden`
   prop before checking their serialized DOM attributes.
4. Meter SSR and hydration preserve the full `role="meter progressbar"`
   fallback token contract, with hydration selecting `[role~="meter"]`.
5. The shared helper catches Solid 2 key/tag/structure/unclaimed diagnostics through the
   deferred verifier, restores exact global/console state on every branch, and
   disposes failed roots immediately and successful roots at test teardown.
   Teardown attempts every root and rethrows the exact first error, including
   falsy thrown values; its regressions pass independently of test order.
6. Its fresh negative fixture and all migrated hydrate tests prove adoption by
   server-node identity while retaining existing behavior expectations.
7. Complete SSR and hydration suites pass with bounded workers and without a
   stale fixture substitution.
8. Relevant typecheck and documentation-current checks pass, or an unrelated
   pre-existing failure is isolated honestly.

## Relationship

Child of #531 and the harness/evidence prerequisite for #536. Independent of
#535. It does not satisfy #536's remaining complex conditional/render-prop
coverage or inventory and removal of eligible Solid 1 one-read/context-ID
workarounds.
