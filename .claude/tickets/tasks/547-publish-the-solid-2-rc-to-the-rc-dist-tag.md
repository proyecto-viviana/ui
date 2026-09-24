---
id: 547
type: task
title: "Publish the Solid 2 release candidate to the `rc` dist-tag"
created: 2026-09-20
parent: 544
status: in-progress
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
---

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

| package                | published `latest` | local `package.json` |
| ---------------------- | ------------------ | -------------------- |
| `solid-stately`        | 0.5.1              | 0.5.2                |
| `solidaria`            | 0.4.3              | 0.5.0                |
| `solidaria-components` | 0.5.1              | 0.6.0                |
| `solid-spectrum`       | 0.6.4              | 0.7.0                |
| `@proyecto-viviana/ui` | 0.6.3              | 0.7.0                |

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
