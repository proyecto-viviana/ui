---
id: 542
type: task
title: "Correct Solid 2 SSR and hydration test compilation"
created: 2026-09-19
parent: 531
status: merged
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
  - {
      state: in-progress,
      at: 2026-09-19,
      note: "owner approved four-path product extension over cf65504b: createDescription, createScrollIntoViewOnFocus, createInteractionModality, and Viviana Breadcrumbs. Preserve SSR/client primitive allocation, browser effects, cleanup and behavior; further owners and the Spectrum Breadcrumbs twin require named scope. No full-task closure or #536 retirement is inferred",
    }
  - {
      state: in-progress,
      at: 2026-09-19,
      note: "approved repair passes fresh focused SSR 18/18, then a refreshed Breadcrumbs fixture 1/1 after fixing its current-item initial snapshot; focused hydration is now 18/22, resolving 13 of the former 17 failures without changing assertions. Hook behavior is 49/49. Remaining focused failures are Virtualizer wrapper, element-child ListBox, static ListView, and Tabs. Full lanes are not rerun while this focused gate is red; additional named owner paths and the Spectrum Breadcrumbs twin remain requested. See execution receipt for exact commands and diagnostics",
    }
  - {
      state: in-progress,
      at: 2026-09-19,
      note: "owner approved the next nine named paths: Spectrum Breadcrumbs twin, static GridList, tabbable-child lifecycle, Virtualizer, three option consumers, renderer utility and its owning test. Existing Collections hydrate-test scope adds a complementary client mutation regression. Focused fresh SSR 5/5 and hydrate 14/14 pass; fresh complete SSR 48/48 then hydration 56/56 pass sequentially with one worker, retaining all original expectations. Independent source reviews found no blockers; exact commands and remaining acceptance are in the receipt. Not merged or verified; #536 and #531 remain open",
    }
  - {
      state: in-progress,
      at: 2026-09-19,
      note: "additional owning ordinary proof is 165/171: six retained-DOM failures in Spectrum Breadcrumbs and Viviana Tabs, both lacking explicit testing-library cleanup. All six pass individually; independent review confirms stale prior fixtures in the combined log, while the precise automatic-hook registration cause remains unverified. Request exactly those two owning test paths for afterEach(cleanup), then rerun both full files and the unchanged five-file command. No query narrowing or assertion weakening; these test paths remain unedited pending authorization. Fresh complete SSR/hydrate remain green, but acceptance remains open",
    }
  - {
      state: in-progress,
      at: 2026-09-19,
      note: "owner authorized the exact two-path ordinary-test cleanup extension. Imported afterEach(cleanup) in Spectrum Breadcrumbs and Viviana Tabs preserves all queries/assertions and resolves retained prior-test DOM: both complete files pass 11/11 and the unchanged five-file owning command passes 171/171. Fresh complete SSR 48/48 then hydration 56/56 pass sequentially with one worker. Read-only review found no issue; no additional product/helper/config change. Ready for conductor review, not merged or verified; #536/#531 requirements remain",
    }
  - {
      state: merged,
      at: 2026-09-19,
      note: "owner authorized this worker to commit and push the bounded repair; transition takes effect with this implementation commit. Unchanged source/test diff 9504514c5698e41ab8caa58b5888d56921e1b2a034ef13a44d6dbdb3797de5df passes fresh single-worker SSR 48/48 then hydration 56/56, owning ordinary 171/171 and typecheck. Direct docs checks pass; authorized outside-sandbox ecosystem rerun passes 38/38. Final review identifies incomplete direct node-identity coverage against Done when 6 in async-only migrated tests; retain that requirement and do not mark verified. #536 stays open and #531 in-progress",
    }
  - {
      state: merged,
      at: 2026-09-19,
      note: "owner approved the exact 18-file additive identity-proof continuation over 92ddc52b. All 36 SSR-to-hydrate cases now capture nonempty semantic server nodes and require exact object identity before interactions; original expectations and complementary CSR coverage remain. Fresh focused SSR passes 36/36, but focused hydration is 33/37: standalone Picker, Form+Picker, DatePicker and PreviewTrigger replace server nodes. Independent assertion review finds no weakening or scope violation. Retain the failing checks; product diagnosis and a new named-path extension are required. Complete lanes are not rerun while focused proof is red, and this already-merged task remains unverified",
    }
  - {
      state: merged,
      at: 2026-09-19,
      note: "owner instructed autonomous planning/execution without per-step permission; exact snapshot tracing identifies nested followRef eager initialization as the shared cause of all four replacement failures. A computed signal initializer owns that read while retaining effect and settled-ref refresh. New owning regression fails on old initialization and passes on the fix, proving node identity, single construction, adopted ref, interaction and disposal. Fresh complete SSR passes 49/49 then hydration 57/57 with one worker; all original expectations and 18-file identity additions remain. Source review finds no blockers; remaining checks are recorded in the receipt. #536 and #531 are not completed by this bounded repair",
    }
  - {
      state: merged,
      at: 2026-09-19,
      note: "final autonomous continuation retains all identity/behavior expectations and adds successful post-hydration DatePicker/PreviewTrigger opening proof with root-before-portal teardown. Baseline-controlled ordinary stalls exposed missing explicit cleanup in Spectrum Picker; adding it preserves all queries and makes the original eight-file owning command pass 214/214. Fresh complete SSR 49/49 (27.59s) then hydration 57/57 (12.86s) pass sequentially with one worker. Read-only source/test reviews find no blockers; final static/docs and source identity are in the execution receipt. #536 and #531 remain open to their full acceptance requirements",
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
or #531. On 2026-09-19 the owner approved the following bounded product repair
for failures revealed by the honest verifier:

- `packages/solidaria/src/utils/createDescription.ts`
- `packages/solidaria/src/selection/createScrollIntoViewOnFocus.ts`
- `packages/solidaria/src/interactions/createInteractionModality.ts`
- `packages/viviana-ui/src/breadcrumbs/index.tsx`

Keep effect/root allocation aligned and current-item initialization faithful
without changing descriptions, scrolling, modality, cleanup, or overflow.
Other product-source repair still requires a separate named-path extension.

The owner's subsequent 2026-09-19 approval adds these exact paths:

- `packages/solid-spectrum/src/breadcrumbs/index.tsx`
- `packages/viviana-ui/src/gridlist/index.tsx`
- `packages/solidaria/src/focus/createHasTabbableChild.ts`
- `packages/solidaria-components/src/Virtualizer.tsx`
- `packages/solidaria-components/src/ListBox.tsx`
- `packages/solidaria-components/src/ComboBox.tsx`
- `packages/solidaria-components/src/Select.tsx`
- `packages/solidaria-components/src/utils.tsx`
- `packages/solidaria-components/test/utils.test.tsx`

The existing authorized `packages/viviana-ui/test/Collections.hydrate.test.tsx`
also proves static registration add/remove, retained row identity and selection,
and disabled/re-enabled behavior. Keep slot ownership, live render props,
zero-argument accessors, focus order, cleanup, and intentional styled differences.
This bounded repair is not general One-Read/context-ID retirement.

The final 2026-09-19 owner-approved test-only extension adds explicit
testing-library lifecycle cleanup in these owning ordinary suites, preserving
all test cases, queries and assertions:

- `packages/solid-spectrum/test/Breadcrumbs.test.tsx`
- `packages/viviana-ui/test/Tabs.test.tsx`

The subsequent owner-approved identity-proof continuation adds direct semantic
node-reference checks in the 18 existing hydrate files listed in the dated
execution receipt. It changes tests only, not products, helpers or configs.
The four replacement failures it exposes were repaired under the owner's
subsequent autonomous-execution instruction on 2026-09-19. Runtime snapshot
tracing narrowed the actual owner to `packages/solidaria/src/utils/refs.ts`:
nested `followRef` initialization must own its initial reactive read. The
bounded regression paths are `packages/solidaria/test/refs.test.tsx`,
`packages/solidaria/test/refs.ssr.test.tsx`,
`packages/solidaria/test/refs.hydrate.test.tsx`, and
`packages/solidaria/test/fixtures/followRef.tsx`. No Provider, FocusableProvider,
DateField, description, or slot-ID workaround is needed. Prior green proof
without identity assertions remains historical, not acceptance of them.

The same autonomous continuation adds explicit `afterEach(cleanup)` in
`packages/solid-spectrum/test/Picker.test.tsx`. Its unchanged combined owning
suite stalled with both the old and corrected ref initialization, while the
old-ref log also exposed retained prior fixtures (multiple matching buttons).
All 21 cases passed in isolation. Explicit cleanup preserves every query and
assertion and makes the unchanged five-file command pass 188/188. The complete
eight-file rerun and fresh full lanes are recorded in the execution receipt.

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
