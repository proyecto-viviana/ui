---
id: 543
type: task
title: "Restore Solid 2 comparison app development"
created: 2026-09-19
parent: 531
status: in-progress
history:
  - {
      state: in-progress,
      at: 2026-09-20,
      note: "private buffered-SSR adapter now passes fresh paired 8 SSR and 26 client tests, including island replay, original node/slot identity, async payloads, visible falsy failures and three app panels; comparison build passes all 91 pages. Settled dev browser passes D12 identity and both Button mouse/Enter actions. Viewer strict warnings, automatic-restart key drift, remaining route/lifecycle coverage and separate web/TanStack compatibility keep acceptance open",
    }
  - {
      state: in-progress,
      at: 2026-09-20,
      note: "paired private adapter proof passes 8 SSR and 7 hydration tests; real browser exposed forbidden onCleanup inside onSettled in app fixtures/chrome. Owner autonomous app-repair authority extends named scope to the eight documented lifecycle owners; framework integration and app migration remain distinct, no product-source change",
    }
  - {
      state: in-progress,
      at: 2026-09-19,
      note: "owner requested usable apps for incremental component testing; installed Astro Solid 7.0.2 still uses Solid 1 compiler/runtime APIs. Bounded comparison integration repair begins without dependency changes; web/TanStack compatibility remains separate",
    }
---

## Scope

Restore the existing comparison app on the pinned Solid 2 runtime. Named paths:
`apps/comparison/astro.config.mjs`, private integration files under
`apps/comparison/integrations/solid/`, paired adapter tests under
`apps/comparison/test/solid-integration/`, and their
`apps/comparison/vitest.solid-{ssr,hydrate}.config.ts` configs. Ticket #543,
initiative #531, generated current views and
`.agents/UI-EXECUTION-543-2026-09-20.md` own coordination/proof. Preserve the
separate uncommitted #534 Hover slice.

Use the already-installed `@solidjs/vite-plugin` and public Solid 2 APIs. No
dependency or public package/name change, no installed-package edits, no
client-only substitution for existing SSR islands, and no comparison styling
patch. Preserve React rendering, slots, island prop updates and disposal.

### 2026-09-20 app lifecycle extension

The real browser stops hydration with `CLEANUP_IN_FORBIDDEN_SCOPE`. Under the
owner's autonomous app-repair instruction, extend named scope to these existing
files under `apps/comparison/src/components/solid/`: `islands/SolidButtonIsland.tsx`,
`KumoButtonFixture.tsx`, `GeistButtonFixture.tsx`, `fixtures/styled/button.tsx`,
`useComparisonColorScheme.ts`, `DocsTopBar.tsx`, `DocsToc.tsx`, and
`ComponentExampleFiles.tsx`. Return the same listener/observer cleanup from
`onSettled`, as required by the installed Solid 2 lifecycle contract. Preserve
the separate owner-level copy-timer cleanup and listener options. Prove actual
D12 hydration/node identity and manual Button interaction in the browser.
Other styled-fixture copies remain migration debt; this does not certify them.

The Button viewer also imports the removed `createResource` API from
`ComponentExampleControls.tsx` and `ComponentExampleFiles.tsx`; add the former
to this app-only extension. Replace the Promise loader with an async memo and
local `Loading` boundary around the existing dependent slot, preserving the
static heading/wrapper, empty pending presentation, and visible failures.

### 2026-09-20 production-build extension

The production build stops at the removed `createResource` import in
`apps/comparison/src/components/solid/ComponentDetailMeta.tsx`. Under the same
owner autonomous app-repair authority, add that exact app path and its coverage
in the already-named panel tests. Preserve the Provider, empty pending content,
coverage/visual/API/supporting-layer sections, visible load failure, and owner
disposal. Prove pending/resolved/rejected/disposed behavior and rerun the build.
No product package or dependency change is authorized by this extension.

## Done when

