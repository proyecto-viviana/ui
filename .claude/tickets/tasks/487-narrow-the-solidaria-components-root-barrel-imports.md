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

## VisualMode consumer request — 2026-09-06

Cross-repository consumer: [VisualMode #9168](../../../../visualmode/visualmode/.claude/worktrees/voxel-editor-delivery/.claude/tickets/tasks/9168-unify-editor-visuals.md)
in `visualmode/visualmode/.claude/worktrees/voxel-editor-delivery`, at
`bc3e99dd31332a2cfcf9d6038cf72c833f0381b0` plus its protected uncommitted
editor candidate. This is VisualMode's ticket, not UI #9168. Its
[research](../../../../visualmode/visualmode/.claude/worktrees/voxel-editor-delivery/.claude/vivianastack/editor-visuals/research.md)
records 502,078 Brotli bytes across all `dist/client/assets/*.js` against
480,000 (22,078 over); the earlier displayed receipt was 457.62 kB.
Provider, Toolbar, ActionButton, ToggleButton, Menu, MenuItem, and Text
must remain in the consumer.

Please acknowledge this consumer on the UI lane and, if direct assistance
is needed, hand off the implementation explicitly before another writer
starts. This existing task owns source reachability; #225 owns packed
per-export minified/Brotli costs; #448 owns release. Module counts do not
prove compressed-byte savings, and no 22,078-byte saving is established for
this change. Keep this task's Done when unchanged. UI source/check evidence
and the consumer's later native build/size measurement are separate proof.
