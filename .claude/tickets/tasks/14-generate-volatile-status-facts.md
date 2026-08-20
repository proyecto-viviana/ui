---
id: 14
type: task
title: "Generate volatile status facts"
created: 2026-08-20
parent: 28
status: in-progress
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

## Progress checkpoint

`scripts/generate-work-views.ts` now generates `status.md` and `roadmap.md` from
the ticket board. It hashes every ticket file and records the source revision.
`docs:check` fails when either view is stale.

This completes work-state generation only. Test results, report provenance, and
the WCAG report metadata still need structured evidence sources.

## Relationship

Depends on the evidence model in #11 and the authority decision in #12. Supports
the reduction in #13.
