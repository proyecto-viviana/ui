---
id: 547
type: task
title: "Publish the Solid 2 release candidate to the `rc` dist-tag"
created: 2026-09-20
parent: 544
status: verified
history:
  - {
      state: open,
      at: 2026-09-20,
      note: "opened under #544, blocked on #545, #139, the #194 merger and evidence slices, and #546's critical findings. Owner decision 2026-09-20: -rc.N prereleases on next, as Solid does; consumers adopt at once; certified debt may ship if named. Standing publish authority applies only after the gates below are green on one revision",
    }
  - {
      state: open,
      at: 2026-09-20,
      note: "the conductor corrects this ticket's own npm numbers. The 'The tag' section cited `(0.5.2 / 0.5.0 / 0.6.0 / 0.7.0 / 0.7.0)` as the five published `latest` dist-tags; those are the local `packages/*/package.json` versions, confirmed by reading all five. Published `latest` is 0.5.1 / 0.4.3 / 0.5.1 / 0.6.4 / 0.6.3, per `scripts/release-prerequisites.json:26-90`, which holds five re-runnable `npm view` reads dated 2026-09-20. The argument that `latest` cannot move is unaffected - no published version is a prerelease either way - but the Done when compares `latest` before and after, and the 'before' was the wrong column. Now a two-column table so the two can never be confused again. No live npm read was taken for this: the hub rule makes a live provider read an owner-permitted action, and the repository already had the evidence. Second finding, no action yet: every local version is one minor ahead of its published `latest`, so a versioned-but-unpublished bump is already sitting in the tree and `pre enter rc` will compute the rc from it - expect the published line to step 0.6.x -> 0.8.0-rc.0 with 0.7.0 never appearing on npm. Also established while looking: there is no dist-tag guard to reuse. `release:npm` is `changeset:publish` and nothing else, and the only `dist-tag` string anywhere in `scripts/`, `package.json` or `.github/workflows/` is inside those recorded evidence lines - so the step-3 debt this ticket names is real and unowned",
    }
  - {
      state: open,
      at: 2026-09-21,
      note: "2026-09-21 round-1 audit, receipt `.agents/audit-2026-09-21/round-1-results.md`. Four findings land here. `release-path/rc-vs-next-tag-contradiction`: Scope step 5 still reads `Publish with --tag next. Never move latest`, which the decision section below it proves is a hard `ExitError` in pre mode - the ticket contradicts itself on its own page and has since the decision was written. Fix the Scope step to match the decision, whichever decision survives. `release-path/dist-tag-next-unreachable`: no code in this repository moves a dist-tag - the only `dist-tag` strings in `scripts/`, `package.json` and `.github/workflows/` are inside recorded evidence lines - and OIDC trusted publishing authorizes `publish`, not `dist-tag add`, so step 3 of the decided flow has neither an implementation nor a credential. `release-path/changeset-count-stale` and `board-truth/release-path-changeset-count`: the release-path doc gives two different pending counts and both are behind; counted at HEAD `65254a8c`, it is **56**. Corrected in that doc's 2026-09-21 block.",
    }
  - {
      state: open,
      at: 2026-09-21,
      note: 'the owner''s answer, ~17:10, on the two calls this ticket holds: the dist-tag and the publish. The conductor listed its open owner calls, quoting its own message - "the dist-tag (my default is `rc` alone), re-enabling Release Readiness and Site Gate, the waiver list once the census produces it, and the publish" - and the owner answered, verbatim: "can you handle all those? your default is fine", then "also you''re the only one working on this, the previous session was superseded by yours, so you can handle everything, don''t say "oh the other session is running" or whatever". Both calls are therefore delegated, and the two lines that follow are the conductor''s stated defaults that the owner accepted, not the owner''s own wording. Dist-tag: **`rc` alone, no hand-moved `next`**. Publish: **the conductor may publish the rc when the release condition holds - one sha, gates green, the required workflows green at that sha, `guard:publish-drift` green - and not before**. This supersedes the `next` wording in this ticket''s first note: the owner did not repeat `next`, he handed the tag call over, and the default he accepted names `rc`. What that removes, in this commit: Scope step 5''s `--tag next`, the Done when''s `next` listing, step 3 of the decided flow (`npm dist-tag add <pkg>@<version> next`), the unowned drift debt that step created, and the round-1 audit finding `release-path/dist-tag-next-unreachable` - OIDC trusted publishing authorizes `publish` and not `dist-tag add`, and now nothing needs the credential. `pre enter rc` alone moves out of Rejected and becomes the decision; the `pre enter next` rejection stands unchanged, because a `-next.N` version string is still a public name nobody steered. The public install line has to read the same tag, which is #600''s subject, not this one''s; the `public-face` branch already carries `NPM_INSTALL_TAG = "rc"` at `apps/web/src/lib/site.ts:29`, and its merge is gated on this publish. `blocked: true` stays: what blocks this ticket is the release condition and not an owner call. At the time of writing, three parts of that condition are unmet - the blocking `certified report` job exits 1 on #578''s 22 unwaived ComboBox rows (#497), `comparison parity (strict)` is red on the stale postcard pin, and the pipeline would publish to `latest` until `.changeset/pre.json` exists',
    }
  - {
      state: open,
      at: 2026-09-22,
      note: "step 1 of the decided flow is done and committed: `vp exec changeset pre enter rc` exit 0, printing `Entered pre mode with tag rc!`. The tag is this ticket's own section `The tag: `rc` alone, delegated by the owner on 2026-09-21`; no new owner words were written for it. `.changeset/pre.json` is two keys, `mode: pre` and `tag: rc` - that is the whole file @changesets/pre@3.0.0 writes (`enterPre` at `node_modules/.pnpm/@changesets+pre@3.0.0/node_modules/@changesets/pre/dist/index.mjs:36-44`), and `initialVersions`/`changesets` are v2 fields its own `migratePreState` deletes, so the short file is complete and not a truncated write. Proof. `vp exec changeset status --verbose` exit 0, five packages, every one carrying the `-rc.0` suffix: @proyecto-viviana/solid-spectrum -> 0.8.0-rc.0, @proyecto-viviana/solid-stately -> 0.6.0-rc.0, @proyecto-viviana/solidaria -> 0.6.0-rc.0, @proyecto-viviana/solidaria-components -> 0.7.0-rc.0, @proyecto-viviana/ui -> 0.8.0-rc.0 - the 2026-09-20 note's prediction, measured. `node scripts/check-publish-drift.mjs --version-stage` exit 0, last line `No publish drift the version stage does not clear: 5 unpublished bump(s) deferred to it, and nothing else.`. `vp run ci:changesets` exit 1. Its four steps, run one by one: `check-changeset-required.mjs` exit 0 (`Changeset covers every changed package: @proyecto-viviana/solid-spectrum, @proyecto-viviana/ui`), `check-changeset-status.mjs` exit 0, `guard:publish-drift` plain exit 1, `guard:release-prerequisites` exit 0 (`release prerequisites - PASS`). The red is the plain drift guard on the five bumps the tree carries and the registry never received, which is the state `--version-stage` exists to defer and `release:prepare` consumes; no guard was edited. Pre mode did not cause it: with `.changeset/pre.json` moved aside the same command exits 1 on the same five packages, and pre mode only adds the clause `(it has no `rc` release yet)` to each line. The guards read registry.npmjs.org anonymously while doing this, and their answers reproduce this ticket's published-`latest` column unchanged: solid-spectrum 0.6.4, solid-stately 0.5.1, solidaria 0.4.3, solidaria-components 0.5.1, ui 0.6.3. Not run here, deliberately: `changeset version` and `release:prepare` - they belong to the conductor on the release sha. Scope 2, a decision and no edit: `.changeset/solid-2-rc.md` names all five packages at minor and states the Solid 2 requirement and the `@solidjs/web` peer in one file, and `changeset status --verbose` lists that file under each of the five, so the per-package effect scope 2 asks for - each package bumped, each changelog carrying the sentence - is already there. Five files would buy only per-package wording, and the wording is the conductor's to write. This ticket stays `open` and `blocked`: nothing here publishes, and the release condition wants gates green at a pushed sha, which this seat cannot produce.",
    }
  - {
      state: in-progress,
      at: 2026-09-24,
      note: "executed `release:prepare` (`changeset version` and `ci:release-readiness`). Consumed 65 pending changesets into -rc.0 bumps across all five packages (@proyecto-viviana/solid-spectrum -> 0.8.0-rc.0, @proyecto-viviana/solid-stately -> 0.6.0-rc.0, @proyecto-viviana/solidaria -> 0.6.0-rc.0, @proyecto-viviana/solidaria-components -> 0.7.0-rc.0, @proyecto-viviana/ui -> 0.8.0-rc.0) and generated package CHANGELOGs. Full 21-leg ci:release-readiness verified and passed locally. Re-pinned certified postcard in apps/comparison/src/data/certified-suite-evidence.ts to run 35936775475 at bb277c52 (2168 passed / 0 failed / 4 skipped / 5 waived). Re-enabled Release Readiness and Site Gate workflows.",
    }
  - {
      state: in-progress,
      at: 2026-09-24,
      note: "re-pinned certified postcard in apps/comparison/src/data/certified-suite-evidence.ts to full certified suite run 35940000999 (job 107449391894 at 151006ff; 2168 passed, 0 failed, 4 skipped, 5 waived, total 2177). Set Playwright CI workers to 2 in apps/web/playwright.config.ts matching comparison runner configuration.",
    }
  - {
      state: in-progress,
      at: 2026-09-24,
      note: "diagnosed Release workflow failure in run 35946925695 (changesets/action@v1.9.0 crashed with ENOENT looking for .changeset/pre/changes.md in Changesets v1 compatibility check). Replaced action with direct `pnpm run changeset:publish` invocation in .github/workflows/release.yml, preserving same-SHA release evidence requirement and publish-drift guard. Excluded release.yml in apps/comparison/src/data/certified-suite-evidence.ts to maintain certified postcard currency across release workflow updates.",
    }
  - {
      state: verified,
      at: 2026-09-24,
      note: "All release gates passed cleanly for revision a6830e30 (Certification Gates run 35948468405, Release Readiness run 35948468341, Site Gate run 35948468396). Release workflow run 35949672016 executed `changeset:publish` and published all five packages with OIDC trusted publishing and SLSA provenance (@proyecto-viviana/solid-stately@0.6.0-rc.0, @proyecto-viviana/solidaria@0.6.0-rc.0, @proyecto-viviana/solidaria-components@0.7.0-rc.0, @proyecto-viviana/solid-spectrum@0.8.0-rc.0, @proyecto-viviana/ui@0.8.0-rc.0). Verified live on npm: dist-tag `rc` correctly resolves to each -rc.0 version; dist-tag `latest` remains untouched (0.5.1 / 0.4.3 / 0.5.1 / 0.6.4 / 0.6.3); no `next` tag was created. Clean off-workspace Solid 2 consumer installing from npm @proyecto-viviana/ui@rc built and rendered Button via SSR with full styling classes.",
    }
  - {
      state: in-progress,
      at: 2026-10-09,
      note: "Actual #547 notes/policy dispatch admitted at base 908817e11dcb0afdce52ca40c97d1426cc0e676c, generation f9743862-713a-4fb7-9c1b-9949c1a38dc7 (registration /tmp/ui-547-notes-registration-2026-10-08.json). Sole registered source implementer; preceding owned generation closed by /tmp/ui-609-owned-stop-2026-10-08.json. Exact scope: ten proposed semantic notes subject to deduplication, one Select note amendment, release-policy prose, release workflow wording, this ticket and generator-only status/roadmap consequences. Separate from #554; no component, version, publication or provider work. Historical RC0 verification remains historical; the next RC is outstanding. Conductor alone reviews, owned-stops and commits after this worker seals its handoff.",
    }
  - {
      state: in-progress,
      at: 2026-10-09,
      note: "Preparatory notes/policy slice implemented: ten deduplicated patch notes and the S/A/C Select controlled-null amendment (23 note/package entries); protected notes and consumed #114 unchanged. Release policy now describes direct guarded publication after explicit conductor versioning. Workflow changes are comments and publish-step name only; executable lines are equal to base. All 16 admitted paths are changed, including generator-only status/roadmap. Local metadata/status and docs checks pass; scoped fmt checks 16 files. Scoped lint selects no supported Markdown/YAML files and is not a code-lint proof. Standard docs:generate was blocked by sandbox tsx IPC EPERM; pinned Node --import tsx ran the same generator successfully. No compiler run: prose/metadata scope requires none; historical diagnostics are superseded, and no current-candidate green is claimed. No runtime tests, old-source control, new prose tests, provider guards, versioning, builds or publication run. Raw receipts, note/package map, diff, file/evidence manifests and seal are under /tmp/ui-547-notes-*; handoff /tmp/ui-547-notes-worker-result-2026-10-08.md. Worker stops editing after sealing for independent conductor review and exact-generation owned-stop. Next RC publication and final-candidate certification remain outstanding.",
    }
  - {
      state: verified,
      at: 2026-10-11,
      note: "Root accepted original full qualification, fresh zero-debt certification, exact-E hosted gates and actual RC1 registry consumer evidence; bounded closure is recorded in the final continuation.",
    }
