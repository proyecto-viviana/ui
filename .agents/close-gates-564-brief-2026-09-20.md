# Brief — #564: the certified-case-floor guard cannot run outside CI

Conductor, 2026-09-20. Item 10 (`31bf3585`) is reviewed, verified and pushed —
`vp run build` now exits 0 end to end in 75 seconds, `guard:package-artifacts`
included, and the six packages behind solidaria that were merely unproven are
proved. **#555 is merged.** Your answer on the style files was the right shape:
evidence first, no guard yet, and a ticket for the count. I corrected that
ticket's count before it gets worked — see the last paragraph.

One task left before queue item 1 closes, and it is small.

## What is red

I walked all nineteen `ci:release-readiness` legs in order at `3f40e8e7`. Leg 8
is the only red that is still red, and it fails on the package manager rather
than on the certified suite:

```
$ vp run guard:certified-case-floor
Error: Command failed: pnpm exec playwright test e2e/certified --list --reporter=json
  [ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY] Aborted removal of modules directory due to no TTY
```

Full log: `.agents/chain-walk-2026-09-20/leg-guard-certified-case-floor.out.txt`.
The ticket is `.claude/tickets/tasks/564-the-certified-case-floor-guard-shells-out-to-bare-pnpm.md`
and it carries the measurements, so read it rather than re-deriving them.

## What to do

`scripts/check-certified-case-floor.mjs:89-95` executes the program the
repository tells every agent not to use. Replace that one `execFileSync` call
with the form the sibling guard `scripts/check-peers.mjs:100` already uses —
`vp` driving the tool, not bare `pnpm`. I proved the replacement by hand from
`apps/comparison`, exit 0 with the report on stdout:

```
vp exec playwright test e2e/certified --list --reporter=json
```

`parseListingStdout` skips whatever banner precedes the first `{`, so it needs
no change — but read it before you assume that, and say in the log which banner
the new form actually prints.

Three things I would not do here, so that you do not have to guess:

1. **Do not set `CI=true` to make it pass.** That sends pnpm down the
   purge-and-reinstall path, which is why CI never sees this. A guard that
   passes only where nobody reads it is the thing being fixed.
2. **Do not reinstall.** The install is not stale in any way the tree can see:
   `pnpm-lock.yaml` and `node_modules/.pnpm/lock.yaml` are byte-identical and
   nothing under `patches/` or any manifest is dirty. If your reading disagrees
   with that, tell me before you install anything.
3. **Do not sweep the `.github/workflows/` `pnpm run …` lines.** That is the
   runner driving the repo from outside, and it is not the same thing.

## Done when

- `vp run guard:certified-case-floor` exits 0 on this checkout with no
  environment variable set and no reinstall, printing the floor line it printed
  at 16:44: `certified case floor: 73 files, 2177 cases, none below the floor.`
- The red run on the old source and the green run on the fix are both in the
  log, as you have been recording them.
- A changeset only if one is owed — this is a repository script, not shipped
  source; say which you decided and why.

Commit on its own, against #564. I will review and push.

## On #563, before you pick it up

I corrected its count from six to eleven and renamed the file off
`563-six-copies-…`. `grep -rl "globalThis as.*process?:" packages/*/src` returns
twelve files: eleven hand-written casts plus `solidaria/src/utils/env.ts`. The
five you did not count are the `NODE_ENV`-only shape — `image/` and
`statuslight/` in both styled twins, and `solidaria-components/src/Collection.tsx`
— and the comment you quoted in the ticket names two of them itself. The stated
Done-when would have left five behind and the twelfth copy would have been
written on top of them. Nothing else in the ticket needed changing; the two-way
choice you framed is the right one, and the note about `isDevEnv()` consulting
`import.meta.env.DEV` first is now written into the Done-when so whoever works
it has to say which reader wins.
