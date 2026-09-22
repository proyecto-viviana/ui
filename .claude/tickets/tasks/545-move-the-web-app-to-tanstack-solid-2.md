---
id: 545
type: task
title: "Move the web app to the TanStack Solid 2 line"
created: 2026-09-20
parent: 531
status: in-progress
history:
  - {
      state: next,
      at: 2026-09-20,
      note: "opened under #531 from the red Site Gate on 77f0de27. Owner approved the 2.0.0-rc.8 bump on 2026-09-20 (#544). Write paths: apps/web/package.json, the lockfile, and apps/web sources the new major forces",
    }
  - {
      state: next,
      at: 2026-09-20,
      note: "record corrected by the conductor: the ticket read `next` while most of it had already shipped, which is the tree beating the document. `dd634d36` bumped router and start to 2.0.0-rc.8 and pinned `router-core` to the 1.171.22 that line and start-plugin-core share, then `d7bcadf5`, `7e1bf524`, `574dfad2` and the createResource commit took `vp run typecheck:apps` from 45 errors to 11, none under `src/app/admin/`, and `grep -rn createResource apps/web/src/` is empty. What is left is not ours: `build:web` dies on `[MISSING_EXPORT] parseServerFunctionUrl` because `@solidjs/web` rc.9 renamed it to `parseServerFunctionActionUrl` while `@tanstack/solid-start` rc.8 still imports the old name under a peer range that admits rc.9, and rc.8 is the last published version. This makes the ticket an RC blocker by a route nobody had traced: `a11y:full` is three `--filter @proyecto-viviana/web` legs and `apps/web/playwright.config.ts:33` starts its server with `vp build && vp preview`, so step 251 of the gates ladder is exactly as green as `build:web`. Two repairs exist and both are the owner's: pin `@solidjs/web` back, a repo-wide framework downgrade that reaches into #531's port of all seven packages, or patch the upstream import - one renamed identifier, one file, one app's dependency, no published package touched, which is the one I would take. Still owed behind it: `guard:deploy-target` and the browser pass",
    }
  - {
      state: next,
      at: 2026-09-20,
      note: "the entry above is wrong and is retracted here rather than edited, because the mistake is worth keeping. It said `build:web` dies on `[MISSING_EXPORT] parseServerFunctionUrl` and that closing it was an unanswered owner call. Both were already false when it was written: `1df7af51`, on this ticket, patches the three call sites in `@tanstack/solid-start@2.0.0-rc.8`'s `dist/esm/server-functions-handler.js` to the rc.9 names, wired through `pnpm-workspace.yaml` `patchedDependencies` and keyed to the exact version so the install fails the day TanStack moves; the reasoning is `.agents/green-main-2026-09-20.decision-solid-start-patch.md` and the owner confirmed it. `vp run build:web` EXIT=0 here, `built in 4.40s`, receipt `.agents/chain-walk-2026-09-20/ladder-build-web-after-patch.out.txt`. The peers half was answered too, by `ca1a0d82` under #532, through `peerDependencyRules.allowedVersions` rather than the `allowAny` silencing I argued against. The cause of the error is the one this repository has a rule for: I read `.agents/green-main-2026-09-20.log.md`'s `Left red` as the state of the tree and did not run the command. What actually remains of this ticket is the rest of its Done when - the built site serving landing, one docs page and `/theme` with SSR and hydration and no console error, and Site Gate green on the pushed revision, which waits on the gate workflows being re-enabled. Step 251 of the certification ladder is unblocked by this and is being walked now",
    }
  - {
      state: next,
      at: 2026-09-21,
      note: 'the rest of the Done when is now measured rather than waited on, and it is red. `vp run test:routes` on `eb75ee0e` - one of the five legs of `ci:site`, which is the whole of Site Gate''s blocking step - reports 22 failed and 153 passed over 174 routes. `/theme` is one of the 22, by name, so this ticket cannot close on this revision and #549 stays blocked behind it. Two classes. Twenty routes server-render to nothing: the response is 200, the preview logs `GET /theme 200 OK (14ms)`, and the served HTML closes its first hydration boundary empty and streams `new Error("Internal Server Error")` into the `$R` resolver, so the route component throws during server render after the shell has already gone out. They are shell-sized where a working route is not - `/theme` 15,285 bytes against `/solid-spectrum/docs/components/button` at 88,026 - and they are `/theme`, all eleven `/examples*`, five of the six `/showcase/*`, and the breadcrumbs, menu and tree docs pages. Two more render and then throw in the browser: `/showcase/inputs` at `get suffix` through `mergeProps`, and the combobox docs page on `Hydration Mismatch. Unable to find DOM nodes for hydration key`. Both are Solid 2 reactivity shapes, not styling. The generic `Internal Server Error` is all a production build leaves, and `vp dev` cannot supply the real one: starting it rebuilds the workspace `dist` and the SSR graph reads it mid-write, producing spurious `Failed to load url` errors for files that all exist. Full reading, with the byte table and the two HTML extracts, in `.agents/site-gate-2026-09-21.routes.md`. The route sweep also checks the console only after the text-length assertion, so the twenty blank routes may be logging errors nobody has read yet. Green on this revision and recorded: `vp run build:web` EXIT=0, built in 4.28s, and `vp run guard:deploy-target` OK for Worker "viviana-ui-docs". The other three `ci:site` legs - `a11y:check`, `test:seo`, `test:api-reference` - are still unrun locally',
    }
  - {
      state: next,
      at: 2026-09-21,
      note: "a third `ci:site` leg measured, and the dead routes turn out to be hiding a second defect behind themselves. `vp run a11y:contrast` - one of the four `&&`-chained legs of `a11y:check` - is red on `eb75ee0e`: 6 routes, 30 instances, over 170 of 174 tests before the harness stopped the run for machine memory. Three of the six failing routes are `/showcase/inputs`, `/showcase/parity` and `/solid-spectrum/docs/components/combobox`, which are exactly three of this ticket's throwing routes - so what the contrast spec measured on them is not the page, it is `apps/web/src/routes/__root.tsx`'s error boundary, whose own colours are `#9ca3af` at 2.34:1 and white on `#3b82f6` at 3.67:1. Closing this ticket takes those three out of the contrast tally and leaves the boundary just as unreadable for the next thing that throws; that half is #586 and is independent of this work. The other three failures are not mine: `/` and `/admin` paint `--interactive-fill` as ink at 3.28:1, a token defect also filed as #586, and `/docs/components/tree` fails with `page.goto: Page crashed` - note the path, the route sweep covered the `/solid-spectrum/` twin and not this one, so it is a new and previously unrecorded route, and a renderer crash rather than a throw to the boundary. It may or may not be this ticket's; whoever takes #545 should check it while they have the SSR graph in hand. Full reading in `.agents/site-gate-2026-09-21.contrast.md`. The fourth leg, `a11y:smoke`, was killed before it produced output and is still unrun; it covers `theme-wipe.spec.ts` and `examples.spec.ts`, which target `/theme` and `/examples*`, both on this ticket's dead list, so it is expected red for this ticket's reason - unverified until someone runs it",
    }
  - {
      state: next,
      at: 2026-09-21,
      note: "2026-09-21 round-1 audit, receipt `.agents/audit-2026-09-21/round-1-results.md`, finding `apps-web/twentytwo-dead-routes-still-open`, high, confirmed: 22 of 174 routes are dead in a production build and this ticket is still open. Narrowed by the skeptic, and the narrowing is useful - all 84 `/docs/components/*` routes pass, so the dead set is somewhere else and a component-by-component sweep is the wrong search. Name the 22 before fixing any of them.",
    }
  - {
      state: in-progress,
      at: 2026-09-21,
      note: "the twenty blank routes are one defect, and it is fixed in this commit. Both copies of ContextualHelpTrigger bound their icons to module-scope `const helpIcon = <svg…>`. JSX at module scope is a value built when the module is evaluated: compiled for the server it runs `ssrHydrationKey()` with no owner, and `getHydrationKey()` is inert only while `sharedConfig.context` is unset - `renderToString` sets that context and never clears it. So on a process that has served one page, evaluating the module throws `getNextContextId cannot be used under non-hydrating context`, the module fails, and every route importing anything from it serves an empty shell with HTTP 200. That is why no component test saw it and why all 84 `/docs/components/*` routes passed: a cold server renders the first page fine. Fixed by rendering each icon from a component, as S2's `Menu.tsx` renders `<InfoCircleIcon>` inside `UnavailableIconWrapper`. Proof that fails first: `packages/solid-spectrum/test/ContextualHelpTrigger.ssr.test.tsx` and its viviana-ui twin warm the server with one `renderToString` and then import the module - on the pre-fix source, 3 failed | 1 passed each, at `ContextualHelpTrigger.tsx:89` and `:100`; after, 4 passed each, and `vp run test:ssr` is 32 files / 87 tests, EXIT=0. An AST sweep of every module-scope JSX expression across the seven published `packages/*/src` roots, 1750 files, found exactly these 4 sites and no other, and `guard:idiomatic-solid` now carries the rule as its fourth check, pinned in `scripts/test-ci-guard-contracts.mjs`; it fails with all four named on the pre-fix tree, EXIT=1, and passes on this one. Measured after: `vp run build` EXIT=0, `vp run build:web` EXIT=0, `vp run test:routes` 170 passed / 5 failed of 175, against 153/22 before. The five are the other two classes, and three of them were hidden behind a blank page that could not reach the console check: `get suffix` through `mergeProps` on `/showcase/inputs` and `/showcase/parity`, and `Hydration Mismatch. Unable to find DOM nodes for hydration key` on `/solid-spectrum/docs/components/breadcrumbs`, `/solid-spectrum/docs/components/combobox` and `/showcase/navigation`. Both classes are being diagnosed separately in this campaign; neither is a styling defect. Receipt `.agents/ssr-545-2026-09-21.module-scope-jsx.md`. Not merged: `test:routes` is still red, and this seat does not push, so Site Gate on the pushed revision is unread",
    }
  - {
      state: in-progress,
      at: 2026-09-21,
      note: "review of the commit above found three holes and all three were real; measured before fixing, and one of the reviewer's two proposed shapes for the second was measured wrong and taken the other way. (1) `findModuleScopeJsx` descended into an IIFE with `ts.forEachChild(node.body, visit)`, which never visits the body node itself, so a concise-body arrow IIFE — `export const icon = (() => <svg …/>)()` — evaluated JSX at module scope and the guard exited 0 on it; it now visits a concise body directly. (2) The guard treated every function boundary as call time, so JSX built by a callback a module-scope call runs before it returns — `NAMES.map((n) => <Icon …/>)`, `Array.from({length: 3}, () => <Icon />)`, `forEach`, `untrack(() => <Sun />)` — was missed, each of which reproduces this ticket's defect exactly. The reviewer offered a denylist of deferring callees; the tree says the opposite, so it is an allowlist of eagerly-invoking ones: treating EVERY callback argument as module scope flags three call-time sites on today's 1750 files (`createLeafComponent` in both skeleton modules, `createHideableComponent`+`createMemo` in `TokenField.tsx`), because most module-scope callbacks in these packages are component factories. With EAGER_CALLBACK_CALLEES — the array iterators plus `Array.from` and `untrack` — `vp run guard:idiomatic-solid` is EXIT=0 on this tree and the remaining blind spot is named in the doc comment and in Scope above, in place of the `refuses ... in every published package` claim, which was wider than the code. Both fixes fail first: on the pre-fix `check-idiomatic-solid.ts` the two new cases in `scripts/check-idiomatic-solid.test.ts` are 2 failed | 15 passed, after 17 passed. (3) The browser half of the shipped claim — 'one DOM node shared by every trigger' — had no proof: every new test runs under `vitest.ssr.config.ts`, where a module-scope icon is an `ssr()` string that can be emitted any number of times, so `html.match(/<svg/g).length === 2` passes on a shared value and fails pre-fix only because the warm render earlier in the file had already poisoned the module. NEW `packages/solid-spectrum/test/ContextualHelpTrigger.test.tsx` (two cases) and NEW `packages/viviana-ui/test/ContextualHelpTrigger.test.tsx` render two triggers into the DOM and assert two distinct `<svg>` nodes: on the pre-fix component source, 4 failed | 16 passed with `expected ... to have a length of 2 but got 1` — the shared node, measured — and 20 passed after. The SSR case is renamed `renders an icon for every instance` and says in a comment what it can and cannot see. Green on this commit: `vp run guard:idiomatic-solid` EXIT=0, `vp run test:ci-guard-contracts` EXIT=0, `vp run guard:layer-boundary` EXIT=0, `vp exec tsx scripts/check-changeset-required.mjs` EXIT=0, `vp lint` EXIT=0, `vp run typecheck` EXIT=0, the two SSR twins 8 passed EXIT=0, the three touched client/guard files 37 passed EXIT=0. Receipt `.agents/ssr-545-2026-09-21.review-fixes.md`. Unchanged: `test:routes` is still red on the other two classes, this seat does not push, so nothing here reaches verified",
    }
  - {
      state: in-progress,
      at: 2026-09-22,
      note: "class 2 is closed and class 3 is down to two routes; `vp run test:routes` is 173 passed / 2 failed of 175, against 170/5 before. Class 2 was one defect in two fields. `suffix={<Keyboard/>}` compiles to `get suffix() { return createComponent(Keyboard, …) }` and `createComponent` is `untrack(() => Comp(props))`, so every read runs the body again - and `TextField` read the prop five times, the last of them inside `adornmentIds()`, the thunk `PrefixInputProvider` hands the headless field for the input's `aria-labelledby`. The headless `Input` read `context.inputProps` from inside its ref callback, and Solid 2 applies refs through `runWithOwner(null, …)`, so that last read re-ran the adornment with `getOwner() === null` and `Keyboard` threw on its hydration key. Fixed by resolving each adornment once with Solid's `children()` in `packages/viviana-ui/src/{textfield,searchfield}/index.tsx`, and by reading `context?.inputProps?.ref` in the component body of both `Input` and `TextArea` in `packages/solidaria-components/src/TextField.tsx`. No new dependency; output unchanged, and the regression case asserts both adornment ids still join the accessible name. Class 3's combobox page was the mirror-image mistake: `createComboBox` built its announcement string formatter behind `!isServer`, `createStringFormatter` allocates reactive nodes, and Solid 2 hydration keys are a per-owner path - so the client allocated ids the server never did and every sibling key after it shifted. Help text is where that surfaces: `Text` renders through `ElementTag`/`dynamic`, whose claim has no fallback. Pinned `react-aria@3.52.0` `dist/private/combobox/useComboBox.mjs:75` calls the formatter unconditionally at the top of the hook body and the file has no server guard at all, so we now do the same; the `!stringFormatter` half of three effect guards goes with it. One fix covers both registers - both styled packages compose the headless `ComboBox`, the only caller - so no styled copy changed and the layer-boundary baseline is untouched. Proofs that fail first, then pass: NEW `packages/viviana-ui/test/TextField.adornments.test.tsx` 3 failed | 1 passed, each `expected 8 to be 1`, then 4 passed; NEW `packages/viviana-ui/test/TextField.{ssr,hydrate}.test.tsx`, the hydrate half `Cannot get child id from owner without an id` at `Keyboard packages/viviana-ui/src/text/Keyboard.tsx:101:5`, then 1 passed; NEW `packages/solid-spectrum/test/ComboBox.{ssr,hydrate}.test.tsx`, the hydrate half `Hydration Mismatch. Unable to find DOM nodes for hydration key: 40A1q00010009630` at `getNextElement` → `staticElement`, then 1 passed. The client-only test does NOT throw - by then the `<Show>` read has already built the node under a live owner - so the crash needs the hydrate environment, which is why no existing suite saw it. Green on this tree: `vp run build` EXIT=0, `vp run build:web` EXIT=0, `vp run typecheck` EXIT=0, `vp lint` EXIT=0, `vp run guard:layer-boundary` EXIT=0, `vp exec tsx scripts/check-changeset-required.mjs` EXIT=0, `vp run test:ssr` 34 files / 91 tests EXIT=0, `vp run test:hydrate` 30 files / 101 tests EXIT=0. `vp run test:run` is 6845 passed / 2 failed over 361 files; both failures are `scripts/release-candidates.test.ts` asserting the pre-#599 wording of the release-prerequisites guard, and `git diff HEAD -- scripts/` is empty in this tree, so they are not this work's. Left standing on purpose: seven `<Show when={local.prefix}>…{local.prefix}</Show>` sites still build their adornment twice - solid-spectrum numberfield/textfield/combobox/color and viviana-ui numberfield/combobox/color - but each passes a plain `prefixId` string rather than a thunk an ownerless ref re-reads, so none throws and no route proves them; wasteful, not broken, and unmeasured. What remains of this ticket: `/showcase/navigation` and `/solid-spectrum/docs/components/breadcrumbs`, both the same hydration-mismatch class, keys quoted in the receipt. Note the count too: `Done when` says 174 routes, the spec file reports 175 tests. Receipt `.agents/ssr-545-2026-09-22.adornments-and-combobox-formatter.md`. Not merged: `test:routes` is still red on those two, and this seat does not push, so Site Gate on the pushed revision is unread",
    }
  - {
      state: in-progress,
      at: 2026-09-22,
      note: "review of `096776df` found two problems, both real, and neither asks for a source change. (1) The count sentence in the entry above - `Done when` says 174 routes, the spec file reports 175 tests - records a discrepancy that does not exist, and it is answered here rather than edited out, because the third entry on this ticket sets this board's practice: a wrong entry is retracted in a later one, not rewritten. `apps/web/e2e/route-sweep.spec.ts:31` declares one route-list guard test and `:43-46` declares exactly one test per `ALL_ROUTES` entry, and `ALL_ROUTES` is `parseRoutes()` from `apps/web/src/app/seo/route-manifest.ts`, which prints `ALL_ROUTES.length = 174` on this tree (`vp exec tsx -e` in `apps/web`, EXIT=0, `MINIMUM_EXPECTED_ROUTES = 169`). So 175 = 1 + 174, `Done when`'s 174 routes stands unchanged, and 173 passed / 2 failed of 175 is consistent with it. Nobody should reconcile the criterion upward. (2) The seven `<Show when={local.prefix}>…{local.prefix}</Show>` sites the entry above left standing on purpose were on no board - `grep -rn` over `.claude/tickets/` found them only in that note, #536 which holds the workaround inventory is `verified` and #546 is `merged` - and receipts are evidence, never instructions. They are now #611, and no longer unmeasured: a throwaway jsdom probe with `prefix={<Probe/>}`, run on this revision and deleted rather than committed (it asserts the fixed count), reports 2 instantiations and 1 rendered node for viviana-ui NumberField, ColorField and ComboBox - one component built and discarded per render, so an adornment with an `onMount`, a ref or a context registration fires twice. Still no throw: all seven pass `prefixId={prefixId}`, a plain `createUniqueId()` string, and `withPrefixLabelledBy` resolves `() => props.prefixId`, the prop and never the adornment, so the ownerless ref read that made class 2 crash has no path here. Left out of this ticket deliberately: its Scope writes only published source a named route proves wrong, and no route proves these. Unmeasured and named as such on #611: whether the discarded build is symmetric under hydration. This commit touches the board, the receipt and this note only - no source file changed, so every measurement in the entry above stands. Run here: `vp exec tsx scripts/check-changeset-required.mjs` EXIT=0. Receipt `.agents/ssr-545-2026-09-22.review-fixes.md`. Unchanged: `/showcase/navigation` and the breadcrumbs page are still red, and this seat does not push, so Site Gate on the pushed revision is unread",
    }
