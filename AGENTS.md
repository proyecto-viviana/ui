# ui

Proyecto Viviana's published Solid design-system family: an evidence-backed
port of Adobe's React Stately/Aria/Spectrum S2, plus Kumo and Geist skins.

Ecosystem rules: [`../AGENTS.md`](../AGENTS.md). This file adds only what is
true of this repository.

## Scope

- Headless chain `solid-stately` → `solidaria` → `solidaria-components`,
  then styled siblings `solid-spectrum`, `@proyecto-viviana/ui`, kumo,
  and geist. Styled packages theme and compose only.
- S2 styling lives only in `solid-spectrum`, generated from tokens by the
  style macro ([ADR 0001](./docs/adr/0001-s2-styling-source-of-truth.md)).
  `apps/comparison` verifies the same behavior; it never patches styling.

## Start

1. [`.claude/current/README.md`](./.claude/current/README.md) — live-docs index.
2. [`.claude/tickets/`](./.claude/tickets/) — the board.

See: [what a ported component must pass](./.claude/current/certification.md) and
[the per-component runner](./apps/comparison/COMPONENT_PLAYBOOK.md).

## Commands

| do | run |
| --- | --- |
| install | `pnpm install` |
| check | `pnpm run check` |
| test | `pnpm run test` |
| build | `pnpm run build` |
| lint | `pnpm run lint` |

## Local rules

- A component is "ported" only with regression coverage across API, ARIA,
  keyboard/focus, forms, timing, styling, and i18n. An export, a green axe
  run, or a stable screenshot is a floor, not proof.
- Publish only
  [the packages in release-policy.md](./.claude/current/release-policy.md).
  `packages/viviana-ui` publishes as `@proyecto-viviana/ui`.
- Mirror upstream (Adobe Stately/Aria/Spectrum S2, Cloudflare Kumo). Geist
  follows public docs, not `@vercel/geistcn`. Never invent a size, name, or
  behavior an upstream answer already gives.
- Names with public reach are owner-steered before they exist; never mint
  one silently. Never add a dependency without explicit approval.
- Behavior research uses the MCP servers in `.claude/current/tooling.md`.
- `.claude/settings.local.json`, `.claude/skills/`, and screenshots stay
  untracked; they are local tool state.