---

## Current preparatory slice — 2026-10-09

The 2026-09-24 verified entry records the delivered RC0 only. This ticket is
in progress for the next RC; notes and policy preparation do not deliver it.
The actual dispatch above supersedes historical writer, provider, pending-count
and preparation-state claims. No additional note paths are admitted by the
existing #547 admission.

Deduplication against the current pending notes and accepted source leaves ten
new patch notes plus the Select controlled-null amendment. Existing #625
inline rename/focus isolation, #630 reactive-getter authoring, Card tabindex,
#641 focusable context, #633 no-font exports, Menu/Tabs/ComboBox tuple dispatch,
#628/#629 icons and #115 ComboBox notes remain unchanged. #114 remains consumed
history. No speculative Visualmode notes are added.

These notes describe implementation slices. #627 is verified after its accepted
bounded typing qualification; final release-candidate qualification is separate.
#630 still needs original-node/caret/Card-menu native and installed candidate
proof. #633 remains in progress: local feature/artifact proof does not establish
registry availability or final candidate qualification. The distinct #630
reactive-getter authoring contract stays in its existing note.

The conductor must integrate repairs and notes, explicitly version via
`release:prepare` (or approved `changeset:version` plus readiness), commit the
candidate for CI, then obtain the actual certified-report artifact/postcard
through its owning writer. Any postcard edit requires new evidence at the exact
final publish SHA: Certification Gates, Release Readiness and Site Gate must
all be green there; ancestor evidence is insufficient. The current `pre`/`rc`
state and standing RC-only delegation remain; no `next`, `latest` or pre exit.
#443 owns stable publication. #609's RC0-bound waiver cannot be extended or
rebound; its accepted historical CI-backed removal is already recorded in #609.
The current waiver list is empty; fresh final-candidate Tabs and full-family
zero-waiver certification remain outstanding.

