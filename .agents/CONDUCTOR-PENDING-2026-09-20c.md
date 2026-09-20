# Conductor brief — #565, the entry import budget

Your next task, and the only one in this brief. The ticket is
`.claude/tickets/tasks/565-clear-the-entry-import-budget-red-before-the-rc.md`;
read it in full first. #553 is closed — all twelve slices landed, and three of
them are recorded on #194 rather than on #553, which is why it looked like nine.
This is the one red it leaves behind.

## Why now

`guard:entry-import-budget` is a blocking step in `certification-gates.yml:215`
and is in no `ci:release-readiness` leg, which is why the nineteen-green walk at
`3f220fb6` did not see it. Those workflows are off at the owner's word and come
back on for the release candidate, so this is waiting there and nowhere else.

## The measurement, at `87b50e34` against the 18:24 build

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

Two unrelated failures share that printout. Treat them as two.

## One, the importer

`packages/solidaria-components/src/RouterProvider.tsx:25` reads

    import { openLink } from "@proyecto-viviana/solidaria";

`openLink` is declared in `packages/solidaria/src/utils/dom.ts:587` and
`src/index.ts:715` re-exports it from `./utils`, which `package.json` already
exports as a subpath. So this is one specifier. It arrived in `e6384f37` under
#555 — reviewed and pushed from this seat, so it is ours, not a found
condition; say so in the log rather than filing it as someone else's.

Re-run the guard afterwards and expect the importer count at 154.

## Two, the five ceilings

These are not that import. The five entries are exactly the ones #485 narrowed
and froze, and each has gained four or five modules since; the log at
`.agents/close-gates-2026-09-20.log.md` recorded 25/25/29/24/20 at 12:20, so
three of them have moved again in a day. Something is still widening the graph.

Measure it, do not reason about it. Get the per-entry module list out of the
guard's own traversal in `scripts/check-entry-import-budget.ts` — it already
builds that list — rather than writing a second walker; build at a commit from
before the drift, diff the two lists per entry, and name the modules that
appeared. Then narrow what can be narrowed.

`--write-baseline` on a still-red entry is the papering-over slice 7 refused.
Where a module genuinely belongs in the entry, raise that one ceiling with it
and write in the ticket which import it is and why it stays. A raised ceiling
with no named import is not acceptable.

## Rules for this task

- The guard reads `dist/`, so it needs a build. `free -m` before each heavy
  command; under 3000 MB available, wait. One heavy command at a time.
- Append to `.agents/close-gates-2026-09-20.log.md` and commit before each
  heavy step, as you have been.
- `guard:publish-drift` now diffs a shipping package's `src` as well as its
  manifest, so a source change in `solidaria-components` wants a changeset.
  Run the guard rather than guessing which packages it names.
- Out of scope: the 60 root-barrel specifiers in `packages/solidaria-components/src`.
  That is #487, and it moves different entries.
- Still not yours: `README.md`, `CONTRIBUTING.md`, `CREDITS.md`,
  `packages/*/README.md`, and page content under `apps/web/src/**` and
  `apps/comparison/src/**`.

## Done when

`vp run guard:entry-import-budget` exits 0 on a fresh build, every raised
ceiling names the import that raised it, the run output is in #565's history,
and the log says what moved each of the five entries.
