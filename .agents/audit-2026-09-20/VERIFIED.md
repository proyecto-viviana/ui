# Audit verification — ticket #546

Each row is a finding the conductor reproduced itself. A worker's word is not
a row. `fixed` names the commit; `ticket` names where unfixed work lives.

| lens | finding | reproduced by | outcome |
| --- | --- | --- | --- |
| 1 | Virtualizer item effect strands its ResizeObserver and frame behind an early `return` | new test `releases item observers and pending frames on unmount` fails on the old source (2 observers never disconnect), passes on the fix; suite 79/79 | fixed, this commit |
| 2 | a certified spec that fails to load still passes the gate | read `certified-summary.ts` (no `onError`), the workflow's `continue-on-error`, and `merge-certified-reports.ts` (fails only on `waiverGateFails`) | ticket #553 |
| 2 | no floor on the number of discovered certified cases | no baseline file and no guard reads one | ticket #553 |
| 2 | `knownDivergences` are unpoliced | `certified-waivers.json` is `[]` | ticket #553 |
| 2 | CI retries hide flaky cases | retry count in the certified workflow, no flaky budget in the merge | ticket #553 |
| 2 | ~~`guard:release-prerequisites` inspects no shipping package~~ | true when the audit ran; **closed by `76bd2b06`** (#553, 2026-09-20 13:57), which widened the config from kumo-only to all five candidates and made the guard read its subjects from the tree. Re-verified 2026-09-20 late: `releasablePackages()` returns 5, all 5 are listed with dated registry evidence, and the entry loop checks every one | fixed, `76bd2b06` |
| 2 | `guard:publish-drift` diffs `src` only, never the manifest | `scripts/check-publish-drift.mjs:94-99` | ticket #553 |
| 2 | npm is unpinned in the release job | `release.yml:58` `npm@^11.5.1` | ticket #553 |
| 2 | `Changesets Check` runs on `pull_request` only | its `on:` block | decided: **keep the trigger**, see below |
| 2 | no workflow calls the `comparison:test:*` scripts except certified-waivers and journeys-driver | searched the workflows for each script name | ticket #553 |
| 5 | `FocusScope.tsx:395` queries `[data-react-aria-top-layer]`, the toast region sets `data-solidaria-top-layer` | both files read; the attribute names do not match | ticket #555 |
| 5 | `Modal.tsx:490-507` sets a one-off `overflow: hidden` instead of `createPreventScroll` | upstream `useModalOverlay.ts:65-67` calls `usePreventScroll` | ticket #555 |
| 5 | `createOverlay` `onBlurWithin` lacks `isElementInChildOfActiveScope` | upstream `useOverlay.ts:148-161` | ticket #555 |
| 5 | `createOverlay` lacks `lastVisibleOverlay` tracking and `preventDefault` on start | upstream `useOverlay.ts:100-126` | ticket #555 |
| 5 | `createPreventScroll.ts:160-167` injects a style tag without a nonce | upstream `usePreventScroll.ts:139-150` | ticket #555 |
| 5 | `createOverlay` adds a document-level `focusin` close listener upstream `useOverlay` does not have | seen while verifying the rows above; whether it is invented is open | ticket #555 |
| 5 | `createDialog` uses `createUniqueId`, not `createSlotId` | upstream `useDialog.ts:56-60` uses `useSlotId` | ticket #555 |
| 5 | `createId` skips `createUniqueId` when a `defaultId` is given | `ssr/index.tsx:90-93`; twin `solid-stately/src/ssr/index.ts:49-54` | ticket #555 |
| 5 | `openLink` assigns `window.location` instead of dispatching on the anchor | `dom.ts:572-590` vs upstream `openLink.tsx:106-144`; `RouterProvider.tsx:112-123` already holds the faithful copy | ticket #555 |
| 1 | `ButtonGroup` drops the `children` dependency, in two twins | pre `local.children` at `:161`; upstream `ButtonGroup.tsx:157` lists children in its deps | ticket #555 |
| P | `build:web` is red on an upstream rename, not on our source | `@solidjs/web` rc.9 renamed `parseServerFunctionUrl`/`serverFunctionUrl` to `parseServerFunctionActionUrl`/`serverFunctionActionUrl`; `@tanstack/solid-start@2.0.0-rc.8` uses the old names in `dist/esm/server-functions-handler.js`. Read from both published tarballs | see `.agents/green-main-2026-09-20.decision-solid-start-patch.md` |

## Not reproduced

The conductor did not reproduce these; they stay claims until someone does.

- lens 5: the `apps/web` Worker security headers, the style-macro `new Function`
  (informational), and the `Modal` `ariaHideOutside` non-reactive ref — which
  the lens itself marked UNPROVEN.
- lens 1: the `createTrackedEffect` debt (185 sites, informational) → #554;
  the `createToastRegion` squashed header; the 12 dead imports.

## The `Changesets Check` trigger — decided 2026-09-20, keep it

The trigger stays `pull_request`. The reasoning is already recorded in
`release-policy.md:92-95` by #553 slice 5 and it holds: on a direct push to
`main` the changeset is in the tree beside the change it describes, and
`guard:publish-drift` fails any unreleased `src` or manifest change that no
pending changeset publishes.

Moving the workflow to `push` would also not do what it looks like it does.
Both diff-shaped scripts default `baseRef` to `origin/main`
(`check-changeset-required.mjs:6`, `check-changeset-status.mjs:7`), and on a
push to `main` `origin/main...HEAD` is empty — they would pass vacuously unless
someone also threaded `CHANGESET_BASE_REF: ${{ github.event.before }}` through.
A vacuous green is worse than an honest absence.

One thing the policy sentence does not say, and should: its compensating guard
is **currently dormant**. `guard:publish-drift` reaches the push path only from
`release.yml:75`, and `release.yml` runs on `workflow_run` of `Certification
Gates` with `if: …conclusion == 'success'`. Gates is red, so the last eight
`Release` runs all concluded `skipped` (`gh run list --workflow=release.yml`,
2026-09-21 01:30–01:59Z). The guard is sound and has not executed on any commit
of this campaign.

That is not an argument for changing the trigger. It is one more reason the gate
reds are the release's critical path, and it is recorded in #568, which owns
"a gate nobody runs is a gate in name only".
