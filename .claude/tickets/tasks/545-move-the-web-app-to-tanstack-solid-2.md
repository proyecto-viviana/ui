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
