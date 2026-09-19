---
id: 536
type: task
title: "Re-architect SSR hydration and retire the One-Read Rule"
created: 2026-09-13
parent: 531
status: in-progress
history:
  - {
      state: open,
      at: 2026-09-13,
      note: "opened under #531 to adopt Solid 2 marker-based streaming hydration and retire context ID workarounds",
    }
  - {
      state: open,
      at: 2026-09-19,
      note: "compiler-harness repair and assertion-layer fallout moved to #542; #536 stays open for complex conditional/render-prop coverage plus inventory and justified retirement of eligible Solid 1 one-read/context-ID workarounds",
    }
  - {
      state: open,
      at: 2026-09-19,
      note: "#542's fail-closed Solid 2 helper now exposes 17 product hydration failures after a 48/48 fresh SSR pass; their separately requested repair does not satisfy this task's remaining conditional/render-prop coverage or workaround inventory/removal",
    }
  - {
      state: open,
      at: 2026-09-19,
      note: "#542 review corrected remaining structure-warning, cleanup-error, and regression-isolation gaps; fresh SSR remains 48/48 and hydration is 38/55 with 17 failures. Shared-hook source evidence narrows the proposed product extension without authorizing edits or completing this task's separate coverage and workaround inventory/removal",
    }
  - {
      state: open,
      at: 2026-09-19,
      note: "owner-approved four-path #542 product repair reduces focused hydration failures from 17 to four, with fresh focused SSR and unchanged assertions. This task remains open: complete lanes, conditional/render-prop coverage and justified workaround inventory/removal are still required. Same-file latent createFocusVisible/useIsKeyboardFocused server-only early returns are deferred inventory, not silently repaired or declared covered",
    }
  - {
      state: open,
      at: 2026-09-19,
      note: "#542's owner-approved next extension now passes fresh complete SSR 48/48 then hydration 56/56 with one worker and unchanged original expectations. This satisfies that harness lane, not this task: explicit eligible Solid 1 workaround inventory, justified removals and complex conditional/render-prop coverage still require named-path admission. No retirement or task closure is inferred",
    }
  - {
      state: open,
      at: 2026-09-19,
      note: "#542 now also passes its complete owning ordinary proof after authorized two-test lifecycle cleanup, with fresh full SSR 48/48 then hydration 56/56. This task remains open for explicit eligible workaround inventory, justified removal and complex conditional/render-prop coverage under separately named admission; the green bounded harness does not close it",
    }
  - {
      state: open,
      at: 2026-09-19,
      note: "coordination: #542's stricter identity proof exposed four replacements, now repaired by owning nested followRef's initial reactive read. Fresh full SSR 49/49 and hydration 57/57 pass, including new ref regression that fails with the old implementation. This does not inventory or justify removing eligible Solid 1 workarounds and does not close this task's conditional/render-prop coverage; those requirements remain",
    }
  - {
      state: in-progress,
      at: 2026-09-19,
      note: "owner-directed autonomous foundation slice inventories remaining workaround families and retires ElementTag's obsolete Solid 1.9.14 static-tag switch using native Solid 2 dynamic. New conditional/render-prop/Provider coverage proves SSR adoption, node identity, live updates and delayed creation; old-source controls expose fallback component-attribute override and independent owning-test cleanup gaps. Fresh complete SSR 51/51 then hydration 59/59 and affected ordinary 183/183 pass with one worker. Full task remains in-progress: stale hydration-state guards, allocation-parity suspects, stale documentation and actual async streaming proof remain; semantic one-read caches are not blanket-removed",
    }
---

## Cause

The original hypothesis was that Solid 2 marker-based streaming hydration would
make Solid 1 context-ID workarounds obsolete. Installed Solid 2 rc.9 still
allocates owner child IDs: `solid-js/dist/solid.dev.js` and `server.dev.js`
implement `getNextContextId()` using `getNextChildId(owner)`, and the server
reserves IDs for `createTrackedEffect` and `onSettled`. Repeated authored-child
evaluation can still construct real components. Remove only individually
disproved workarounds; marker hydration does not justify blanket cache removal.

