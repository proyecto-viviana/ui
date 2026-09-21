# Round-1 audit, 2026-09-21 — every finding and who owns it

Source: [`round-1-results.md`](./round-1-results.md), copied byte for byte from
the fleet's artifact. 76 findings survived the skeptics over the range
`f13fd341..4acbc9e4` (78 commits). Every one has a row here, and every row names
a ticket. Where the skeptic narrowed a finding, the row carries the **narrowed**
claim, not the headline.

Read the results file for evidence. This table is only the assignment.

## What was true when this was written

Every number below comes from a command run while writing it, on 2026-09-21.

| fact | value |
| --- | --- |
| HEAD | `65254a8c` |
| `origin/main` | `96376e9a`, 17 commits behind HEAD |
| `vp run docs:check` at HEAD | EXIT=1 — `roadmap.md` and `status.md` both stale |
| earliest blocking red in the ladder | `docs:check`, `certification-gates.yml:235` at HEAD |
| Certification Gates on `main` | last run 35560076342 at `96376e9a`, **failure**, 2026-09-21T04:11:59Z |
| last 60 Certification Gates runs on `main` | 31 failure / 29 cancelled / 0 success |
| last green Certification Gates on `main` | 2026-08-31T00:49:19Z, run 33345702215, `a686e846` |
| `ci:release-readiness` | **20** `&&` legs |
| twentieth leg added by | `a5129cb2` (#566), 2026-09-20 20:37 |
| pending changesets | 56 |
| Release Readiness / Site Gate | both `disabled_manually` |
| upstream pin | `@react-spectrum/s2` 1.7.0, `react-aria` 3.52.0, `react-aria-components` 1.21.0, `react-stately` 3.50.0 |

The audit brief handed to the fleet named `1.5.1 / 1.19.0 / 3.50.0`. That is the
2026-08 pin and it is stale; the tree is right and the brief was wrong
(`components-src/stale-pin-in-audit-brief`). No live document in
`.claude/current/` carries the stale pin — `upstream-sync.md:13` already says S2
1.7.0 / RAC 1.21.0 — so there was nothing to correct in place. The two remaining
mentions are dated history (`#82`'s own note says "then-pinned … verify current
pins first", and `packages/solidaria/CHANGELOG.md`) and were left alone.

## The stages

New tickets, in the order the work must happen:

| stage | tickets | why it is where it is |
| --- | --- | --- |
| S0-a | #587 | the release chain and `release:prepare` are red at their own guard's test file |
| S0-b | #588 | `docs:check` truncates the ladder before parity, axe and freshness ever run |
| S0-c | #589 | CI prints verdicts it does not hold, so every later reading is unsafe |
| S1 | #590 | nothing has a whole-chain green; "nineteen of nineteen" is a stale claim |
| S2-a…f | #591–#596 | the confirmed source defects, cheapest cause first |
| S3 | #597 | the parity ratchet moved past its own receipt |
| S4-a/b | #598, #599 | the publish path's two gates measure the wrong thing |
| S6 | #600 | the public install line names a dist-tag that does not exist |
| — | #601 | the low residues no stage claims, swept once |

## Critical

| finding | severity / verdict | owner | new or existing | action |
| --- | --- | --- | --- | --- |
| `guards-a/eib-test-red` | critical / confirmed | #587 | new | rewrite the three cases against the source-module unit; until then `ci:release-readiness` and `release:prepare` are not passable |

## High

| finding | severity / verdict | owner | new or existing | action |
| --- | --- | --- | --- | --- |
| `ratchets/parity-rebless-outruns-receipt` | high / confirmed | #597 | new | 14 of 30 facts were classified, 16 were not; re-measure or revert the growth |
| `guards-a/nineteen-green-stale` | high / confirmed | #590 | new | re-walk the chain as twenty legs at one sha; retire the nineteen-green claim everywhere it is cited |
| `guards-b/ladder-regressed-to-231` | high / confirmed | #588 | new | regenerate the views as the last edit before the commit; correct the ladder frontier |
| `ci-truth/main-red-head-unpushed` | high / confirmed | #588 | new | close the red, then push; HEAD has never been seen by a workflow |
| `ci-truth/unit-suite-never-runs-on-main` | high / confirmed | #590 | new | give the jsdom suites, the a11y gate and the route/SEO sweeps a leg in an enabled workflow |
| `ci-truth/ladder-table-wrong-earliest-red` | high / confirmed | #588 | new | write step 235 into the ladder table before any further "reached step N" claim |
| `ci-truth/docs-generate-not-reproducible` | high / confirmed | #588 | new | the generator ran before the commit's last ticket edit; make that mechanically impossible |
| `test-integrity/unit-suite-runs-in-no-enabled-ci` | high / confirmed | #590 | new | same leg as above; record the run id on the tickets that cite the tests as proof |
| `test-integrity/main-red-and-release-unsatisfiable` | high / confirmed | #568 | existing | #568 already measures the five workflows; add that two of the three `release.yml` requires are disabled, so the publish cannot pass today |
| `solidaria-src/openlink-setopening` | high / confirmed | #591 | new | pass `false` at `createPress.ts:799`; test that Space on a role-overridden `<a href>` in a collection navigates exactly once |
| `apps-web/twentytwo-dead-routes-still-open` | high / confirmed | #545 | existing | 22 of 174 routes dead in a production build; all 84 `/docs/components/*` pass, so the dead set is elsewhere |
| `public-face/rc-tag-does-not-exist` | high / confirmed | #600 | new | guard the README install line against the registry's real dist-tags |
| `public-face/landing-installs-solid-1` | high / confirmed | #600 | new | same guard covers the landing page's install line |
| `board-truth/546-lens4-unproved` | high / confirmed | #546 | existing | lens 4 was never proved; say so on the ticket rather than carrying it as closed |
| `board-truth/generated-views-stamp-lies` | high / partly | #588 | new | the stamp matches no committed board; `check-docs-current` does guard it and is red, so the gap is ordering, not coverage |

## Medium

| finding | severity / verdict | owner | new or existing | action |
| --- | --- | --- | --- | --- |
| `555-a/overlay-child-scope-unfixed` | medium / partly | #557 | existing | the headline is refuted — the `focusin` effect installs only when `shouldCloseOnBlur` is set, at `createPopover.ts:132`; the residue is that the invented listener exists at all, which is #557 |
| `555-a/openlink-router-bypass` | medium / partly | #592 | new | pre-existing parity gap, not a regression; route the four sites through `useRouter().open` or narrow the changeset text |
| `555-b/no-ci-leg-for-555-tests` | medium / partly | #590 | new | the tests are real and no enabled workflow runs them |
| `555-b/press-style-not-nonced` | medium / confirmed | #594 | new | nonce `createPress`'s injected style from `ownerDocument`; ticket the seven other sites |
| `578-census/585-wrong-upstream-anchor` | medium / confirmed | #585 | existing | **already settled** by `495582e9` — the cause was corrected before the fix, and the prescribed padding was tried and measured wrong |
| `ratchets/gates-never-green` | medium / partly | #588 | new | "never green" is refuted (last success 2026-08-31, `a686e846`); the survivor is that it is blocking-red on `docs:check` at the RC tip |
| `ratchets/layer-boundary-blind-7-days` | medium / partly | #577 | existing | "hand-maintained" is refuted — the guard sha256-walks both trees; the residue is that `viviana-ui` has no ColorSwatchPicker test to diverge |
| `guards-b/553-guards-run-nowhere` | medium / confirmed | #568 | existing | four of the twelve gates #553 closed have a disabled workflow as their only CI caller |
| `ci-truth/cancel-in-progress-erases-the-verdict` | medium / confirmed | #589 | new | either set `cancel-in-progress: false` for main, or name the one sha that must get a complete run |
| `release-path/release-prereq-self-attestation` | medium / partly | #599 | new | the local publish route bypasses the ladder; re-derive each prerequisite instead of storing a sentence |
| `release-path/rc-vs-next-tag-contradiction` | medium / confirmed | #547 | existing | Scope step 5 still says `--tag next`, which the same ticket proves is a hard error; and the `rc`-vs-`next` decision itself is an **owner call**, see below |
| `release-path/dist-tag-next-unreachable` | medium / confirmed | #547 | existing | no code in the repo moves a dist-tag, and OIDC covers publish, not `dist-tag add` |
| `release-path/publish-drift-boundary-false` | medium / confirmed | #598 | new | derive the boundary from the published version, and fail when local is ahead of npm with no pending publish |
| `test-integrity/no-whole-suite-green-at-head` | medium / partly | #590 | new | the one green was at `3f220fb6`, 53 commits back, not 28; do not re-cite 6,698 |
| `test-integrity/entry-import-budget-unit-swapped` | medium / partly | #587 | new | keep one unit; re-derive every ceiling from a measured run and record the command beside the JSON |
| `solidaria-src/createid-hydration-rationale` | medium / confirmed | #596 | new | the unconditional `createUniqueId()` rests on a rationale nobody owns; write the rationale or revert it |
| `solidaria-src/focusscope-shouldrestorefocus` | medium / confirmed | #593 | new | port `shouldRestoreFocus` and gate the body/detached branch on it |
| `components-src/dialog-dangling-labelledby` | medium / partly | #595 | new | the audit cites the wrong commit (`70a8d478`, not `40ac9573`) and its prescribed fix **diverges** from RAC 1.21.0, which sets the attribute unconditionally; the real gap is `Button.tsx:483` assigning `el.id` imperatively |
| `components-src/stale-pin-in-audit-brief` | medium / confirmed | #597 | new | the pin is recorded correctly at the top of this file; no live document needed a change |
| `apps-web/ci-never-rendered-a-web-page` | medium / confirmed | #549 | existing | Site Gate is the only thing that renders a route and it is disabled |
| `apps-web/docs-check-is-the-red-that-truncates` | medium / confirmed | #588 | new | two stale markdown files skip every late gate |
| `public-face/contributing-names-a-disabled-gate` | medium / confirmed | #548 | existing | CONTRIBUTING promises a gate that does not run |
| `public-face/a11y-evidence-overstated` | medium / partly | #548 | existing | "every route" and "a different package" are both wrong — `a11y:contrast` covers ALL_ROUTES and `a11y:smoke` includes the viviana-ui docs; the survivor is that no leg is AA-on-every-route, and target-size is exempted |
| `public-face/sideeffects-false-is-wrong` | medium / confirmed | #548 | existing | the manifest says `["*.css"]` |

## Low

| finding | severity / verdict | owner | new or existing | action |
| --- | --- | --- | --- | --- |
| `555-a/openlink-onclick-reentry` | low / partly | #591 | new | harm refuted — net observable behaviour matches; carry the guard anyway with the `setOpening` fix so the two stay in step |
| `555-a/ssr-suites-unrun` | low / confirmed | #590 | new | the SSR suites that cover the id-ordering hazard were excluded from the run |
| `555-a/dialog-triggerid-dangling` | low / confirmed | #595 | new | same cause as the medium above; one fix closes both |
| `555-b/item3-closed-as-removed-but-kept` | low / confirmed | #557 | existing | the invented listener is still live; #557 is the ticket that removes its reason to exist |
| `555-b/buttongroup-misses-attribute-changes` | low / confirmed | #601 | new | the restored children dependency does not cover a child that changes size in place |
| `555-b/s2-cleanups-guard-counts-files` | low / confirmed | #601 | new | the guard reports 58 files as 58 bodies; there are 81 bodies |
| `578-census/census-585-contradiction` | low / confirmed | #585 | existing | **already settled** by `495582e9`; the ticket now carries one cause, measured |
| `578-census/toast-browser-branch-stub-sync` | low / confirmed | #578 | existing | the stub is synchronous, so the branch is not exercised the way a browser runs it |
| `578-census/attr-namespace-unguarded` | low / confirmed | #578 | existing | two per-component assertions are not a guard; nothing stops `attr:` returning |
| `ratchets/rebless-refusal-gap` | low / confirmed | #577 | existing | a fork born `diverged` still needs no reason |
| `guards-a/layer-boundary-reason-bypass` | low / confirmed | #577 | existing | the rule lives only in `--write-baseline`, the path the harness refuses |
| `guards-a/s2-cleanups-return-only` | low / confirmed | #601 | new | falling off the end of an armed body is invisible |
| `guards-a/eib-after-build` | low / confirmed | #587 | new | the guard needs no build; move the step before it |
| `guards-b/570-behaviour-claim-false` | low / confirmed | #577 | existing | nine paths were re-blessed under a blanket the diff contradicts |
| `guards-b/556-verified-on-correlation` | low / confirmed | #556 | existing | the bisect #556's own scope demanded was never run and the order-dependence is still present |
| `guards-b/postcard-test-tautology` | low / partly | #574 | existing | **already settled** by `13080aa0` — the test now drives a `PostcardGitProbe` through five distinct outcomes and has negative cases; it was never a test that could not fail |
| `guards-b/entry-budget-refrozen-twice` | low / confirmed | #587 | new | same ticket as the unit swap; one re-derivation answers both |
| `guards-b/layer-boundary-vanish-hole` | low / confirmed | #577 | existing | a baselined path that leaves the shared set still vanishes silently |
| `ci-truth/certified-shards-render-green-while-failing` | low / partly | #589 | new | it does block, through the report job; the hazard is that eight jobs read as passes over an 88-failure suite |
| `ci-truth/contrast-receipt-leg-mislabel` | low / not challenged | #589 | new | fix the leg label and carry the 170/174 caveat into every summary that cites the tally |
| `release-path/peers-wildcard-called-ratchet` | low / partly | #601 | new | the doc's wording is corrected in the release-path correction block; narrowing the two wildcards is the work |
| `release-path/changeset-count-stale` | low / confirmed | #547 | existing | corrected to 56 in the release-path correction block |
| `release-path/publish-drift-comment-false` | low / not challenged | #598 | new | rewrite the comment to state what the guard does — a git-only diff |
| `test-integrity/parity-baseline-re-blessed-against-own-finding` | low / partly | #597 | new | not buried — the `growthLog` records all 30 verbatim and #579 files the mis-pairing; the survivor is that the oracle was widened instead of fixed |
| `solidaria-src/linkclicked-dedup` | low / confirmed | #591 | new | key the de-duplication on the event, not the element plus a timeout |
| `solidaria-src/focusin-target-retargeting` | low / confirmed | #593 | new | use `getEventTarget`, and do not skip an empty scope |
| `solidaria-src/dom-focus-import-cycle` | low / confirmed | #601 | new | `dom.ts` ↔ `focus.ts` cycle introduced by the `openLink` rewrite |
| `solidaria-src/upstream-pin-baseline` | low / confirmed | #597 | new | the range **was** checked against 3.52.0 / 1.21.0 / 1.7.0, so no verdict in the results file is invalid; only the brief was wrong |
| `components-src/popover-stale-comment` | low / confirmed | #601 | new | the comment describes a `display:contents` group the same commit deleted |
| `apps-web/icon-page-claims-every-prop` | low / confirmed | #549 | existing | the page asserts completeness while documenting 3 props |
| `apps-web/head-has-no-ci-at-all` | low / confirmed | #588 | new | closing the red and pushing is what fixes this |
| `public-face/each-package-two-builds` | low / confirmed | #548 | existing | false for `solid-stately` |
| `board-truth/581-merged-below-its-bar` | low / confirmed | #578 | existing | four rows remain against a zero-failure Done-when; two of the four are #584's |
| `board-truth/chain-20-never-walked` | low / partly | #590 | new | CI does prove leg 20 green at `96376e9a`; the chain has still never run whole |
| `board-truth/layer-boundary-nine-left-the-ratchet` | low / confirmed | #577 | existing | a `diverged` path's drift is never re-checked |
| `board-truth/release-path-changeset-count` | low / confirmed | #547 | existing | corrected to 56 in the release-path correction block |

## One owner call this receipt will not make

**Which dist-tag the RC lands on.** Two records disagree and neither is this
seat's to overrule:

- `.agents/CONDUCTOR-PENDING-2026-09-20b.md:17` — owner, 2026-09-20 12:45:
  `-rc.N` on the **`rc`** dist-tag, install line `npm i <pkg>@rc`, `latest`
  stays the Solid 1 line. "The #548 drafts change every `@next` to `@rc`."
- `1042f0fe` and #547's decision section — conductor, 2026-09-20 22:58:
  `pre enter rc`, then `npm dist-tag add <pkg>@<version> next` per package, so
  the install line stays `@next`.

Initiative #544's own decision line says `next`. #600 cannot be written until
one of the two is retired, because the guard it asks for compares the README's
install tag against the registry, and the two readings want different tags in
the README. The conductor's default, absent a word: **`rc` alone**, the simpler
of the two, with the install line `@rc` — it needs no step outside Changesets
and so creates no dist-tag that silently stops tracking. Owner decides.

## Deviations from the brief this receipt was written against

1. **The earliest red is step 235, not 231.** 231 was correct at `96376e9a`;
   `7ec2a732` (#194) and `13080aa0` (#574) are the only two post-audit commits
   that touch the workflow and they shifted it. Verified by reading the file at
   both shas.
2. **56 changesets pending, not 51.** Counted on disk and in the index at HEAD.
3. **Three findings are already settled by commits that landed after the audit
   range closed** — `578-census/585-wrong-upstream-anchor` and
   `578-census/census-585-contradiction` by `495582e9`,
   `guards-b/postcard-test-tautology` by `13080aa0`. They keep their rows and
   their owners; the action column says so rather than re-opening them.
4. **#601 exists and the brief did not ask for it.** Eleven low findings belong
   to no stage. Filing eleven tickets would bury the board; leaving them
   unowned would break the rule this file exists to keep. One sweep ticket is
   the smallest thing that satisfies both.
5. **No status moved.** The scheme's lifecycle runs forward only, with `parked`
   and `dropped` as its side exits, so a `merged` or `verified` ticket whose
   Done-when the audit shows unmet — #546, #555, #556, #581 — cannot be walked
   back. Each carries a dated note saying plainly what is unmet and which
   ticket owns the residue. That is a gap in the scheme, not in the board, and
   it is worth one hub-level question later.

# Round-2 audit, 2026-09-21 — every finding and who owns it

Source: [`round-2-results.md`](./round-2-results.md), transcribed from the
fleet's artifact with two factual corrections named at the top of it. 15
findings survived the skeptics over the range `4acbc9e4..65254a8c` (16
commits) — the work written after round 1's range closed. 0 critical, 3 high,
4 medium, 8 low. Same rule as above: every finding has a row, every row names a
ticket, and where a skeptic narrowed a finding the row carries the **narrowed**
claim.

## What was true when this block was written

Every number below comes from a command run while writing it, on 2026-09-21.

| fact | value |
| --- | --- |
| HEAD | `fa0686da` |
| `origin/main` | `96376e9a`, 18 commits behind HEAD |
| commits in the round-2 range on `origin/main` | **0 of 16** — `git merge-base --is-ancestor` false for each |
| newest Certification Gates run on `main` | 35560076342 at `96376e9a`, **failure**, 2026-09-21T04:11:59Z |
| the run the `65254a8c` census reports | 35558449632 at `eb75ee0e`, created 03:42:53Z, finished 04:06:14Z, **failure** |
| commits between that run's head and the census | **18** (`git rev-list --count eb75ee0e..65254a8c`) |
| census commit time, true UTC | 2026-09-21T13:46:11Z (`TZ=UTC git log --date=format-local`) |
| Release Readiness / Site Gate | both still `disabled_manually` |
| highest ticket number before this block | 601 |

## The new stages

| stage | ticket | why it is where it is |
| --- | --- | --- |
| S2-g | #602 | a published button ignores `<Form isDisabled>`; one line, one test case, no dependency on any other stage |
| S2-h | #603 | #582's fix is indistinguishable from the code it reverses, and the enter seam it touches is still not RAC's |

Both sit inside S2, the confirmed source defects, because both are behaviour in
published packages and land before anything is published. Neither blocks the
other, and neither blocks S0 or S1.

## High

| finding | severity / verdict | owner | new or existing | action |
| --- | --- | --- | --- | --- |
| `r2-certified-a/r2a-1` | high / confirmed | #602 | new | end ActionButton's `isDisabled` on the `useFormProps` proxy and add the `<Form isDisabled>` case the commit's `it.each` never had |
| `r2-guards/r2-guards-1` | high / partly | #574 | existing | the covered-path set omits the runner, the merger, the waiver logic and the pinned oracle; latent, not live, because the postcard is already 2577 paths stale — widen or invert before the next pin |
| `r2-guards/r2-guards-3` | high / confirmed | #578 | existing | the census is stale on arrival by 18 commits; re-head it as a snapshot of run 35558449632 at `eb75ee0e` and move #583 out of "cheap" into owner-blocked |

## Medium

| finding | severity / verdict | owner | new or existing | action |
| --- | --- | --- | --- | --- |
| `r2-certified-a/r2a-5` | medium / confirmed | #584 | existing | the trigger emits no `data-pressed` where RAC's carries it while the popover is open — the other direction of the same defect, inside this ticket's Done-when |
| `r2-certified-b/F1` | medium / partly | #588 | existing | the "gate lies" framing is refuted (merged means landed; the owner disabled the workflows); the survivor is that none of the sixteen has been seen by CI |
| `r2-certified-b/F2` | medium / partly | #603 | new | #582 is merged, so the residue moves: a test that fails on `6ad3d12d^`, and the record of why the 2026-09-02 certification was wrong |
| `r2-guards/r2-guards-2` | medium / partly | #574 | existing | coverage gap, not fake proof — write the uncovered-but-decisive case first, watch it fail, then widen |

## Low

| finding | severity / verdict | owner | new or existing | action |
| --- | --- | --- | --- | --- |
| `r2-certified-a/r2a-4` | low / partly | #584 | existing | remove the invented `data-*` at `createSelect`, not only at the component; the shipped value is `"true"`, not `""`, and #254 already gates the trigger's `data-open` |
| `r2-certified-a/r2a-6` | low / not challenged | #601 | existing | item 8 — an exported oracle policy constant nothing imports; the real filter is the journey allowlist |
| `r2-certified-b/F3` | low / partly | #603 | new | "as upstream" is half true; gate entering on a resolved placement, or name the deviation instead of claiming parity |
| `r2-certified-b/F4` | low / partly | #576 | existing | merged with its Done-when's DOM evidence never recorded; paste the step-1 output or say the candidate rests on the mutation |
| `r2-certified-b/F6` | low / not challenged | #586 | existing | the dark hero gradient is a visual edit axe cannot measure; the new `ErrorFallback` `h2` is the one hardcoded colour in the file it touched |
| `r2-guards/r2-guards-4` | low / partly | #194 | existing | "only shrinks" is a fixed ceiling — record a per-section count so deleting an entry lowers it; the finding's JSON path is wrong, it is under `scripts/` |
| `r2-guards/r2-guards-5` | low / partly | #601 | existing | item 9, residue of merged #139 — containment is anchored on a `tmpdir()` read from the same environment as the override; constrain the victim, not only the location |
| `r2-guards/r2-guards-6` | low / not challenged | #601 | existing | item 10, residue of merged #139 — a fresh `mkdtemp` stage per run with no cleanup, one copy of seven packed packages each time |

## Deviations from the brief this block was written against

1. **No status moved, again.** Two merged tickets have a Done-when the audit
   shows unmet — #576 (no DOM print) and #582 (no discriminating test). The
   scheme runs forward only, so each carries a dated note saying what is unmet,
   and #582's live residue is #603. Same gap as round 1's deviation 5, and the
   second instance of it in one day, which strengthens the hub-level question.
2. **Two findings were corrected while transcribing**, not carried verbatim:
   `r2-guards-4` cites a JSON path that does not exist, and `r2-guards-3` mixes
   local and UTC times in a finding whose whole point is a time gap. Both
   corrections are at the top of the results file with the command that
   establishes them. Round 1's file was copied byte for byte; this one was not,
   and says so.
3. **Three lows went to #601 rather than to new tickets**, for the reason round
   1 gave: one sweep row beats three board rows. That makes #601 ten items, and
   its title loses its count so the next sweep needs no rename.
4. **`r2-guards-1` is filed as latent.** It is a high by mechanism — the gate's
   own runner can change without invalidating the postcard — but no postcard is
   currently pinned and the certified shards rerun on every push, so it is owed
   before the next pin, not before #574 closes. The row says so rather than
   promoting it to a stage.
5. **No finding in this round was executed.** The fleet ran no build and no
   test, so every `needs-run` is still owed and every pass count in the sixteen
   commits' messages remains unverified. The results file's "Not covered"
   section names the commands.
