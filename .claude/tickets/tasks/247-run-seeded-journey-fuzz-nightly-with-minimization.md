---
id: 247
type: task
title: "Run seeded journey fuzz nightly with minimization"
created: 2026-09-02
parent: 243
status: in-progress
history:
  - {
      state: open,
      at: 2026-09-02,
      note: "opened for the D13 interaction-journeys certification (owner decision 2026-09-02)",
    }
  - {
      state: in-progress,
      at: 2026-09-02,
      note: "journeys-nightly.yml: schedule + dispatch, ComboBox/Picker matrix, date seed, artifacts, summary; local seed=7 dry run minimized to one click",
    }
---

## Work

Wire `journeyFuzz` (#244) into `.github/workflows/journeys-nightly.yml`:
one job per certified component with journeys, fixed seed derived from the
date, a time budget, artifacts for minimized failures, and a summary table.
A minimized failure opens or updates a ticket body draft under
`output/` for the orchestrator to file. Never runs on PRs.

## Done when

The workflow parses, a local dry run with a tiny budget completes, and a
seeded failure injected in /tmp is minimized to a stable journey.

## Landed

`.github/workflows/journeys-nightly.yml`:

- Triggers: nightly cron `17 6 * * *` (UTC) and `workflow_dispatch`. No
  `pull_request`.
- Matrix: ComboBox (`combobox.certified.spec.ts`) and Picker
  (`picker.certified.spec.ts`), `fail-fast: false`.
- Same setup as Certification Gates: checkout, pnpm, Node 22, pinned
  upstream oracle, frozen-lockfile install, Playwright Chromium.
- `JOURNEY_SEED=$(date -u +%Y%m%d)`, `JOURNEY_FUZZ=1`,
  `JOURNEY_BUDGET_MS=180000`, `JOURNEY_MAX_STEPS=16`.
- Builds with `comparison:build`, then Playwright grep `D13 fuzz` on that
  component spec only (seed journeys stay off this job).
- Artifacts: `e2e/journeys/minimized`, Playwright report/results, and
  `output/d13-journey-fuzz-*.md` ticket drafts.
- Step summary table: component, seed, budget, pass/fail.

Local dry run (`JOURNEY_SEED=7`, 120s budget, ComboBox): generated one
`click trigger` step (deterministic across two generate() calls), failed the
same ComboBox overlay DOM contract as the seed journeys, ddmin kept that
single step, wrote `e2e/journeys/minimized/combobox-7.json`.

`python3 -c "import yaml; yaml.safe_load(open('.github/workflows/journeys-nightly.yml'))"`
parses.

## Relationship

Child of #243. Depends on #244.
