---
id: 487
type: task
title: "Narrow the solidaria-components root-barrel imports"
created: 2026-09-06
parent: 32
status: open
history:
  - {
      state: open,
      at: 2026-09-06,
      note: "split out of #485: 60 source files, and the reason every styled component entry still resolves 90 solidaria modules",
    }
---

Every published component entry of `@proyecto-viviana/ui` and
`@proyecto-viviana/solid-spectrum` resolves 90–92 `solidaria` modules no matter
which symbols it asks for, because it resolves `solidaria-components` on the
way and `solidaria-components` imports the `@proyecto-viviana/solidaria` root
barrel.

## Cause

`packages/solidaria-components/src` has **60** files importing
`from "@proyecto-viviana/solidaria"`. Measured against built `dist`, a
`viviana-ui` component entry reaches 165–191 modules, of which 72 are
`solidaria-components` and 90–92 are `solidaria`. Narrowing a component's own
root-barrel specifier does not move that number: the count is set one layer
down.

#485 proved the shape of the fix on the entries that reach `solidaria`
**directly** (both `Provider`s, `ButtonGroup`, `ProgressBar`, `ProgressCircle`),
taking each from 90 solidaria modules to 8–17. Those five are the only entries
that could be fixed without touching this package.

## Work

- Narrow the 60 specifiers in `packages/solidaria-components/src` to the
  declared `solidaria` subpaths. `scripts/entry-import-budget.json` holds the
  frozen inventory; removing a path from it is free.
- Re-measure the component entries afterwards and add ceilings for the ones
  that actually drop, so `guard:entry-import-budget` holds them.
- Update `scripts/entry-import-budget.json` with `--write-baseline` and say in
  the ticket what each entry went from and to.

## Out of scope

- Splitting `solidaria`'s own barrels. This is about what the consumer asks for,
  the same boundary #485 kept.
- Publishing. That is #448 under #443.

## Done when

`packages/solidaria-components/src` has no root-barrel import left, the
inventory in `scripts/entry-import-budget.json` shrank by 60, the component
entries that dropped carry ceilings, and a changeset is present.

## Relationship

Child of #32. Follow-up to #485, which measured the split and fixed the
directly-reaching half.
