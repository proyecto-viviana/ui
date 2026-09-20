# Lens 1 — Solid 2 codemod damage (ticket #546, 2026-09-20)

Target commit: `163f4377` "#531: port the seven pack packages onto Solid 2 RC"
(1836 files, +10780/-9041), plus the 32 fallout commits since.

## Coverage

Examined so far:
- Every `_s2Cleanups` site in `packages/**/src` (58 files listed by
  `rg -c _s2Cleanups packages/ -g '*.ts*'`; 29 distinct effect bodies), by
  brace-matched extraction, checking: cleanup reachability, early returns,
  array sharing across re-runs, registration owner.
- `createTrackedEffect` semantics established empirically against the real
  runtime (`node_modules/.pnpm/@solidjs+signals@2.0.0-rc.9/.../dist/dev.js`):
  returned function *is* a cleanup, runs once before the next run and on
  dispose; writes from inside it do land.
- Forbidden-scope rule: `createMemo`/`createEffect`/`onCleanup` inside
  `createTrackedEffect` throw (`PRIMITIVE_IN_FORBIDDEN_SCOPE` /
  `CLEANUP_IN_FORBIDDEN_SCOPE`). Scanned all 200 `createTrackedEffect` bodies
  in `packages/` + `apps/` for lexically-nested forbidden calls — **none**.
- Single-argument `createEffect`/`createRenderEffect` survivors — none
  (verified by `tsc --noEmit` on solidaria, solid-stately,
  solidaria-components, solid-spectrum, kumo, geist).
- Solid 2 `For`/`Show` callback-argument shapes vs Solid 1
  (`node_modules/solid-js/types/client/flow.d.ts`) — default `For` is keyed
  and still yields `(rawItem, indexAccessor)`; non-keyed `Show` still yields
  an accessor. No mechanical breakage, and `tsc` would catch it.
