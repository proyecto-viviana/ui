---
id: 212
type: task
title: "Fail packed-consumer smoke if a Button import retains Table or Color"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
---

## Cause

Pack comments claim a single-primitive import compiles only that graph.
`sideEffects` and thin `dist/index.jsx` barrels are the structure that
would make it true; no gate proves it. `scripts/consume-pack-smoke.mjs:154-161`
imports `@proyecto-viviana/ui/Button` and Kumo Button and asserts rendered
HTML only. Styled Button imports `{ Button, DialogTriggerContext,
PopoverTriggerContext }` from the RAC root barrel, and RAC Button imports
from the solidaria root barrel, so tree-shaking depends entirely on the
consumer honoring `sideEffects`.

## Work

Extend the packed-consumer fixture to build a consumer bundle and fail if
collection / color / dnd / generated-locale modules remain in the graph for
a Button-only import.

## Done when

`import { Button } from "@proyecto-viviana/ui/Button"` produces a consumer
bundle with none of the forbidden modules, and the check runs where #146
puts the smoke.

## Relationship

F-PERF-004. Delta on #146.
