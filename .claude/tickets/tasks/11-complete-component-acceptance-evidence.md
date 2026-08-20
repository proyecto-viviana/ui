---
id: 11
type: task
title: "Complete the component acceptance evidence model"
created: 2026-08-20
parent: 24
status: open
history:
  - { state: open, at: 2026-08-20, note: "opened from the acceptance-schema review of a8ecda44" }
  - {
      state: open,
      at: 2026-08-20,
      note: "made --strict-full imply strict mode and added unit and command regressions",
    }
  - {
      state: open,
      at: 2026-08-20,
      note: "stopped translating pending into the canonical not-started outcome",
    }
---

The current report is an inventory. It does not prove current component
acceptance. This distinction is correct, but the remaining evidence model is
not complete.

## Resolved in this review

- `--strict-full` now implies `--strict` and exits 1 on the current backlog.
- `pending` now reports as unnormalized instead of silently becoming
  `not-started`.

## Open gaps

- Visual evidence pointers identify files but not runnable test titles.
- Only 15 of 66 validation notes report ten complete gates.
- Thirty-six notes have no gate summary.
- Ninety-one gate outcomes are unnormalized.
- The report does not record the last full-suite revision and three-count as
  current executable evidence.
- Validation notes repeat large prose templates but still omit resolved test
  titles. The volume does not provide stronger evidence.

## Scope

- [x] Make full-strict behavior unambiguous and hold it with a regression test.
- Store structured evidence pointers with a file and test title.
- Resolve each pointer to an existing runnable test case.
- [x] Use only `complete`, `partial`, and `not-started` as canonical outcomes.
- Report noncanonical source text until each note is migrated.
- Record the last full certified run with revision, passed, failed, and skipped
  counts.
- Provide a command that fails when required acceptance evidence is incomplete.
- Keep the frozen baseline command as a regression guard with a precise name
  and description.
- Generate repeated note structure from the evidence model when practical.
  Keep component-specific decisions and failure modes near the component.

## Checkpoint

`parseParityReportOptions` now makes `--strict-full` imply strict mode. A unit
test holds the option contract. A command test runs the report against the
current backlog and requires exit code 1. `pending` now reports as unnormalized
source text. The focused nine-test run passed.

## Done when

A component can be accepted only when every required gate has a canonical
outcome and current runnable evidence. A regression test fails if full-strict
mode silently returns success on a known full backlog.

## Relationship

Continues A-002 through A-005. It complements completed ticket #2. Ticket #2
freezes new catalogue divergence. This ticket proves current acceptance.
Tickets #17, #18, and #20 supply missing behavior evidence found in the latest
work. Ticket #23 supplies built-package regressions for JSX-ref behavior.