- `onMount` (removed from the Solid 2 surface) — used only in `apps/web`,
  which is still on Solid 1 (known, #545). No package uses it.

Also examined, and **ruled out** (each with the scan that cleared it):

- **Write-then-read of the same signal.** Solid 2's largest silent semantic
  change: a read immediately after a write returns the *stale* value until
  `flush()` — in *every* scope, including unowned top level, not only effects
  (`node /tmp/t2.mjs`: `setC(7); c()` → `0`; after `flush()` → `7`; the setter
  itself returns the new value). Scanned every `const [get, set] = createSignal`
  pair for a `get()` read after a `set()` call in the same block (9 hits) and
  every `obj.setFoo(...)` followed by `obj.foo` (6 hits): **all 15 are reads
  evaluated as the setter's own argument, or in a different closure.** No site
  depends on read-back. `node /tmp/scan9.mjs`, `node /tmp/scan10.mjs`.
- **Two-argument `createEffect` whose apply reads a dependency its compute does
  not.** Scanned all 65 two-argument effects, diffing tracked identifiers and
  `props.`/`local.` reads between compute and apply (`node /tmp/scan6.mjs`).
  The apply-only reads are helper-function calls and callback props
  (`.onFocusChange`, `.onLoadMore`, `.onExited`), where not re-running is the
  intended and upstream-matching behavior. The one substantive dependency drop
  is the ButtonGroup finding below.
- **`onSettled` as the `onMount` replacement.** It is per-owner, not
  per-application: in an owned scope it lowers to `trackedEffect(() => untrack(cb))`,
  so components mounted later still fire, and a returned cleanup *is* honored
  (`.../@solidjs/signals/dist/prod/signals.js:700-712`). No defect.
- **Effects that acquire a listener/observer without a cleanup.** Scanned every
  effect body in `packages/`; the two hits (`buttongroup`) clean up at component
  scope. The `onCleanup` → `return () => {...}` conversions in
  `createInteractOutside`, `createOverlay`, `createMediaQuery`, `createOverlayPosition`,
  `FocusScope`, `ScrollView` are all complete
  (`git show 163f4377 --format= -- <file> | grep '^[-+].*\(onCleanup\|EventListener\|return () =>\)'`).
- **Context shape.** Solid 2 `createContext` returns the provider function
  itself; `ctx.Provider` no longer exists
  (`node_modules/.pnpm/solid-js@2.0.0-rc.9/.../dist/solid.js:6-16`). No
  `.Provider` member access survives in any package — the 4 `rg '\.Provider\b'`
  hits are all prose in comments. `useContextOptional`'s `context.defaultValue`
  fallback (`packages/solidaria/src/utils/owner.ts`) is the right field.
- **`For` keyed default.** `mapArray` treats `keyed` as true unless explicitly
  `false` (`.../@solidjs/signals/dist/prod/map.js:36-38`), so Solid 1 call
  sites yielding `(rawItem, indexAccessor)` are unchanged.
- **`on:click` → `onClick` in `createPress`.** The codemod removed all 24 `on:`
  namespace usages, moving press's click handler from a native listener to
  Solid's delegated one, and deleted the non-enumerable `defineProperty` that
  hid `onClick` from spreads. Upstream `usePress` also returns a plain
  `onClick` in `pressProps` and React delegates it
  (`react-spectrum/packages/react-aria/src/interactions/usePress.ts:449`), so
  this matches upstream. The one call site that invokes `pressProps.onClick`
  by hand, `packages/solidaria/src/tabs/createTabs.ts:505`, builds its own
  `tabProps` rather than spreading `pressProps`, so there is no double-fire.
  Not a defect.
- **`createMemo(fn, initialValue)` survivors.** Solid 1's second argument was an
  initial value; Solid 2's is `MemoOptions`, whose fields are all optional — so
  *any* object passes the type check and a stale initial value would be silently
  swallowed rather than caught by `tsc`. Scanned every two-argument
  `createMemo`/`createSignal`/`createStore` call in `packages/`
  (`node /tmp/scan11.mjs`): the only hits are generic-parameter parsing
  artifacts and one genuine options spread
  (`packages/solid-stately/src/utils/reactivity.ts:53`). No survivors.
- **Deferred or unreachable `_s2Cleanups.push`.** Beyond the early-`return`
  scan, checked all 29 bodies for a runner that is missing, and for pushes
  registered from inside a `setTimeout`/`requestAnimationFrame`/`.then`
  callback (which would register after the effect returned):
  `rg -B2 '_s2Cleanups\.push' <all package sources>` shows every push is
  immediately preceded by its synchronous `addEventListener`/`observe`. Only
  the Virtualizer body is broken.
- **Mangled-syntax sweep.** All non-icon source lines over 250 characters
  (16 lines): 15 are legitimate SVG path data, intl strings and CSS gradients;
  the 16th is the `createToastRegion` finding below.
- `packages/viviana-ui` type-checks clean
  (`npx tsc --noEmit -p packages/viviana-ui/tsconfig.build.json`, no output);
  it has no plain `tsconfig.json`, so an earlier package sweep had skipped it.

Skipped / not done:
- Runtime test execution beyond single-file (brief forbids; writer seat held),
  so every finding here is static-analysis plus upstream comparison.
- `apps/comparison` and `apps/web` (other lenses / #545).
- Store (`createStore`/`reconcile`) write granularity and `createMemo`
  `equals` semantics under Solid 2 — not attacked; a plausible place for a
  second lens to dig.
- `Dynamic` and `Portal` behavior differences — not attacked.
- Hydration and SSR paths — covered by #536/#542 and another lens.

## Findings

### CRITICAL Virtualizer item effect drops every cleanup it registers (rAF + ResizeObserver leak)
- where: `packages/solidaria-components/src/Virtualizer.tsx:1003-1052`
  (`createTrackedEffect` opened at 1003; pushes at 1042 and 1050; the
  cleanup-returning `return` at 1058 is unreachable for this path).
  Twins: 1 — this shape is unique; the scan below found no second instance.
- what: the codemod turned `onCleanup(...)` into `_s2Cleanups.push(...)` plus a
  single `return () => { for (const c of _s2Cleanups) c(); }` at the *end* of
  the effect body. This body has an early `return;` at line 1052, inside
  `if (info != null && index != null && virtualizer) { ... return; }`, which is
  the **normal** path for every virtualized item that has layout info. Both
  cleanups pushed in that block — `cancelAnimationFrame(frame)` (1042) and
  `resizeObserver.disconnect()` (1050) — are therefore never returned and never
  run, on effect re-run or on dispose.
- proof:
  - `sed -n '1003,1060p' packages/solidaria-components/src/Virtualizer.tsx` —
    `_s2Cleanups.push` at 1042/1050, bare `return;` at 1052, the
    `return () => {...}` runner only at 1058.
  - `git show 163f4377^:packages/solidaria-components/src/Virtualizer.tsx | sed -n '1028,1049p'`
    — pre-codemod the same two registrations were `onCleanup(() => cancelAnimationFrame(frame))`
    and `onCleanup(() => resizeObserver.disconnect())`, which were owner-bound
    and ran regardless of the early `return;`.
  - Scanner (brace-matched, all `_s2Cleanups` bodies in `packages/`) reports
    exactly one body with a `return` statement between the first push and the
    runner: this one.
- expected: every cleanup registered before an early return still runs.
  Upstream RAC `useVirtualizerItem.ts:37-42, 63-87` registers these in a
  `useLayoutEffect` cleanup. Solid 2's own doc for the primitive
  (`@solidjs/signals/dist/types/signals.d.ts:443` and the example above it)
  requires the cleanup to be the effect's *return value*, so an early return
  discards it.
- blast radius: `solidaria-components` `Virtualizer` and everything built on
  it — `ListBox`, `GridList`, `Table`, `Tree` in virtualized mode — and both
  styled twins (`solid-spectrum`, `@proyecto-viviana/ui`) that re-export them.
  One `ResizeObserver` per item is retained for the life of the page, holding
  detached item DOM alive; pending `requestAnimationFrame` callbacks keep
  calling `virtualizer.updateItemSize` on unmounted rows.

### LOW Codemod left dead `createEffect` / `onCleanup` imports in eight solidaria modules
- where: `packages/solidaria/src/tabs/createTabs.ts:31`,
  `toast/createToastRegion.ts:25`, `toggle/createToggle.ts:23`,
  `tokenfield/createToken.ts:20` (both names),
  `tokenfield/createTokenField.ts:20` (both names),
  `tooltip/createSafeArea.ts:19` (both), `tooltip/createTooltipTrigger.ts:24`
  (both), `tree/createTree.ts:20`. 12 unused bindings across 8 files.
- what: every `createEffect` in these files became `createTrackedEffect` and
  every `onCleanup` became `_s2Cleanups.push`, but the import lines were only
  appended to, never pruned.
- proof: `cd packages/solid-spectrum && ../../node_modules/.bin/tsc --noEmit -p tsconfig.json`
  reports `TS6133: 'createEffect' is declared but its value is never read` for
  each. `packages/solidaria/tsconfig.json` does **not** set `noUnusedLocals`,
  which is why solidaria's own check is green and nobody noticed.
- expected: no unused imports; and solidaria should be held to the same
  `noUnusedLocals` bar as the package that type-checks it transitively.
- blast radius: hygiene only (bundlers tree-shake). But it means
  `vp run check` for `solidaria` cannot see this class of codemod residue at
  all — the signal only appears when a *downstream* package compiles it.

### HIGH ButtonGroup no longer re-measures overflow when its children change
- where: `packages/solid-spectrum/src/buttongroup/index.tsx:164-176`; twin `packages/viviana-ui/src/buttongroup/index.tsx:164-176` (2 sites, identical text)
- what: the codemod converted the overflow effect to the two-argument form and dropped `local.children` from the dependency list, replacing it with a comment claiming the ResizeObserver covers it. It does not: the observer fires on a *box-size* change of the group or its parent, and adding/removing/relabelling a button inside a width-constrained flex group usually leaves both boxes unchanged. The group then keeps a stale `hasOverflow`, i.e. stays horizontal while overflowing or stays stacked vertical after the children shrink.
- proof:
  - post: `sed -n '164,177p' packages/solid-spectrum/src/buttongroup/index.tsx` — compute reads `orientation(); align(); size(); local.UNSAFE_style;` only.
  - pre: `git show 163f4377^:packages/solid-spectrum/src/buttongroup/index.tsx | grep -n "local.children"` — the Solid 1 effect read `local.children` in the same dependency list.
  - the observer targets are `groupElement` and `groupElement.parentElement` (`:151-162`); `measureOverflow` (`:115-127`) reads `groupElement.children` offsets, which change without either box resizing.
- expected: upstream re-runs the check whenever `children` changes. `react-spectrum/packages/@react-spectrum/s2/src/ButtonGroup.tsx:131-163` — `checkForOverflow` is a `useCallback` with `children` in its dependency array (line 157) and `useLayoutEffect(() => { checkForOverflow(); }, [checkForOverflow])` (162-164) re-runs on every children identity change. Upstream's `useResizeObserver` watches `parent` only (line 175); observing the group itself is an added divergence and a feedback edge, since the callback writes `hasOverflow`, which reorients the group and therefore resizes it.
- blast radius: `solid-spectrum` and `@proyecto-viviana/ui` ButtonGroup; every consumer with a dynamic button set (`<For>`, conditional actions, locale-driven labels). Silent: the group simply renders the wrong orientation.

### MEDIUM Codemod squashed the createToastRegion header into one line, corrupting generated API docs
- where: `packages/solidaria/src/toast/createToastRegion.ts:42` (1 site, unique in the repo)
- what: the codemod collapsed the file header — imports, the `AriaToastRegionProps` and `ToastRegionAria` declarations, and the doc comment — onto single lines. Line 42 is a closing brace followed by an entire JSDoc block, its paragraphs and its fenced `@example`, run together as one line. It compiles, and prettier left it alone because the whole thing is inside a comment.
- proof:
  - `sed -n '42p' packages/solidaria/src/toast/createToastRegion.ts` — `} /** * Provides the accessibility implementation for a ToastRegion component. * * ... * @example * ```tsx * import { createToastRegion } from 'solidaria'; ...`
  - unique: `rg -c '\*/ \S' packages/*/src` and `rg -l '\* \* ' packages/*/src` both return only this file.
- expected: JSDoc survives the port as a block comment. The public API reference is generated from the TS checker and its doc comments (`vp run api:extract`, blocking `guard:api-reference`), so the description and the example for this hook are emitted as one unparsable run-on line — a published-docs defect, not just formatting.
- blast radius: `solidaria` `createToastRegion` docs page, and any other consumer of the emitted JSON. No runtime effect.

### MEDIUM The port is built on `createTrackedEffect`, which Solid 2 deprecates and documents as tearing-prone
- where: 185 calls across 101 files under `packages/*/src` (188 of them added by `163f4377` itself); densest in `solidaria` and `solidaria-components`
- what: the codemod's default rewrite for a Solid 1 `createEffect(() => {...})` was `createTrackedEffect(() => {...})`, a same-scope-tracking primitive that Solid 2 marks `@deprecated` and retains "solely to ease 1.x migration". Its own doc carries a `WARNING` that it "may run multiple times for a single change or show tearing (reading inconsistent state)". That is the reactive substrate of the headless chain an RC would publish.
- proof:
  - counts: `rg -c 'createTrackedEffect\(' $(git ls-files 'packages/*/src/**' | grep -E '\.tsx?$')` → 185 in 101 files; `git show 163f4377 --format= -- packages | grep -c '^+.*createTrackedEffect('` → 188 added, against 276 removed `createEffect(` lines.
  - deprecation and warning: `node_modules/.pnpm/@solidjs+signals@2.0.0-rc.9/node_modules/@solidjs/signals/dist/prod/signals.js:187-231`.
- expected: Solid 2 directs reactive side effects to `createEffect(compute, effect)` and one-time post-render DOM work to `onSettled`. The port does use both (≈65 two-argument effects, 29 `onSettled`), so the deprecated form is the residue of the mechanical pass, not a considered choice — the comments at the converted sites show conversion was done only where a forbidden-scope error or a dropped write forced it.
- blast radius: every published package. Not a defect you can point a repro at; it is the cost basis of the RC — each of the 185 sites is an unaudited 1.x assumption, and the primitive is on a deprecation path, so the debt grows.
- note: I scanned all 185 tracked-effect bodies and all 29 `onSettled` bodies (including one level of local helper calls) for `createMemo` / `createEffect` / `createRenderEffect` / `onCleanup` in a forbidden scope and found none, so the dev-mode guard rails are currently satisfied. `node /tmp/scan7.mjs`, `node /tmp/scan8.mjs`.

## Verdict

**No — I would not cut an rc from this tree**, on the Virtualizer finding alone.
It is in `solidaria-components`, so `solid-spectrum`, `@proyecto-viviana/ui`,
kumo and geist all inherit it; every virtualized collection (Table, ListBox,
GridList, Menu, Tree, CardView) accumulates a `ResizeObserver` per item that is
never disconnected, and an rc is exactly the artifact an off-workspace consumer
would hit it with. It is also a one-line fix, so the cost of holding is small.

Two caveats on how much this verdict is worth. First, everything here is static
analysis plus upstream comparison — the brief forbids builds and browser runs,
so nothing below was observed failing at runtime. Second, this lens looked for
*codemod* damage; a clean result on the scans above says the mechanical pass did
not leave holes in the classes I could enumerate, not that the port is correct.

The three I would fix first:

1. **`Virtualizer.tsx:1052`** — the early `return;` discards both pushed
   cleanups. Return the cleanup runner instead of bare `return`, or restore
   owner-bound cleanup. One line, CRITICAL, headless chain.
2. **ButtonGroup's dropped `children` dependency** (2 twins) — overflow is no
   longer re-measured when the button set changes, and the justification in the
   comment is wrong about what a two-argument `createEffect`'s compute scope
   forbids. Upstream re-runs on `children`; restore that edge, and drop the
   added self-observation, which upstream does not do and which feeds the
   observer its own restyle.
3. **A guard for the `_s2Cleanups` shape.** The Virtualizer bug is not a typo,
   it is what the transform does to any body with an early `return`. There are
   29 such bodies; one was wrong. The brace-matched scan that found it takes
   under a second and belongs in `vp run check`, otherwise the next conversion
   reintroduces it silently. The same applies to the 185 remaining
   `createTrackedEffect` sites: they are the unconverted residue, and each is an
   unaudited 1.x assumption.

The `createToastRegion` header corruption is cheap to fix and visible in
published docs; the 12 dead imports are hygiene and can ride along.
