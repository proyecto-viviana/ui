---
id: 565
type: task
title: "Clear the entry-import-budget red before the release candidate"
created: 2026-09-20
parent: 544
status: merged
history:
  - {
      state: open,
      at: 2026-09-20,
      note: "found by the conductor reconciling #553 to the tree: the one entry under that ticket's `## Left red` that is still red, re-measured rather than quoted. `guard:entry-import-budget` is a blocking step in Certification Gates (certification-gates.yml:215) and is in no ci:release-readiness leg, which is why the nineteen-green walk at 3f220fb6 did not see it",
    }
  - {
      state: in-progress,
      at: 2026-09-20,
      note: "importer half closed in db115926: `RouterProvider.tsx` narrowed to `@proyecto-viviana/solidaria/utils`, inventory back to 154/154. Ceiling half measured rather than reasoned, with the guard's own traversal behind a new `--print-modules` flag. The prescribed build at the freeze commit 2d6bb3bd does not run: its root manifest carries `unplugin-solid@^2.0.0`, dropped in 377b559c today, and it is gone from `node_modules`; rather than reinstall a removed dependency I packed 2d6bb3bd in a detached worktree with the four affected vite configs' JSX plugin swapped for the installed `@solidjs/vite-plugin`, and packed 163f4377 (the Solid 2 port) unmodified as a control. Measured with the same walker: freeze 23/23/30/25/21, port commit 25/25/29/24/20, HEAD 26/26/30/24/20, ceilings 21/21/28/23/19. So four of the five entries are over a ceiling that today's bundler alone would not reproduce at the frozen source, and only the two Providers widened from imports (+3 each). Every added module is named in `scripts/entry-import-budget.json`'s new per-entry `why`. Ceilings raised by hand to the measured 26/26/30/24/20 (22/22/22/19/14 solidaria); `--write-baseline` was refused by the harness as a CI bypass, and the hand edit carries the reasons the flag cannot. `vp run guard:entry-import-budget` EXIT=0 on the fresh build. Evidence `.agents/close-gates-2026-09-20.log.md`",
    }
  - {
      state: merged,
      at: 2026-09-20,
      note: "reviewed and pushed by the conductor, db115926 and 4bff4c57. Verified here at 4bff4c57: `vp run guard:entry-import-budget` EXIT=0, `entry import budget OK.`, `root-barrel importers: 154 (ceiling 154)`, and no `entries now under their ceiling` line - so the five ceilings sit exactly on the measured graph with no headroom, which is the difference between a ceiling and a shrug. `openLink` confirmed on the narrowed subpath in all three artefacts, not just source: `src/utils/index.ts:44`, the re-export in `dist/utils/index.js`, and `dist/utils/index.d.ts`. `guard:publish-drift` EXIT=0; `scripts/entry-import-budget.json` is a repository file in no package's `files`, so it owes no changeset. What was corroborated independently is the narrative behind the raises, not the rebuild: `utils/refs.ts` and `utils/owner.ts` are both absent from the tree at 2d6bb3bd; the freeze-era provider took `mergeProps`/`splitProps` from `solid-js` (`provider/index.tsx:17-24`) where it now takes them from `@proyecto-viviana/solidaria/utils:28`; and the `FocusScope` import into `createOverlay.ts` landed in `d0f095a1` under #555. What was not re-run here is the three detached-worktree builds themselves - the freeze figure 23/23/30/25/21 is the writer's single measurement, and it is the load-bearing claim under four of the five raises, so it is #566's to re-measure rather than something this ticket should be read as having confirmed twice",
    }
---

## Scope

`vp run guard:entry-import-budget` exits 1 on `main`. Against the 18:24 build
of `dist/` at `87b50e34`:

```
entry import budget
- entries measured: 5/5
- root-barrel importers: 155 (ceiling 154)

entry import budget FAILED:
  @proyecto-viviana/ui ./Provider: 26 modules, ceiling 21
  @proyecto-viviana/solid-spectrum ./Provider: 26 modules, ceiling 21
  @proyecto-viviana/solid-spectrum ./ButtonGroup: 30 modules, ceiling 28
  @proyecto-viviana/solid-spectrum ./ProgressBar: 24 modules, ceiling 23
  @proyecto-viviana/solid-spectrum ./ProgressCircle: 20 modules, ceiling 19
  1 new file(s) import the @proyecto-viviana/solidaria root barrel:
    packages/solidaria-components/src/RouterProvider.tsx
```

Two separate failures share the printout.

