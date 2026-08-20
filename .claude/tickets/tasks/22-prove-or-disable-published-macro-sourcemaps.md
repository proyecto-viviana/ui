---
id: 22
type: task
title: "Prove or disable published macro source maps"
created: 2026-08-20
parent: 27
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated A-017 from the latest-work build review" }
---

The six-package build passes, but styled package builds emit repeated
`SOURCEMAP_BROKEN` warnings for files transformed by `unplugin-macros`.
Existing structural checks prove that map JSON parses and references existing
files. They do not prove that generated positions map to authored positions.

## Scope

- Create a small style-macro fixture with known authored and generated
  locations.
- Resolve a generated location back to its source with a standard source-map
  consumer.
- Fix the transform map chain if the resolved position is wrong.
- If accurate maps cannot be produced, disable misleading maps explicitly and
  document the release tradeoff.
- Remove the unused `@adobe/spectrum-tokens` `deps.onlyBundle` entry if the
  current build confirms that it has no effect.
- Add a guard that fails on an unreviewed broken-map warning.

Do not treat parseable map JSON as mapping-fidelity evidence.

## Done when

The build is warning-free for this condition and a regression proves the
selected source-map policy.

## Relationship

Carries forward adversarial-audit finding A-017. Supports the build migration
review in ticket #10.
