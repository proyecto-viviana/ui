---
id: 568
type: task
title: "ci:release-readiness runs a subset of the blocking gates; `guard:gate-coverage` prints which and keeps the two docs true"
created: 2026-09-20
parent: 544
status: merged
history:
  - {
      state: open,
      at: 2026-09-20,
      note: "found by the conductor after #567. #565 recorded `guard:entry-import-budget` as absent from every ci:release-readiness leg, which is why the nineteen-green walk at 3f220fb6 did not see it red, and #566 fixed that one by wiring it in. This ticket is the measurement that says it was never one gate: 28 of the 36 blocking steps in certification-gates.yml have no leg in the chain",
    }
  - {
      state: open,
      at: 2026-09-20,
      note: "second measurement, from the workflow side rather than the script side, taken by the conductor while settling the last open row of the #546 audit. Of the five workflows that could hold release safety on the push path, exactly one executes today and it is red - see 'What actually runs' below. `gh run list --workflow=changesets-check.yml` puts its most recent run at 2026-09-04, seventeen days before this campaign's first commit. This does not change the Work section; it raises the stakes on choosing, and it is the evidence for the sentence in 'Why it matters now' that a workflow nobody has enabled is a gate in name only",
    }
  - {
      state: open,
      at: 2026-09-20,
      note: "third pass, and it corrects this ticket's own first number. The count of 28 uncovered gates was taken by matching leg names literally, so a gate the chain reaches through a composed script was counted as uncovered. `typecheck` was the only one: `check`, the chain's first leg, is `vp check && vp run typecheck`. The real figure is **27**, the covered count is unchanged at 8, and the sentence claiming root TypeScript is not in the chain at all is struck - the 16:30 `Release Readiness` failure it cited proves the opposite of what it was cited for, because the chain is what caught that error. The measurement now lives in `.agents/audit-2026-09-20/measure-gate-coverage.mjs`, which walks the composition and reads `continue-on-error` per step block; every number in the Scope section is its output at `19e19328`. Also established here by reading both job logs: `Release Readiness` and `Site Gate` were switched off over one and the same TS7016, fixed by `29f2b2f9` eight minutes later, so re-enabling them is a precondition of stage 4 - and an owner action, since this seat's attempt to run `gh workflow enable` was refused",
    }
  - {
      state: open,
      at: 2026-09-21,
      note: "2026-09-21 round-1 audit, receipt `.agents/audit-2026-09-21/round-1-results.md`. Two findings land here and one row needs correcting. `test-integrity/main-red-and-release-unsatisfiable`, high, confirmed: `scripts/check-release-evidence.mjs:10-12` requires a successful run of all three of `certification-gates.yml`, `release-readiness.yml` and `site-gate.yml` at the exact release sha; two of the three are `disabled_manually`, a disabled workflow produces no run, and the guard fails closed - so the RC's own release condition is unsatisfiable today, and the two `gh workflow enable` commands are an owner action. `guards-b/553-guards-run-nowhere`, medium, confirmed: four of the twelve fail-open gates #553 closed have a disabled workflow as their only CI caller, so closing them changed nothing that runs. And the table row that names the earliest ladder red is wrong - measured here, `docs:check` is `certification-gates.yml:235` at HEAD `65254a8c` and was `:231` at `96376e9a`, where CI runs 35556441049, 35558449632 and 35560076342 all stopped; `comparison parity (strict)` and `axe full audit` have not executed since `1a98e250`. #588 owns the red; this ticket owns the row.",
    }
  - {
      state: open,
      at: 2026-09-21,
      note: "placed at stage S5 of #544's path, before Site and before #547, where it had been only a footnote under two other stages. The deliverable is stated there in two parts: the owner action `gh workflow enable release-readiness.yml` and `gh workflow enable site-gate.yml`, and the writer's ladder-row correction. Re-checked here: `gh workflow list --all` still reports `Release Readiness` and `Site Gate` as `disabled_manually` while `Certification Gates`, `Changesets Check`, `Journey Fuzz Nightly` and `Release` are active, and `scripts/check-release-evidence.mjs:9-13` still requires a successful run of all three of `certification-gates.yml`, `release-readiness.yml` and `site-gate.yml` at the release sha.",
    }
  - {
      state: open,
      at: 2026-09-21,
      note: 'the owner''s answer, ~17:10, on the one call this ticket holds: the two `gh workflow enable` commands are **no longer an owner action**. The conductor listed its open owner calls, quoting its own message - "the dist-tag (my default is `rc` alone), re-enabling Release Readiness and Site Gate, the waiver list once the census produces it, and the publish" - and the owner answered, verbatim: "can you handle all those? your default is fine", then "also you''re the only one working on this, the previous session was superseded by yours, so you can handle everything, don''t say "oh the other session is running" or whatever". So the enable is delegated to the conductor, and the timing below is the conductor''s stated default that the owner accepted, not the owner''s wording: **once the twenty-leg chain is green locally at one sha**, or earlier only if `check-release-evidence.mjs` needs their runs to be satisfiable. The body''s line calling this an owner action is corrected in this commit; the three earlier notes that call it one stay as they are, because they were true when written - this seat''s own `gh workflow enable` was refused on 2026-09-20. Nothing else about this ticket moves: the delegation settles who runs two commands, not the Work section, which is still a live decision about what the chain is for, and not the coverage figure of 8 of 35. And the enable is a measurement, not an expected green - neither workflow has run since `f813032d`, so the first run on a current revision may well be red, which is the point of running it before the publish rather than during it',
    }
  - {
      state: in-progress,
      at: 2026-09-22,
      note: "decided by the conductor: option 3 of Work, with the invariant it names. ci:release-readiness stays, guard:gate-coverage is one leg of it, and the citation for the gates is that guard. scripts/gate-coverage.json has one entry per blocking step of the certification-gates job (no continue-on-error: true) plus the certified matrix job and the certified report job. scripts/check-gate-coverage.mjs is read-only and offline. It fails, naming the step, when a blocking step has no entry, an entry names a step that is gone, or a leg is not a package.json script, and it walks composition, so typecheck counts through check (vp check && vp run typecheck) and again through build. vp run guard:gate-coverage prints: ci:release-readiness runs 8 of 41 blocking gate steps locally; the other 33 run only in Certification Gates (scripts/gate-coverage.json). The body's 8 of 36 was the npm-script count at 19e19328. This guard counts every blocking step of that job, including checkout, setup, install, the Playwright cache, the Chromium install, the artifact upload, and Publish summary, which is why M is 41. The eight local steps are guard gate-coverage, typecheck, lint (vp check) via check, test ssr, test hydrate, guard source artifacts, guard entry-import-budget, and build package evidence. Where the brief and the tree disagreed, the smaller true thing landed. guard:gate-server-reuse is absent from certification-gates.yml, so the new step is the first blocking step and the package.json leg sits immediately after vp run guard:gate-server-reuse. guard:workflow-pins and guard:gate-server-reuse do not pin the step list, so neither was edited. jobBlock is a second copy of the four-line cut in scripts/test-ci-guard-contracts.mjs, because that file runs its suite on import, exports nothing, and is outside the write paths. Comparison-build and the two floor jobs stay out of the map: step names such as Checkout collide across jobs. The Publish summary table does not name the new step; a failing step still fails the job. gh workflow list --all this session: Certification Gates, Changesets Check, Journey Fuzz Nightly, and Release are active; Release Readiness and Site Gate are disabled_manually. The ticket text's Done-when, a stated relationship a script enforces and one true sentence, is met by vp run guard:gate-coverage. The brief still wants those two workflows enabled, and they are not, so this stays in-progress. The chain is twenty-one vp run legs. #544 and #590 still say twenty, and #544 still calls the earliest blocking step :235. Proof: vp run guard:gate-coverage -> 0; vp test run scripts/check-gate-coverage.test.* --maxWorkers=2 -> 0 (6 passed); vp run guard:workflow-pins -> 0; vp run guard:gate-server-reuse -> 0; vp run test:ci-guard-contracts -> 0; vp run docs:check -> 0; vp fmt --check on the touched files -> 0; vp lint on the touched code files -> 0. vp run docs:generate rewrote status.md and roadmap.md. The roadmap stamp includes status, so roadmap.md is in this commit, and that regenerate also counts #614, already open under #32 and missing from the previous views, which moves #32 from 6/13 to 7/14. The workflow edit is the new step plus the header lines that had said the blocking ladder was verified green locally before promotion.",
    }
  - {
      state: merged,
      at: 2026-09-22,
      note: "2026-09-22. The review of ac79e0ac and 72fbaf38 holds: the guard was reading one job. blockingGateSteps now enumerates every blocking step of the six Certification Gates jobs. Dated counts from the guard this session: 11 of 46 blocking gate steps run locally, the other 35 run only in Certification Gates, and 43 steps are runner plumbing (89 blocking steps). The printed sentence is the one release-policy.md:98 and certification.md:114 contain; git grep -nF of that sentence returns those two lines and nothing else. The chain reaches three comparison-build steps, not the two the brief named: D13 journey driver unit tests via comparison:test:journeys-driver, guard certified case floor via guard:certified-case-floor, and build packages via build. Publish floor summary stays a gate: that run invokes no package script and the plumbing allowlist does not name it. The allowlist uses the real step name Install Playwright Chromium. jobBlock was not extracted. check-gate-server-reuse.mjs and check-workflow-pins.mjs do not slice jobs. The other copy is test-ci-guard-contracts.mjs:65, which runs on import and is outside this change; this guard's copy is check-gate-coverage.mjs:48. The gh workflow enable commands the previous in-progress note was waiting on are the conductor's, not this ticket's, so this entry is merged for the landed guard plus this fix. verified is not written here. #544 outside the edited lines still calls this ticket open at the S5 header and still says twenty-leg chain in the release-condition sentence. Proof from the repo root: vp run guard:gate-coverage -> 0 and printed the sentence. git grep -nF of that sentence -> exit 0, two hits. Scratch copies under the w568b scratchpad, each checked with checkGateCoverage: (a) a blocking step added to comparison-build -> exit 1, naming comparison evidence build / w568b fake blocking step; (b) release-policy.md changed from 11 of 46 to 12 of 46 -> exit 1, naming .claude/current/release-policy.md; (c) axe full audit given continue-on-error true -> exit 1, saying blocking step certification-gates / axe full audit is now advisory; remove its entry or restore continue-on-error. VITEST_MAX_WORKERS=2 vp test run scripts/check-gate-coverage.test.ts -> 0, 11 passed. vp run guard:workflow-pins -> 0. vp run guard:gate-server-reuse -> 0. vp lint on the mjs and ts write paths -> 0. vp exec tsc --noEmit -p tsconfig.typecheck.json -> 0. vp run check -> 0. vp fmt --check on the write paths -> 0. vp run docs:check -> 0.",
    }
  - {
      state: merged,
      at: 2026-09-22,
      note: "2026-09-22. The guard walks every vp|pnpm|npm run script in a step body. A string leg must be among them when the body names any, every other named script must be one ci:release-readiness reaches, and a null leg that names a reached script still fails. Publish floor summary is plumbing. Publish summary binds and rows guard:entry-import-budget. The body's 8 of 35, 36, and 27 in Scope and Why it matters now are the count at 19e19328, and the guard's printed sentence is the live number. The 3065bde5 hunk on #544 began one line above the brief's window (old :390) and dropped the :235 claim #544:262 already superseded. #544's S5 header now says merged. #616 holds the blind spots this change leaves. The sentence: ci:release-readiness runs 11 of 44 blocking gate steps locally across the six Certification Gates jobs; the other 33 run only there; 45 steps are runner plumbing (scripts/gate-coverage.json). 13:52 vp fmt --check on the mjs, the test, the json, and the workflow -> 1 (check-gate-coverage.mjs). 13:52 vp fmt scripts/check-gate-coverage.mjs -> 0. 13:52 vp run guard:gate-coverage -> 1 and printed that sentence; the two docs still said 11 of 46. 13:52 vp test run scripts/check-gate-coverage.test.ts --maxWorkers=2 -> 1 (12 passed, 2 failed on the stale sentence). 13:53 node count of the allowlist -> 0: nine names, five of them uses-only, 34 O_* bindings and 34 rows in certification-gates.yml:331-451. 13:55 vp run guard:gate-coverage -> 0 and printed the sentence. 13:55 vp test run scripts/check-gate-coverage.test.ts --maxWorkers=2 -> 0, 14 passed. 13:55 vp run test:ci-guard-contracts -> 0. 13:55 vp run guard:workflow-pins -> 0. 13:55 vp run guard:gate-server-reuse -> 0. 13:55 vp fmt --check on the write paths -> 0. 13:55 vp lint scripts/check-gate-coverage.mjs scripts/check-gate-coverage.test.ts -> 0. 13:55 vp run check -> 0. 13:55 vp run docs:generate -> 0. 13:56 git grep -nF of the sentence -> 0, certification.md:114 and release-policy.md:98. 13:56 vp run docs:check -> 0. 13:57 vp run docs:check -> 0 after this note.",
    }
