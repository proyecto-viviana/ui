# Dev hydration crash — investigation, results, and next steps

_Last updated: 2026-06-02. Repos involved: `proyecto-viviana/ui` (this repo, the
design system) and `proyecto-viviana/social` (the pokeforos app — see its
`docs/viviana-ui-consumption.md` for the consumer side)._

## ✅ RESOLVED + VERIFIED (2026-06-02) — read this first

The fix is the **consumption/build approach**, exactly as the analysis below
concludes — **not** a component change. The Switch's `<input>` is wrapped in the
**`VisuallyHidden` component**, which is the react-aria pattern (react-aria's own
Switch does `<VisuallyHidden elementType="span"><input/></VisuallyHidden>`, shared
by Checkbox/RadioGroup/SearchField/Slider/DropZone). That nested-component insert
drifts Solid's hydration keys **only when the lib is consumed PRE-COMPILED in
separate dom/ssr passes** (the "compiled-dual" build). Ship the lib **JSX-preserve**
(`solid`→`dist/*.jsx`) so the **consumer compiles dom+ssr from one source in one
run → keys align**. **Verified on `/perfil`: with `VisuallyHidden` intact +
JSX-preserve consumption, the Switch hydrates with 0 errors.** This keeps
`VisuallyHidden` (faithful to react-aria, consistent across all form components)
and fixes every such component at once.

**On codex's fix:** codex worked around it by deleting `VisuallyHidden` from the
Switch and hiding the `<input>` via a CSS `style()` overlay (`position:absolute;
inset:0; opacity:0`) with the visible track `aria-hidden` + `pointerEvents:none`.
That is a11y-valid but a **Switch-only divergence from react-aria**. We restored
`VisuallyHidden`, re-tested under JSX-preserve, confirmed it's clean, and
**reverted codex's change** as unnecessary. The component is unchanged from the
committed react-aria-faithful version; the fix lives entirely in the build.

(History note: an earlier edit of this banner briefly framed codex's removal as
THE fix — that was wrong. The verified root cause + fix are the build approach, as
the body of this doc already said.)

## TL;DR (matches the verified resolution above)

- The recurring **"Hydration Mismatch — Unable to find DOM nodes for hydration
  key"** crash on Switch / VisuallyHidden (and other nested form components) is
  **DEV-ONLY** (`vp dev`). **Production is clean** — verified on `vp preview`
  (prod-strict): the same `/switch-test` page hydrates with 0 console errors.
- **Root cause: consuming the library PRE-COMPILED in separate DOM and SSR
  passes** (the "compiled-dual" build). The two bundles, compiled independently
  by `unplugin-solid` (`generate:"dom"` and `generate:"ssr"`), assign
  **misaligned Solid hydration keys** for nested-component structures. In dev,
  Solid's `devComponent` wrapper exposes the drift → `getNextElement` fails.
- **The fix is consumer-compilation**: ship the lib so the _consumer_
  compiles it — the **`solid` → `dist/*.jsx` JSX-preserve pattern** that kobalte
  /corvu/`tsup-preset-solid` use. Then the consumer's `vite-plugin-solid`
  compiles DOM + SSR from **one source in one Vite run** → keys align → clean.
- **Proven (2026-06-02):** with pokeforos consuming the lib via a **`src` alias**
  (consumer compiles), the Switch hydrates **cleanly** in dev; consuming the
  **compiled-dual** build **crashes**. Same component, same wrapper — only the
  consumption differs.

## Why this matters / the goal

pokeforos (`proyecto-viviana/social`) is the first real consumer of this design
system. We want: (a) a publishable lib, (b) a clean `vp dev` experience for app
developers, (c) correct SSR on Cloudflare Workers (workerd). Production already
works; the open problem was the **dev** hydration crash on nested components.

## Validated outcomes that stand (keep these)

1. **tsup → tsdown migration** (commit `bfb16be9`). Fixed a TS 6.0.3 `baseUrl`
   failure (tsup's bundled dts injected the deprecated option; tsdown's dts reads
   the real tsconfig). Note: **`vp pack` _is_ tsdown** under the hood (both are
   void(0)/Rolldown/Oxc), so "migrate solid-spectrum to tsdown" is a no-op in
   disguise — configure tsdown via `vp pack`.
