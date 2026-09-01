---
id: 161
type: task
title: "Gate certified-suite skipped counts against registered divergences"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
---

## Cause

`lastFullCertifiedSuiteRun` is `skipped: 4` with four `knownDivergences`.
`acceptance-schema.test.ts` still names six fixmes including DatePicker
open-escape-close keys that the inventory will not find. `test:comparison-data`
runs only `prop-tables.test.ts`. Certification Gates still comments
"6 skipped".

## Work

Run the evidence validator in CI. Update the stale six-name list and the
workflow comment.

## Done when

A drift between recorded skipped counts and registered divergences fails CI.

## Relationship

F-TEST-002.
