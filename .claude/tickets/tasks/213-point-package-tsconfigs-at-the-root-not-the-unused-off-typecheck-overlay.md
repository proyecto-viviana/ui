---
id: 213
type: task
title: "Point package tsconfigs at the root not the unused-off typecheck overlay"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
---

## Cause

`tsconfig.typecheck.json` exists to turn unused checks off for the CI gate.
#156 made solid-stately, solidaria, solidaria-components, and kumo extend
that overlay, so package-local `tsc` inherits `noUnusedLocals: false`,
`noUnusedParameters: false`, `noEmit: true`, `types: ["node"]`; solid-stately
`tsconfig.build.json` extends it for declaration emit. solid-spectrum still
extends the root and includes `test/**/*`; viviana-ui has only a
`tsconfig.build.json` naming weaker flags. #156's done-when said packages
"either extend the root or name their weaker flags"; the family is split
three ways and the shared choice is the weaken-unused file.

## Work

Make every package tsconfig extend the root, name weaker flags only in
`tsconfig.build.json` where emit needs them, and keep the CI overlay for the
gate alone.

## Done when

No package tsconfig extends `tsconfig.typecheck.json`; package-local `tsc`
sees unused bindings.

## Relationship

F-TS-011. Completes #156's config half; the flag decision stands. #155 owns
tests in the gate.
