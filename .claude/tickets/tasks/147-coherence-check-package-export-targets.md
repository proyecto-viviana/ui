---
id: 147
type: task
title: "Coherence-check package export targets"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
---

## Cause

`guard:package-artifacts` fails only when a path is missing. `import` and
`default` may point at different files. Types may not sit next to JS.

## Work

Reject split CSS conditions and types/JS layout skew. Add negative fixtures.

## Done when

The CSS `default`/`import` split and the stately flags types/JS split would
fail the guard.

## Relationship

F-PACKAGING-003. #47 remains the Vite Plus dts migration.