---

## Scope

The framework move itself has landed: router and start are on `2.0.0-rc.8`,
`@solidjs/web` rc.9's renamed server-function export is patched through
`pnpm-workspace.yaml`, and `vp run build:web` passes. What is left is the site
that build produces. `vp run test:routes` — one of the five legs of `ci:site`,
which is the whole of Site Gate's blocking step — measured 22 of 174 routes red
on `d1c5f4b3`, in three classes. None of them is a styling defect.

1. **Twenty routes served an empty document with HTTP 200.** Closed: both
   copies of `ContextualHelpTrigger` built their icons at module scope, which on
   a server that has already rendered throws
   `getNextContextId cannot be used under non-hydrating context` and takes the
   whole menu module — and every route importing anything from it — with it.
   `guard:idiomatic-solid` scans all seven published source roots for
   module-scope JSX and refuses every shape it can see from the AST: a binding,
   a collection, a ternary, a `static` field, an IIFE body block or concise, and
   a callback that a module-scope `.map`/`Array.from`/`untrack` runs before it
   returns. Its one named blind spot is a callback run at module evaluation by a
   callee outside that list, documented on `findModuleScopeJsx`.
2. **`get suffix` through `mergeProps`** threw in the browser on
   `/showcase/inputs` and `/showcase/parity`. Closed: a JSX-valued prop is a
   getter that rebuilds the component on every read, and `TextField`'s
   `aria-labelledby` thunk re-read it from inside the input's ref callback,
   which Solid 2 runs with no owner. Both fields resolve each adornment once
   with `children()`, and the headless `Input`/`TextArea` read the context's
   `ref` in the component body.
