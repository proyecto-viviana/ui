---
id: 14
type: task
title: "Generate volatile status facts"
created: 2026-08-20
parent: 28
status: verified
history:
  - {
      state: open,
      at: 2026-08-20,
      note: "opened because measured facts are copied across current documents",
    }
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "generated ticket status and roadmap views with a deterministic board revision",
    }
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "regenerated and validated the views for the 117-task, 12-initiative board with zero board problems",
    }
  - {
      state: merged,
      at: 2026-08-20,
      note: "added structured provenance to the generated WCAG report and validation to docs:check",
    }
  - {
      state: verified,
      at: 2026-08-20,
      note: "270 D7/D8 browser cases, five provenance fixtures, and docs:check pass",
    }
---

Exact counts and test outcomes appear in several current documents. Manual
copies drift after each run and make prose a second source of truth.

## Scope

- Inventory every repeated count, revision, package version, and gate outcome.
- Identify the executable or typed source for each fact.
- Generate the operational summary and `/admin` view from those sources.
- Record when and at which revision a test result was produced.
- Keep explanations in stable documentation. Keep measured values in generated
  output or evidence records.
- Make stale generated output detectable.
- Treat `apps/comparison/e2e/reports/wcag-aaa-report.md` as generated evidence.
- Record its generation command, source revision, timestamp, and result scope.

## Done when

No volatile measured fact requires synchronized edits in multiple prose files.
The operational view identifies its source and evidence revision.

## Verified evidence

`scripts/generate-work-views.ts` now generates `status.md` and `roadmap.md` from
the ticket board. It hashes every ticket file and records the source revision.
`docs:check` fails when either view is stale.

The WCAG report records its generator, command, Git revision, clean-source
state, UTC timestamp, result, and observed D7/D8 scope. The visible counts must
match that structured scope.

The report came from clean revision `2d8b519453c511d8b1a60cbbb174e2a4a3abba02`.
All 270 selected browser cases passed. Five drift fixtures and `docs:check`
enforce the report contract.

## Relationship

Depends on the evidence model in #11 and the authority decision in #12. Supports
the reduction in #13.
