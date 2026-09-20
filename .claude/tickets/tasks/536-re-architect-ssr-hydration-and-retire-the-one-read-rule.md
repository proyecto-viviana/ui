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
  - {
      state: in-progress,
      at: 2026-09-19,
      note: "autonomous hydration-state slice replaces obsolete sharedConfig.context checks in ClientOnly/useIsHydrated and ScrollView with symmetric Solid 2 client-source effects. Old-source controls expose fallback key drift and six mid-hydration geometry callbacks. Fresh complete SSR 53/53 then hydration 61/61 and owning ordinary 229/229 pass with one worker; same-owner IDs, fallback adoption, immediate CSR/remount and scroll cleanup are covered. Allocation-parity suspects, stale guidance, actual async streaming and full foundation/release acceptance remain open",
    }
  - {
      state: in-progress,
      at: 2026-09-19,
      note: "bounded hook-parity slice confirms six old-source hydration key failures and repairs createFocusVisible/useIsKeyboardFocused plus createHydrationState/useIsSSR/createBrowserEffect/createBrowserValue through symmetric registration. Independent review additionally caught and prevented function-valued fallback invocation. Fresh complete SSR 60/60 then hydration 68/68 pass with one worker. Focus lifecycle/FocusScope work, portal route proof, stale guidance and genuine async streaming remain; no task, initiative or release acceptance inferred",
    }
  - {
      state: in-progress,
      at: 2026-09-19,
      note: "bounded focus lifecycle slice proves and repairs createAutoFocus/createFocusRestore SSR owner omissions by registering their unchanged onSettled callbacks symmetrically; VirtualFocus passes unchanged as an allocation control. Old-source hydration fails exactly two key-2/key-1 cases; fresh complete SSR 63/63 then hydration 71/71 pass with one worker. FocusScope structure, portal routes, stale guidance and genuine streaming remain; already-dequeued delayed autofocus cancellation is explicitly recorded under #534, not claimed fixed",
    }
  - {
      state: in-progress,
      at: 2026-09-19,
      note: "bounded FocusScope slice repairs the SSR-only bare-child return with symmetric provider/sentinels and a guarded document capture. Three old-source SSR cases lack the manager; corrected complete SSR 66/66 then hydrate 74/74 and owning 47/47 pass with one worker. Exact adoption, containment, restoration, dynamic collection and meaningful cleanup are covered, including a failing cancellation-removal control. Public portal routes, stale guidance and genuine streaming remain; no task or release closure inferred",
    }
  - {
      state: in-progress,
      at: 2026-09-19,
      note: "public OverlayContainer body/inherited/explicit route proof exposes a lazy prop memo first read inside a child-forbidden tracked callback. Bounded createModal.tsx repair moves only mount validation into createEffect's owned compute phase, retaining the SSR guard. Fresh complete SSR 69/69 then hydrate 77/77 and owning 29/29 pass with one worker. Outer identity, generated IDs, modal ARIA and close/reopen/disposal are preserved. Tooltip routes, stale guidance, real streaming and all initiative/release gates remain open",
    }
  - {
      state: in-progress,
      at: 2026-09-19,
      note: "public Tooltip controlled/default-open generated/explicit-ID and standalone routes expose four missing hydrated description links. TriggerWrapper's tracked callback first reads snapshot-null refs; split createEffect preserves initial dependency tracking and existing DOM/listener cleanup. Five focused routes and owning 25/25 pass; fresh complete SSR 74/74 then hydrate 82/82 pass with one worker. SSR portal guard and real render-prop replacement semantics remain. Stale guidance, actual streaming, sibling/build/attribution and release gates remain open",
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

Remaining #536 acceptance: resolve the allocation-parity suspects, update stale One-Read
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

## 2026-09-19 hydration-state migration

The subsequent autonomous slice supersedes the pending hydration-state-guard
row above. `ClientOnly` and `useIsHydrated` now use one symmetric owner structure
on server/client, a boolean initialized immediately ready for CSR/remounts,
and a Solid 2 client-source effect to release gated content after hydration.
Both `createScrollView` effect registrations use that same supported effect
option. All package-source `sharedConfig.context` references are gone; this is
not blanket removal of semantic child caches or acceptance of the remaining
allocation-parity suspects.

Installed rc.9 has `sharedConfig.hydrating`, not `context`. Its renderer can
flush ordinary effects before hydration ends, so merely renaming the private
guard or relying on `onSettled` would not establish the required boundary.
`ssrSource: "client"` effects reserve a matching server owner slot without
executing browser work and wait for the hydration snapshot release on client.

Old-source controls fail meaningfully: the new utils hydration regression
reports missing key `00311`; the new ScrollView regression records six viewport
callbacks with `hydrating: true`. Corrected focused SSR is 7/7 and hydration
6/6. Fresh complete SSR is 53/53 (25 files), then hydration 61/61 (24 files),
one worker. Proof covers actual fallback-node adoption, the ID allocated
immediately after the hook in the same owner, absent fallback, immediate CSR
and remounts, deferred children, stable bindings and balanced disposal. Scroll
proof retains the 200-item virtualized integration and adds nonzero geometry,
resize/scroll behavior, observer disconnect, pending frame/timer cancellation,
and removal of the connected-target scroll listener.

This does not prove real async streaming or close #536/#531. Source paths,
full command ledger and remaining gates are recorded in
`.agents/UI-EXECUTION-536-GUARDS-2026-09-19.md`.

## 2026-09-19 hook parity and remaining route audit

This slice supersedes the interaction-modality and SSR-utility portion of the
pending allocation-parity inventory. All six old-source hydration cases fail
with client key `32` versus server key `31`, leaving one unclaimed span. The
regressions allocate `createUniqueId()` in the hook's own owner immediately
after calling it, then prove computed ID equality and exact node adoption.

`createFocusVisible` and `useIsKeyboardFocused` now register their real effects
on both sides while retaining false SSR state and browser event semantics.
`createHydrationState`/`useIsSSR` retain true SSR/initial-hydration state and
become immediately false for CSR/remounts. The browser effect keeps tracked
reads and cleanup before reruns/disposal but waits for snapshot release;
browser values remain one-time, untracked computations. A function-valued
fallback/value is retained by identity, never invoked as an initializer. A
review-driven negative control fails if that initializer wrapper is removed.
Focused SSR/hydrate are 7/7 each; fresh complete SSR 60/60 then hydrate 68/68
pass. Exact commands and additional checks are in
`.agents/UI-EXECUTION-536-HOOKS-2026-09-19.md`.

Owning ordinary proof passes 87/87 after a baseline-controlled test-precondition
repair in `createFocusRing.test.tsx`. The original combined run was 85/86;
restoring the two committed source files reproduces the same focus-ring failure
(plus both new CSR regressions). Pinned React Aria and local focus handlers
re-sample global modality on focus, so the positive autoFocus case now explicitly
establishes keyboard modality and retains its true assertion. A paired pointer
case asserts focused with no ring. Product focus behavior is unchanged; this
test repair does not complete #534's separate scheduler audit.

Read-only route review narrows, but does not silently close, the remaining work:

- `createAutoFocus` and `createFocusRestore` skip a real `onSettled` owner
  reservation on SSR. Next repair must register that lifecycle symmetrically,
  preserve server no-op methods, and prove focus/save/cancel/disposal behavior.
- `createVirtualFocus` skips only a literal signal, which reserves no owner ID.
  Retain the guard for allocation purposes; add a same-owner control. Its
  default-focused-key SSR semantics are a separate concern, not counter proof.
- Public standalone `FocusScope` returns bare children on SSR but context and
  two sentinels on client. It needs structural/context adoption coverage and a
  genuine symmetric implementation, not counter padding; browser document reads
  must remain guarded and containment/restoration behavior must remain intact.
- Public `OverlayContainer` and open Tooltip are portal routes. Prove adopted
  outer nodes plus settled portal creation/ARIA/close/disposal before deciding
  whether their private-owner server returns need changes. Normal public Modal
  routes gate private ModalContent off during SSR; retain that defensive return.
- Real streaming requires an unresolved shell before server resolution, tail
  arrival while client hydration is pending, exact streamed-node adoption, and
  bounded completion/error cleanup. Awaiting a fully resolved stream string or
  showing a child after synchronous hydration does not satisfy this requirement.

Stale guidance/comments and final complete lanes after all justified retirements
remain open. No semantic one-read cache, held task, publication boundary or
#537 zero-waiver live 2,177-case requirement is waived.

## 2026-09-19 focus lifecycle parity

This slice supersedes the createAutoFocus/createFocusRestore pending entry.
Each now registers its existing real `onSettled` callback before the SSR no-op
return. Installed server registration reserves an owner ID without invoking the
callback; browser cleanup remains client-only. Client callback timing is
unchanged: restoration captures the settled trigger before queued autofocus,
while autofocus's actual ref/focus callback runs after the hydration walk.

Three same-owner fixtures allocate an ID immediately after the hook. Old-source
SSR passes 10/10, but hydration fails only AutoFocus and FocusRestore: client key
`2` versus unclaimed server div key `1`/ID `0`. VirtualFocus passes unchanged;
its literal signal does not reserve an owner ID, so no counter-driven guard
removal is justified. Its default-focused-key SSR semantics are not covered by
this null-initial-state allocation control.

The corrected proof retains exact SSR node/ref identity, immutable pre-hydration
ID comparison, inert server APIs, enabled autofocus after hydration, captured
external trigger and explicit restore/clear behavior. VirtualFocus keyboard
events retain physical focus, update aria-activedescendant and skip disabled
items. Owning ordinary cases prove restoration, disabled/cleared restoration,
and queued-request cancel/disposal with connected targets. Immediate focus
assertions explicitly establish keyboard modality rather than inheriting it.
Full SSR is 63/63 (26 files), then hydrate 71/71 (25 files), one worker.
Receipt and exact command ledger: `.agents/UI-EXECUTION-536-FOCUS-2026-09-19.md`.

Cancellation after a positive-delay autofocus winner leaves the queue is a
different branch: its timer is untracked and needs its own failing regression
and repair under #534. This slice neither changes nor claims coverage of it.
FocusScope structural/context symmetry, public portal-route reachability,
stale guidance/comments, actual shell-first streaming and final complete lanes
remain before #536 can close. All #531 and release gates remain intact.

## 2026-09-19 FocusScope structure and context

This bounded slice supersedes the pending public FocusScope entry. The old
server-only bare-children return omitted both the provider and two hidden
sentinels. Three real SSR fixtures (default, enabled and disabled options) fail
against that source because descendant useFocusManager receives no manager.
The repair retains the same provider, sentinels and lifecycle registrations on
both sides, guarding only setup-time document capture. Installed server effects
reserve owners without running browser callbacks; null refs keep their compute
functions inert. Existing client lifecycle timing and methods are unchanged.

SSR proves inert manager methods, no ref callbacks, generated IDs and sentinel
order. Hydration adopts all six original nodes and the input ref, compares the
immutable server ID, and exercises autofocus, disabled-item skipping, forward
and reverse Tab containment, dynamic sibling collection, restoration and close.
Owning cleanup coverage now checks exact listener removal and behavior with
reconnected targets instead of a vacuous assertion. A queued-autofocus disposal
regression fails when cancellation is temporarily removed; the implementation
was restored before final proof. This is FocusScope's existing frame cleanup,
not #534's separate already-dequeued delayed-winner timer debt.

Fresh complete SSR passes 66/66 (26 files), then hydration 74/74 (25 files),
one worker; owning FocusScope/owner-document/FocusManagement passes 47/47.
Receipt and exact ledger: `.agents/UI-EXECUTION-536-SCOPE-2026-09-19.md`.
Public portal routes, stale guidance/comments, genuine unresolved-shell/late-tail
streaming and final complete lanes remain. Nested/portaled FocusScope hydration
is not claimed by these standalone fixtures. No initiative or release gate closes.

## 2026-09-19 public OverlayContainer routes

This slice supersedes OverlayContainer's pending route entry. Real public
fixtures cover body, inherited and explicit mounts with a following generated-ID
sibling. SSR must not evaluate portal content or browser mount callbacks. The
existing server guard is correct and remains; hydration creates the portal only
after the walk while adopting all five outer elements and their original IDs.

The first old-source hydration run stalled and was stopped without claiming
completion. A bounded one-case diagnostic captured PRIMITIVE_IN_FORBIDDEN_SCOPE:
the compiler-generated portalContainer getter first allocates a lazy memo in
createTrackedEffect's child-forbidden callback. The justified source extension
changes only OverlayContainer validation to createEffect(portalContainer,
callback), so that read occurs in the supported compute owner. Existing nesting
validation, error, Portal and separate modal registration are unchanged.

New assertions separate the hook's boolean data-ismodal prop from Solid's empty
serialized presence marker. Hydration verifies mount precedence, parent ARIA,
close/reopen, child disposal and exact preservation of caller-owned mounts.
The ordinary reactive mount case verifies legitimate portal-child replacement,
balanced disposal and ARIA; installed Solid's insertion-root cleanup and the
pinned Adobe/React portal route support remounting when the target changes.
No original expectation was relaxed and no identity cache was introduced.

Fresh complete SSR passes 69/69 (26 files), then hydrate 77/77 (25 files),
one worker. Owning overlays passes 29/29. Receipt and exact command ledger:
`.agents/UI-EXECUTION-536-PORTAL-2026-09-19.md`.
Tooltip public-route proof, stale guidance/comments, actual unresolved-shell/
late-tail streaming and final complete lanes remain. Private ModalContent's
normal public SSR guard remains justified; no task or release closure inferred.

## 2026-09-19 public Tooltip routes

Five real routes cover controlled/default-open triggers with generated/explicit
IDs and standalone controlled Tooltip. The existing TooltipContent server guard
is retained: SSR suppresses portal children and callbacks while preserving the
outer trigger, wrapper and following generated-ID field. Hydration adopts those
exact nodes/ref/ID before exercising description linkage, Escape dismissal,
keyboard reopen, unrelated versus ancestor scroll and complete root cleanup.

Four old-source trigger routes fail because the actual button never receives
aria-describedby, although the tooltip exists and positioning sees that same
button. Temporary probes confirm handleRef sees it but createTrackedEffect first
reads snapshot-null; no set/removeAttribute call occurs. Installed signals rc.9
documents the legacy callback's inability to see an earlier staged write before
its initial dependency read. The narrow repair uses createEffect's owned compute
to snapshot refs and trigger props, leaving imperative description/listener work
and cleanup in its callback. Fresh real SSR proves allocation parity. No Button,
dependency, duplicate-version or portal-guard diagnosis is inferred.

New test assumptions were corrected at their owning layers: positive-arity
render props can create replacement bodies as exit values change, so each real
body has an instance token and must be disposed exactly once; exactly one is
live while open. A blur after ancestor-scroll dismissal still forwards a close
request under the existing non-deduplicating overlay state contract. Tests assert
the exact callback sequence per operation and inertness after disposal. No
existing behavior expectation was weakened or render-prop source changed.

Fresh complete SSR passes 74/74 (27 files), then hydrate 82/82 (26 files), one
worker; existing ordinary Tooltip tests pass 25/25. Source and test reviewers
accept this bounded slice. Receipt/ledger:
`.agents/UI-EXECUTION-536-TOOLTIP-2026-09-19.md`.
The zero-geometry deferred-ref path is not newly certified here; no blanket
Tooltip lifecycle claim. Stale guidance/comments, actual unresolved-shell/late-tail
streaming and final full lanes still remain before task or initiative closure.

## Done when

All SSR and hydrate test suites pass without hydration key desynchronization
errors or context ID counter leaks.

## Relationship

Child of #531. Sibling of #535.