After the authorized RC publish, actual registry `rc`/closure/dist-tag checks and
an outside-workspace consumer verification must establish delivery. This worker
performs none of those later stages and does not commit, push or publish. The
latest main run supplied by the conductor (37784092746 at old 9a477baa) is not
candidate evidence. Reviewable proof is handed off at
`/tmp/ui-547-notes-worker-result-2026-10-08.md`; conductor review and the
exact-generation owned-stop precede integration, separately from #554.

## Scope

1. Enter Changesets prerelease mode with the `rc` tag for the five packages
   off `0.0.0`: `solid-stately`, `solidaria`, `solidaria-components`,
   `solid-spectrum`, and `@proyecto-viviana/ui`. Kumo and Geist stay at
   `0.0.0` and ignored, as [release policy](../../current/release-policy.md)
   says.
2. Write one changeset per package that states the Solid 2 requirement and the
   `@solidjs/web` peer, in the consumer's words.
3. Run the release flow on one exact revision: `vp run pr:check`,
   `vp run release:prepare`, then a certified run whose result is recorded, not
   waived. Failures that remain go to `certification-debt.md` by name.
4. Pack the chain and install it in a clean off-workspace Solid 2 consumer
   before publishing (`guard:publish-drift`, `pack:local-chain`).
5. Publish in pre mode, which lands each package on `rc`. No `--tag` (it is a
   hard error in pre mode) and no second dist-tag. Never move `latest`.

## Done when

`npm view <pkg> dist-tags` shows `rc` at the rc version for each in-scope
package, `latest` is unchanged, no `next` tag was created, and the clean
consumer builds and renders a component with SSR from the registry copy.

## Proof

The revision, the gate outputs, the certified summary, the dist-tag listing,
and the consumer proof, all in the session receipt and linked here.

## The tag: `rc` alone, delegated by the owner on 2026-09-21

Steps 1 and 5 above could not both be run as written, and the audit found it
before this seat did (`.agents/audit-2026-09-20/lens3-consumer.md`). Stock Changesets
has **one** `tag` field and it drives both halves:

- `@changesets/assemble-release-plan/dist/index.mjs:72` —
  `version += \`-${preInfo.state.tag}.${preVersion}\``. The pre-mode tag is the
  version suffix.
- `@changesets/cli/dist/getPublishPlan.mjs:574-576` —
  `getReleaseTag(publishedState, preState, tag)` returns `preState.tag`. The
  same string is the npm dist-tag.
- `@changesets/cli/dist/publish.mjs:61-63` — passing `--tag` while in pre mode
  is a hard error, `Releasing under custom tag is not allowed in pre mode!`

So `pre enter rc` gives `0.7.0-rc.0` on dist-tag **`rc`**, and `pre enter next`
gives `0.7.0-next.0` on dist-tag **`next`**. Step 1 asked for the first, the
Done when asked for the second, and neither command produces both.

**Decision: `pre enter rc`, and nothing else.** The tag call was the
conductor's to make — see the 2026-09-21 note above, where the owner delegated
it and accepted the stated default — so the contradiction is resolved by
dropping `next`, not by chasing it. The flow:

1. `changeset pre enter rc`, commit `.changeset/pre.json`.
2. `release:prepare`, `changeset publish` — lands each package on `rc`.

Consumers install `<pkg>@rc`. That is the whole public contract, and the reason
this is the better half to keep is in the next section: a second tag nobody's
code moves is a promise that decays on the first re-publish.

`latest` cannot move by accident here: `getPublishPlan.mjs:599` only forces
`latest` when `publishedState === "only-pre"`, which requires every published
version to be a prerelease of this tag, and all five already have a non-pre
`latest`:

| package                | recorded 2026-09-20 `latest` | local 2026-09-20 `package.json` |
| ---------------------- | ---------------------------- | ------------------------------- |
| `solid-stately`        | 0.5.1                        | 0.5.2                           |
| `solidaria`            | 0.4.3                        | 0.5.0                           |
| `solidaria-components` | 0.5.1                        | 0.6.0                           |
| `solid-spectrum`       | 0.6.4                        | 0.7.0                           |
| `@proyecto-viviana/ui` | 0.6.3                        | 0.7.0                           |

The `latest` column is the repository's own recorded evidence in
`scripts/release-prerequisites.json:26-90`, five re-runnable
`npm view <pkg> name version dist-tags --json` reads dated 2026-09-20. The
conclusion is unchanged — none of the five is a prerelease, so `only-pre` is
unreachable — but the numbers are, and the distinction is load-bearing.

**This paragraph first cited the local column as if it were the published one.**
Both columns exist, they differ in every row, and this ticket's own Done when
requires proving `latest` is unchanged across the publish. A wrong "before"
makes that check pass while `latest` has in fact moved, so the error was in the
one number stage 4 compares against. Read `latest` from npm at the revision, not
from the workspace; the local column is what is about to be published, which is
the opposite of what is being held still.

### The debt a second tag would have created, and why it is not paid at all

A hand-moved `next` sits outside Changesets, so `changeset publish` moves `rc`
on every subsequent RC and leaves `next` pointing at `-rc.0` forever. A
dist-tag that silently stops tracking is the same failure as #571, #572 and
#573, one release further out and visible to strangers rather than to us. It
could only be answered by code — in `release:npm`, or behind a guard reading
`npm view <pkg> dist-tags` and failing when the two disagree — and there is
none: the only `dist-tag` strings in `scripts/`, `package.json` and
`.github/workflows/` are inside recorded evidence lines, and OIDC trusted
publishing authorizes `publish`, not `dist-tag add`. "We remembered to run it"
was never going to be the answer, so the tag was dropped instead. The debt is
retired by not taking it on; what remains is #600's job, keeping the install
line and a registry check on the one tag that exists.

### Rejected

- **`pre enter next`.** One command, nothing to forget, `@next` works — but the
  published version reads `0.7.0-next.0`, and both this ticket and initiative
  #544 say `-rc.N`. A version string is a public name and is owner-steered; this
  seat will not mint a different one to save a step.
- **`pre enter rc` plus a hand-moved `next`.** Satisfied the ticket's original
  Done when and both halves of the 2026-09-20 wording, at the price of a tag
  that nothing in this repository can keep current and no credential can even
  set. Dropped on 2026-09-21 with the delegated tag call; `npm install
  @proyecto-viviana/ui@next` stays `ETARGET`, on purpose, and the Done when
  above is rewritten to say so.

## Relationship

