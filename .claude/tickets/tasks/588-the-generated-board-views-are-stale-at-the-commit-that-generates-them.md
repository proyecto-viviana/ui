---
id: 588
type: task
title: "The generated board views are stale at the very commit that regenerates them, and docs:check is the red that truncates the ladder"
created: 2026-09-21
parent: 544
status: open
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
