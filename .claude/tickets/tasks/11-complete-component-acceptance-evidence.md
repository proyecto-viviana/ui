---
id: 11
type: task
title: "Complete the component acceptance evidence model"
created: 2026-08-20
parent: 24
status: verified
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
  - {
      state: next,
      at: 2026-08-21,
      note: "selected by the documented order in tickets #10 and #87 after the release and documentation reorganization closed",
    }
  - {
      state: in-progress,
      at: 2026-08-21,
      note: "implementing exact runnable evidence pointers, recorded certified-run evidence, and a separate full-acceptance command",
    }
  - {
      state: verified,
      at: 2026-08-21,
      note: "proved exact runnable-title resolution, recorded the successful 2170/0/6 certified run, kept the frozen strict guard green, and held the full acceptance backlog red",
    }
---

The current report is an inventory. It does not prove current component
acceptance. This distinction is correct, but the remaining evidence model is
not complete.

## Resolved in this review

- `--strict-full` now implies `--strict` and exits 1 on the current backlog.
- `pending` now reports as unnormalized instead of silently becoming
  `not-started`.

## Backlog exposed by the model

- Only 15 of 66 validation notes report ten complete gates.
- Thirty-six notes have no gate summary.
- Ninety-one gate outcomes are unnormalized.
- Three hundred thirty-nine current visual-state claims still use legacy
  file-only evidence. ActionMenu is the first reviewed structured migration.
- Validation notes repeat large prose templates but still omit resolved test
  titles. The volume does not provide stronger evidence.

## Scope

- [x] Make full-strict behavior unambiguous and hold it with a regression test.
- [x] Store structured evidence pointers with a file and test title.
- [x] Resolve each pointer to an existing runnable test case.
- [x] Use only `complete`, `partial`, and `not-started` as canonical outcomes.
- [x] Report noncanonical source text until each note is migrated.
- [x] Record the last full certified run with revision, passed, failed, and skipped
      counts.
- [x] Provide a command that fails when required acceptance evidence is incomplete.
- [x] Keep the frozen baseline command as a regression guard with a precise name
      and description.
- [x] Keep repeated state evidence in the typed model instead of copying it into
      validation-note prose.
      Keep component-specific decisions and failure modes near the component.

## Checkpoint

The report now resolves `{file, title}` pointers from the TypeScript test source.
ActionMenu's 11 current visual states are the first structured migration. The
report counts 339 remaining file-only state claims as legacy and does not accept
them. It combines this evidence with the ten canonical gate outcomes, so the
current honest result is `0 / 78` accepted components.

The recorded successful certified run is revision
`0f1e1198963c46eb3294744475e269a7c0041eb6`, run `32485238975`, job
`96780157126`: 2,170 passed, 0 failed, and 6 skipped out of 2,176. The six skips
match the six registered known divergences.

Verification on 2026-08-21:

- `vp test run apps/comparison/src/data/acceptance-schema.test.ts apps/comparison/src/data/report-component-parity-options.test.ts` — 12 passed.
- `vp run comparison:report:parity:strict` — passed with no new gaps outside
  the frozen baseline.
- `vp run comparison:report:acceptance` — exited 1 on the known full-acceptance
  backlog, as required.
- `vp run check` — formatting, lint, and typecheck passed.

## Done when

A component can be accepted only when every required gate has a canonical
outcome and current runnable evidence. A regression test fails if full-strict
mode silently returns success on a known full backlog.

## Relationship

Continues A-002 through A-005. It complements completed ticket #2. Ticket #2
freezes new catalogue divergence. This ticket proves current acceptance.
Tickets #17, #18, and #20 supply missing behavior evidence found in the latest
work. Ticket #23 supplies built-package regressions for JSX-ref behavior.
