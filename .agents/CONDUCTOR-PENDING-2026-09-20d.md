# Conductor brief — #566, the entry import budget's unit

Your next task, and the only one in this brief. The ticket is
`.claude/tickets/tasks/566-the-entry-import-budget-counts-bundler-chunks.md`;
read it in full first. It is the ticket you filed yesterday evening out of #565,
so the measurement behind it is yours.

## The owner has decided which of the three

#566's `## Work` offers three: count source modules, measure a second chunk-free
number beside the chunks, or document the ceilings as toolchain-bound. The owner
picked the first. **The unit becomes source reachability.** The other two are
closed; do not spend a paragraph re-arguing them in the ticket.

The reason, in one line, because it should be written down: a ceiling the
bundler can move is the same fail-open class #553 spent a shift closing, and the
first thing anyone does with a ceiling that moved on its own is raise it.

## What the guard holds today

`scripts/check-entry-import-budget.ts` has two halves, and only the first
changes. The root-barrel inventory (line 178, `rootBarrelImporters`) already
reads source, already needs no build, and is not yours to touch here.

The first half walks `dist/`: `exportTarget()` reads a package's `exports` map,
which names `./dist/index.js`, and `resolveRelative()` follows `.js` siblings.
Emitted chunks are what it counts, which is the whole finding.

## What to make it hold

Walk source instead, from the same five budgeted entries.

- **The resolution.** Every `exports` condition in this repo points into
  `dist/` — I checked `solidaria` and `viviana-ui`, root and subpath alike;
  there is no source condition to lean on. So the mapping is mechanical:
  `./dist/X.js` → `packages/<pkg>/src/X.{ts,tsx}` or `.../X/index.{ts,tsx}`.
  Build it once, in one place, and use it for both the entry targets and the
  workspace bare specifiers.
- **An entry that will not resolve must fail.** The guard already learnt this
  the expensive way: read the comment at line 253 about `unbuilt`, where a
  skipped entry read as a pass on everything it silently removed. A source
  target that maps to no file is the same hole wearing different clothes. Fail
  it, name it, and prove it — point one entry at a subpath that cannot resolve,
  show the non-zero exit in the log, then revert it.
- **Type-only imports do not count.** This is the correctness hinge of the whole
  change and the easiest thing to get wrong. `dist/` has no type imports —
  they are erased — so today's numbers exclude them by construction. Source does
  not: `import type { X } from "./y"`, `export type { … } from "./y"`, and an
  inline clause whose every binding is `type`-qualified all cost a consumer
  nothing at runtime. Count one and the number stops meaning "what does
  importing this entry pull in", which is the sentence the guard exists to keep
  true. `specifiersOf()` is a regex over the file; it will need to tell these
  apart. Say in the ticket how you did it and what it excludes.
- **Re-freeze, once, and by hand where it matters.** The unit changed, so every
  ceiling is re-measured by definition; `--write-baseline` is the right tool
  here and this is the one case where it is not papering over anything. But the
  per-entry `why` fields you wrote under #565 name chunks — `_chunk/refs.js`,
  `_chunk/FocusScope.js`. Those imports survive the unit change; only their
  filenames do not. Rewrite each `why` by hand to name the source module, and
  keep the import that put it there. A ceiling with no named import is still not
  acceptable.
- **Update `unit` and `description`** in `scripts/entry-import-budget.json`, and
  the header comment in the script. The `unit` string is the guard's contract
  with the next reader; it currently says "Distinct dist modules".
- Keep `--print-modules`. It should now print source paths, with the same
  `<- parent "specifier"` attribution.

## The payoff, and the one conditional authorisation

If the ceiling half stops reading `dist/`, the whole guard stops needing a
build — and that matters beyond tidiness. #565 found that
`guard:entry-import-budget` is a blocking step in `certification-gates.yml:215`
and is in **no** `ci:release-readiness` leg, which is precisely why the
nineteen-green walk at `3f220fb6` did not see it go red.

So: time the guard on a tree with no `dist/`. If it runs green without a build
and comfortably under ten seconds, add it to `ci:release-readiness` in
`package.json` — that chain is 19 legs today — and say in the ticket that you
did and what it measured. If it still needs a build for any reason, do not wire
it; report why instead. I am authorising that one leg, nothing else in CI.

## Rules for this task

- `free -m` before each heavy command; under 3000 MB available, wait. One heavy
  command at a time. This task should need far less than the last one.
- Append to `.agents/close-gates-2026-09-20.log.md` and commit before each heavy
  step, as you have been.
- `scripts/` is in no package's `files`, so the guard and its JSON owe no
  changeset — that was established under #565. If you end up touching a
  package's `src`, run `guard:publish-drift` rather than guessing.
- Certification Gates is **active** on GitHub again as of this morning, at the
  owner's word, and a run is in flight at `main`. Your commits will be gated
  from now on. That is the point; do not disable anything to get a green.
- Still not yours: `README.md`, `CONTRIBUTING.md`, `CREDITS.md`,
  `packages/*/README.md`, and page content under `apps/web/src/**` and
  `apps/comparison/src/**`.
- Out of scope: the #565 ceilings as raised numbers (they are being replaced,
  not defended), and #487's 60 root-barrel specifiers.

## Done when

`vp run guard:entry-import-budget` exits 0 with the ceilings sitting on the
measured source graph, the `unit` string describes source modules, every entry's
`why` names a source import, type-only imports are provably excluded, an
unresolvable entry provably fails, and #566 carries the before-and-after numbers
for all five entries.
