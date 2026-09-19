# UI #536 hook allocation parity — 2026-09-19

Starting revision: `ea89fa97c24222294df74c1a707f4bf6c830f5b0`, branch `main`.
Initial status and index were clean. Owner-directed autonomous execution keeps
root as sole writer; independent agents inspect without writing or running
proof. This receipt is a bounded foundation slice, not release acceptance.

## Named scope and diagnosis

- `packages/solidaria/src/interactions/createInteractionModality.ts`: remove
  server early returns from createFocusVisible/useIsKeyboardFocused. Their real
  effect registration must reserve the same owner slot on both sides; preserve
  false SSR values and existing keyboard/pointer behavior.
- `packages/solidaria/src/ssr/index.tsx`: symmetric createHydrationState/useIsSSR,
  tracked createBrowserEffect and one-time createBrowserValue. Client-source
  effects wait for hydration snapshot release; CSR/remount hydration state is
  immediately false. A wrapper initializer retains function-valued fallbacks
  rather than invoking them. No public signature, dependency or version change.
- New `packages/solidaria/test/fixtures/hydrationHooks.tsx` and
  `hydrationHooks.ssr.test.tsx`, `hydrationHooks.hydrate.test.tsx`,
  `hydrationHooks.test.tsx`: seven shared cases plus two CSR regressions.
- Existing `packages/solidaria/test/createFocusRing.test.tsx`: establish the
  missing keyboard precondition for its autoFocus positive case; preserve its
  true assertion and add pointer-modality false coverage. No product repair.
- #536/#531 dated progress, this receipt, generated status/roadmap via the
  supported docs command. Temporary logs and full command ledger are under
  `/tmp/ui-execution-536-hooks-`.

Installed rc.9 server effects reserve owner child IDs even when their browser
callbacks do not execute. All six old-source hydration cases report missing
client key `32` against unclaimed server span key `31`/ID `30`. The new fixtures
allocate createUniqueId immediately after the hook in the same owner; a sibling
component alone would not detect this. A runtime multiple-Solid warning is not
the diagnosis. No package installation or Kumo behavior change is involved.

The browser renderer flushes ordinary effects before completing hydration.
`ssrSource: "client"` is the supported snapshot boundary. Browser effects remain
tracked, with cleanup before reruns/disposal; browser values remain untracked,
one-time computations. Solid 2 treats a function signal initializer as a
computation, so direct fallback initialization was rejected by independent
review and a failing control before the wrapper correction.

## Proof

All test runs use one worker, sequentially. Focused commands are bounded at 90s;
full lanes at 120s. No lane hangs or reaches its bound. Exact commands, exit
codes, logs and final Git outcome: `/tmp/ui-execution-536-hooks-result.md`.

| Phase / log suffix                          | Exit   | Result                                                  |
| ------------------------------------------- | ------ | ------------------------------------------------------- |
| Old-source `baseline-ssr.log`               | 0      | 6/6, 444ms                                              |
| Old-source `baseline-hydrate.log`           | 1      | 0/6, 1.44s; each missing key 32                         |
| Corrected `focused-ssr.log`                 | 0      | 6/6, 455ms                                              |
| Corrected `focused-hydrate.log`             | 0      | 6/6, 1.22s                                              |
| Function fallback `function-control.log`    | 1      | 6/7, 506ms; fallback must not be invoked                |
| `final-focused-ssr.log`                     | 0      | 7/7, 562ms                                              |
| `final-focused-hydrate.log`                 | 0      | 7/7, 1.64s                                              |
| Complete `full-ssr.log`                     | 0      | 60/60, 26 files, 33.00s                                 |
| Then complete `full-hydrate.log`            | 0      | 68/68, 25 files, 25.23s                                 |
| Original owning `owning.log`                | 1      | 85/86, focus-ring precondition failure                  |
| Existing isolated `focus-ring-isolated.log` | 0      | 23/23, 1.42s                                            |
| Committed-source `owning-baseline.log`      | 1      | 83/86: same focus-ring failure and two new CSR controls |
| `focus-keyboard.log`, `focus-pointer.log`   | 0 each | Selected 1/1 each; 23 unrelated tests filtered each     |
| `focus-ring-final.log`                      | 0      | 24/24, 1.50s                                            |
| `owning-final.log`                          | 0      | 87/87, five files, 2.91s                                |
| Final `acceptance-ssr.log`                  | 0      | 60/60, 26 files, 36.50s                                 |
| Then `acceptance-hydrate.log`               | 0      | 68/68, 25 files, 13.27s                                 |
| `typecheck.log`                             | 0      | `vp run typecheck`                                      |
| `check.log`                                 | 0      | Seven-path formatting/lint check                        |
| Docs wrappers                               | 1 each | Sandbox tsx IPC EPERM                                   |
| Direct docs generate/check                  | 0 each | Supported no-IPC equivalents                            |

Source was restored byte-for-byte after the committed-source control. The
focus-ring implementation never calls the modified hooks. Both the pinned
`react-spectrum/packages/react-aria/src/focus/useFocusRing.ts` and local handler
replace autoFocus's seed with current modality on focus; programmatic focus
preserves that modality. The old test did not establish it. The correction
does not infer which earlier test left pointer state or claim random flakiness.
Independent review accepted the explicit keyboard and pointer expectations.

Hydration proof includes exact SSR node/ref identity, computed ID equality,
keyboard/pointer updates, construction-time hydration snapshots, deferred
browser work, tracked reruns, one-time values, function identity/no invocation,
nonnull remounts, balanced cleanup and disposed subscriptions. SSR proves no
browser callback runs. Independent source/test review found no remaining
blocker in this bounded slice.

## Remaining acceptance

The final fresh SSR then hydrate rerun is green, as are typecheck and scoped
formatting/lint. Both docs wrappers fail with the known sandbox tsx IPC EPERM;
`node --import tsx scripts/generate-work-views.ts --write` and
`node --import tsx scripts/check-docs-current.ts` pass. Only generated
status/roadmap board hashes change; no unexpected generated files are tracked.
Attribution remains the existing
64 mismatches (one exact-source, 63 reviewed-local); the two changed source paths
are not reported. The 103 mappings needing review are a separate statistic.
No mass hash refresh or attribution waiver is authorized. Parent ecosystem
gate passes 38/38 outside the sandbox; no parent files were edited.

#536 remains in-progress: createAutoFocus/createFocusRestore symmetric lifecycle
registration, FocusScope structure, public portal-route proof, stale guidance
and real shell-first asynchronous streaming remain. createVirtualFocus's literal
signal does not allocate an owner ID; preserve the guard pending its control.
ModalContent's private SSR return is publicly gated; no blanket removal.
#534 retains the full scheduler audit and delayed-focus cancellation behavior.
#531 retains all sibling/build requirements and attribution debt.

#139 precedes packaging; #194 evidence repairs precede #537's live 2,177-case
same-revision zero-failure/skip/waiver proof. No broad ordinary suite, build,
packaging, certified run, versioning or publication ran in this slice. #87's
census, #136 owner holds, successor #245 and skip #254 remain. Kumo/Geist stay
experimental with no first release inferred. The persistent goal stays active
until eligible packages actually pass all gates, publish through the authorized
workflow and have verified artifacts.