3. **`Hydration Mismatch. Unable to find DOM nodes for hydration key`** on
   `/solid-spectrum/docs/components/breadcrumbs`,
   `/solid-spectrum/docs/components/combobox` and `/showcase/navigation`. The
   combobox page is closed: `createComboBox` built its string formatter on the
   client only, which shifted every hydration key after it, and upstream's
   `useComboBox` has no such guard. Breadcrumbs and navigation are open and are
   the whole of what is left.

Class 3's two remaining routes are Solid 2 reactivity shapes. Write paths:
`apps/web` sources, and the published package source a named route proves wrong.
Not in scope: the error boundary's own contrast and the
`--interactive-fill`-as-ink defect, both #586; and the seven sibling fields that
still build a component-valued `prefix` twice, which no route proves and which
are #611.

## Done when

`vp run test:routes` passes all 174 routes against the built site, with no
console error. `vp run build:web` passes. Site Gate is green on the pushed
revision.

## Proof

`vp run build`, `vp run build:web`, `vp run test:routes`, `vp run
guard:deploy-target`, `vp run guard:idiomatic-solid`, the SSR regressions under
`vp run test:ssr`, and the Site Gate run id recorded here.

## Relationship

Child of #531. Blocks #549 and every docs deploy. The double-build residue of
class 2 is [#611](./611-seven-styled-fields-build-their-prefix-adornment-twice.md).
Section 1 of
[#87](./87-close-every-remaining-audit-item-in-order.md) names this work. The
error boundary that painted three of these routes in the contrast tally is
[#586](./586-the-accent-fill-is-used-as-ink-and-fails-aa-on-the-landing-page.md).
