# Release path — from here to the packages on `next`

Owner instruction, 2026-09-20 evening: continue autonomously, and hold one goal
— go over every remaining item up to releasing the packages that are green and
done. This file is that goal written down. The board stays authoritative; this
only orders what is already on it.

## The goal, stated so it can fail

One revision of `main` on which the Certification Gates ladder walks to the end,
and on that same revision the five in-scope packages published to the `next`
dist-tag as `-rc.1`. Every failure that survives is **named as debt in
`certification-debt.md`**, never waived and never silently skipped. `latest`
does not move.

In scope, from [release policy](../.claude/current/release-policy.md) and #547:

| package                                | at HEAD |
| -------------------------------------- | ------- |
| `@proyecto-viviana/solid-stately`      | 0.5.2   |
| `@proyecto-viviana/solidaria`          | 0.5.0   |
| `@proyecto-viviana/solidaria-components` | 0.6.0 |
| `@proyecto-viviana/solid-spectrum`     | 0.7.0   |
| `@proyecto-viviana/ui`                 | 0.7.0   |

Kumo and Geist stay at `0.0.0` and are ignored by Changesets. 48 changesets are
pending; the repository is not in prerelease mode (`.changeset/pre.json` absent).

## Stage 1 — learn the true red list

`ci:release-readiness` is 20 legs; `certification-gates.yml` has 36 blocking
steps and 28 of them are not legs (#568). So "the chain is green" has never meant
the ladder is green, and the ladder has been off for most of the campaign. Until
the red list is known, every estimate past this stage is a guess.

Two mechanisms, and they run at the same time without competing for memory:

- **CI walks it for free.** The workflow stops at the first red, so each push
  after a fix reveals the next one, about 34 minutes a walk, on GitHub's
  runners and not this machine. `guard attribution-headers` (step 113) was the
  first and is closed by #567.
- **A local walk of the cheap gates** gives the rest in one pass instead of one
  per push. It is heavy, so it runs only when the writer is idle, one command at
  a time, output to `.agents/chain-walk-2026-09-20/`.

Known red before the walk: `guard api-reference` at `certification-gates.yml:193`
(#559), confirmed locally, 81 of 84 pages drifted.

### What the walk found, 2026-09-20 evening

Fourteen cheap pre-build gates, about a second each, receipts one file per gate
in `.agents/chain-walk-2026-09-20/`. Ten green: `rac-parity`,
`dnd-keyboard-parity`, `virtualizer-keyboard-parity`, `spectrum-tokens-pin`,
`style-macro-parity`, `s2-intl-catalog`, `source-artifacts`,
`invented-utilities`, `docs-routes`, `outbound-links`. Four red, each now a
ticket:

| step | gate               | red                                            | ticket |
| ---: | ------------------ | ---------------------------------------------- | ------ |
|  121 | `rac-export-gap`   | `setInteractionModality` pending on merged #231 | #569   |
|  160 | `layer-boundary`   | 10 baselined-identical paths diverged           | #570   |
|  169 | `idiomatic-solid`  | a baselined site was fixed, entry left          | #571   |
|  185 | `examples-purity`  | allowlist has no `@solidjs/web`                 | #571   |
|  193 | `api-reference`    | 81 pages drifted                                | #559   |

The walk changes the order of this whole plan. #559 is step 193; the ladder
stops at **121**, seventy-two steps earlier. Closing #559 alone would have
turned no CI walk green, and each of #569, #570, #571 would have cost a separate
34-minute push to discover. That is the argument for walking locally rather than
letting CI reveal one red per push.

### The post-build half, walked the same evening

`vp run build` green, then the five gates behind it that nothing had ever run —
`ci:release-readiness` reaches none of them, which is #568's point. Three green:
`jsx-deopt-size`, `entry-import-budget`, `s2-cleanups`. Two red, both now
ticketed:

| step | gate                   | red                                            | ticket |
| ---: | ---------------------- | ---------------------------------------------- | ------ |
|  219 | `jsx-ref-dead-code`    | asserts a `setAttribute` removed in `70a8d478` | #572   |
|  227 | `upstream-test-parity` | baseline +30 suspects behind the pin           | #573   |

Neither is a build defect, which is worth stating because both messages read
like one. #572 says "package transform dropped" about a line the refactor
deleted; #573's ratchet was last moved by a regen labelled "fmt drift". Both are
records that stopped tracking the tree — the failure mode the standing rule
"the tree beats the document" names.

### Step 239, and the gate that no commit can pass

Comparison parity strict turned out not to need a browser at all — it is a
`tsx` script over the catalogue — so it ran the same evening. EXIT=1, and its
**only** blocking gap is the certified-suite postcard. Every other
always-blocking section is `[pass]`; the two `[gap]` control and validation
sections are inside the frozen baseline.

That one gap is not staleness. `certifiedSuitePostcardIsCurrent` is
`headSha === evidence.revision`; `evidence.revision` is a hand-edited literal in
committed source; nothing regenerates it. Writing the current SHA into it is
itself a commit, so the literal always names HEAD's parent. **The gate's pass
condition has no witness.** #574.

This changes the shape of the goal. The ladder cannot walk to the end on any
revision until 239's rule is replaced, so #574 is a blocker for the RC in the
strongest sense — not "a red to clear" but "a red that clearing cannot reach".
It is also the gate standing between the owner's decision on #547 (record
certified evidence by running Certification Gates in CI) and its being carried
out: the recording mechanism rejects every recording.

### Step 251, and the two owner calls that were already answered

Written first as "251 cannot run and two owner calls stand in the way", and
that was wrong in this seat's own direction — it read
`.agents/green-main-2026-09-20.log.md` as the state of the tree instead of
checking the tree. Corrected here in the same session, which is what the rule
asks for.

The reasoning that holds: all three legs of `a11y:full` are
`--filter @proyecto-viviana/web`, and `apps/web/playwright.config.ts:33` starts
its server with `vp build && vp preview --port 4000`. So step 251 is exactly as
green as `build:web`. What was wrong was the second half — that `build:web`
fails. It does not:

- `vp run build:web` EXIT=0, `✓ built in 4.40s`, receipt
  `.agents/chain-walk-2026-09-20/ladder-build-web-after-patch.out.txt`.
- The `parseServerFunctionUrl` break was closed by `1df7af51` under #545 itself,
  by the patch this seat would have recommended: `patches/@tanstack__solid-start@2.0.0-rc.8.patch`
  rewrites the three call sites in one dist file, wired through
  `pnpm-workspace.yaml` `patchedDependencies` and keyed to the exact version so
  the install fails the day TanStack moves. Reasoning in
  `.agents/green-main-2026-09-20.decision-solid-start-patch.md`; the owner
  confirmed it, and it is named in the writer's own task.
- The peers question is answered too, and not by the `allowAny` silencing this
  seat argued against: `ca1a0d82` (#532) added `solid-js` and `@solidjs/web` to
  `peerDependencyRules.allowedVersions`, which is the ratcheting form.

So there are no unanswered owner calls on the path. Step 251 ran under
`VIVIANA_GATE=1`, which is what turns off Playwright's server reuse and makes
the local run the gate's run.

### What step 251 actually returned

EXIT=1, and the shape of it is better than the count. Two of the three legs are
clean — playground axe 10/10, comparison axe 81/81 — so the ported site has no
axe violation anywhere. The third, `a11y:smoke`, is 7 failed / 67 passed, and
the seven are **two defects, not seven**:

- Five are one shell in one scheme. Every failure is the `+ Create` floor in
  `apps/web/e2e/examples.spec.ts:205`, the failing set is exactly the five
  registry entries whose `fuchsiaFill` is `+ Create`, and each one passes in
  `[dark]` and fails in `[light]`. #575, which also says what must not happen:
  the helper compares two computed colour strings for equality, so "make it
  pass" has a wrong answer that looks like success.
- Two are the playground's toast region never appearing. #576.

Receipt `.agents/chain-walk-2026-09-20/ladder-axe-full.out.txt`.

The red list for the RC is nine tickets: #559, #569 and #570 merged, #571 green
and committing; #572, #573, #574, #575, #576 open. #545 is not among them — most
of it shipped in `dd634d36` and after, the patch closed the rest, and its record
is corrected on the ticket. Of the nine, #574 is still the only one that
clearing cannot reach: its gate has no passing witness, so it needs a design
decision rather than a fix. That decision is now taken and written into #574:
ancestry plus coverage, with the postcard's own file excluded from the covered
set, and `fetch-depth: 0` on the job that runs step 239 because the workflow
checks out at depth 1 today.

### The `gates` job is now fully accounted for

Written first as "three steps are unwalked", and that count was itself
incomplete — it was made from the walk's own receipts rather than from the
workflow. Read against the file, the `gates` job has 41 named steps: seven of
setup, then **31 blocking gates**, then `guard:upstream-freshness`, then two
`if: always()` reporting steps. Every one of the 31 now has either a green
receipt or a ticket. The four that were missing from the list, and what closed
them:

| step | gate                        | result |
| ---: | --------------------------- | ------ |
|   86 | `typecheck`, the whole repo, not the `typecheck:apps` leg | EXIT=0 |
|   90 | `guard:ts-nocheck-budget`   | EXIT=0, 59 against a ceiling of 59, nothing new or moved |
|   97 | `test:ci-guard-contracts`   | EXIT=0, every negative fixture still exits non-zero |
|  266 | `guard:upstream-freshness`  | `continue-on-error: true` — advisory by construction, never blocking |

Receipts `ladder-typecheck-full.out.txt`, `ladder-ts-nocheck-budget.out.txt`,
`ladder-ci-guard-contracts.out.txt`. `vp check` (103), `test:ssr` (107) and
`test:hydrate` (111) were already green in the writer's own chain-state table —
0 / 0 / 0, 29 files 78 tests and 27 files 98 tests — so they were walked, just
not by this seat.

That the ts-nocheck budget sits exactly **at** its ceiling is worth one line:
it passes and it has no headroom, so the first `@ts-nocheck` any Solid 2 repair
adds to a public package turns step 90 red. Nothing to do about it now; it is
the kind of thing that costs a 34-minute CI walk to learn the hard way.

### What the walk has still not covered

"The ladder" above means the `gates` job. The workflow has more jobs, and this
seat has walked none of them:

| workflow line | job's work                                                        |
| ------------: | ----------------------------------------------------------------- |
|       432–452 | certified waiver units, D13 journey driver, `guard:certified-case-floor`, `comparison:build`, `guard:comparison-atom-css` |
|      486, 549 | the pair and contract Playwright suites — floors, per #195 / #196  |
|      622, 678 | the certified suite in shards, then `merge-certified-reports`      |

So "nine tickets" is the red list of the `gates` job, which is now complete, and
not of the workflow, which is not. The difference is where a surprise would come
from, and it is a large difference: those jobs are the certified suite itself —
#194's and #547's obligation, and the thing #574's new rule will demand a fresh
run of anyway. They are also the expensive ones, which is the argument for
running them on GitHub's runners rather than here.

## Stage 2 — clear the reds, in ladder order

One ticket each, the writer implements, this seat reviews against a re-run and
commits. Ladder order is not taste: a gate that never runs is a gate whose
failure nobody has seen, and the later ones are the expensive ones.

The audit residue already filed, to be triaged by whether it blocks a gate
rather than by how interesting it is: #554, #557, #558, #559, #560, #561, #562,
#563, #568.

#568 is the one that should not be deferred past this stage. If the two ladders
keep no stated relationship, the next campaign rediscovers all of this.

## Stage 3 — the obligations #547 already carries

Its history names these, and each is checked here before the release flow starts:

- **#139**, refuse `rmSync` outside a temp prefix in the pack script. This one is
  ordered first for a reason: stage 4 runs `pack:local-chain`, which is the
  script in question.
- **#194**, certified skipped counts ratcheted and the certified record pinned to
  HEAD. #547 asks for a certified run "recorded, not waived"; that record is
  currently pinned to `0f1e1198` and stale.
- **#546**, the adversarial audit of the migration and the gates. Its critical
  findings are what #555, #565, #566 and #567 came out of; what remains of it is
  the question of whether it is done, not whether it is needed.
- **#545**, the web app on the TanStack Solid 2 line. Bears on `test:web` and on
  the site, not on the five packages' own closure — a candidate for named debt
  rather than a blocker, and the one item in this list this seat expects to
  argue about before assuming.

## Stage 4 — the release flow, on one revision

In order, all on the same commit, from #547:

1. Changesets prerelease mode, tag `rc`.
2. One changeset per package, stating the Solid 2 requirement and the
   `@solidjs/web` peer in the consumer's words.
3. `vp run pr:check`, `vp run release:prepare`, and a certified run whose result
   is recorded.
4. `vp run guard:publish-drift` and `pack:local-chain` into a clean off-workspace
   Solid 2 consumer, which builds and renders with SSR from the packed copies.
   This is the step that catches what the workspace hides: `ui@0.6.0` shipped
   broken past every in-repo check.
5. Publish `--tag next`. Never move `latest`.

Standing owner authority covers push, the `next` publish and the docs deploy.
It does not cover moving `latest`, a new public name, a branch or a PR, or any
secret change.

## Out of scope for this goal

#443's `latest` release train, and leaving prerelease mode, which is #443's work.
The public face — #548, #549, #550 — is Fable's copy and its own track; nothing
here waits on it and nothing here writes it.

## How it runs

One writer seat, `close-gates`, one ticket at a time, briefed from the ticket
rather than from chat. This seat reviews every commit by re-running the thing it
claims, pushes, keeps the board and this file true, and does not implement.
When a stage's assumption turns out wrong, it is corrected here in the same
session — the tree beats the document.
