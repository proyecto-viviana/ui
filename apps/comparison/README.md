# Comparison App

Side-by-side parity harness for Adobe React Spectrum S2 and
`@proyecto-viviana/solid-spectrum`.

## Boundary

The comparison app verifies S2 parity. It must not implement S2 component
styling.

Read
[`docs/adr/0001-s2-styling-source-of-truth.md`](../../docs/adr/0001-s2-styling-source-of-truth.md)
before adding styled component work.

## Commands

```bash
vp run comparison:dev
vp run comparison:build
vp run comparison:typecheck
vp run comparison:report:gaps
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

Current local report snapshot (2026-05-15): `69` official entries tracked,
`33` live on both stacks, `36` still missing or blocked, `172` visual states
tracked, `49` with current visual evidence, and `32` with strict pair-diff
tests.

Use the reports as the current roadmap:

```bash
vp run comparison:report:gaps
vp run comparison:report:exports
```

## CSS Boundary

Allowed comparison CSS:

- page shell
- controls
- panels
- screenshot frames

Not allowed:

- component colors
- component padding
- component radius
- component visual states
- new `.comparison-spectrum-*` component-internal rules