---

## Scope

The 8 of 35, the 36, and the 27 in Scope and "Why it matters now" are the count at `19e19328`; the guard's printed sentence is the live number.

Two gate ladders exist and neither contains the other.

`ci:release-readiness` is 20 legs in `package.json`, which resolve to 32 once
the legs that are themselves compositions are followed. `certification-gates.yml`
has 36 blocking steps that run an npm script — 35 distinct — and exactly 1
advisory one, `guard:upstream-freshness`. The 27 blocking gates the chain does
not run:

```
guard:ts-nocheck-budget            guard:idiomatic-solid
test:ci-guard-contracts            guard:invented-utilities
guard:attribution-headers          guard:docs-routes
guard:rac-parity                   guard:examples-purity
guard:rac-export-gap               guard:api-reference
guard:dnd-keyboard-parity          guard:outbound-links
guard:virtualizer-keyboard-parity  guard:jsx-deopt-size
guard:spectrum-tokens-pin          guard:jsx-ref-dead-code
guard:style-macro-parity           guard:s2-cleanups
guard:s2-intl-catalog              guard:upstream-test-parity
guard:layer-boundary               docs:check
                                   comparison:report:parity:strict
                                   a11y:full
                                   comparison:test:certified-waivers
                                   comparison:build
                                   guard:comparison-atom-css
```

