# UI #536 public portal routes — 2026-09-19

Starting revision: `53bf02c346536655082efa7dd13d7016df240002`, branch `main`.
Initial status/index clean. Owner-directed autonomous foundation slice, one
source writer, independent read-only reviews. No task/release closure.

## Scope and diagnosis

The originally coverage-only slice adds body/inherited/explicit public
OverlayContainer routes to existing solidaria hydrationHooks fixture/SSR/hydrate
tests. SSR must not evaluate portal children or browser mount callbacks. The
client must adopt five exact outer nodes, ref and immutable generated IDs before
creating its portal after the hydration walk. Close/reopen/disposal checks own
modal ARIA, child cleanup and exact restoration of caller-owned mount children.
The hook's boolean data-ismodal prop and Solid's empty DOM presence marker are
asserted separately, not changed in product source.

Old-source focused SSR passed 16/16. Hydration stalled: the first run was stopped
after about 74 seconds with only RUN output, exit 130, incomplete. A bounded
body-route diagnostic also timed out (exit 124), but captured
PRIMITIVE_IN_FORBIDDEN_SCOPE: the compiler-generated portalContainer getter
allocates a memo when first read inside createTrackedEffect's child-forbidden
callback. Temporary console probes were removed. No duplicate-version or
modal-count-loop diagnosis is made.

That evidence justified extending named scope to
`packages/solidaria/src/overlays/createModal.tsx` and owning `test/overlays.test.tsx`.
Only OverlayContainer's mount validation changes to createEffect's owned compute
phase. SSR guard, nesting check/error, Portal and separate modal registration
remain. Formatter-only cleanup reindents the latter; unused onCleanup is removed.
The new ordinary case covers reactive target changes, balanced modal registration
and external mount ownership. Its initial same-node assumption was incorrect:
installed Solid Portal disposes its insertion root and pinned Adobe/React also
remounts for a different target. The corrected case explicitly checks replacement,
old-child cleanup, unchanged parent identity/ARIA and final cleanup. No existing
expectation was weakened. Source and test reviewers found no bounded blocker.

## Proof

One worker, sequential test lanes. Exact commands, all failures/incomplete runs
and final Git result: `/tmp/ui-execution-536-portal-result.md`. Log prefix matches.

| Log suffix                    | Exit   | Result                                                  |
| ----------------------------- | ------ | ------------------------------------------------------- |
| focused-ssr.log               | 0      | Old source 16/16, 748ms                                 |
| focused-hydrate.log           | 130    | Incomplete; stopped, no completed count                 |
| owning-baseline.log           | 0      | Selected original 4 passed, 24 filtered, 1.80s          |
| body-diagnostic.log           | 124    | Incomplete, owned-primitive error stack captured        |
| corrected-focused-hydrate.log | 1      | 3 new assertion-layer failures, 13 filtered             |
| final-focused-ssr.log         | 0      | 16/16, 635ms                                            |
| final-focused-hydrate.log     | 0      | 16/16, 1.72s                                            |
| owning.log                    | 1      | 28 passed, new target-change identity assumption failed |
| owning-final.log              | 0      | 29/29, 1.62s                                            |
| owning-reviewed.log           | 0      | 29/29, 1.61s, stronger count/outer identity checks      |
| full-ssr.log                  | 0      | 69/69, 26 files, 28.79s                                 |
| full-hydrate.log              | 0      | 77/77, 25 files, 12.25s, after fresh SSR                |
| typecheck.log / check.log     | 0 each | Typecheck and scoped five-file format/lint              |
| Docs wrappers                 | 1 each | Known sandbox tsx IPC EPERM                             |
| Direct docs equivalents       | 0 each | Generate and check pass                                 |
| attribution.log               | 1      | Unchanged 64-path mismatch set                          |

Filtered selector cases are not acceptance waivers. Attribution still has one
exact-source plus 63 reviewed-local mismatches; 103 mappings needing review is
separate. createModal.tsx is not in the mismatch set; no hashes refreshed.
Generated tracked changes are only status/roadmap board hashes; fixture HTML
is ignored. No unexpected generated paths. Independent source/test reviews
accept the bounded repair and behavior proof. Parent ecosystem gate is 37/38:
doc-shape has eight findings across VisualMode's main and graphics-residency
CURRENT.md files (line cap and retired words). These unrelated files were not
edited. This supersedes the preceding slice's green parent-gate snapshot, not
the current UI proof. Final review/Git results are in the exact command ledger.

## Remaining work

#536 remains in-progress: Tooltip public routes, stale One-Read guidance,
genuine unresolved-shell/late-tail streaming and final full lanes. Normal public
ModalContent's SSR guard remains; marker hydration is not blanket authority to
remove semantic caches. #531 retains every sibling/build requirement, including
#534's separately recorded already-dequeued delayed-autofocus cancellation.
#139 precedes pack/consume; #194 precedes #537's live 2,177-case same-revision
zero-failure/skip/waiver execution. Attribution/security, exact-SHA release gates
and actual artifact verification remain. No broad ordinary suite, build, pack,
certified execution, versioning or publication ran. Holds, successor #245,
skip #254, dependency/naming and Kumo/Geist first-release boundaries unchanged.
