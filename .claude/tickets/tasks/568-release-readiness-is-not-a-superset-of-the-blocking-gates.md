---
id: 568
type: task
title: "ci:release-readiness covers 8 of 36 blocking certification gates, so a green chain proves less than it reads"
created: 2026-09-20
parent: 544
status: open
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
---

## Scope

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

**This blocks the release, and it is an owner action.**
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