## Work

1. Update SSR and hydration harness tests (`vitest.ssr.config.ts`,
   `vitest.hydrate.config.ts`).
2. Test complex component trees with conditional children and render props under
   Solid 2.0 streaming hydration.
3. Inventory defensive one-read/context-ID workarounds and remove those proved
   obsolete under the installed runtime, retaining justified ownership and
   single-evaluation semantics with explicit dispositions.

## 2026-09-19 bounded retirement and inventory

The owner's autonomous-execution instruction admits named, justified foundation
slices without repeated routine permission requests. This slice replaces only
`solidaria-components/src/ElementTag.tsx`'s Solid 1.9.14 static-tag switch with
Solid 2's native `dynamic` helper, updates its dependent VisuallyHidden comment,
and adds owning utility/conditional/render-prop/Provider coverage. The native
helper uses `sharedConfig.hydrating` to adopt server elements only during the
walk, then `createElement` for subsequent mounts; its separate tag-source memo
preserves node identity during unrelated prop changes. Using `dynamic` rather
than the deprecated `Dynamic` component also prevents a forwarded `component`
attribute from overriding the selected tag. The old implementation fails the
new arbitrary-tag forwarding cases. No public API or accessibility contract
changes. Explicit Link/Separator test teardown fixes independently reproduced
retained-fixture failures without changing their expectations.

Inventory is based on package-source searches and installed rc.9 source, not a
claim that every suspect is a failing public route. Paths below are relative to
`packages/`; paired styled paths mean both solid-spectrum and viviana-ui.
No direct package-source counter-reset/rewind or `getNextContextId` call was
found. Historical references to a single global counter are not current runtime
evidence.

