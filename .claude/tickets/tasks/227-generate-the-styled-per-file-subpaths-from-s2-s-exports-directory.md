---
id: 227
type: task
title: "Generate the styled per-file subpaths from S2's exports directory"
created: 2026-09-01
parent: 33
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from owner decisions on the round-2 audit" }
---

## Cause

Owner decision on #219 item 3. `packages/solid-spectrum/src/Button.ts` is
`export * from "./button"` (the whole family); S2's `exports/Button.ts`
exports `Button`, `ButtonContext`, `Text`. `./Picker` has the same shape.

## Work

Generate the styled per-file subpath modules from the pinned S2
`packages/@react-spectrum/s2/exports/*.ts` list: one file per S2 export
file, exporting exactly the names S2 exports there. Add a guard that fails
when a generated file drifts from its S2 source. Apply to both styled
packages (`viviana-ui` mirrors `solid-spectrum`). Changeset (major-adjacent:
family re-exports disappear from per-file subpaths; the owner sets the bump).

## Done when

Every `./<Name>` subpath of `@proyecto-viviana/solid-spectrum` exports the
same names as S2's `exports/<Name>.ts`; the drift guard is on Certification
Gates.

## Relationship

Owner decision on #219 item 3. Coordinates with #221 (barrel) and #226.
