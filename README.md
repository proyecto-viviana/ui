# Proyecto Viviana

SolidJS ports of Adobe's React accessibility and Spectrum stacks:

| Package                                  | Role                                                    |
| ---------------------------------------- | ------------------------------------------------------- |
| `@proyecto-viviana/solid-stately`        | Solid port of React Stately state primitives.           |
| `@proyecto-viviana/solidaria`            | Solid port of React Aria hooks and behavior primitives. |
| `@proyecto-viviana/solidaria-components` | Solid port of React Aria Components.                    |
| `@proyecto-viviana/solid-spectrum`       | Spectrum 2 styled Solid components.                     |

This project is not production-ready. Use it as a parity port and test bed until
the release policy says otherwise.

## Current Shape

Last refreshed from local reports on 2026-05-15:

- React Aria Components named exports: `0` missing from
  `solidaria-components`.
- Spectrum S2 catalogue: `69` official entries tracked, `33` live on both
  React and Solid sides, `36` still missing or blocked.
- Visual parity coverage: `172` official states tracked, `49` with current
  React/Solid visual evidence, `32` with strict pair-diff tests.
- `solid-spectrum` root catalogue exports are present, but many support exports
  are still missing: contexts, slots, hooks, and helpers.

Export parity is not behavior parity. A component is not done until source,
ARIA behavior, keyboard flows, interaction timing, styling, and visual tests all
match the upstream contract.

## Daily Commands

```bash
vp install
vp run check
vp test run packages
vp run comparison:dev
vp run comparison:report:gaps
vp run comparison:report:exports
vp run guard:rac-export-gap
```

Use `vp` commands for repo work. Raw package-manager commands are only for
debugging package-manager-specific behavior.

## How To Pick Work

For styled Spectrum parity, start with the gap report:

```bash
vp run comparison:report:gaps
```

Pick one missing or partial component, then follow
[`apps/comparison/COMPONENT_PLAYBOOK.md`](apps/comparison/COMPONENT_PLAYBOOK.md).
The comparison app is the verification harness; component styling belongs in
`packages/solid-spectrum`, not in app CSS.

For React Aria Components parity, start with:

```bash
vp run guard:rac-export-gap
```

The current export gap is closed, so new work should focus on behavior,
accessibility, and test parity rather than adding names to the barrel.

## Docs Map

- [`docs/CURRENT_STATUS.md`](docs/CURRENT_STATUS.md): current gap snapshot and
  next priorities.
- [`docs/tooling.md`](docs/tooling.md): command layer, checks, and local AI
  documentation tooling.
- [`docs/release-policy.md`](docs/release-policy.md): package release rules.
- [`docs/adr/0001-s2-styling-source-of-truth.md`](docs/adr/0001-s2-styling-source-of-truth.md):
  styling source-of-truth rule for Spectrum 2 parity.
- [`apps/comparison/README.md`](apps/comparison/README.md): comparison app
  boundary and commands.
