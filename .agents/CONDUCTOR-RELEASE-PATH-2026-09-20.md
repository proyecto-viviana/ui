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

### Step 251, and why it was not run

Axe full was left unrun on purpose, not for lack of a slot. Its Playwright
config starts the server with `vp build && vp preview --port 4000`
(`apps/web/playwright.config.ts:33`), and all three legs of `a11y:full` are
`--filter @proyecto-viviana/web`. So 251 is exactly as green as `build:web`,
and `build:web` does not complete. From `.agents/green-main-2026-09-20.log.md`,
"Left red":

```
[MISSING_EXPORT] "parseServerFunctionUrl" is not exported by
  @solidjs/web@2.0.0-rc.9/server-functions/dist/server.js
  ← @tanstack/solid-start@2.0.0-rc.8/server-functions-handler.js
```

`@solidjs/web` rc.9 renamed it to `parseServerFunctionActionUrl`;
`@tanstack/solid-start` rc.8 still imports the old name while declaring a peer
range that admits rc.9; and `npm view @tanstack/solid-start versions` ends at
rc.8, so there is nothing to bump to. This is a break between two upstream
packages, not a defect in this repository, and it is the whole of what remains
of #545 — whose earlier slices did land, in `dd634d36` and after, though the
ticket still reads `next`.

### Two owner calls, and they are the real gate

Both were named by the previous seat and neither has been answered. They are
what stands between here and a ladder that walks to the end:

1. **The `parseServerFunctionUrl` break.** Either pin `@solidjs/web` back to an
   rc that still exports the name — a repo-wide framework downgrade, with
   `solid-js@2.0.0-rc.9` pinned alongside it — or patch the upstream import.
   My recommendation is the patch: it is a rename, not a behaviour change, its
   blast radius is one file in one app's dependency, it is reversible, and it
   does not touch a single published package. The downgrade would reach back
   into #531's port of all seven.
2. **`pnpm peers check`.** It cannot go clean by bumping; every unmet member is
   a transitive of the rc.8 line itself. Adding `solid-js` to `allowAny` would
   silence the check rather than satisfy it, and would hide a Solid 1
   dependency we introduced ourselves — which is precisely what it caught
   before. Recommendation: leave it unsilenced and name it as RC debt.

So the red list for the RC is eight tickets — #559, #569 and #570 merged; #571,
#572, #573, #574 open; plus #545, which is blocked upstream rather than by us.
Of those, #574 and #545 are the two that clearing cannot reach: one needs a
design decision here, the other an owner call on someone else's package.

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
