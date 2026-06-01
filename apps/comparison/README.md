# Comparison App

Side-by-side parity harness for Adobe React Spectrum S2 and
`@proyecto-viviana/solid-spectrum`.

## Boundary

The comparison app verifies S2 parity. It may use `solid-spectrum` for the docs
shell/chrome, but it must not implement or patch S2 component-internal styling
with app CSS.

Read
[`docs/adr/0001-s2-styling-source-of-truth.md`](../../docs/adr/0001-s2-styling-source-of-truth.md)
before adding styled component work.

## Commands

```bash
vp run comparison:dev
vp run comparison:build
vp run comparison:typecheck
vp run comparison:report:parity
vp run comparison:report:parity:strict
vp run comparison:report:gaps
vp run comparison:report:exports
vp run comparison:test:default
vp run comparison:test:button
```

## Component Passes

Use [Component Playbook](./COMPONENT_PLAYBOOK.md) for component validation work.
The task order lives there; detailed prompts and component notes live in
[playbook/](./playbook/). Open only the current task checklist so the pass stays
focused.

## Current Coverage

Routes are generated from the official React Spectrum S2 catalogue. Missing
Solid implementations stay visible as gaps.

Current local report snapshot (2026-06-01): `69` official entries tracked,
`69` live on both stacks, `0` missing/gap catalogue entries, `349` visual
states tracked, `113` with current visual evidence, `56` with strict pair-diff
tests, and `0` blocked visual-state rows.

The strict parity report is green: modeled controls, validation notes, and
current visual/asserted evidence are all `69/69`. The gap report has no
missing/gap catalogue entries or blocked visual-state rows.

Use the reports as the current roadmap:

```bash
vp run comparison:report:parity
vp run comparison:report:parity:strict
vp run comparison:report:gaps
vp run comparison:report:exports
```

## CSS Boundary

Allowed hand-written comparison CSS:

- harness layout and framing
- comparison controls
- parity/status panels
- screenshot frames
- temporary docs-shell scaffolding during the solid-spectrum chrome migration

Not allowed:

- component-internal colors
- component-internal padding
- component-internal radius
- component visual states
- new `.comparison-spectrum-*` component-internal rules

Preferred docs-shell styling is `solid-spectrum` plus the S2 style macro. If a
route needs component visual parity, fix `packages/solid-spectrum`; do not fake
the component from `apps/comparison/src/styles/global.css`.