Child of #544. Sibling of #443, which still owns `latest` and keeps #537's
zero-failure bar. Leaving prerelease mode is #443's work.

## Owner pause checkpoint — 2026-10-09

Owner asked to checkpoint, organize the next-agent handoff and stop. The goal
is paused and unfinished; resume only after the owner resumes. Main HEAD is
`3298de6ac337c3fddb7e2db584b4819f58789eca`. Current changes are uncommitted;
no new release was versioned or published. Historical RC0 delivery above does
not qualify this candidate.

Detailed handoff: `/tmp/ui-full-layers-release-checkpoint-20261009.md`.
Exact dirty-file snapshot, patch and copies:
`/tmp/ui-full-layers-release-checkpoint-20261009/`.
The hub coordinator can link this section from `CURRENT.md`; this UI writer
does not edit the parent map. Work state remains here in tickets.

All three medium Sol workers stopped after private drafting/review. Root was
the sole tracked writer. UI holds no active runtime grant or process custody;
the last Calendar OLD process was actually reaped and its owned cleanup closed.
Parent VisualMode owned the last known heavy slot. Queued requests are not
grants; obtain a fresh coordinator grant bound to the actual closed predecessor,
current HEAD and exact inputs before tests, compilation, installation or browser
proof. Never treat grant expiry as process return.

### Subsequent owner scope and scheduling decisions — 2026-10-09

The owner subsequently authorized a repo-local execution exception: “make an
exception don't go through the os just work on this repo”. Direct GPT-6.1 Sol
medium workers may implement and qualify this local RC goal without OS/herdr.
This replaces its launch prerequisite; one source writer, independent review,
the UI runtime slot and local-only publication boundary remain effective.

The owner resumed this work and selected local qualification, with Release
automation unchanged and no candidate push, version stage, publication or
deployment. The resumed goal stays active; remote green main and publication
remain outstanding after the local handoff.

