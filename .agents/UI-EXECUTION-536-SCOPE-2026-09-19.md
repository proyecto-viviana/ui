# UI #536 FocusScope parity — 2026-09-19

Starting revision: `aa61c0adbef726850fb3a309dda92a29954ddcfb`, branch `main`.
Initial status/index clean. Owner-directed autonomous foundation slice; root is
sole writer and independent agents review read-only. No task/release closure.

## Scope and diagnosis

- `packages/solidaria/src/focus/FocusScope.tsx`: remove the SSR-only bare-child
  return, retaining the real provider, sentinels and lifecycle owners; guard
  setup-time document capture. Browser callback timing and methods unchanged.
- Existing `test/fixtures/hydrationHooks.tsx` and its SSR/hydrate tests: three
  standalone FocusScope modes (default, enabled, disabled), real manager calls
  and same-owner descendant generated IDs.
- `test/FocusScope.test.tsx`: replace vacuous listener cleanup with exact removal
  and connected-target behavior; add queued-autofocus disposal regression.
- #536/#531 dated progress, this receipt, generated status/roadmap board hashes.

Installed rc.9 server effects reserve owners but do not run browser apply
callbacks. Their compute functions see null refs/empty scope and stay inert;
onSettled reserves its slot without invoking browser work. Three old-source
SSR cases fail because descendants have no FocusManager. Fixtures are written
only after SSR assertions pass, so no baseline hydration result is claimed.

New SSR proof checks inert manager methods, no ref invocation, generated ID and
label link, hidden sentinel order and markers. Hydration proves exact six-node
and ref adoption, immutable server-ID equality, autofocus, disabled-item skipping,
both Tab containment directions, dynamic sibling collection, close/restoration
and post-close focus freedom. Ordinary cleanup retains/reconnects targets so
detachment cannot conceal leaked listeners or callbacks. Removing cancellation
temporarily makes the disposal regression fail; it was restored before final
proof. This is not #534's already-dequeued positive-delay timer repair.

Formatting expands a previously compressed import and reindents existing
containment code; whitespace-insensitive source diff confirms only the stated
repair. Independent source/test reviews report no bounded blocker. Nested or
portaled scope hydration is not claimed by these standalone cases.

## Proof

One worker, sequential test lanes; 90-second focused/owning and 120-second full
timeouts. No timeout/saturation. Full command ledger and Git outcome:
`/tmp/ui-execution-536-scope-result.md`. Logs share that prefix.

| Log suffix              | Exit   | Result                                          |
| ----------------------- | ------ | ----------------------------------------------- |
| `owning-baseline.log`   | 0      | 46/46, 3 files, 4.92s                           |
| `baseline-ssr.log`      | 1      | 10 passed / 3 failed, 568ms; missing manager    |
| `focused-ssr.log`       | 0      | 13/13, 630ms                                    |
| `focused-hydrate.log`   | 0      | 13/13, 1.72s                                    |
| `owning.log`            | 0      | 47/47, 4.89s                                    |
| `cancel-control.log`    | 1      | Selected regression fails, 1.25s; 32 filtered   |
| `owning-final.log`      | 0      | 47/47, 5.45s, restored cancellation             |
| `full-ssr.log`          | 0      | 66/66, 26 files, 27.07s                         |
| `full-hydrate.log`      | 0      | 74/74, 25 files, 11.65s, after fresh SSR        |
| `typecheck.log`         | 0      | After ticket edits                              |
| `check.log`             | 0      | Five code paths, format/lint clean              |
| Docs wrappers           | 1 each | Known sandbox tsx IPC EPERM                     |
| Direct docs equivalents | 0 each | Generate and check pass                         |
| `attribution.log`       | 1      | Identical 64-path mismatch set; no new mismatch |

The negative control's 32 filtered cases are intentional selector exclusions,
not acceptance waivers. Attribution remains one exact-source plus 63 reviewed
local mismatches; 103 mappings needing review is a separate statistic. FocusScope
is not in that mismatch set. No blanket hash refresh or attribution waiver.
Generated tracked changes are only the two board hashes; fixture HTML remains
ignored. No unexpected tracked generated changes. Parent ecosystem gate passes
38/38 outside the sandbox; no parent files edited. Final scoped Markdown
formatting and regenerated direct docs checks pass. Independent final evidence
review confirms the logs, scope and remaining-gate claims without a blocker.

## Remaining work

#536 stays in-progress for public OverlayContainer/Tooltip routes, stale
One-Read guidance/comments, actual unresolved-shell/late-tail streaming and
final full lanes. Public portal guards are not defects merely because they
return early on SSR; private ModalContent remains gated from normal public SSR.
#531 retains every sibling/build requirement, including #534 delayed-winner
cancellation. #139 safety precedes packaging; #194 repair precedes #537's live
2,177-case same-revision zero-failure/skip/waiver execution. Attribution/security,
exact-SHA release gates and actual artifact verification remain outstanding.

No broad ordinary suite, build, packaging, certified execution, versioning or
publication ran. #87 census/foundation-first sequence, #136 owner holds,
successor #245, skip #254, dependency/public naming and experimental Kumo/Geist
first-release boundaries are unchanged. Persistent release goal remains active.
