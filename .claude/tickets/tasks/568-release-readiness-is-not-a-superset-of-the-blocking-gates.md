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
---

## Scope

Two gate ladders exist and neither contains the other.

`ci:release-readiness` is 20 legs in `package.json`. `certification-gates.yml`
has 36 blocking steps that run an npm script, and exactly 1 advisory one. The
28 blocking gates the chain does not run:

```
typecheck                          guard:idiomatic-solid
guard:ts-nocheck-budget            guard:invented-utilities
test:ci-guard-contracts            guard:docs-routes
guard:attribution-headers          guard:examples-purity
guard:rac-parity                   guard:api-reference
guard:rac-export-gap               guard:outbound-links
guard:dnd-keyboard-parity          guard:jsx-deopt-size
guard:virtualizer-keyboard-parity  guard:jsx-ref-dead-code
guard:spectrum-tokens-pin          guard:s2-cleanups
guard:style-macro-parity           guard:upstream-test-parity
guard:s2-intl-catalog              docs:check
guard:layer-boundary               comparison:report:parity:strict
                                   a11y:full
                                   comparison:test:certified-waivers
                                   comparison:build
                                   guard:comparison-atom-css
```

Measured at `a5129cb2` by parsing both files; the script is four lines of
`node -e` and worth re-running rather than trusting this list after a change.

Note `typecheck` on that list. The chain runs `typecheck:apps`, a different
script, so root TypeScript is not in it at all — and root `typecheck` is what
the 16:30 run of 2026-09-20 died on.

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
chain is green", that sentence currently covers 8 of 36 blocking gates.

## What actually runs

The section above counts scripts. This counts workflows, measured 2026-09-20
late with `gh workflow list --all` and `gh run list --workflow=<file>`:

| workflow              | state               | last run on a campaign commit                                                  |
| --------------------- | ------------------- | ------------------------------------------------------------------------------ |
| `Certification Gates` | active              | running, red at one step (`guard upstream-test-parity`)                        |
| `Changesets Check`    | active              | **none** — last run 2026-09-04, `pull_request` only and nothing here opens PRs |
| `Release Readiness`   | `disabled_manually` | 2026-09-20 16:30, failure, then switched off                                   |
| `Site Gate`           | `disabled_manually` | 2026-09-20 16:30, failure, then switched off                                   |
| `Release`             | active              | 8 consecutive `skipped` — its `if:` needs a successful `Certification Gates`   |

One of five executes, and it is red. Two were switched off after failing rather
than after being fixed. One has not fired since before the campaign began. The
fifth is gated on the first.

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
