---
id: 564
type: task
title: "`guard:certified-case-floor` shells out to bare `pnpm` and cannot run locally"
created: 2026-09-20
parent: 544
status: merged
history:
  - {
      state: open,
      at: 2026-09-20,
      note: "found by the conductor walking all nineteen `ci:release-readiness` legs at `3f40e8e7`. Leg 8 is the only source-independent red, and it is red on the package manager, not on the certified suite. Green at 16:44, red at 18:05 and red on every run since: the only tree change between the two runs was `dom.ts:617` (`31bf3585`) and a ticket file, neither of which the guard reads, so the verdict depends on state the tree does not hold",
    }
  - {
      state: merged,
      at: 2026-09-20,
      note: 'landed in 3f220fb6, pushed. One program name, plus the two doc comments that asserted the old one and a test for the bannerless report `vp` actually prints; `vp run test scripts/check-certified-case-floor.test.ts` is 11/11. The writer sharpened the diagnosis rather than accepting it: the red did not reproduce on its checkout, because the state bare `pnpm` consults - `node_modules/.pnpm-workspace-state-v1.json`, `lastValidatedTimestamp` 18:17:11 - had been revalidated after the last red, with no commit in between. It refused to manufacture a red for the record, which is right, and the flip-flop is the ticket''s own complaint measured from the other side: a gate that answers from a timestamped file in `node_modules` is unreliable green as well as unreliable red. Conductor''s independent checks at 3f220fb6: `vp run guard:certified-case-floor` EXIT=0 printing `certified case floor: 73 files, 2177 cases, none below the floor.`; the same guard with `vp` resolvable only from `node_modules/.bin` (the shape CI gets, since CI has no global install and reaches `vp` through `pnpm exec`) EXIT=0, and that shim runs the workspace''s own vite-plus 0.2.9; `vp check` clean on both changed files. Precedent worth recording honestly: `scripts/check-peers.mjs` is the form that was copied, but it is wired into no npm script or workflow, so leg 8 is the first `execFileSync("vp", …)` CI will actually execute - which is why the PATH-restricted run above was made rather than assumed. No changeset: a repository guard is in no package''s `files` and no consumer notices it. Evidence `.agents/gate-564-2026-09-20.log.md` and `.agents/chain-walk-2026-09-20/verify-564-{guard,ci-path,unit}.out.txt`',
    }
---

## Scope

`scripts/check-certified-case-floor.mjs:89-95` reads the certified listing by
shelling out to the package manager the repository tells every agent not to use:

```js
const stdout = execFileSync(
  "pnpm",
  ["exec", "playwright", "test", "e2e/certified", "--list", "--reporter=json"],
  { cwd: COMPARISON_ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
);
```

Bare `pnpm` runs its own deps-status check before `exec`, decides this
`node_modules` must be purged and reinstalled, and then aborts because there is
no TTY:

```
[ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY] Aborted removal of modules directory due to no TTY
[ERROR] Command failed with exit code 1: pnpm install
```

The install is not stale in any way the tree can see. Measured at `3f40e8e7`:

- `pnpm-lock.yaml` and `node_modules/.pnpm/lock.yaml` are byte-identical.
- No manifest, lockfile, `pnpm-workspace.yaml` or patch file is dirty.
- `node_modules/.modules.yaml` was written at 16:41 by a `vp` install and has
  not changed since; the guard was green at 16:44 and red at 18:05. The only
  tree change across that gap was `dom.ts:617` and two ticket files, and the
  guard reads neither — it reads the playwright listing.

So the disagreement is between `vp`'s install and bare `pnpm`'s idea of what
that install should look like — the guard fails on a judgement made by a tool
the repository does not drive. `CI=true` sends pnpm down the purge-and-reinstall
path instead of the abort, which is why CI does not see this and a local walk
does. A guard that passes only where nobody reads it is not a guard.

The repository already has the fix, one directory over, in a sibling guard —
`scripts/check-peers.mjs:100`:

```js
execFileSync("vp", ["exec", "pnpm", "peers", "check", "--json"], { … })
```

Verified by hand from `apps/comparison`, exit 0 with the report on stdout:

```
vp exec playwright test e2e/certified --list --reporter=json
```

`check-certified-case-floor.mjs` is the **only** bare-`pnpm` call site in
`scripts/`; the `pnpm run …` lines in `.github/workflows/` are the runner
driving the repo from outside and are not in scope. `parseListingStdout` skips
whatever banner precedes the first `{`, so it needs no change.

## Done when

`vp run guard:certified-case-floor` exits 0 on a developer checkout with no
environment variable set and no reinstall, printing the floor line it printed at
16:44 (`certified case floor: 73 files, 2177 cases, none below the floor.`), and
the guard no longer names `pnpm` as a program to execute. Record the red run on
the old source and the green run on the fix.

## Relationship

Child of #544, found closing queue item 1. Independent of the defects in #555.
Related to #562 in kind: a gate whose result depends on unrecorded local state.
