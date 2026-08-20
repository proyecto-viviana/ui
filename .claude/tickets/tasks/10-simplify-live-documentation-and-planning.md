---
id: 10
type: task
title: "Simplify the live documentation and planning system"
created: 2026-08-20
status: in-progress
history:
  - {
      state: open,
      at: 2026-08-20,
      note: "opened from the latest-work and documentation organization review",
    }
  - {
      state: open,
      at: 2026-08-20,
      note: "fixed the first acceptance-report defect and recorded the full document classification",
    }
  - {
      state: open,
      at: 2026-08-20,
      note: "confirmed the declared ticket authority and documented the current admin conflict",
    }
  - {
      state: open,
      at: 2026-08-20,
      note: "completed the repository-wide documentation census and ticketed latest-work risks",
    }
  - {
      state: open,
      at: 2026-08-20,
      note: "owner confirmed the ticket board and admin projection architecture; implementation started in #12",
    }
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "cut over /admin, migrated active task state, generated work views, and started the retained-doc rewrite",
    }
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "reduced the live current-doc surface to stable references and generated views, with all open audit work on the ticket board",
    }
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "validated the simplified operating surface, ticket board, generated views, admin tests, web typecheck, and pinned upstream oracle",
    }
---

The repository has too many live documentation surfaces. Current facts, work
state, evidence counts, and completed history appear in multiple files. These
copies drift and make the next action difficult to find.

This ticket coordinates the cleanup. It does not replace the focused tickets
listed below.

## Starting evidence

- `main` is 19 commits ahead of `origin/main`.
- The worktree has 509 status entries: 342 modified, 147 deleted, and 20
  untracked.
- `.claude/current` has 25 tracked Markdown files.
- Those files contain approximately 14,586 lines and 140,000 words.
- The current index defines a 22-step reading order.
- Task state exists in current-document frontmatter and `.claude/tickets/tasks`.
- `docs:check` checks metadata and task links. It does not check factual
  freshness, duplicate authority, local links, or completed-document retention.

## Work order

1. Complete the acceptance-evidence foundation in #11.
2. Record the owner-directed task authority in #12.
3. Classify and reduce the live documentation surface in #13.
4. Generate volatile status facts in #14.
5. Rewrite the retained prose in #15.
6. Enforce the resulting documentation contract in #16.
7. Close the latest-work evidence risks in #17, #18, and #20.
8. Refresh derivative-attribution work in #19.
9. Correct the prop-table link boundary in #21.
10. Resolve build-evidence risks in #22 and #23.

Do not mix this program with unrelated implementation changes. Preserve the
existing dirty worktree. Update this ticket after each completed slice.

## Live checkpoint

The 2026-08-20 review completed without repository edits before these tickets.
Focused acceptance-schema tests passed 7/7. `docs:check`, the parity inventory,
the layer-import inventory, and `git diff --check` passed. The complete 2,176
case certified suite and aggregate `ci:site` did not run.

The report has one confirmed command defect. `--strict-full` exits 0 when used
alone because exit handling also requires `--strict`.

That defect is now fixed. `--strict-full` exits 1 on the current full backlog.
The focused option and acceptance-schema run passed 9/9 tests. Ticket #13 holds
the complete 25-file classification and the reference dependencies that must
move before retirement.

The portfolio and adopted execution playbook assign durable work state to
`.claude/tickets`. The local `/admin` implementation still edits 101 task
records under `.claude/current`. Ticket #12 records the evidence, overlap map,
legacy board gaps, and proposed owner-confirmed cutover.

The retained repository also has approximately 23,600 Markdown lines outside
`.claude/current`. Most belong to stable public docs, colocated playbooks, or
component evidence. Ticket #13 now classifies these groups. Ticket #19 isolates
one active plan that incorrectly lives under `docs/`.

The focused latest-work run passed 394 tests with four expected skips. Three CSS
parse warnings remain. Tickets #17, #18, and #20 record behavior branches that
those tests do not prove. Ticket #21 records a scheme-relative URL defect in the
uncommitted prop-table renderer. No clean full certified run exists for the
post-fix tree.

The complete six-package build now passes and validates 802 manifest artifact
targets. It emits repeated macro source-map warnings. Ticket #22 migrates the
existing A-017 finding to a focused task. Ticket #23 records the required scan
for other JSX refs that the package optimizer can treat as unassigned.

Final audit checks on 2026-08-20:

- `vp run build` passed for all six public packages and the artifact guard.
- `vp run guard:dependency-security` passed all three commands.
- `vp run guard:source-artifacts` passed.
- `vp run guard:release-prerequisites` passed and skipped unpublished
  `@proyecto-viviana/kumo@0.0.0` as designed.
- `vp run test:ci-guard-contracts` passed 12 contract cases.
- The acceptance option and schema run passed 9/9 tests.
- The prop-table renderer run passed 4/4 tests. Ticket #21 identifies the
  missing double-leading-slash case.
- `vp run docs:check` and `git diff --check` passed.
- `vp check` stopped at 14 formatting issues in pre-existing owner files. No
  ticket or acceptance file from this audit appears in that list.
- The worktree now has 528 entries: the original 509 entries plus 19 files from
  this audit. No unrelated owner file was reformatted or reverted.

## Resume here

The owner confirmed that `.claude/tickets` is the only writable task-state
store. `/admin` must edit and project that board. Stable references remain in
`.claude/current`. Roadmap and status views become generated outputs. Git
history stores retired plans and completed operational records.

The task-state cutover is implemented in the working tree. `/admin` reads and
writes `.claude/tickets`. All unique active current-document tasks now have
ticket records. `.claude/current` contains no `tasks:` or roadmap `items:`
frontmatter. `status.md` and `roadmap.md` are generated from the board and name
their source revision.

The board now contains 117 tasks and 12 initiatives. Their global IDs run from
#1 through #129.
No milestone name was invented. The generated board validation reports no
schema or hierarchy errors.

The retirement pass reduced `.claude/current` from 25 files and approximately
14,586 lines to 13 files and approximately 1,143 lines. Open recertification
and upstream-release branches now have atomic tickets. Completed plans and
logs live only in Git history.

Continue with evidence generation in #14, the retained-prose rewrite in #15,
and the remaining contract checks in #16. Use #13 for the completed retirement
census and dependency map.

The final cleanup checks passed: `docs:check`, 24 `/admin` tests, the web
typecheck, the pinned upstream-oracle guard, the 13-file local-link scan, and
`git diff --check`.

Work that does not depend on the task-store decision can continue in this
order:

1. Fix #21 because it is a narrow URL-boundary defect in uncommitted work.
2. Replace the false Table regression in #20 with a real reactive and browser
   transition.
3. Resolve the owner-steered public Menu state contract, then complete #17.
4. Prove focus scheduling in #18 and built-package JSX refs in #23.
5. Continue the acceptance evidence model in #11.
6. Resolve source-map policy in #22.

Use #19 for the separate attribution inventory. Keep later prose changes within
the retained set recorded by #13.

## Done when

- One short operational surface identifies the current state and next action.
- One structured task source owns work state.
- Stable references do not repeat volatile status facts.
- Completed plans and logs do not remain in the live documentation surface.
- Retained prose is STE-aligned and preserves technical meaning.
- Executable checks enforce the documented organization.

## Relationship

Coordinates #11 through #23. Existing tickets #1, #3, #4, #5, #6, and #9 keep
their current scope.
