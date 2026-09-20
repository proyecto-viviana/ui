# UI #536 public Tooltip routes — 2026-09-19

Start `7b62cc92a36a9153ad81c0739259d6a18e859fd9`, main, clean index/tree.
Owner-directed autonomous foundation slice, root sole writer and independent
read-only source/test reviews. No task, initiative or release closure.

## Scope and diagnosis

New solidaria-components Tooltip SSR/hydrate tests and shared fixtures cover
controlled/default-open triggers, generated/explicit tooltip IDs and standalone
controlled Tooltip. Real SSR suppresses portal children/callbacks; hydration
adopts exact outer nodes/ref/immutable following ID and creates its body after
the walk. Tests retain description linkage, Escape, keyboard reopen, unrelated
versus ancestor scroll, listener removal, per-instance disposal and post-disposal
inertness with the original trigger reconnected.

Four old-source trigger cases lack aria-describedby on the original button.
Tooltip exists, has the expected ID and positions using that same button, but
no attribute set/remove call occurs. Temporary probes confirm handleRef sees
the button while createTrackedEffect first reads snapshot-null. Installed rc.9
documents this legacy effect's inability to see an earlier staged write before
its first read; snapshot stale tracking is lost by its non-creation recompute.
No duplicate-version or competing Button-writer diagnosis is made.

The justified named source extension is only
`packages/solidaria-components/src/Tooltip.tsx`: split createEffect snapshots
refs and trigger props in its owned compute, then performs the unchanged DOM
and listener work with returned cleanup. It pre-subscribes dependencies and
preserves snapshot-release wakeup. SSR compute is DOM-inert; fresh fixtures
prove owner allocation and adoption. Existing TooltipContent SSR guard remains.
Other source diff is formatter-only import/JSX/cleanup indentation. The existing
owning Tooltip.test.tsx was inspected and run without modification.

New test assumptions were corrected with source evidence, not product weakening:
positive-arity render props can construct a replacement body when exit values
change, so symbol tokens require exactly one disposal per real instance and one
live body while open. Overlay state forwards close requests without deduplication;
tests separately assert ancestor-scroll close and a later blur close request.
Exact listener tuples preserve omitted options. Temporary probes removed.

## Proof

Exact commands, failures and Git results: `/tmp/ui-execution-536-tooltip-result.md`.
Logs use `/tmp/ui-execution-536-tooltip-` prefix. One worker and sequential lanes.

| Log suffix                                       | Exit   | Result                                                                |
| ------------------------------------------------ | ------ | --------------------------------------------------------------------- |
| focused-ssr.log                                  | 0      | Old source 5/5, 2.86s                                                 |
| focused-hydrate.log                              | 1      | Four missing links, one new disposal-count assumption; 0/5, 7.39s     |
| attribute-trace.log                              | 1      | One selected missing-link case; no button attribute write; 4 filtered |
| ref-trace.log                                    | 1      | Same selected failure; ref sees button, effect reads null; 4 filtered |
| fixed-ssr.log                                    | 0      | 5/5, 2.96s                                                            |
| fixed-hydrate.log                                | 1      | Standalone passes; four new callback-count assumptions fail, 3.80s    |
| owning-baseline.log                              | 0      | Existing Tooltip 25/25, 3.57s                                         |
| final-focused-hydrate.log                        | 0      | 5/5, 4.00s                                                            |
| full-ssr.log                                     | 0      | 74/74, 27 files, 29.49s                                               |
| full-hydrate.log                                 | 0      | 82/82, 26 files, 13.04s, after fresh SSR                              |
| typecheck.log / check.log                        | 0 each | Typecheck and scoped four-file formatting/lint                        |
| docs-generate.log / docs-check.log               | 1 each | Known sandbox tsx IPC EPERM                                           |
| docs-generate-direct.log / docs-check-direct.log | 0 each | Authorized direct no-IPC equivalents                                  |
| attribution.log                                  | 1      | Identical 64-path mismatch set; Tooltip absent                        |

Attribution retains one exact-source plus 63 reviewed-local mismatches; 103
mappings needing review is a separate statistic. No hash refresh. Generated
tracked changes are only current status/roadmap board hashes; fixture HTML is
ignored. No unexpected generated paths. Independent source/test reviews accept
the bounded repair and proof. Parent ecosystem gate now passes 38/38 (exit 0);
the preceding unrelated VisualMode doc-shape failures were resolved externally.
No parent/VisualMode files were edited by this worker. Final scope in command ledger.

## Remaining

#536 stays in-progress for stale guidance/comments, genuine unresolved-shell/
late-tail streaming and final full lanes. The zero-geometry deferred-ref branch
is not newly certified by these nonzero-geometry fixtures. #531 keeps every
sibling/build requirement; #534's delayed-autofocus winner remains separate.
#139 precedes packaging; #194 precedes #537's live 2,177-case same-revision
zero-failure/skip/waiver proof. Attribution/security, toolchain owner decision,
exact-SHA release workflows and actual publication/artifact verification remain.
No broad ordinary suite, build, pack, certified run, version or publish occurred.
Holds, successor #245, skip #254, naming/dependency and experimental first-release
boundaries remain unchanged. Persistent release goal stays active.