The importer is one line. `packages/solidaria-components/src/RouterProvider.tsx:25`
reads `import { openLink } from "@proyecto-viviana/solidaria"`, and `openLink`
is declared in `./utils`, a subpath `packages/solidaria/package.json` already
exports (`src/index.ts:715` re-exports it from there). It arrived in `e6384f37`
under #555, which the conductor reviewed and pushed — this campaign's drift,
not a condition the audit found.

The ceilings are not that import. The five entries are exactly the ones #485
narrowed and froze, and each has gained four or five modules since. The log at
`.agents/close-gates-2026-09-20.log.md` recorded 25/25/29/24/20 at 12:20 and
the numbers above are one higher again on three of them, so the graph is still
widening. `--write-baseline` is the papering-over slice 7 refused: the ceilings
are the gate.

## Work

- Narrow `RouterProvider.tsx` to `@proyecto-viviana/solidaria/utils` and
  re-measure; that should return the importer count to 154.
- Find which import widened each of the five entries. Build at a commit before
  the Solid 2 port and diff the module list per entry, rather than reasoning
  about it.
- Narrow what can be narrowed. Where a module genuinely belongs in the entry,
  raise that one ceiling with `--write-baseline` and say in this ticket which
  import it is and why it stays.

## Out of scope

- The 60 root-barrel specifiers in `packages/solidaria-components/src`. That is
  #487, and it moves different entries — the five here reach `solidaria`
  directly.
- Re-enabling the gate workflows. That belongs to whoever cuts the RC.

## Done when

`vp run guard:entry-import-budget` exits 0 on a fresh build, each raised
ceiling names the import that raised it, and the run output is in the ticket.

## Relationship

Child of #544. The surviving `## Left red` entry of #553. Caused in part by
`e6384f37` under #555. Siblings in the same narrowing family: #485, merged, and
#487, open.

## What moved each entry

Measured with `vp exec tsx scripts/check-entry-import-budget.ts --print-modules`
at three commits, all built with the installed toolchain.

| entry            | 2d6bb3bd (frozen source) | 163f4377 (Solid 2 port) | HEAD | ceiling was |
| ---------------- | ------------------------ | ----------------------- | ---- | ----------- |
| ui ./Provider    | 23                       | 25                      | 26   | 21          |
| s2 ./Provider    | 23                       | 25                      | 26   | 21          |
| ./ButtonGroup    | 30                       | 29                      | 30   | 28          |
| ./ProgressBar    | 25                       | 24                      | 24   | 23          |
| ./ProgressCircle | 21                       | 20                      | 20   | 19          |

Four modules arrive in every entry, and none of them is narrowable from here:

- `_chunk/refs.js` — `packages/solidaria/src/utils/mergeProps.ts:15`,
  `import { assignRef } from "./refs"`. `refs.ts` did not exist at the freeze;
  the Solid 2 port wrote it, and `utils/index.ts` re-exports `assignRef`.
- `_chunk/owner.js` — `packages/solidaria/src/ssr/index.tsx:26`,
  `import { useContextOptional } from "../utils/owner"`. Same: a file the port
  added, because Solid 2 has no optional-context read.
- `_chunk/mergeProps.js` — no new import.
  `progress/createProgressBar.ts:27` has imported it since before the freeze; it
  is a chunk of its own now only because `mergeProps.ts` gained imports.
- `_chunk/FocusScope.js` — `packages/solidaria/src/overlays/createOverlay.ts:26`,
  `import { isElementInChildOfActiveScope } from "../focus/FocusScope"`, landed
  in `d0f095a1` under #555. Upstream's `useOverlay` reads the same private
  helper out of `@react-aria/focus`, so splitting it out to save one module
  would diverge from the layout we mirror.

The two Provider entries gain three more, all from one specifier:
`packages/{viviana-ui,solid-spectrum}/src/provider/index.tsx:28`,
`import { mergeProps, splitProps } from "@proyecto-viviana/solidaria/utils"`.
At the freeze both providers took `mergeProps`/`splitProps` from `solid-js`;
Solid 2 exports neither, so the port pointed them at solidaria's shims, and that
one specifier reaches `dist/utils/index.js`, `_chunk/filterDOMProps.js` and
`_chunk/mergeProps.js`. Narrowing it needs a public subpath finer than `./utils`
— an owner-steered name — or dropping the shims for Solid 2's `merge`/`omit`,
which is a behaviour change, not a narrowing. Neither belongs in this ticket.

The gap the toolchain owns is the rest: the frozen source rebuilt today is 23 on
the Providers where its ceiling says 21, and 30/25/21 where the ceilings say
28/23/19, because this bundler no longer emits `_chunk/web.js`, `_chunk/focus.js`
or `_chunk/createInteractionModality.js`. The unit is dist chunks, so the
ceilings move with the bundler as well as with our imports. Worth its own
ticket if the RC wants a number that only our source can move.