`vp run comparison:dev` starts, existing manual component pages are interactive,
and real Astro Solid islands render and hydrate with original node identity,
without hydration diagnostics. Demonstrate a mouse and keyboard Button action,
SSR/client parity, isolated island IDs, prop updates and unmount cleanup.
Keep server render failures visible. Production build and existing route gates
must also pass before full ticket closure; a dev-server banner is insufficient.

## Proof

Run focused paired SSR/client adapter tests with one worker, then browser proof
on the existing Button viewer and D12 routes. Keep exact failures/logs and
review the changed scope. Run typecheck, scoped checks and generated-doc checks.
This does not replace #537's live 2,177-case same-revision zero-waiver gate or
authorize packaging before #139, deployment, or release.

### 2026-09-20 bounded results

- Fresh `vitest.solid-ssr.config.ts` passes 8/8, followed by
  `vitest.solid-hydrate.config.ts` 26/26, each `--maxWorkers=1`. The client lane
  includes ten CSR panel tests; these are not claims of panel SSR adoption.
- Paired fixtures prove per-request IDs, exact initial nodes, preserved live
  default/named slots, updates after Astro removes `ssr`, unmount disposal,
  staggered/reverse island event replay, nested Solid-parent event deduplication
  before/after a microtask, pending older-root updates, real async serialized
  data and original thrown Error/undefined/zero/false failure recovery.
- `vp run comparison:build` initially fails on `ComponentDetailMeta`'s removed
  API; after its independently reviewed migration it passes, 91 pages.
- Root `vp run typecheck` and scoped lint pass. Separate app `vp exec astro
check` exits 1: 40 errors, zero warnings and 37 hints across 435 files. Most
  errors concern hyperscript's callable return type, with additional fixture
  prop/import and two boolean-returning `onSettled` callbacks. Root typecheck
  excludes this app and does not supersede its failed check.
- Existing production-preview site suite passes 7/7 and client-router suite
  passes 1/1, sequentially with `--workers=1 --reporter=line`; the latter proves
  its existing prefetch/same-document/remount contract. These do not certify
  arbitrary async nested-island navigation or all component interactions.
- Fresh complete foundation lanes pass SSR 75/75 (28 files), then hydrate 98/98
  (27 files), each `--maxWorkers=1`. Hydration exits zero but logs a failed
  default-HTML dependency scan despite the unchanged explicit entry settings;
  retain that diagnostic as separate toolchain debt, not a clean-log claim.
- Real browser proof on the settled dev server retains D12's exact SSR button
  and wrapper and increments each route's Button counter once with mouse and
  once with Enter. D12 emits no diagnostics; the viewer still emits 738 strict
  warnings. The probe uses existing route readiness and scopes the Solid panel.
- Preserve earlier red evidence: a Vite automatic restart exposed hydration
  keys `s000080000020001`/`s0000800000200020` versus server
  `s0000800001001`/`s00008000010020`; a cold probe without route readiness timed
  out on its action counter; dependency optimization later reloaded the page
  and invalidated identity sentinels. These are not silently counted as passes.

Independent installed-runtime review reproduces a restart mechanism: the
process-global callable I18n context in `packages/solidaria/src/i18n/locale.tsx`
captures its original Solid module's owner state. Reusing it in a second module
generation changes child key `s0100` to `s01` and loses `fr-FR` context; a
runtime-owned context preserves both. Same installed version throughout. A
separately named product regression/repair and controlled Vite-restart proof
are required before claiming causal closure. Refresh-off versus refresh-on was
confounded by restarting the process; refresh itself is not a confirmed cause.

The adapter awaits complete async SSR output; overlapping unresolved island
roots, live streamed chunk arrival, a CSR-only parent, and navigation lifecycle
remain outside this bounded proof. The focused adapter tests do not replace
the existing route/interaction, complete foundation or release gates. No claim
that all app pages or published packages are ready follows from the build.

## Relationship

Child of #531, prioritized by the owner's incremental-app-testing request.
Installed TanStack Start/Router also uses removed Solid 1 APIs; web app startup
is an independent outstanding integration repair, not covered by this ticket.
All #87 census/owner holds and initiative/release requirements remain intact.
