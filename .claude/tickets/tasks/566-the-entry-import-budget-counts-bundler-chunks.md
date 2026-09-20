---
id: 566
type: task
title: "The entry import budget counts bundler chunks, so the bundler can move it"
created: 2026-09-20
parent: 544
status: next
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

Decide what the guard should hold, then make it hold that:

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

The #565 ceilings themselves. They are raised to the measured values with each
import named.

## Relationship

Child of #544. Found by #565; siblings #485 (merged) and #487 (open).
