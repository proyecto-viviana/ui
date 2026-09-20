---
id: 565
type: task
title: "Clear the entry-import-budget red before the release candidate"
created: 2026-09-20
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-20,
      note: "found by the conductor reconciling #553 to the tree: the one entry under that ticket's `## Left red` that is still red, re-measured rather than quoted. `guard:entry-import-budget` is a blocking step in Certification Gates (certification-gates.yml:215) and is in no ci:release-readiness leg, which is why the nineteen-green walk at 3f220fb6 did not see it",
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
