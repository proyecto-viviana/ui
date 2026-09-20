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

## Done when

The campaign ends with each item fixed, ticketed where it belongs, or rejected
by the owner.

## Proof

Each fixed item names its commit. Each proposal names the file it would change.

## Relationship

Child of #544. Hub and harness items need tickets in `vivianastack` or
`viviana-ai` once the owner accepts them.
