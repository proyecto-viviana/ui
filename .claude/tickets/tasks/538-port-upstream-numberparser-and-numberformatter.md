---
id: 538
type: task
title: "Port upstream NumberParser and NumberFormatter into createNumberFieldState"
created: 2026-09-17
status: merged
history:
  - {
      state: open,
      at: 2026-09-17,
      note: "Filed after the fact. The work landed in 4ade6b3c without an owning ticket; this ticket records it.",
    }
  - {
      state: merged,
      at: 2026-09-17,
      note: "4ade6b3c. createNumberFieldState now imports NumberFormatter and NumberParser from @internationalized/number instead of hand-rolling parse and format. Net -47/+28 in the state file. Adds @internationalized/number ^3.6.7 as a solid-stately runtime dependency; the owner ratified that dependency on 2026-09-17 after it was committed without prior approval. Changeset filed in the same commit as this ticket.",
    }
---

Replace `createNumberFieldState`'s hand-rolled number parsing and
formatting with Adobe's `@internationalized/number`, the same source
upstream `useNumberFieldState` uses.

## Scope

- `packages/solid-stately/src/numberfield/createNumberFieldState.ts`
- `packages/solid-stately/package.json`, `pnpm-lock.yaml` — the new
  runtime dependency.
- Not the NumberField component, its ARIA layer, or its styled siblings.

## Done when

`createNumberFieldState` holds no local parse or format arithmetic, and
`solid-stately` declares `@internationalized/number` as a dependency with
a changeset covering the bump.

## Relationship

Sibling of the existing `@internationalized/date` dependency in the same
package. Feeds #350. Under the #443 release train: `solid-stately` is
releasable and public, so the dependency bump is part of that train.

## Proof

Working directory: `ui`.

| Kind   | Command             | Result                                                                        |
| ------ | ------------------- | ----------------------------------------------------------------------------- |
| source | `git show 4ade6b3c` | 3 files; `@internationalized/number ^3.6.7` added to `packages/solid-stately` |
| local  | `pnpm run check`    | exit 0; 4258 files formatted, 0 lint findings in 3111, `tsc --noEmit` clean   |
