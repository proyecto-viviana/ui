---
id: 545
type: task
title: "Move the web app to the TanStack Solid 2 line"
created: 2026-09-20
parent: 531
status: next
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
---

## Scope

`apps/web` pins `@tanstack/solid-router` 1.170.29, `@tanstack/solid-start`
1.168.46, and `@tanstack/router-core` 1.171.26. Those releases peer on
`solid-js ^1.9.10` and import `solid-js/web`, which Solid 2 no longer exports.
Site Gate fails with `"./web" is not exported` from `apps/web/node_modules/solid-js`.
The app's own sources already import `@solidjs/web`.

1. Bump router and start to the `rc` dist-tag, `2.0.0-rc.8`. Align
   `router-core` and any TanStack plugin to the versions that line requires.
2. Fix what the major breaks in `apps/web`: route definitions, the locale
   rewrite, head and meta, server entry.
3. Add no other dependency.

## Done when

`vp run build:web` passes. The built site serves the landing page, one docs
page, and `/theme` with SSR and hydration and no console error. Site Gate is
green on the pushed revision.

## Proof

`vp run build:web`, `vp run guard:deploy-target`, a browser pass over the three
routes against a fresh preview, and the Site Gate run id recorded here.

## Relationship

Child of #531. Blocks #549 and every docs deploy. Section 1 of
[#87](./87-close-every-remaining-audit-item-in-order.md) names this work.
