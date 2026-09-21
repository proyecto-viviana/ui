# #587 — the entry import budget guard, its three red cases, and the build it never needed

Every command below was run on 2026-09-21 in `/home/emoporemilio/projects/viviana-hub/ui`
at `a1eb810c` plus this ticket's edits. Exit codes are as printed.

## 1. The red, before anything was touched

    vp test run scripts/check-entry-import-budget.test.ts     exit 1 — 3 failed (3)

All three cases, for one reason: the fixture and the assertions describe a guard
that reads `dist/`.

- `passes when every budgeted entry is built and under its ceiling` — got
  `entry import budget FAILED: 2 budgeted target(s) resolve to no source file`.
- `fails a budgeted entry that is not built` — expected `not built`.
- `still says to build first when nothing is built` — expected
  `build the packages first`.

## 2. Which side drifted

The test is the stale side.

- `git log --follow -- scripts/check-entry-import-budget.test.ts` → one commit,
  `5c57cf2f` (#553), written for the dist-chunk guard.
- `git show 5c57cf2f:scripts/check-entry-import-budget.ts` → `not built` at
  line 173, `build the packages first` at line 236. Both strings are that
  guard's.
- `a5129cb2` (#566) changed the unit to source modules by owner decision and
  touched four files; the test is not one of them
  (`git log f13fd341..4acbc9e4 -- scripts/check-entry-import-budget.test.ts` is
  empty).

So the script keeps its contract — an entry that maps to no source file fails
loudly and never skips — and the test was rewritten to it.

## 3. The guard does not read `dist/`, and this is the measurement that says so

The dispatch brief asked for the guard to be moved *after* `build`, because it
"reads dist/". It does not: `sourceOfTarget` strips `dist/` off the `exports`
target and looks under `src/`. Proved rather than argued, at a checkout that has
never been built:

    git archive HEAD packages scripts | tar -x -C <scratch>/nobuild
    ls -d <scratch>/nobuild/packages/*/dist       → No such file or directory
    node --experimental-strip-types scripts/check-entry-import-budget.ts
                                                  → entries measured: 5/5, exit 0

The ticket, and the audit finding `guards-a/eib-after-build`, both ask for the
opposite of the brief — the step above `build` — and that is what landed.

## 4. The three rewritten cases, and what each one fails against

    vp test run scripts/check-entry-import-budget.test.ts     exit 0 — 3 passed
    vp test run scripts --maxWorkers=2                        exit 0 — 12 files, 75 passed

The fixture publishes `./dist/Provider.js` targets and writes `src/Provider.ts`
sources, and writes no `dist/` at all. `@proyecto-viviana/ui ./Provider` reaches
three modules — its own, a local `./context`, and `@proyecto-viviana/solidaria/i18n`
through solidaria's own `exports` map — against a ceiling of 3/1.

| case | violating fixture | asserted |
| --- | --- | --- |
| under the ceiling passes | the graph above | exit 0, `entries measured: 2/2`, `entry import budget OK.` |
| over the ceiling fails | one more local import, `./extra` | exit 1, `@proyecto-viviana/ui ./Provider: 4 modules, ceiling 3` |
| unresolvable target fails | `src/Provider.ts` removed | exit 1, `budgeted target(s) resolve to no source file`, `Fix the exports map or the specifier`, and never `entry import budget OK.` |

Each case was run against pre-fix code, with `GUARD` pointed at a scratch copy:

- the pre-#566 dist-chunk guard (`git show 5c57cf2f:…`) → **3 failed (3)**, exit 1.
- the current guard with the fail-loudly branch replaced by
  `if (!measured) continue;` → **1 failed**, and it is the unresolvable-target
  case.
- the current guard with the total ceiling not enforced → **1 failed**, and it is
  the over-budget case.

## 5. The ordering, and the contract that now holds it

`certification-gates.yml`: `guard entry-import-budget` moved above
`build package evidence`. `guard jsx-deopt-size` stays after it — that one does
measure the artifacts.

`scripts/test-ci-guard-contracts.mjs` asserted the old direction ("must build
package artifacts before measuring the entry import budget"), which #566 made
false. It now asserts the inverse in both chains:

    vp run test:ci-guard-contracts, pre-fix workflow order   exit 1
      Error: Certification Gates must measure the entry import budget before building packages
    vp run test:ci-guard-contracts, at HEAD                  exit 0

`ci:release-readiness` already ran the guard before `build` (a5129cb2); that
order is now pinned by the same assertion instead of resting on a commit message.

## 6. No budget number changed

    vp exec tsx scripts/check-entry-import-budget.ts --print-modules      exit 0

| entry | measured | ceiling |
| --- | --- | --- |
| `@proyecto-viviana/ui ./Provider` | 53 (47 solidaria) | 53/47 |
| `@proyecto-viviana/solid-spectrum ./Provider` | 52 (47) | 52/47 |
| `@proyecto-viviana/solid-spectrum ./ButtonGroup` | 57 (47) | 57/47 |
| `@proyecto-viviana/solid-spectrum ./ProgressBar` | 44 (38) | 44/38 |
| `@proyecto-viviana/solid-spectrum ./ProgressCircle` | 35 (28) | 35/28 |

Five of five exactly at the ceiling, so the re-derivation #587 asked for is a
no-op: the numbers in `scripts/entry-import-budget.json` are the numbers a run at
this revision produces.

> Corrected later the same day, in the review round below. This section first
> said the command and the five readings were "recorded in the JSON's
> `description`, which `--write-baseline` preserves" — which is the defect, not
> the feature. The numbers are written by the run now; no reading is spelled out
> in prose that a rewrite would carry forward.

## 7. The review round, and what it found (same day, `10684229` reviewed)

Three problems, all of them real.

**The derivation rotted by design.** `--write-baseline` rewrites every number
and copies `description` and `why` forward verbatim, so the five readings §6
wrote into `description` would have survived the first legitimate ceiling
change — `guards-b/entry-budget-refrozen-twice`, rebuilt by the fix for it. So
the numbers became the script's to write:

- each entry carries a `measuredAt`, written by the run that set its ceiling;
- `description` states no measurement at all;
- `--write-baseline` refuses a `why` whose opening counts ("53 source modules,
  47 of them solidaria") disagree with what it just measured, and writes
  nothing when it refuses.

Red before green, against the guard at `10684229`:

    vp test run scripts/check-entry-import-budget.test.ts   exit 1 — 2 failed | 6 passed

The pre-fix `--write-baseline` exits **0** there while it rewrites a 9/9 ceiling
to 3/1 under a `why` that still claims 5/2. After the fix, 8 passed, exit 0, and
the refusal reads:

    @proyecto-viviana/ui ./Provider: `why` states 5 source modules, 2 of them
    solidaria; this run measured 3 and 1. Rewrite `why` with the new counts and
    the import that moved them, then re-freeze.

Re-frozen with the fixed script — `vp run guard:entry-import-budget -- --write-baseline`,
exit 0, "Wrote 5 entry ceiling(s) and a 154-file root-barrel inventory". No
ceiling moved: the only content the diff adds is five `"measuredAt": "2026-09-21"`
lines.

**Three failure branches had no test**, including the one the guard exists for.
Added, each with a fixture that violates only it:

| new case | fixture | asserted |
| --- | --- | --- |
| solidaria ceiling | ui `./Provider` reaches `solidaria/i18n` + `solidaria/overlays`: 3 total against 3, 2 solidaria against 1 | exit 1, `@proyecto-viviana/ui ./Provider: 2 solidaria modules, ceiling 1`, and never the total message |
| root-barrel addition | `packages/viviana-ui/src/barrel.ts` exporting from the bare specifier, reachable from no entry | exit 1, `root-barrel importers: 1 (ceiling 0)`, `1 new file(s) import the @proyecto-viviana/solidaria root barrel` |
| dead workspace specifier | a resolving entry importing `@proyecto-viviana/solidaria/missing` | exit 1, the entry and specifier named, and never `entry import budget OK.` |

The total ceiling is checked first as an `if`/`else if`, so the over-budget case
never reaches the solidaria branch — it needed its own fixture. Each case was
proved to bind its branch by mutation, with the guard copied to the scratch
directory and that one branch removed:

| mutation | result |
| --- | --- |
| solidaria ceiling branch deleted | 1 failed, 7 passed (8), exit 1 — the solidaria case |
| root-barrel addition never pushed | 1 failed, 7 passed (8), exit 1 — the root-barrel case |
| per-entry unresolved report deleted | 1 failed, 7 passed (8), exit 1 — the dead-specifier case |

    vp test run scripts --maxWorkers=2     exit 0 — 12 files, 80 passed (75 before)
    vp run guard:entry-import-budget       exit 0 — 5/5 entries, 154 importers against 154

**Certification Gates is not disabled.** The claim below was written without
running the command. It was run this time:

    gh api repos/:owner/:repo/actions/workflows
      Certification Gates   active          .github/workflows/certification-gates.yml
      Changesets Check      active
      Journey Fuzz Nightly  active
      Release               active
      Release Readiness     disabled_manually
      Site Gate             disabled_manually

    gh run list --workflow=certification-gates.yml
      five push-to-main runs today; latest 35560076342, 2026-09-21T04:11:59Z

So §5's reorder and the changed assertion in `scripts/test-ci-guard-contracts.mjs`
are not parked in a disabled workflow: they land in a live blocking ladder on the
next push to main, the assertion as the `CI guard failure contracts` step
(`certification-gates.yml:100-101`, no `continue-on-error`). The residual risk is
"untested on a runner", not "unobserved".

## What this receipt does not prove

No CI run: this seat does not push. Certification Gates is active and blocking
and will execute the reordered step on the next push — today's runs are red at
`docs:check`, the generated-view staleness #588 owns, before the ladder reaches
either change. `vp run build` was not run either: nothing in this ticket needs
one, which is the point.
