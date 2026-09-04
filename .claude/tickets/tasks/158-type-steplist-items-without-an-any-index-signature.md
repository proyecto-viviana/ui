---
id: 158
type: task
title: "Type StepList items without an any index signature"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
---

## Cause

Public `StepListStateProps.items` is `Array<{ key: Key; [key: string]: any }>`.
Returned `items` is only `Array<{ key: Key }>`.

## Work

Narrow the public item shape.

## Done when

The public type does not use an `any` index signature.

## Relationship

F-TS-009. Not #98 or #99.