Re-measured at `19e19328` by
`.agents/audit-2026-09-20/measure-gate-coverage.mjs`, which is the honest
version of the four-line `node -e` this ticket first used: it splits the
workflow into step blocks so `continue-on-error` is read from the whole block,
and it follows the chain's legs transitively instead of matching leg names
literally. Re-run it rather than trusting this list after a change.

### The first measurement had `typecheck` on the list, and that was wrong

`typecheck` was the 28th entry. It does not belong: `check`, the chain's first
leg, is `vp check && vp run typecheck`, so the chain runs root TypeScript — just
not under its own name. The 2026-09-20 16:30 `Release Readiness` run is the
proof, and it points the opposite way to how this ticket first read it. That run
died on `scripts/check-peers.test.ts(7,63): error TS7016`, reached through
`vp run check` calling `tsc --noEmit -p tsconfig.typecheck.json`. The chain
**caught** that error; it did not miss it. `29f2b2f9` fixed it eight minutes
later.

The correction matters beyond one row. The original count was taken by matching
leg names literally, so any gate the chain reaches through a composed script
would have been counted as uncovered. `typecheck` is the only one that actually
was — the transitive walk finds no others — but the method could not have known
that, and the guard this ticket asks for has to walk the composition or it will
encode the same mistake.

## Why it matters now