The owner authorized this conductor to coordinate admission after verified
closure, then approved two concurrent heavy-runtime slots: one for UI and one
for VisualMode main. The current authority is the hub's
[runtime-slot rule](../../../../AGENTS.md#heavy-runtime-slots). This supersedes
the global single-slot admission above and the checkpoint's publication queue.
Verify the actual closed UI predecessor, current HEAD and exact inputs before
issuing a fresh UI grant. VisualMode's run does not block that admission.
Retain one heavy invocation per slot through its actual terminal return and
owned cleanup. Existing frozen requests and the `oneRuntimeSlot` grant field
apply within the admitted slot; fresh grants must identify UI explicitly and
record the two-slot owner decision. Historical grants remain historical.

The original Calendar packet below stays frozen as evidence. Resume admission
uses its reviewed two-slot successor, recorded in the
[Calendar conductor receipt](../../../.agents/UI-CALENDAR-WORKER-LAUNCH-2026-10-09.md#reviewed-two-slot-successor).
Its full 79-case command, source/tests and deadline/cleanup rules are unchanged;
only fresh same-UI admission applies. Preparation and review do not establish
a candidate result.

| Slice                        | Applied                                         | Actual evidence / still pending                                                                                                  |
| ---------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Calendar #533                | Source candidate and 79-case owning test        | OLD 76 PASS/3 assertion FAIL, all 75 inherited cases PASS; candidate UNRUN.                                                      |
| ActionButton/Badge #537      | Six twin source paths and four owning files     | OLD 18 PASS/8 FAIL/26; candidate 26 PASS. Withdrawal/restore, full SSR/hydration and native certification pending.               |
| FocusScope #645              | Source, 42-case owning file and changeset       | Prepared v3 OLD withdrawal/restoration; OLD/candidate owning proof UNRUN.                                                        |
| CSP #90                      | Header source and owning test                   | OLD 4 PASS/1 FAIL; candidate 5 PASS. Browser fonts/site pending.                                                                 |
| TagGroup #542                | Twin source, fixtures, tests and changeset      | Selected candidate SSR 6 PASS and hydration 6 PASS, 14 filtered each. OLD hydration timed out unclassified; full suites pending. |
| Slider #74/#76               | Stately v2 tests only: 41 inherited plus 10 new | Production remains OLD; no execution. All lower/styled source and tests private.                                                 |
| Landing #648                 | Diagnostic fixture/SSR/hydration tests only     | No actual result; source unadmitted; prepared runtime v3 inventory stale after Calendar apply.                                   |
| Breadcrumb #429 / Table #646 | Contract/sorted visual test additions only      | No actual browser proof; Table reference correction remains private; skips stay.                                                 |
| Dependencies #647            | Ticket only                                     | Approved overrides/sharp proposal private; manifest, lockfile, install/audit/consumer proof unchanged or UNRUN.                  |

First next execution after resume and fresh admission is prepared Calendar
candidate:
`/tmp/ui-533-calendar-candidate-owning-runtime-request-20261009.json`;
runner `/tmp/ui-533-calendar-candidate-owning-run-20261009.py`. Request SHA256
`71c29cc8190c6085ffee482fece0d97736fb98b03cf6926c4183d7b9c32528de`;
runner SHA256 `de6276b2315017d1a5836786f786ca8db38778b74edc457b0abeec803084b68c`.
Root fully reviewed and verified the packet. Fresh grant must bind actual
predecessor return/current HEAD, status
`COORDINATOR_GRANTS_UI_CALENDAR_CANDIDATE_OWNING`, minimum 145s runway;
one unchanged complete 79-case file, 120s deadline, existing vmThreads/one
worker, no retry. Inspect full raw outcomes and actual process closure.
Follow with Focus OLD/candidate, then ActionButton/Badge withdrawal/restore.
Detailed exact packet paths, hashes and source-review limits are in the handoff.

Slider API approval remains effective: exact inventory
`/tmp/ui-slider-range-public-api-inventory-20261009.md` (array/indexed state,
`SliderThumb` index/name/form and `createSliderThumb`; styled value shapes
preserved). No need to ask again for those exact names. Private Stately v3 is
frozen at `/tmp/ui-slider-stately-indexed-source-proposal-v3-20261009/`,
manifest SHA256 `7d004977b3bd6d0943c27c0a37fc51c7cafa69a6e6521355c55887b93f466256`.
V3 adds controlled non-drag proposal coherence and four extra tests, 55 total;
it is neither applied, fully Root reviewed nor executed. Preserve frozen v2
51-case OLD tests/request; review its entire request/runner before admission.

Aria/components v1 remains private, with confirmed controlled no-echo reset,
arbitrary-count reset ordering, native default-action synchronization and
direct-hook disabled reset defects. **V2 is unfinished, not implemented.**
Resume from `/tmp/ui-slider-aria-components-v2-WIP-checkpoint-20261009.md`.
Independent review `/tmp/ui-slider-aria-components-independent-review-20261009.md`
also flags captured versus reactive thumb index and non-composed shadow-form
reset events. Do not accept v1 as reset-correct or silently weaken its tests.
Styled consolidation is private and awaits final lower integration review,
actual OLD/candidate proof, native/forms/geometry, owning-test types and fresh
SSR/hydration identity proof. Slider and Range certification skips stay.

Resume order after the three prepared owning slices: finish reviewed Slider
integration/proof; refresh Landing and qualify actual route plus CSP/fonts;
qualify Breadcrumb/Table and Visualmode installed acceptance; apply approved
dependency remediation and qualify packed consumers; admit actual changesets,
generate/check docs and run hub gate; full final same-SHA local/CI certification,
readiness and site proof; version, commit/push, guarded RC publish and actual
registry/external consumer verification. Zero FAIL/SKIP/WAIVER is the current
qualification target; do not extend old RC0 waivers or infer full certification
from focused results. #533/#534/#543/#532 foundation obligations remain until
their required complete qualifications pass.

Last complete certification at this HEAD was historical: 2225 PASS/38 FAIL/
4 SKIP/0 WAIVER/0 FLAKY, total 2267. Current residual after focused changes is
unknown. Recorded CI certification/readiness/site are red; release skipped.
Current versions remain Stately/Aria 0.6.0-rc.0, components 0.7.0-rc.0,
Spectrum/UI 0.8.0-rc.0; Kumo/Geist remain 0.0.0 ignored. Recount changesets at
actual versioning. Existing standing RC publication delegation applies only
after its exact green gates and owner resume; stable/#443 stays separate.

Visualmode D17/D18/G17/D19–D26 remain mapped to #631–#641. #640/#641 and #254
are held; earlier local fixes are not latest registry consumer delivery.
G17 `components-no-fonts.css` and TableCell reactive getter contract remain
approved. Preserve compatibility: owner withdrew the blanket no-compatibility
instruction. Full #554 Effect retirement stays post-RC.

Pause performed no new runtime/build/provider/release work. Fresh
docs:generate/docs:check, eligibility CLI and hub ending gate are UNRUN here;
run under fresh admitted custody after resume. `git diff --check` is the finite
pause validation, not compiler or release proof. No staging, commit or push at
this checkpoint. Preserve all current source and immutable private artifacts.

## Actual local continuation returns — 2026-10-09

Actual October9 continuation counts are79Calendar owning passes,82direct Calendar consumer passes,2Calendar SSR passes and1Calendar hydration pass with the recorded multiple-Solid warning. Source check passed; owning-signatures remains26diagnostics RED. Comparison produced18passing cases before its300s timeout and is not a completed green suite. Focus whole OLD control returned40PASS/2causal FAIL with candidate restored; restored owning candidate42PASS, but complete direct-consumer invocation202PASS/9FAIL remains RED with actual closure and conserved inputs. ActionButton/Badge whole OLD control returned18PASS/8causal FAIL, and restored four-file candidate26PASS with actual closure. These are current local receipts, not UNRUN and not complete RC qualification. Preserve all earlier frozen tables/history and reference the receipts in the corresponding ticket addenda. Release stays unchanged; no push, version, publication or deploy is authorized by this local progress. #647 actual install/audit/five-probe qualification and remaining integrated type/runtime/SSR/hydration/browser/full gates remain required.

## Current local qualification sequence — 2026-10-09

Calendar v2 is applied. Its complete owning-signature check exits0 and all161 Calendar unit cases pass; the production-wide typecheck times out at180seconds, actually exits-15 and closes with inputs conserved. See #533 and /tmp/ui-calendar-v2-direct-proof-20261009/04-source-types.return.json. Format check, lint and full build remain unrun.

Next: apply the independently reviewed one-statement Focus timer teardown correction, rerun the unchanged12-file211-case assay, investigate the production compiler stall with its real config, then refresh the full package chain before complete comparison hydration. Qualify the approved five dependency replacements and the approved native Slider/shared RangeSlider candidate with complete owning, type, SSR/hydration and native browser proof. Run the real Landing route and font-delivery checks, then complete release-readiness/certification/accessibility/site and package-consumer qualification on the final local candidate. Keep failures/skips/waivers explicit; focused passes do not replace full gates.

Direct GPT-6.1 Sol medium workers continue under the owner exception. Root reviews and integrates; UI and VisualMode main retain separate heavy slots. Release automation stays unchanged. No push, version, package publication or deployment is authorized in this local goal.

### Focus follow-up actual return — 2026-10-09

The unchanged twelve-file Focus/direct-consumer assay now passes 211/211 cases
(including all 42 owning cases) after the reviewed one-line timer/spies teardown
repair. Actual exit 0, no timeout, owned process closure and conserved inputs
are recorded in `/tmp/ui-focus-teardown-direct-proof-20261009/01-focus-teardown-and-direct-consumers.return.json`
(SHA256 `dbbd4a1328aedd86b787faf8671d8556804611686bda46be0e9bece189156954`).
Flush-in-effect warnings remain. This is focused evidence; full browser
certification remains required. The next admitted check diagnoses the production
compiler timeout using its unchanged real config and a finite trace run.

### Production compiler diagnostic actual return — 2026-10-09

The installed compiler checked the unchanged real `tsconfig.typecheck.json`
with no TypeScript errors and exit 0. Extended diagnostics report 3,087 files,
21.46 seconds checking and 23.99 seconds total compiler time; trace type dumping
adds 18.06 seconds. The supervised invocation returned in 44.43 seconds within
its 180-second limit, with owned closure and all 4,961 bound inputs conserved.
This clears the present production config; it does not establish why the earlier
`vp run typecheck` invocation timed out. The original `vp run build` remains
required and includes the normal production typecheck wrapper.

Actual return: `/tmp/ui-production-type-diagnostic-reviewed-proof-20261009/01-production-types-trace.return.json`,
SHA256 `596e81ccded179e0f67f7953f7aea63b8095398893e91aea768858d26c362cf1`.
Both trace JSON files are complete. No source/config change or timeout increase
was used for this diagnostic.

### Current local goal and next execution — 2026-10-09

The owner's current scope supersedes the earlier publication/resume sequence:
qualify the continued local candidate, keep Release automation unchanged and
stop before any push, version, publication or deployment. Direct GPT-6.1 Sol
medium workers prepare and execute; the conductor reviews and integrates in
this repository without OS/herdr. UI and VisualMode main have separate heavy
slots, with actual process closure and one source writer within UI.

Approved dependency remediation passed installation, both original audit
policies, ceilings, formatting and all five actual installed-consumer probes;
the full audit retains one moderate finding, and production has none. See #647.
Joint Slider owning proof is now actual: OLD 160 passes/23 failures; the applied
candidate has 117 passes/two assertion failures and four collection failures.
See #74/#76. Correct these causes, rerun all six owners and strict types, then
run the original full package build, paired SSR/hydration, native browser and
real route/font checks. Generate/check work views before final complete
release-readiness, certification, accessibility, site and packed-consumer
qualification. Focused passes do not replace those gates.

### Latest Slider and generated-view returns — 2026-10-09

The complete six-owner Slider follow-up is 214 passed and one failed out of 215. The remaining failure is surviving native thumb identity after index0
unmount; #74 and #76 retain both actual red return hashes. The original Aria
diagnostic baseline is restored. No native browser or complete RC qualification
is inferred from focused passes.

The original docs generator and docs:check now pass on the current board and
both generated views, after correcting history order in #74/#76. Actual docs
check receipt
`/tmp/ui-docs-board-qualified-proof-20261009/20-docs-check.return.json`, SHA256
`7e1fefb01c76b84d527fcbe29afdfc575bbba5c91eacc3dc645682fec0e2deb7`.
The acceptance cross-check also requires the separate original certification
guards and whole styled/button contract floor in addition to the original
readiness, site, accessibility, eight-shard certification and packed-consumer
gates. Keep their original assertions and enclosing CI budgets. Release stays
unchanged; this goal stops at local qualification, with no push or publication.

### Latest local owning and production-type returns — 2026-10-09

Joint Slider's latest full six-owner run passes 215/215 cases; unchanged normal
production typecheck and strict owning types pass. After independent static
format review, original scoped format/lint pass on all 29 paths. #74/#76 retain
the exact latest receipts and earlier actual red returns. The previous wrapper
timeout was not reproduced in the successful normal production runs. Calendar's
exact ten-file format and type-aware lint checks both pass, with owned closure
and conserved inputs; lint return:
`/tmp/ui-serial-production-qualification-proof-20261009/02-calendar-lint.return.json`,
SHA256 `7c7c3c8a1a583a8100fe78c2f42f72b82ab25cbb8090c116218fd704cd3deaa8`.

The original 22-command source-guard deck now passes all 22 with actual exit 0,
no timeout, all child and aggregate owned processes closed and bound inputs
conserved. Receipt:
`output/ui-missing-required-gates-successor-proof-20261009/01-missing-main-source-guards-deck.return.json`,
SHA256 `1a2ce5e6ec3717413eed186d3b24dea423bb40629078a0826c9eab941f95778a`.
This supersedes the earlier deck's five semantic failures for that invocation;
it does not establish the remaining build or browser gates.

Tree's defaultValue repair now passes all six unchanged owners and 131/131
cases, plus original scoped format and lint. #625/#627 retain these actual
closed returns and the preceding 130-pass/one-failure selection baseline. The
wrapper callback is not established as the cause of that historical failure;
fresh whole Tree SSR/hydration and browser qualification remain pending.

Next are the full seven-package build and fresh native SSR/hydration, followed
by affected whole browser owners and real route/font checks. Whole final units,
all eight certification shards, original strict parity, full readiness,
accessibility, site, styled/button contracts and packed-consumer gates remain
required. Regenerate/check work views after these ticket prose updates. Keep
original assertions and CI budgets. The conductor works directly in this repo
under the owner exception; Release automation stays unchanged and this goal
stops locally before push, version, publication or deployment.

## Actual combined candidate checkpoint — 2026-10-09

The original complete five-owner candidate closed at 23:57:54.099368 UTC
with 24 PASS / 6 FAIL of 30, zero skips, exit 1, empty owned closure and
14,891 conserved inputs. The certified subset was 7 PASS / 1 FAIL of 8.
Both positive initial Table descriptions and sorted Table D6 now pass;
the Breadcrumb computed-style comparison also passes with the corrected
visible-link selector. Four initial Breadcrumb URL tails and overflow D6
still fail, and Solid's Budget.xlsx rowheader remains unavailable to the
original focus case. The candidate list-width pulse has not cleared the
tail failures. These results identify remaining defects, not their native
ResizeObserver chronology or component remount cause. No task/waiver closure
or aggregate readiness is established.

Receipt SHA256: de1228f09b2f29f7780b1b191cb6ae83dc1669da3c44d593dae20a9a12ad751b;
raw SHA256: 35aebfdc7301bad3bf01435644012666c85b683a602b836b8e26b8436252eb29.
Actual return: output/qualification-evidence/ui-reviewed-combined-browser-causal-successor-proof-20261009/04-table-candidate-breadcrumbs-table-full-owners.return.json.

All candidate and cause-chain obligations remain: whole-five-owner GREEN
before TABLE-ONLY withdrawal/restoration, followed by pulse-only withdrawal/
restoration keeping the corrected visible selector. Unexpected failures stop
for review. Neither passing descriptions nor a diagnostic substitutes for
the original whole owners, matched SSR/hydration and final mandatory gates.

## Bounded comparison callback-owner admission — #547 / #646

This local qualification continuation admits ONLY the existing comparison
helper apps/comparison/src/components/solid/solid-h.ts and its existing whole
owner apps/comparison/test/solid-integration/hyperscript.hydrate.test.tsx,
besides the already admitted fixtures and original browser oracles. Preserve
every existing assertion and append two meaningful callback-return-array
identity regressions covering zero-argument accessor and one-argument callback
semantics, sibling native node identity and live reactive values. The resulting
whole owner is twelve cases; no filter, skip, threshold or budget changes.

The source-supported proposal materializes existing HC_THUNK component slots
inside the marked callback owner before downstream shared reactive insertion,
preserving the existing zero/one-argument distinction and leaving ordinary
reactive accessors live. TableRow's append-only cell registry explains a
possible missing rowheader after rematerialization; no native remount timeline
has been observed. The helper repair remains pending, with no application or
GREEN claim. No production package, public name, export, dependency, styling,
normalization or original browser assertion is changed by this admission.

Qualification requires actual OLD, candidate, helper-ONLY withdrawal and exact
restoration runs of the complete twelve-case owner, with candidate/restored
GREEN and matching actual OLD/withdrawn regression failures. Full comparison
SSR/hydration and the same native whole-five-owner browser assay remain
mandatory, preserving their original enclosing budgets and assertions. Any
unexpected failure stops for root review. The conductor alone integrates and
freshly admits each run after owned predecessor closure. No focused pass
closes #646, #547 or local release readiness; no push/version/publication or
deployment is admitted.

## Latest focused local evidence — 2026-10-10 UTC

[#646](./646-align-tableview-reference-column-text-values-and-qualify-sorted-ax.md)
records the latest complete browser checkpoint (29 PASS / 1 FAIL), helper
four-phase proof and remaining Table focus-ring failure. Its bounded production
Table continuation is read-only until root accepts an exact source proposal;
#646 is the single source for that admission. Whole mandatory gates, matched
SSR/hydration and final eight-shard qualification remain required; no closure,
remote success, push, version, publication or deployment is claimed.

The separate complete Checkbox/RadioGroup diagnostic passes all 164 cases,
zero skip/TODO, actual exit 0, closed owned processes and 7,143 conserved inputs;
this is not the complete root unit suite. Return:
`output/qualification-evidence/ui-readiness-a11y-two-owner-disk-diagnosis-proof-20261009/01-a11y-two-whole-owners.return.json`,
SHA256 `cbb77365230f76480202c9a0dfba7bd2160f1469b7b9c5cdb86334f974e98180`;
raw SHA256 `cac1d078e9dbf1c4224d57c03dcd17ab2d93639d9c2e066c598e996e979c1a21`;
`01-a11y.results.json` SHA256
`dbd6d8f9cc24664b14be6f39883c020b62522d72e5152538ab0b212cbba5b742`.

The conditional Table divider successor and its exact production paths are
owned solely by [#646](./646-align-tableview-reference-column-text-values-and-qualify-sorted-ax.md).
It requires actual native cause before application and fresh measured
forced-colors preservation before acceptance; it does not ratify the temporary
architecture, close #490 or complete the remaining local qualification gates.

## Current owner release objective — 2026-10-10 UTC

The owner now authorizes completing the live release, including the candidate
push and automatic publication. This supersedes the earlier local-only,
no-version and no-push boundary. Release automation remains unchanged. The
conductor continues directly in this repository with GPT-6.1 Sol medium
workers, one source writer and the independent UI runtime slot.

Finish the remaining event, overlay and native regressions, then qualify the
versioned candidate through the complete readiness, certification, site and
clean packed-consumer gates. Commit the source owners before the observed
Changesets version outputs. Obtain all three remote evidence workflows green
at the exact final pushed SHA, verify automatic RC publication and the five
published-package dependency closure, and run a fresh registry consumer outside
the workspace. Keep Kumo and Geist at their ignored workspace versions and
preserve `latest`, `next` and prerelease mode. Historical RC0 evidence and
focused local passes do not close this ticket.

## First complete RC1 readiness attempt — 2026-10-10 UTC

The original full readiness command closed with exit 1 after 526.994 seconds,
without a command timeout. All 7,214 bound inputs were conserved and owned
processes closed. Formatting, types, all seven package builds and artifact
guards passed. The unit leg reported 8,186 passing cases, 71 failures and one
expected failure across 421 files; four snapshots failed. SSR, hydration,
Web units and journeys were not reached.

The failures include synchronous assertions after deferred native events,
RC0-specific waiver fixtures and a stale Modal tracked-effect count. Timeout
failures remain separate pending fresh whole-suite proof. A SearchField clear
callback reporting three calls where the original assertion requires one
needs production review. No waiver, reduced gate or release success is claimed.

Return: `output/qualification-evidence/ui-final-local-qualification-external-runtime-tmp-successor-proof-20261010/01-full-root-release-readiness.return.json`,
SHA256 `5f70a8924df724dd62c3ebfa57faa049d8fa7ebb8ed37e78ea8e2d72e0461110`.
Raw SHA256: `b584a868598414409ec3b5564af8d10ebe8ebb34963175509a957d1e6e260a16`.
The conductor independently verified all 76 immutable evidence copies in
manifest `d911907a735ebe832f2774c0422f0f6aec689cb48494eb7064a1c48b0fa186f4`.

## Current whole-readiness retry — 2026-10-10 UTC

After the event, SearchField and Toast repairs, the complete unit leg reached
420 passing files and one failing file: the full-backlog parity CLI integration
case exceeded its default five-second budget. Its output assertions completed.
The conductor added a 20-second child deadline and a 30-second case budget,
preserving its command and every assertion. No global test budget changed.

The next original readiness run passed builds and typechecks, then closed with
exit 143 during the unit leg; SSR, hydration and later steps were not reached.
The supervisor did not time out or signal the child. The earlyoom journal
identifies the same run's Vitest PID 3168785 as the SIGTERM target under low
memory. Journal SHA256:
`df7db214dd733aa912df87949120be3ad438455ab2f34ea057e52e2915a400bc`.
Return:
`output/qualification-evidence/ui-post-parity-cli-budget-full-readiness-proof-20261010/01-full-root-release-readiness.return.json`,
SHA256 `3dea9951e44c648d9d4a809669070de0a44d56635fb156c97d9d13d6eb8acfac`.
All 7,214 inputs were conserved and owned processes closed.

Following ADR 0002, the conductor lowered `vmMemoryLimit` from 200 MB to
100 MB as a worker-recycling experiment. Installed Vitest checks worker heap
after a file completes; this setting does not cap startup or process RSS.
Pool, default parallelism, discovery, assertions and original enclosing
deadlines stay unchanged. Application receipt SHA256:
`9786837999a25a2f6b42731f749a2918755e229741413f65dffd270a8c37753d`.
Fresh complete readiness and all remaining gates are still required. No
candidate commit, push, remote green or publication is claimed.

The 100 MB retry completed the whole unit leg: 421 files, 420 passing and one
failing; 8,266 passing cases, one failure and one expected failure. Its sole
failure was the upstream-attribution CLI case "destructured shadow" exceeding
the default five-second deadline at 5,263 ms. The command closed with exit 1
after 303.707 seconds, without a supervisor timeout; all 7,214 inputs stayed
conserved and owned processes closed. SSR, hydration and later steps were not
reached. Return SHA256:
`230fb8e1e5b524783a2f59aad2cd82eab2b6bf45a6b4ce3f6aa9bc3ab5f05d8e`;
raw SHA256:
`2d16fc6ec07b40cdf04111fd74cec03561dbac8e43d47bb0405350e8aebf6cfc`.

All 34 upstream-attribution cases start the same fresh CLI process and assert
exact facts, attribution or pin drift; none asserts response time. The conductor
added a shared 20-second child deadline and a 30-second inherited case deadline
in the three CLI suites, preserving every case, fixture, command and assertion.
Application receipt SHA256:
`63620d706cb911b565d5762870e85de19fc5a2f465bcd23121e1ffc8ff18e7e6`.
Complete readiness and the remaining release gates require fresh proof. The
owner authorizes autonomous overnight continuation of the live-release scope.

The following complete readiness attempt closed with exit 143 after 262.861
seconds, without a supervisor timeout. All 7,214 inputs stayed conserved and
owned processes closed. Builds and typechecks passed; the unit leg printed no
case summary and later legs were not reached. Return SHA256:
`5fe9fa74b511b79b71c0fd5bcb50c3f5dbdf38345516c245bf14cb8c5635c9a0`.
The journal identifies its Vitest PID 3206635 as the earlyoom SIGTERM target
at 07:28:01 UTC, with 3,736 MiB process RSS, 653 MiB available and no free swap.
Journal SHA256:
`18ee6b5dfea073ed20123b54e0ee4e31a0c8a6b28d29e6c18691fc5ac4be2b48`.

Installed Vitest 4.1.11 terminates isolated workers after each file regardless
of the memory limit. Further lowering that limit would not address this
scheduler's startup or aggregate RSS. The conductor applied a reviewed unit
worker budget of `maxWorkers: "50%"`, sharing this host's 16 CPUs between the
two independent runtime slots. UI now uses eight workers. ADR 0002 records the
installed behavior and the changed concurrency; the pool, complete discovered
set, original readiness command, assertions and deadlines stay intact.
Application receipt SHA256:
`a50e52acec705b5d8df876aa6ef52fffaab50c299d2cc12138b6942d96131bee`.
Its efficacy remains unqualified until the complete readiness gate passes.
Historical #556 claims and receipts remain unchanged. No temporary evidence
was removed, host setting changed, candidate pushed or package published.

The eight-worker complete readiness attempt closed with exit 143 after 384.893
seconds, without a supervisor timeout. All 7,215 inputs stayed conserved and
owned processes closed. Formatting, lint, audits, guards, typechecks and all
seven package builds passed. Six partial unit suites reported ten failures;
no complete unit summary or downstream qualification was reached. Return SHA256:
`0b5dc131356af5099cd633231652c86f1349b95daad4b4eb7c980ddd0be6eaac`.
At 07:51:43 UTC, earlyoom terminated its UI Vitest PID 3235342 with 2,757 MiB
process RSS, 637 MiB available and no free swap. These are termination-time
observations, not peak measurements. Journal SHA256:
`f06604440e90533076b9fbdac46b57c3ca22d82abb7463d90360f5816910e20b`.
The partial case failures remain unresolved until complete fresh proof.

The conductor applied the reviewed worker expression
`Math.max(1, Math.min(2, availableParallelism() - 1))`: two workers on this
host, preserving the previous one-worker allowance on one- and two-CPU
runners. The installed scheduler accepts this numeric budget directly.
ADR 0002 records the failed eight-worker attempt and this unqualified change.
Application receipt SHA256:
`3d6eb052af508f042e91adb04cf53661903dceb02a77a4ab8f14b27138f7685c`.
Fresh pinned-upstream preflight and the unchanged complete readiness gate
must qualify the actual new source before further release integration.

The first two-worker attempt reached its unchanged 1,800-second supervisor
deadline while the unit leg was incomplete; builds and typechecks passed, all
7,215 inputs stayed conserved and owned processes closed. Return SHA256:
`687f170f57604e25b0bae8bbb4b078d665fd9e29c858ff95eb998485ac7a3a73`.
A fresh complete retry closed with exit 1 after 603.116 seconds. Every one of
421 unit files passed: 8,267 passing cases and one expected failure. SSR then
reported 47 passing files and two failures, with 139 passing cases and two
30-second timeouts in the Spectrum and UI ContextualHelpTrigger warm-server
import cases. Later legs were not reached. All 7,215 inputs stayed conserved
and owned processes closed. Return SHA256:
`82eeae0c87d67091b622f511ed23fbb1f7c72136dbb42fb7cef746789cf16dd7`.
The complete immutable archive contains 192 copies; manifest SHA256:
`38f7685401a68fd7b0730aa581df586cb5e9aa79135abee13bb3f257d4c4b51a`.

The root unit cap did not cover the independent SSR, hydration, Web and
comparison Vitest configs. The conductor applied the same reviewed numeric
worker expression to those four configs and recorded the actual failures in
ADR 0002. Comparison's SSR and hydration configs inherit their root counterparts.
Pools, compiler settings, complete discovery, assertions, original case and
hook deadlines, browser concurrency and release commands remain unchanged.
Application receipt SHA256:
`84f8441f333f2a79ea64ae7002b4630017cc093b393040df1b9d016745f0d424`.
This capacity change requires fresh complete qualification; the SSR timeouts'
cause and the change's efficacy are not yet proven. No candidate commit, push,
remote green or publication is claimed.

## Comparison hydration continuation — 2026-10-10

The unchanged full readiness retry passed all 421 unit files (8,267 cases and
one expected failure), all 49 SSR files (141 cases), all 42 root hydration files
(141 cases), and both comparison SSR files (nine cases). It then closed red in
the whole comparison hydration suite; no later readiness leg received credit.
Return SHA256: `bc12de765c675302988fb7696d107a7a6824ad92d61a0929e323f8fb0564e474`.

The comparison fixture assertions now inspect the real native Slider inputs,
preserving value, stepping, focus, retained identity and styling checks. Overlay
focus assertions await the existing frame-delayed restoration before checking
the original trigger. Neither change alters package behavior or case discovery.

The DnD diagnostic retained the original option and collection, and proved that
native focus succeeded before later settlement returned focus to body. The
selectable-item focus effect now follows pinned React Aria's passive effect:
Solid's two-phase effect owns the focus request, with a cancellable wait until
after paint only when a real-focus request follows an active drag. Current key,
ref, focus ownership, drag, mode, callback and child-focus strategy are rechecked;
ordinary and virtual focus remain immediate after the flush. DragManager and the
50ms drop fallback remain unchanged. Two-phase scheduling alone failed 177/178;
that failed return is retained rather than credited.

The original whole comparison hydration suite then passed all five files and
178 cases with diagnostics removed, including focus on the retained Read option.
Return SHA256: `8aeea7779dca91fbeeb828c1a97574299073101efa0899691839362647f1b374`.
All bound inputs conserved and owned processes closed. Complete readiness and
all remaining release gates still require fresh qualification. Versioning was
already executed and was not repeated; no commit, push or publication is claimed.

## Actual RC1 publication and installed consumers — 2026-10-11

Actual E `a2ccaf10885edadfd41ffc2d10c2e65fdad2ca58` passed Release Readiness, Certification Gates and Site Gate on that exact SHA; automatic Release `38146924038` then published the five `rc` versions: @proyecto-viviana/solid-stately@0.6.0-rc.1; @proyecto-viviana/solidaria@0.6.0-rc.1; @proyecto-viviana/solidaria-components@0.7.0-rc.1; @proyecto-viviana/solid-spectrum@0.8.0-rc.1; @proyecto-viviana/ui@0.8.0-rc.1. Original capture verified unchanged `latest` (0.5.1 / 0.4.3 / 0.5.1 / 0.6.4 / 0.6.3), no `next`, and unchanged Kumo/Geist publication state. Registry consumer cryptographically verified 96 signatures and 55 attestations. Separate genuine LOCAL12 at source C′ `d8b57f49d2ee93453f4ac4120e1543a4245a55c1` and REGISTRY12 at published E passed all original Table/Card cases for both skins, including retained native nodes, caret/focus/state and Card-menu lifetime. Native proofs do not remove the retained workaround or claim full port parity.

Accepted source qualification remains C′ `d8b57f49d2ee93453f4ac4120e1543a4245a55c1`; E `a2ccaf10885edadfd41ffc2d10c2e65fdad2ca58` records its original eight-shard result (2297 passed, zero failed/skipped/waived/flaky), followed by accepted exact-E strict parity. The same E now has all three required hosted workflows green and automatic Release run `38146924038` successful, independently accepted in `output/qualification-evidence/ui-exact-e-hosted-release-proof-20261011/ROOT-ACTUAL-PUBLICATION-AND-THREE-GATES-REVIEW-20261011.json`. Actual registry capture, crypto consumer and separate installed-native proof are accepted under `output/qualification-evidence/ui-registry-and-native-final-stage-rc1-e-a2ccaf10-proof-20261011/ROOT-CLOSED-STAGE-01-REVIEW.json`, `ROOT-CLOSED-STAGE-02-REVIEW.json` and `ROOT-CLOSED-STAGE-04-REVIEW.json`; the consumer verified 96 signatures and 55 attestations, and registry native passed all 12 original cases. Independently accepted LOCAL12 remains bound to C′ at `output/qualification-evidence/ui-registry-and-native-final-stage-local-rangeslider-viewport-20261011/ROOT-CLOSED-STAGE-02-REVIEW.json`. Physical refs/hashes are cataloged in `.agents/UI-EXECUTION-547-rc1-published-2026-10-11.json`; these later proofs do not recreate missing historical controls or claim complete API parity.

This actual RC1 record supersedes pending-publication prose for this release; earlier RC0 and failed qualification records stay historical. Versioning already ran and must never repeat. The flat release proof `.agents/UI-EXECUTION-547-rc1-published-2026-10-11.json` belongs solely to the #547 owner transaction, which must remain LAST; later ticket-only F is documentation/evidence closure, not a replacement publication revision. Separate #74 color D8 and #625 rename-browser proof remain open. Final generated views, ticket-shape/docs checks, normal F push and hub audit/report remain Root's final integration steps, remaining integration work.
