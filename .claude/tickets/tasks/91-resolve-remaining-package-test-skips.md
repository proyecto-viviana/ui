---
id: 91
type: task
title: "Resolve remaining package test skips"
created: 2026-08-20
parent: 24
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from adversarial finding A-022" }
---

Six package-test skips remain classified. The actionable cases are a full-width
TimeField input path and a Table `scrollRef` placeholder. Three React
Suspense-only cases and one jsdom geometry case need an explicit environment
classification.

## Scope

- Replace the full-width TimeField skip with a browser or component-level test
  that exercises the real input path.
- Convert the Table `scrollRef` placeholder to an explicit inventory record or
  a behavior test.
- Keep framework-only and environment-only exclusions explicit.
- Report package skips separately from certified `fixme` cases and deferred
  acceptance branches.

## Done when

Each current skip proves a necessary environment boundary or is replaced by a
runnable behavior test.