This is the same failure shape #553 spent a shift closing, one level up. #553
asked whether each gate can fail; this asks whether anyone runs it. A gate that
is blocking in a workflow nobody has enabled, and absent from the chain people
do run locally, is a gate in name only.

It has already cost twice in one day. `guard:entry-import-budget` went red and
stayed red through a nineteen-green walk (#565). `guard:attribution-headers`
went red in `e6384f37` at 16:37 and was found only when the workflow was
switched back on seven hours later (#567).

It also bears directly on #547. If the release candidate's evidence is "the
chain is green", that sentence currently covers 8 of the 35 blocking gates.

## What actually runs

The section above counts scripts. This counts workflows, measured 2026-09-20
late with `gh workflow list --all` and `gh run list --workflow=<file>`:

| workflow              | state               | last run on a campaign commit                                                  |
| --------------------- | ------------------- | ------------------------------------------------------------------------------ |
| `Certification Gates` | active              | running, red at one step (`guard upstream-test-parity`)                        |
| `Changesets Check`    | active              | **none** — last run 2026-09-04, `pull_request` only and nothing here opens PRs |
| `Release Readiness`   | `disabled_manually` | 2026-09-20 16:30, failure, then switched off — one TS error, fixed 8 min later |
| `Site Gate`           | `disabled_manually` | 2026-09-20 16:30, failure, then switched off — the same one TS error           |
| `Release`             | active              | 8 consecutive `skipped` — its `if:` needs a successful `Certification Gates`   |

One of five executes, and it is red. Two were switched off after failing rather
than after being fixed. One has not fired since before the campaign began. The
fifth is gated on the first.

### Both switched-off workflows died on the same single error, and it is fixed

Read from the two job logs, not inferred. `Release Readiness` 35522923242 and
`Site Gate` 35522923210 both ran at `f813032d` at 16:30 and both failed with
exactly one line:

```
scripts/check-peers.test.ts(7,63): error TS7016: Could not find a declaration
file for module './check-peers.mjs'
```

Each reached it the same way, through its own first leg calling `vp run check`
→ `tsc --noEmit -p tsconfig.typecheck.json`. `29f2b2f9` (16:38) put
`// @ts-expect-error — plain-JS guard, no types` on that line, and it is an
ancestor of HEAD.

So neither workflow is off because it found something hard. Both are off because
of one suppression that landed eight minutes after they were switched off, and
nobody switched them back on. That is this ticket's thesis in its smallest
possible form.

**This blocks the release, and it was filed here as an owner action.** The
2026-09-21 history note records what changed and quotes the words it rests on.
`scripts/check-release-evidence.mjs:10-12` requires a successful run of
`Certification Gates`, `Release Readiness` **and** `Site Gate` for the exact
release SHA. A `disabled_manually` workflow cannot produce one, so stage 4 of
`.agents/CONDUCTOR-RELEASE-PATH-2026-09-20.md` cannot start until both are
enabled:

```
gh workflow enable release-readiness.yml
gh workflow enable site-gate.yml
```

Neither has run since `f813032d`, which predates every ladder closure of this
campaign, so what they report on a current revision is unknown and should be
treated as a new measurement rather than an expected green.

This is also how `guard:publish-drift` came to be dormant. It is named in
`release-policy.md:92-95` as the control that makes `Changesets Check` safe to
leave `pull_request`-only, and its only push-path invocation is `release.yml:75`
— inside the workflow that has concluded `skipped` eight times running. The
design is sound; nothing has run it. The audit row that asked whether the
`Changesets Check` trigger should move was decided **no** on those grounds, in
`.agents/audit-2026-09-20/VERIFIED.md`.

The workflow file's own header already states the principle this ticket is
about: "Work on this repo lands direct-to-main, so a PR-only ladder structurally
never fires (`ci-main-gate-wiring`)." It was written for `Certification Gates`
and never applied to the other four.

## Work

Decide what the chain is _for_, then make it say that. The options are not
equal and picking is the work:

- Make `ci:release-readiness` the superset: every blocking gate becomes a leg.
  Honest, and slow — `a11y:full`, `comparison:build` and the parity reports are
  minutes each, and the chain is already the long pole of a local check.
- Split by cost: a fast chain that is a true superset of the cheap gates, and a
  named slow one for the rest, with the workflow running both and neither
  claiming to be the other.
- Leave the chain as it is and stop treating it as proof — rename it to what it
  covers, and make the workflow the only thing that may be cited as "gates
  green".

Whatever wins, the invariant worth encoding is that adding a blocking step to
`certification-gates.yml` without adding it somewhere runnable should itself
fail a guard. There is already `guard:workflow-pins` and `guard:gate-server-reuse`
reading these workflow files, so the reading half exists.

## Done when

The two ladders have a stated relationship that a script enforces, and #547 can
cite one sentence about gate coverage that is true.

## Relationship

Child of #544. Generalises the finding in #565 and the miss in #567. Same
family as #553, which closed the fail-open half of the same question.
