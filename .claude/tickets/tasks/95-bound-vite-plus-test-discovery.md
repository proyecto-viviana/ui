---
id: 95
type: task
title: "Bound Vite Plus test discovery"
created: 2026-08-20
parent: 27
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from adversarial finding A-024" }
---

A cold Vite Plus test dependency scan can traverse ignored or vendored HTML
outside the package-test surface. `noDiscovery` did not make the scan hermetic.

## Scope

- Identify the inputs that enter the cold dependency scan.
- Reduce or explicitly bound discovery to intended test sources.
- Add a regression fixture that proves ignored and vendor trees cannot affect
  test collection or diagnostics.

## Done when

The cold scan reads only declared test inputs, and an out-of-scope fixture fails
before the fix and passes after it.
