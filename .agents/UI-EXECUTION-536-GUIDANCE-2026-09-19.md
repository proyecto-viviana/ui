# UI #536 hydration guidance — 2026-09-19

Start `1ae0eb84289fc300cb2ede1584e0c311f3eeac30`, main, clean tree/index.
Owner-authorized autonomous foundation slice; root sole writer, read-only review.

## Scope and result

The patterns reference and 21 TypeScript/TSX comment sites now describe installed
Solid 2 rc.9 owner-scoped IDs, compatible initial structure and explicit DOM
adoption. They no longer claim a global counter, one ID per component/getter,
universal client getter memoization, inevitable route aborts, or a categorical
ban on JSX-valued props/render callbacks. Config comments name the actual refresh
option and client hydration-state signal. OptionContent documents `props.render`.

Retain child sharing per evaluation, reactive updates, provider laziness, option
label wrapping and historical regressions. The guide requires real shell-first
streaming separately and no longer suggests memo/Show/null can repair a missing
context ancestor. Review corrected snapshot overclaims, the Form coverage label
and descendant data-attribute selectors. No assertion or executable AST changed.
Focused formatting also normalized existing imports/cleanup indentation.

Named paths: `.claude/reference/patterns.md`, `vitest.hydrate.config.ts`,
solidaria-components utils and two Virtualizer comments; paired Spectrum/UI
tabs, tree, statuslight, combobox and picker sources; UI gridlist/ProgressCircle;
Kumo button; Spectrum Form fixture/Picker hydrate; UI Collections SSR/TagGroup
hydrate. #536/#531 histories, generated current status/roadmap and this receipt
complete the 27-path scope. Exact paths/commands in
`/tmp/ui-execution-536-guidance-result.md`.

## Proof

Logs use `/tmp/ui-execution-536-guidance-`. One worker; test lanes sequential.

| Command / log                              | Exit   | Result                                                                            |
| ------------------------------------------ | ------ | --------------------------------------------------------------------------------- |
| Full SSR / full-ssr.log                    | 0      | 74/74, 27 files, 29.44s                                                           |
| Subsequent full hydrate / full-hydrate.log | 0      | 82/82, 26 files, 12.76s                                                           |
| typecheck.log                              | 0      | Typecheck after ticket edits                                                      |
| docs-generate.log / docs-check.log         | 1 each | Known sandbox tsx IPC EPERM                                                       |
| attribution.log                            | 1      | Same 64-path mismatch set; no hash refresh                                        |
| ast.log                                    | 0      | Initial comment-only printer comparison, 21/21                                    |
| ast-final.log / ast-structural.log         | 1 each | Comparator detected formatter layout / JSX comment trivia, not executable changes |
| ast-structural-final.log                   | 0      | Structural AST equivalence, 21/21                                                 |

The initial inline AST command also encountered sandbox child-process EPERM;
the read-only comparison ran outside sandbox. The final comparator compares
syntax kinds/children/leaf text, excluding positions and empty JSX comments.
No typed behavior or test expectation is discarded from that comparison.
Scoped 21-file format/lint and both direct docs equivalents pass (exit 0).
Direct docs checks pass again after ticket formatting. Parent ecosystem gate
passes 38/38 (exit 0); no parent paths edited. Attribution mismatch-list diff
against the preceding Tooltip run is empty. Generated changes are only the
current status/roadmap board hashes. Independent source/docs review accepted;
no unexpected generated paths or additional source extension.

## Remaining

#536 remains in-progress for genuine unresolved-shell/late-tail streaming and
final complete proof. #531 retains sibling/build requirements. Attribution
still has one exact-source and 63 reviewed-local mismatches; 103 mappings needing
review is a separate count. #139 precedes pack, #194 precedes #537 live 2,177
same-revision zero-failure/skip/waiver proof. Security/toolchain owner choice,
exact-SHA release workflows and actual publication/artifact verification remain.
No ordinary broad suite, build, pack, certified run, version or publish occurred.
All holds, successor #245, skip #254 and Kumo/Geist first-release boundaries stay.
