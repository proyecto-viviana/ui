---
id: 566
type: task
title: "The entry import budget counts bundler chunks, so the bundler can move it"
created: 2026-09-20
parent: 544
status: in-progress
history:
  - {
      state: open,
      at: 2026-09-20,
      note: "found while measuring #565. The frozen source of 2d6bb3bd, rebuilt with the installed toolchain, measures 23/23/30/25/21 against the ceilings 21/21/28/23/19 that were written from that same source - so four of the five entries were over before a single import changed. The difference is chunking: this build emits no `_chunk/web.js`, `_chunk/focus.js` or `_chunk/createInteractionModality.js`, and splits `_chunk/mergeProps.js` out where the old one folded it in",
    }
  - {
      state: next,
      at: 2026-09-20,
      note: "owner decision: of the three options under `## Work`, the unit becomes source reachability. The second (a chunk-free number measured beside the chunks) and the third (documenting the ceilings as toolchain-bound) are closed. Reason recorded so it is not re-argued: a ceiling the bundler can move is the fail-open class #553 closed, and the first thing anyone does with a ceiling that moved on its own is raise it. Briefed in `.agents/CONDUCTOR-PENDING-2026-09-20d.md`, which names the two traps - every `exports` condition in this repo points into `dist/`, so the dist-to-src mapping is the guard's own and an entry that will not resolve must fail rather than skip (the `unbuilt` lesson at `check-entry-import-budget.ts:253`); and type-only imports, which `dist/` excludes by erasure and source does not, must not be counted or the number stops meaning what a consumer pays for. Conditional authorisation carried in the brief: if the guard no longer needs a build and runs under ten seconds, add it as a leg of `ci:release-readiness`, which is the 19-leg chain it is absent from and the reason the nineteen-green walk at 3f220fb6 did not see it red",
    }
  - {
      state: in-progress,
      at: 2026-09-20,
      note: "unit changed to source reachability. `sourceOfTarget()` is the one dist-to-src mapping and serves both the entries and the workspace specifiers; it tries the `types` condition before the runtime one because tsc mirrors `src/` one file to one file while the bundler may rename an entry - solid-stately emits src/flags/flags.ts as dist/private/flags/flags.js, and without that order three specifiers into it fail to resolve. Type-only and build-time macro imports are excluded, proved by flipping each predicate to false: ButtonGroup measures 57 as shipped, 468 with type edges counted and 63 with macro imports counted. An unresolvable target fails rather than skipping, proved by pointing ./ProgressCircle at ./dist/progress/ProgressCircleRenamed.js (EXIT=1, named in the output) and reverting. Re-frozen once with --write-baseline, the five `why` fields rewritten by hand to name source modules, and `unit`/`description`/header comment updated. The guard no longer reads dist/: a worktree of e0ccb27e with no dist anywhere measures the same numbers in 0.251s, so it is now a leg of ci:release-readiness, after guard:source-artifacts and before vp run build. Evidence `.agents/close-gates-2026-09-20.log.md`",
    }
---

## Scope

`scripts/check-entry-import-budget.ts` counts distinct **dist modules** reachable
from an entry. A dist module is a bundler chunk, and rolldown decides how to
split chunks from how many importers a module has. So a ceiling moves when the
bundler, the JSX plugin or a module's own import list changes, not only when a
consumer imports something new.

Measured under #565, same walker, three commits:

| entry            | 2d6bb3bd frozen source | 163f4377 Solid 2 port | 87b50e34..HEAD | ceiling then |
| ---------------- | ---------------------- | --------------------- | -------------- | ------------ |
| ui ./Provider    | 23                     | 25                    | 26             | 21           |
| s2 ./Provider    | 23                     | 25                    | 26             | 21           |
| ./ButtonGroup    | 30                     | 29                    | 30             | 28           |
| ./ProgressBar    | 25                     | 24                    | 24             | 23           |
| ./ProgressCircle | 21                     | 20                    | 20             | 19           |

The frozen-source column is the one that matters: those numbers come from the
commit whose measurement set the ceilings.

## Work

Decided — see `## Settled`. The three the owner chose between:

- Count source modules reached, not emitted chunks, so the number answers "what
  does importing this entry pull in" independently of chunking; or
- keep chunks but measure a second, chunk-free number beside them and fail on
  that; or
- state plainly in the budget file that the ceilings are toolchain-bound and
  must be re-measured on every bundler or plugin bump, and add that step to the
  place bumps are made.