| Family / owning paths                                                                                                                                                                                                                                                                                                                            | Disposition and remaining proof                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `solidaria-components/src/ElementTag.tsx`; dependent `VisuallyHidden.tsx` comment                                                                                                                                                                                                                                                                | Retire the obsolete static-tag workaround in this slice. Cover compiled SSR, exact adopted node identity, forwarded attributes/refs/events, reactive spread updates with retained focus, delayed mount, actual tag replacement, hide/reveal, cleanup, arbitrary tags and nested Provider order.                                              |
| `solidaria-components/src/utils.tsx` (`ClientOnly`, `useIsHydrated`); `solidaria/src/virtualizer/ScrollView.ts`                                                                                                                                                                                                                                  | Pending migration: legacy `sharedConfig.context` checks cannot detect the rc.9 hydration walk. Preserve fallback adoption, immediate CSR/remount behavior, and viewport measurement deferral; prove nonzero client geometry cannot expand rows during adoption, then settles with scroll/resize cleanup. Not changed here.                   |
| Kumo/Geist buttons; paired styled `button`, `statuslight`, `picker`, `combobox` authored-child memos                                                                                                                                                                                                                                             | Retain: share one evaluated subtree between classification and rendering while allowing direct signal updates. Simplification needs primitive/element transitions, mixed text, nested Text context and same-node identity proof.                                                                                                             |
| Paired styled `tabs`, `table`, `breadcrumbs`; headless `Table.tsx`; Viviana `progress/ProgressCircle.tsx`, `gridlist`, `tree`; Spectrum `tree` local snapshots                                                                                                                                                                                   | Retain single-evaluation semantics. Re-reading a getter may recreate components; these are not private counter manipulation. Correct stale server-only/client-memoized rationales in a subsequent documentation/comment slice.                                                                                                               |
| `solidaria-components/src/utils.tsx` (`useRenderProps`, `OptionContent`), `TextField.tsx`, `Switch.tsx`, `RadioGroup.tsx`, `Table.tsx`, `Color.tsx`                                                                                                                                                                                              | Retain stable render-prop lifetimes and positive-arity/zero-argument distinction. New utility fixtures prove live values, context ownership and stable render-prop invocation while conditional children change; they do not justify removing all per-component caches.                                                                      |
| `solidaria/src/utils/mergeProps.ts`; headless `Form.tsx`, `PreviewTrigger.tsx`, `VisuallyHidden.tsx`, `Switch.tsx`, `Modal.tsx`, `Table.tsx`; paired styled `form`                                                                                                                                                                               | Retain lazy children and selective getter handling: provider ownership is a semantic requirement independent of hydration.                                                                                                                                                                                                                   |
| `solidaria/src/utils/refs.ts`, `createDescription.ts`; headless `Virtualizer.tsx`, `Table.tsx`; paired styled `breadcrumbs`; Viviana `gridlist` registration                                                                                                                                                                                     | Retain demonstrated rc.9 fixes: owned initial reads, symmetric effect registration, isolated memo ownership, host/child ordering and correct initial/static-registration visibility. These are not obsolete Solid 1 debt.                                                                                                                    |
| Headless `Modal.tsx`, `Popover.tsx`, `Toast.tsx`; `solidaria/src/ssr/index.tsx` IDs; paired styled `skeleton` collection caches                                                                                                                                                                                                                  | Retain client-only portal behavior, real ID/prefix contracts and keyed collection identity. Marker hydration alone disproves none of them.                                                                                                                                                                                                   |
| `solidaria/src/interactions/createInteractionModality.ts` (`createFocusVisible`, `useIsKeyboardFocused`); `ssr/index.tsx` (`createHydrationState`, `createBrowserEffect`, `createBrowserValue`); `focus/createAutoFocus.ts`, `createFocusRestore.ts`, `createVirtualFocus.ts`, `FocusScope.tsx`; `overlays/createModal.tsx` (`OverlayContainer`) | Pending allocation-parity coverage, not confirmed defects: server early returns may omit child-ID reservations. Test real SSR context, a following generated-ID sibling, exact hydration identity and client behavior before changing source. Internal ModalContent/Tooltip returns additionally require proof of public-route reachability. |
| Styled slot inspection/flattening/stamping in SelectBox, GridList, Tree, buttons, segmented control                                                                                                                                                                                                                                              | Deferred to #535/#168/#169. Preserve raw-element slot and layout behavior; no incidental slot rewrite here.                                                                                                                                                                                                                                  |
| Probe-then-render sites in headless DatePicker, Calendar, RangeCalendar, DateField, Table, Menu and styled TabsPicker/color/menu/radio/tree                                                                                                                                                                                                      | Remaining #441 class; retaining existing snapshots does not close this backlog.                                                                                                                                                                                                                                                              |
| `solid-stately/src/utils/reactivity.ts`; interaction/focus scheduling mirrors; Viviana `tag-group` serialized `{t}` inspection                                                                                                                                                                                                                   | Accessor migration belongs to #533, scheduler behavior to #534; serialized tag detection needs separate representation-specific coverage. None removed here.                                                                                                                                                                                 |

Remaining #536 acceptance: migrate the stale hydration-state guards with
owning coverage, resolve the allocation-parity suspects, update stale One-Read
documentation/comments, prove actual asynchronous streaming (the new fixtures
use synchronous `renderToString` plus post-hydration conditional updates), and
rerun every SSR/hydrate suite after the final justified retirements. This slice
does not complete #536, #531, the deferred tickets, or release acceptance.

Bounded proof: fresh complete SSR 51/51 then hydration 59/59 (one worker),
owning ordinary tests 183/183, typecheck and scoped formatting/lint pass. Docs
wrappers fail with sandbox tsx IPC EPERM; supported direct no-IPC equivalents
pass. `guard:attribution-headers` exits 1: one exact-source contract mismatch
and 63 reviewed-local mismatches. All 64 reported source paths are unchanged
from starting HEAD `7b370277da951755cb3082477745d2c790210d8a`; ElementTag's
updated reviewed hash matches. The repository-wide attribution gate remains
red and requires separately scoped reconciliation, not a waiver or mass hash
refresh. Its 103 mappings needing review are a separate inventory statistic.
Commands, controls and logs: `.agents/UI-EXECUTION-536-2026-09-19.md`.

## Done when

All SSR and hydrate test suites pass without hydration key desynchronization
errors or context ID counter leaks.

## Relationship

Child of #531. Sibling of #535.
