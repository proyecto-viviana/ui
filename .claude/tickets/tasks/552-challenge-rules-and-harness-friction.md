---
id: 552
type: task
title: "Challenge rules and harness friction met during the campaign"
created: 2026-09-20
parent: 544
status: in-progress
history:
  - {
      state: in-progress,
      at: 2026-09-20,
      note: "owner, 2026-09-20: do not take the system as it is; improve it, make it clearer, and challenge unnecessary rules as a standing side-track of the real work. Repo-local items are fixed in their own commit. Hub and harness items are proposed to the owner one at a time",
    }
---

## Scope

A running list. Each item says what cost time, why, and the smallest change
that removes it. Prefer removing a collision to adding a rule or an exception.

### Fixed here

1. **The pre-commit hook was dead.** `core.hooksPath` still named the
   repository's old location, a directory that no longer exists, so
   `vp staged` never ran. That is how `163f4377` put a syntax error and 373
   unformatted files on main. Repointed to the relative `.vite-hooks/_`.
   Open: nothing reinstalls it on a fresh clone; add a `prepare` script or a
   `guard:git-hooks` in `pr:check:fast`.
2. **Receipts against the formatter.** A receipt may not be edited after its
   day, but the format gate covered `.agents/`, so a receipt not formatted on
   its day became a permanent CI failure. `.agents/**` left the formatter
   (`acb75aa4`).

### Proposed, this repository

3. **`blocked: true` carries no reason.** The reason hides in a history note
   and nothing clears the flag. Replace with `blocked_by: [545, 139]`; the
   generator can render it and report when every blocker is verified.
4. **History notes are paragraphs.** #87 repeats "no dependency, hold,
   certification or release boundary changes" in nearly every entry. A note
   should be one fact and its proof. Standing boundaries belong once, in the
   body.
5. **Nobody reads CI (fixed: `AGENTS.md` Start now asks).** Release Readiness, Certification Gates, and Site Gate
   failed on every one of the last eleven pushes to main on 2026-09-20, from
   `5f150d2f` through `77f0de27`, and each session committed on top. The start
   ritual names five documents to read and no step that asks whether main is
   green.

### Proposed, hub and harness (owner's call)

6. **A Claude worker silently spends the most expensive model.** The host
   default is Fable and `engine start` forwards `--model` only when given; the
   flag is undocumented. Make the harness choose the model from the role
   (Decision 040) and refuse a Claude launch that names none.
7. **The runtime catalogs one repository.** Launching into any other checkout
   needs a hand-written JSON environment variable. Derive the catalog from
   `eligibility.json`.
8. **`engine start --help` returns an error,** not help. The flags are
   learnable only from source.
9. **`ELIGIBILITY.md` is forty rows of "yes".** A table where every row
   agrees tells a reader nothing. List only the exceptions.
10. **An AGY worker cannot work unattended, and the harness cannot see it.**
    AGY asks permission for each shell command; `audit-claims` stopped on its
    first `ls`. `engine list` and `engine probe` both report `idle` and
    `promptable: true` while the pane shows a permission menu, so a conductor
    believes the task finished or never began. `start-flags.ts` has approval
    flags for Codex only. Two changes: detect the menu and report `blocked`;
    and give the owner one place to pre-approve a read-only command set for
    AGY workers, since a conductor must not answer another agent's prompt.
11. **`engine start` prints the whole task text twice** in its JSON reply. A
    two-kilobyte brief costs the conductor four on every launch. Echo the
    delivery id and a hash.
12. **`engine list --kind` help names three kinds;** `agy` is the fourth and
    works.

### Added while the 2026-09-20 audit ran

13. **A ticket edit makes two generated board views stale,** so
    `docs:generate` has to ride in the same commit. Pure mechanical coupling;
    generate in the pre-commit hook instead. _(this repository)_
14. **`vp run check` on a dirty tree does not prove HEAD.** Two dirty files
    hid a format failure. The CI-parity check needs a clean tree, or a
    worktree it can check without stashing. _(this repository)_
15. **The one-writer rule's real cause is the shared index and a pre-commit
    hook that stashes unstaged tracked changes,** not the work itself.
    Untracked files under `.agents/` are safe — the formatter ignores
    `.agents/**` and lint-staged leaves untracked files alone — so read-only
    lenses and out-of-tree drafters can run beside a writer. Worktrees with
    disjoint paths are the sanctioned escape (the VisualMode exception);
    propose the same for ui docs work. _(hub)_
16. **Claude Code's `bashEditDiff` credits a concurrent session's file change
    to whichever Bash call was running.** A read-only auditor's pane showed
    "Updated apps/web/package.json" that it never wrote. Cosmetic, but it
    reads as a rule breach; verify through the transcript's `tool_use`, not
    the pane. _(harness)_
17. **The attribution local-review contract hashes raw bytes of 254 files,**
    so any formatter or codemod run turns `guard:attribution-headers` red
    with zero licence signal — it did, on the Solid 2 codemod, for 63 files.
    Hash a normalised form (whitespace and import lines stripped), or key the
    review on "no Adobe header and no upstream counterpart" instead of bytes.
    _(this repository)_
18. **An AGY worker cannot be launched unattended.** The CLI has `--sandbox`
    and `--dangerously-skip-permissions`; the harness exposes neither
    (`os/packages/providers/src/engine/driver.ts` `agentArgs`). Grok launches
    always-approve and Codex has sandbox and approval flags, so AGY alone is
    unusable unattended — lens 4 had to be run headless from a shell.
    Proposal: one public `--unattended` start flag for agy, mapping to
    `--dangerously-skip-permissions`, refused unless the task file is under
    60 lines — the owner's "small tasks only" rule made mechanical. Extends
    item 10. _(harness)_

## Done when

The campaign ends with each item fixed, ticketed where it belongs, or rejected
by the owner.

## Proof

Each fixed item names its commit. Each proposal names the file it would change.

## Relationship

Child of #544. Hub and harness items need tickets in `vivianastack` or
`viviana-ai` once the owner accepts them.