2. **Repo renames**: this repo → `github.com/proyecto-viviana/ui`; pokeforos →
   `github.com/proyecto-viviana/social`. `repository` metadata + git remotes
   updated; committed.
3. **The `style()` macro is an app-level API** (confirmed against the React
   Spectrum S2 docs — apps use `style({...})` directly and customize components
   via the `styles` prop). So pokeforos legitimately uses the macro, and
   **`viviana-ui/style` must ship as built JS** — `@parcel/macros` refuses to
   strip types from a `.ts` file under `node_modules` ("Stripping types is
   currently unsupported for files under node_modules"). This is a real
   publish-blocker we fixed (build `src/style.ts` → `dist/style.js`).
4. **A minor correctness fix in `VisuallyHidden`**: `splitProps` must extract
   `children`, else it stays in `others` and is both spread via `{...mergedProps()}`
   AND rendered explicitly → the children getter is read twice (solid-start
   #1752). Read once. (This is correct, but it is **not** the crash fix — the
   crash persisted with it in place.)

## The crash

```
Error: Hydration Mismatch. Unable to find DOM nodes for hydration key: 000…0010
  at getNextElement (solid-js/web)
  at …/solid-spectrum/dist/index.js  (inside ToggleSwitch)
  at devComponent (solid-js.js)      ← Solid DEV-only component wrapper
  at createComponent (solid-js.js)
```

- The SSR HTML is **complete and correct** (the `<input>`, label, and children
  all render). It is purely a **hydration-key sequence mismatch** between the SSR
  output and what the client expects.
- `devComponent` is Solid's dev-build runtime wrapper: it wraps each component's
  `createComponent` in an extra reactive computation that records name/props for
  the Solid DevTools + HMR. It exists **only in dev** (prod strips it). The
  **server build of solid-js has no `devComponent`** (its `createComponent` calls
  the component directly). That client-vs-server asymmetry is harmless for most
  apps, but it _exposes_ the key drift introduced by separate dom/ssr
  compilation, specifically for nested components.
- Only **nested** lib components trip it (Switch → VisuallyHidden); flat
  components (homepage cards/buttons) are clean.

## Approaches tried + results

| Consumption approach                                                                                | Prod (`vp preview`) | Dev (`vp dev`)                                                           | Notes                                            |
| --------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------ | ------------------------------------------------ |
| `src` alias (consumer compiles source)                                                              | clean               | **CLEAN** (2026-06-02)                                                   | dom+ssr from one source/run → aligned keys       |
| JSX-preserve (`solid`→`dist/*.jsx`, consumer compiles)                                              | clean               | _expected clean_ (kobalte pattern; not yet re-verified — see next steps) | committed at `fc9128a0`/`1754f4b5`/`d2193352`    |
| Compiled-dual (`dist/index.js` DOM + `dist/index.ssr.js` SSR, `workerd`/`worker`/`node` conditions) | clean               | **CRASHES**                                                              | separate compilation → misaligned hydration keys |

Other facts established:

- **Cloudflare workerd SSR uses `conditions: ["workerd","worker","browser",
"import","module"]` — never `node`.** So a compiled-dual `node`→ssr.js mapping
  silently fell through to `import`→index.js (the DOM build) on the server →
  "Client-only API called on the server side." Routing must use `workerd`/`worker`
  (which the client doesn't have). This matters only if compiled-dual is ever
  revived; the recommended path (jsx-preserve) avoids it (the consumer compiles
  per-environment, so no condition juggling).
- A **hand-written, high-fidelity mimic** of ToggleSwitch's structure (label
  spreads, VisuallyHidden component, void `<input>`, ref, `children()` helper,
  track) — compiled by pokeforos's own `vite-plugin-solid` — **hydrates clean**.
  So the trigger is **not** the JSX structure; it's the separate compilation.

## Confounds we hit (so the history isn't misread)

1. **Test-harness bug:** an early `/switch-test` wrapped components in
   `<p data-test=…>`, and the components render a `<label>` containing a `<div>`.
   `<div>` inside `<p>` is invalid HTML → the browser auto-closes the `<p>` → the
   parsed DOM diverges from the SSR string → a hydration mismatch **independent of
   the Switch**. Several "it still crashes" readings during bisection were this,
   not the component. Always reproduce in a `<div>` wrapper.
2. **`/perfil` 307-redirects** when unauthed, so testing the Switch there measured
   the redirect target, not perfil. Use a dedicated public route.
3. The earlier belief that "the crash is identical across all consumption modes /
   it's purely `devComponent` / it's build-independent" was based on these
   confounded tests and is **wrong** — see the decisive experiment below.

## The decisive experiment (2026-06-02)

Same lib Switch, same clean `<div>` wrapper, dev server, real browser
(playwright):

- Consumed **compiled-dual** (from a `pnpm pack` tarball in node_modules):
  **crashes** (`getNextElement` in ToggleSwitch, `devComponent`).
- Consumed via **`src` alias** (pokeforos's `vite-plugin-solid` compiles the lib
  source, DOM + SSR from one source in one run): **clean, 0 errors.**

Only the consumption/compilation differs → **the separate dom/ssr compilation is
the cause; consumer-compilation is the fix.** This is also exactly why **kobalte
is clean**: it ships JSX (`solid`→`dist/index.jsx`) for the consumer to compile.

## Conclusion

The pivot to **compiled-dual** (separate pre-built DOM + SSR bundles, routed by
export conditions) was the wrong turn — it introduced the hydration-key
misalignment. The **JSX-preserve / `solid` condition** approach (consumer
compiles) is correct and is what the committed state (`d2193352`) already has.

## Next steps (when resuming)

1. ~~Revert the compiled-dual experiment back to JSX-preserve.~~ **DONE** — the
   committed build (`fc9128a0`/`1754f4b5`/`d2193352`) is JSX-preserve
   (`solid`→`dist/*.jsx`, `default`→`dist/*.js`, no `workerd`/`node`→ssr routing).
   No compiled-dual changes remain.
2. ~~Verify JSX-preserve + `VisuallyHidden` is clean in `vp dev`.~~ **DONE
   (2026-06-02)** — `/perfil` Switch ("Notificaciones por email", checked)
   hydrates with **0 errors** under the `src`-alias consumption (consumer
   compiles). `VisuallyHidden` is intact (codex's overlay reverted).
3. Decide whether to keep the small **VisuallyHidden `splitProps(children)`** fix
   (correct; harmless — currently uncommitted) and **publish** (changeset already
   staged: `.changeset/tsdown-jsx-preserve-exports.md`). For JSX-preserve the
   consumer compiles the `.jsx`, so the macro is expanded at lib-build time and
   consumers don't need the macro plugin for the lib's own styles.
4. **Verify the published path** before relying on it: have pokeforos consume the
   lib's built `dist/*.jsx` **from node_modules** (via the `solid` condition,
   `pnpm pack`/`link`), not the `src` alias. Same mechanism (consumer compiles the
   `.jsx`), so expected clean — but not yet re-confirmed with the actual built
   artifact.
5. Update dependencies across both repos ("just in case" maintenance) — deferred.
6. Then switch pokeforos's dep from the alias/`link:` to the **published**
   `^0.0.x` and re-verify dev + prod.

## Repo state (uncommitted in this repo, 2026-06-02)

The compiled-dual experiment is fully reverted; `ToggleSwitch` is the committed
react-aria-faithful `VisuallyHidden` version (no diff vs HEAD). Remaining
uncommitted, all keep-worthy:

- `docs/dev-hydration-investigation.md` — this writeup.
- `packages/solidaria-components/src/VisuallyHidden.tsx` — the `splitProps`
  children fix (correctness; see "Validated outcomes" #4). **Keep.**
- `packages/viviana-ui/{package.json,tsdown.config.ts}` — build `src/style.ts` →
  `dist/style.js` so the `viviana-ui/style` macro entry ships as JS (the
  macro-from-node_modules publish-blocker; see "Validated outcomes" #3). **Keep.**
- `apps/web/src/routeTree.gen.ts` — generated; ignore/revert.

`bfb16be9` (tsdown), `fc9128a0`/`1754f4b5`/`d2193352` (JSX-preserve build),
`a4a375f1` (this doc's first cut), and the repo-rename commits are committed and
correct.