Whichever wins, the guard should say which kind of change moved a number when it
fails, since `--print-modules` already has the per-entry list.

## Out of scope

The #565 ceilings as raised numbers. They are replaced, not defended: the unit
changed, so every one of them was re-measured. #487's 60 root-barrel specifiers
are someone else's.

## Relationship

Child of #544. Found by #565; siblings #485 (merged) and #487 (open).

## Settled

The owner picked the first option: the unit is source reachability. The second
(a chunk-free number measured beside the chunks) and the third (documenting the
ceilings as toolchain-bound) are closed. The reason, recorded once: a ceiling the
bundler can move is the fail-open class #553 spent a shift closing, and the first
answer to a ceiling that moved on its own is to raise it.

## Before and after

The unit changed, so the two columns are not comparable — that is the point, and
the budget file's `description` says so.

| entry            | dist chunks (#565 ceiling) | source modules (#566 ceiling) | solidaria |
| ---------------- | -------------------------- | ----------------------------- | --------- |
| ui ./Provider    | 26                         | 53                            | 47        |
| s2 ./Provider    | 26                         | 52                            | 47        |
| ./ButtonGroup    | 30                         | 57                            | 47        |
| ./ProgressBar    | 24                         | 44                            | 38        |
| ./ProgressCircle | 20                         | 35                            | 28        |

They roughly doubled for two reasons, both wanted. A chunk folds several modules
together, and source reachability does not tree-shake, so a subpath barrel costs
every module it re-exports: `@proyecto-viviana/solidaria/utils` alone is 25 of
the Providers' 53 and 22 of ProgressCircle's 35. A barrel import is exactly the
cost this guard exists to hold, and nothing but an import can move the number.

## What the exclusions exclude

Type-only imports: `import type … from`, `export type … from`, and a clause
whose every brace binding is `type`-qualified with no default or namespace
binding outside the braces. Not excluded: an unmarked binding that happens to
name a type. Telling those apart needs a type checker, and a ceiling should err
upward rather than under-count. Macro imports: `… with { type: "macro" }`, which
the style macro evaluates at build time and replaces with its result.

Both proved by flipping the predicate to `false` and re-measuring:

| entry            | as shipped | type-only counted | macro counted |
| ---------------- | ---------- | ----------------- | ------------- |
| ui ./Provider    | 53         | 155               | 60            |
| s2 ./Provider    | 52         | 153               | 58            |
| ./ButtonGroup    | 57         | 468               | 63            |
| ./ProgressBar    | 44         | 49                | 49            |
| ./ProgressCircle | 35         | 40                | 40            |

468 against 57 is the hinge: counting erased edges would have measured a graph
no consumer loads.

## The resolution, and the failure it must not skip

Every `exports` condition in this repository points into `dist/`, so the mapping
is `./dist/X.js` → `src/X.{ts,tsx}` or `src/X/index.{ts,tsx}`, in one function
that both the budgeted entries and the workspace bare specifiers go through. It
tries the `types` condition first: tsc's declaration output mirrors `src/` one
file to one file, while the bundler may rename an entry — `solid-stately` emits
`src/flags/flags.ts` as `dist/private/flags/flags.js`, and only `types` still
spells the source path.

An unresolvable target fails, as the `unbuilt` path already learnt to. Proved by
pointing `./ProgressCircle` at `./dist/progress/ProgressCircleRenamed.js`:

```
entry import budget FAILED: 1 budgeted target(s) resolve to no source file:
  @proyecto-viviana/solid-spectrum ./ProgressCircle (exports ./dist/progress/ProgressCircleRenamed.js)
```

Exit 1; reverted with `git checkout --`. A workspace specifier inside the graph
that resolves to nothing fails the same way. Specifiers naming a non-source file
— `.json` translation bundles, stylesheets, assets — are skipped by name, as the
dist walk skipped them by taking `.js` siblings only.

## It became a release-readiness leg

The guard no longer reads `dist/`. A detached worktree of `e0ccb27e` with
`node_modules` symlinked and no `dist/` anywhere measures the same 53/52/57/44/35
in 0.251s; through `vp run` on a built checkout it is 0.595s. So
`guard:entry-import-budget` is now a leg of `ci:release-readiness`, after
`guard:source-artifacts` and before `vp run build`, with the other source-only
guards. Its absence from that chain is why the nineteen-green walk at `3f220fb6`
did not see it red.
