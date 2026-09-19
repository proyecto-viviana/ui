# UI #536 hydration-state migration — 2026-09-19

Starting revision: `75a9a9d8add3ff3b99ceb640cf2999b70c7f58da`, branch `main`.
Initial working tree and index were clean. Root remains the sole writer;
independent reviewers read runtime, source and tests without editing or running
proof. The owner requested autonomous execution through eligible-package release;
this receipt covers only the next bounded foundation slice, not that outcome.

## Source and named scope

- `packages/solidaria-components/src/utils.tsx`: ClientOnly uses the same hook
  and Show structure on server/client; useIsHydrated initializes immediately
  true for CSR/remounts and registers a client-source effect symmetrically.
- `packages/solidaria/src/virtualizer/ScrollView.ts`: both existing effects use
  `ssrSource: "client"`; remove the obsolete context/done guard and rationale.
- Existing component tests: `test/fixtures/utils.tsx`, `utils.ssr.test.tsx`,
  `utils.hydrate.test.tsx`, `utils.test.tsx`, `test/fixtures/virtualizer.tsx`,
  `Virtualizer.ssr.test.tsx`, `Virtualizer.hydrate.test.tsx`. These add lifecycle
  regressions and explicit hydration-root teardown without weakening existing
  behavior or identity expectations.
- #536/#531 dated progress, #87 dated owner-goal coordination, this receipt,
  and generated status/roadmap through the supported docs command.

Installed rc.9 defines `sharedConfig.hydrating`, not `context`. Web render
flushes before hydrate's finally clears hydrating, so ordinary effects and
onSettled are not a sufficient completion barrier. The public client-source
effect option defers compute/apply until snapshot release; its server runtime
reserves a matching owner ID without executing browser work. This retains
server/client allocation parity, immediate CSR/remount behavior and browser
cleanup. No dependency, export, public name or version changes.

## Proof

Commands and exits are recorded fully in
`/tmp/ui-execution-536-guards-result.md`; logs use the prefix
`/tmp/ui-execution-536-guards-`. All tests use one worker. Focused commands
have 90-second bounds; full lanes 120 seconds. None hangs or reaches its bound.

| Phase / log suffix                           | Exit | Result                                                                                         |
| -------------------------------------------- | ---- | ---------------------------------------------------------------------------------------------- |
| Old utils `baseline-ssr.log`                 | 0    | 3/3, 3.01s                                                                                     |
| Old utils `baseline-hydrate.log`             | 1    | 2/3, 3.61s; missing hydration key `00311`                                                      |
| Corrected `utils-ssr.log`                    | 0    | 3/3, 2.90s                                                                                     |
| Corrected `utils-hydrate.log`                | 0    | 3/3, 3.57s                                                                                     |
| Old ScrollView `scroll-baseline-ssr.log`     | 0    | 4/4, 3.85s                                                                                     |
| Old ScrollView `scroll-baseline-hydrate.log` | 1    | 2/3, 4.39s; six viewport callbacks during hydration                                            |
| Corrected `focused-ssr.log`                  | 0    | 7/7, two files, 4.53s                                                                          |
| Corrected `focused-hydrate.log`              | 0    | 6/6, two files, 4.67s                                                                          |
| Complete `full-ssr.log`                      | 0    | 53/53, 25 files, 30.32s                                                                        |
| Then complete `full-hydrate.log`             | 0    | 61/61, 24 files, 13.64s                                                                        |
| `owning.log`                                 | 0    | 229/229, utils/Virtualizer/Modal/Popover/Toast, 6.46s                                          |
| `typecheck.log`                              | 0    | `vp run typecheck`                                                                             |
| `check.log`                                  | 0    | Nine-path `vp check`, format/lint clean                                                        |
| `attribution.log`                            | 1    | Existing one exact-source and 63 local contract mismatches; neither changed source is reported |

New gate proof captures actual SSR fallback references before their intended
replacement, generated IDs immediately after the hook in the same owner,
children constructed only after hydrating=false, no-fallback rendering,
immediate CSR/remount readiness, stable reactive bindings and balanced disposal.
Scroll proof checks nonzero size/window/offset, exact adoption, resize and scroll,
observer disconnect, frame/timer cancellation, and connected-target events after
root disposal. The existing 200-item range/row-identity regression is unchanged.

Independent source review found no remaining blocker in this bounded slice.
Review strengthened the ScrollView adopted-node count and reattached the
retained target after disposal so a leaked document listener would be detected;
the final complete hydration run includes both corrections. The stale-field
search now finds no `sharedConfig.context` in package TS/TSX source.

## Remaining work

Docs wrappers `vp run docs:generate` and `vp run docs:check` each exit 1 with
the known sandbox tsx IPC EPERM. Their authorized direct equivalents both exit
0: `node --import tsx scripts/generate-work-views.ts --write` and
`node --import tsx scripts/check-docs-current.ts`. Only status/roadmap board
hashes change; no unexpected generated output is tracked.

The parent ecosystem gate first exits 1 in the sandbox (13/38 failures,
including git subprocess EPERM). The outside-sandbox rerun exits 0, all 38
passing. The previous parent AGENTS doc-shape findings are no longer present;
this worker did not edit parent files. Logs are `ecosystem.log` and
`ecosystem-unrestricted.log` under the prefix above. Final diff whitespace and
named scope checks pass; commit/push outcome is in the temporary handoff.

#536 stays in-progress: resolve other server-early-return allocation suspects,
update stale One-Read guidance and establish actual async-streaming evidence.
These synchronous fixtures and post-hydration updates do not prove streaming.
#531 retains all sibling/build requirements. Attribution remains red, not
waived. #139 precedes packaging; #194 evidence repairs precede #537's live
2,177-case same-revision zero-failure/skip/waiver proof. No ordinary broad suite,
packaging, certified run, versioning or publication ran in this slice.

The active autonomous goal includes release only after required gates, guarded
workflow publication and artifact verification. #87's census and #136's owner
holds, successor #245 and skip #254 remain. The release preflight also identified
the tracked-clean missing import opener in merge-certified-reports.ts (#194)
and the exact npm toolchain owner choice (#138); neither is silently repaired
or waived here. Kumo/Geist first-release decisions remain separate.
