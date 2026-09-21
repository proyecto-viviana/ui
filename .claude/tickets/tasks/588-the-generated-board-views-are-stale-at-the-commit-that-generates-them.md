---
id: 588
type: task
title: "The generated board views are stale at the very commit that regenerates them, and docs:check is the red that truncates the ladder"
created: 2026-09-21
parent: 544
status: merged
history:
  - {
      state: open,
      at: 2026-09-21,
      note: "opened from the 2026-09-21 round-1 audit, receipt `.agents/audit-2026-09-21/round-1-results.md`. Five findings, one cause: `guards-b/ladder-regressed-to-231`, `ci-truth/ladder-table-wrong-earliest-red`, `ci-truth/docs-generate-not-reproducible`, `board-truth/generated-views-stamp-lies`, `apps-web/docs-check-is-the-red-that-truncates`; plus `ci-truth/main-red-head-unpushed`, `apps-web/head-has-no-ci-at-all` and the survivor of `ratchets/gates-never-green`. The cause is ordering, not coverage: `vp run docs:generate` is run, then the commit's last ticket edit lands, so the stamp names a board state that was never committed. Recomputing `boardRevision()` as `scripts/generate-work-views.ts:31-40` defines it reproduces the stamp exactly at `24953c97`, `d106ffdf`, `25f59397`, `19e19328` and `1a98e250`, and fails to at `d2f94530`, `eb75ee0e`, `96376e9a` and `4acbc9e4`. Verified here at HEAD `65254a8c`: `vp run docs:check` EXIT=1, both `roadmap.md` and `status.md` stale",
    }
  - {
      state: open,
      at: 2026-09-21,
      note: "the step number in the audit is already out of date and the ticket records the current one instead. `docs:check` was `certification-gates.yml:231` at `96376e9a`, which is what CI runs 35556441049, 35558449632 and 35560076342 all failed at; at HEAD it is **:235**, moved by `7ec2a732` (#194) and `13080aa0` (#574), the only two post-audit commits touching the workflow. Both numbers are in this ticket on purpose: the ladder table has been wrong twice for the same reason, that somebody wrote a line number down and the file moved under it",
    }
  - {
      state: open,
      at: 2026-09-21,
      note: "2026-09-21 round-2 audit, receipt `.agents/audit-2026-09-21/round-2-results.md`, finding `r2-certified-b/F1`, medium, partly: the same truth as `ci-truth/main-red-head-unpushed` above, measured again over the sixteen commits written after round 1's range closed. None of them is on `origin/main` - `git merge-base --is-ancestor` is false for all sixteen against `96376e9a` - so every pass count in their messages and receipts is an unreplayed local claim. Main's three newest Certification Gates runs are failures, the latest 35560076342 at `96376e9a`, 2026-09-21T04:11:59Z, and `gh workflow list --all` still reports Site Gate and Release Readiness `disabled_manually` while #586 names Site Gate as its blocker. The skeptic refuted the finding's gate-lies framing: the scheme defines merged as landed in a sha, not as gated, #586 is in-progress and says its run is owed, and the owner disabled the workflows - so the survivor is exactly this ticket's scope. Closing the red and pushing is what turns sixteen unverified claims into one run id",
    }
  - {
      state: open,
      at: 2026-09-21,
      note: "the defect reproduced live while landing round 2, and it has a named cause now rather than an inferred one. `503e50a0` ran `vp run docs:generate` as its last edit and `vp run docs:check` exited 0 in the working tree; the pre-commit hook then ran `vp check --fix` over the seventeen staged files, reformatted one of them (`.claude/tickets/tasks/603-...md`, one line, YAML flow-scalar quoting), and committed that reformatted content. `vp run docs:check` on the committed tree exited 1 with both views stale, and `a9ab33ee` restamped them. So the ordering hole is not only human - a hook that mutates staged files after the generator has run reproduces it every time, and the writer cannot avoid it by being careful. Two shapes fit this ticket's `make it mechanically impossible`: run the generator from inside the hook, after `vp check --fix` and before the commit object is written, or have `docs:generate` stamp from the staged index rather than from the working tree. Verified: the formatter touched exactly one file, `git diff beb8e9ee 503e50a0 -- .claude/tickets/`, and only a note whose text contained a double quote",
    }
  - {
      state: merged,
      at: 2026-09-21,
      note: "scope items 1 and 3. The conductor's call on item 1 was not the hook and not a second guard: make the stamp format-insensitive, so that `generate last, then commit` holds through a formatter that runs after the generator. `boardRevisionOf(entries)` in `scripts/generate-work-views.ts` now hashes, per ticket, the path plus the ticket's *parsed* frontmatter canonicalised to sorted-key JSON, instead of the file's raw bytes. Generator and checker stay on that one function - `docs:check` reaches it through `checkGeneratedWorkViews()`, which regenerates both views and compares them whole, so there is no second copy of the rule to drift. The body is deliberately out of the hash, and the views are the reason it can be: they render frontmatter only, and no normalisation of prose survives a markdown formatter that may rewrap it. The cost of that choice, stated plainly: a body-only ticket edit no longer moves the stamp. The stamp names the board the views were rendered from, not the ticket text. Proof, pre-fix red then post-fix green, same test both times: `scripts/generate-work-views.test.ts`, nine cases, run first against the byte hashing merely lifted into the new signature - `vp test run scripts/generate-work-views.test.ts` EXIT=1, 2 failed | 7 passed, the two failures being `holds still when the formatter respells a ticket` and `ignores the body`; then against the frontmatter hashing, EXIT=0, 9 passed. The seven that pass both ways are the movement half of the contract: status, title, history note, an appended history entry, a ticket added, a ticket renamed, and order-independence. Real formatter, not a fixture: respelling `title:` in `.claude/tickets/tasks/239-...md` from double to single quotes left `vp run docs:check` EXIT=0 against views stamped from the double-quoted bytes, and `vp check --fix` on that file then rewrote it back to double quotes, which is the formatter doing exactly what `503e50a0` caught it doing. The generated views themselves are untouched by the formatter: `vp check --fix .claude/current/status.md .claude/current/roadmap.md` leaves both md5sums identical. And the trap's signature is visible in this board's own history - recomputing the old byte stamp over each commit's committed board gives HEAD MATCH, HEAD~1 STALE, HEAD~2 MATCH, HEAD~3 STALE, HEAD~4 MATCH, which is two work commits each followed by a restamp commit, in the last four. `vp run typecheck` EXIT=0. The hook is NOT touched, and that is a decision, not an omission: `.vite-hooks/pre-commit` runs `vp staged`, which is lint-staged bundled into `node_modules/vite-plus/dist/staged/bin.js`, where `concurrent` defaults to `true` and `true` becomes `Infinity`, so a second pattern matching `.claude/tickets/**` would run *at the same time as* `vp check --fix` rewrites those same files in place - the opposite of race-free. Two more reasons on top of the race: `docs:check` reads the whole working tree, not the index, so an unstaged edit to any other ticket would decide the verdict of a commit that does not contain it; and it costs 1.23 s warm on its own, which is not well under two seconds once it is on every ticket commit. With the stamp format-insensitive the hook step has no remaining job anyway. Scope item 3, corrected: `.claude/current/status.md` does not say the next red is step 239 and never did - it is generated whole by `generate-work-views.ts`, carries no step number and no ladder sentence, and its own `Evidence boundary` section says it reports ticket state only (`grep -n 239 .claude/current/*.md` finds nothing). So there was no generator source to fix either. The only written frontier is the dated correction block in `.agents/CONDUCTOR-RELEASE-PATH-2026-09-20.md`, which is left standing as the record: it already names the step by NAME - `docs:check`, id `docs_check`, in the `gates` job of `certification-gates.yml` - and gives its line with the sha it was read at. This note writes the name and no number on purpose; that line has moved twice already under people who wrote it down. Owed, and not this seat's: scope item 2, the push, and the Certification Gates run id whose `docs:check` step is green. That is the Done-when, so this is `merged`, not `verified`. End to end, inside this commit: this ticket's own `title:` was left single-quoted while `vp run docs:generate` stamped the views, so the pre-commit formatter rewrote it to double quotes *after* the stamp and inside the commit - the exact `503e50a0` shape, staged deliberately - and `vp run docs:check` on the committed tree exits 0 with no restamp commit behind it",
    }
  - {
      state: merged,
      at: 2026-09-21,
      note: 'review of the landed fix; three findings, all three real, all three fixed here. (1) The stamp hashed the whole parsed frontmatter while the two views print only path, id, type, title, status, blocked and parent, so a reworded history note or a corrected `created:` moved a stamp no view depends on - and the closing history note is by convention the last edit of a ticket commit, which is the human half of the very ordering hole the first note above names. Measured on this live board against the landed code: rewording this ticket''s own closing note STAMP MOVES, changing `created:` STAMP MOVES, while grep for that note text across `.claude/current/status.md` and `.claude/current/roadmap.md` finds 0 and 0. `boardRevisionOf` now hashes the rendered projection - the path plus those six frontmatter fields - read through `parseTicket`, which is already the one definition of how frontmatter becomes those fields, so no normalisation rule is restated in the generator; `canonical()` went with the raw frontmatter it existed for. Measured after: both HOLD. End to end on the real board, which is the ordering hole itself: `vp run docs:generate`, then respell a history note in `.claude/tickets/tasks/603-no-test-can-tell-the-popovers-two-enter-placements-apart.md`, then `vp run docs:check` EXIT=0 with both views md5-identical. (2) The one fixture carrying the fix was invented, and the real transformation is a different one. Run on a scratch copy, `vp check --fix` does not unquote a title and does not fold a scalar across lines; it requotes single to double, expands a long one-line flow map, and rewrites a double-quoted scalar to SINGLE quotes, unescaping \" to " and doubling '' to ''''. That is `git diff beb8e9ee 503e50a0 -- .claude/tickets/` on ticket 603, the only transformation ever observed to cause this bug. FORMATTED is now the verbatim output of running that formatter on WRITTEN, so a future change to `splitFrontmatter` breaks the suite on the real input rather than on a guess at it. (3) Correction to the note above: it records scope item 1 as delivered and it was not. Only the respelling half closed. A change to one of the seven rendered fields made after the generator ran still ships a stale view, and the closing flip to `merged` is exactly that shape, so `docs:check` in CI remains the only detector - the red that truncates the ladder, which is what this ticket was opened for. Item 1 is narrowed and partly deferred, and the residue is #604. The conductor''s call cited in that note is also not on disk: the decision reached this seat as the task text of its harness run and nothing in `.agents/` records it, so read it as this seat''s judgement until the conductor writes it down. Proof, pre-fix red then post-fix green, the same 13-case `scripts/generate-work-views.test.ts` both times: against the landed frontmatter hashing `vp test run scripts/generate-work-views.test.ts --maxWorkers=2` EXIT=1, 3 failed | 10 passed, the three being `holds still when only a history note changes`, `holds still when created, subtitle or app change` and `keeps unparsable tickets apart`; against the projection hashing EXIT=0, 13 passed. `vp run typecheck` EXIT=0. Still owed and still not this seat''s: scope item 2, the push and the Certification Gates run id',
    }
  - {
      state: merged,
      at: 2026-09-21,
      note: "bookkeeping only, no code. The run this ticket was waiting on has concluded without answering it: Certification Gates 35623988073, push, `e8bacb9d`, `certification-gates` job 106413682647 concluded `failure` at step 24 `guard layer-boundary`, and `docs:check` - step 37 - never ran, conclusion `skipped`. So this run carries no verdict on this ticket and it stays `merged`; the run whose `docs:check` step is green is still owed. Recorded because the earliest red on `main` has moved off `docs:check`: `guard layer-boundary` now truncates the ladder sixteen steps ahead of it, and that is a different ticket's problem, not this one's",
    }
---

## Scope

1. Make the ordering mechanically impossible to get wrong. The smallest thing
   that does it: run `docs:check` from the staged pre-commit hook whenever the
   staged set touches `.claude/tickets/`, so a commit that edits a ticket and
   leaves the views behind cannot be made. **Propose it, do not implement it
   here** — the hook is shared with other sessions and the shape is the
   conductor's call. A `guard:generated-views` script that recomputes
   `boardRevision()` is the alternative, and it costs a CI step that
   `docs:check` already spends.
2. Regenerate the views as the last edit before committing, and push. `main`
   has been red on this since `d2f94530`; HEAD is 17 commits unpushed and no
   workflow has ever seen it.
3. Correct the ladder frontier wherever it is written down —
   `.claude/current/status.md` and
   `.agents/CONDUCTOR-RELEASE-PATH-2026-09-20.md` both still say the next red
   is step 239, and `comparison parity (strict)` and `axe full audit` have not
   executed since `1a98e250`. Write the step number with the sha it was read
   at, or write the step name and no number.

## Done when

One push of `main` produces a Certification Gates run whose `docs:check` step
is green, and the same revision is reachable by `vp run docs:check` locally
with EXIT=0. The ladder frontier in `status.md` names the step the run
actually stopped at, with its run id.

## Proof

The run id and its step list; `vp run docs:check` EXIT=0 at the pushed sha; the
recomputed `boardRevision()` matching the committed stamp.

## Relationship

Child of #544, stage S0-b. Everything behind step 235 — #574's parity gate at
:244 and #575/#576's axe legs at :256 — has been skipped for four runs, so
their CI state is unknown rather than red. This ticket is what makes those
readings possible again. Related to #577: a ratchet that cannot report its own
staleness is the same shape as a generator whose stamp cannot.
