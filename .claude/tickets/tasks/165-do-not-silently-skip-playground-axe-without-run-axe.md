---
id: 165
type: task
title: "Do not silently skip playground axe without RUN_AXE"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
---

## Cause

`playground-axe.spec.ts` and `contrast.spec.ts` `test.skip` when `RUN_AXE` is
unset. Named CI scripts set the env. A bare Playwright run on those files
exits 0.

## Work

Fail closed when the env is missing, or make skip impossible in CI configs.

## Done when

Forgetting `RUN_AXE=1` cannot produce a green axe job.

## Relationship

F-TEST-010. Not #91.
