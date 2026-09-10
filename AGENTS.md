# ui

Proyecto Viviana's published Solid design-system family: an evidence-backed
port of Adobe's React Stately/Aria/Spectrum S2, plus a Cloudflare Kumo port.

Ecosystem rules: [`../AGENTS.md`](../AGENTS.md). This file adds only what is
true of this repository.

## Scope

- Six public packages share one chain: `solid-stately` → `solidaria` →
  `solidaria-components` → (`solid-spectrum`, `@proyecto-viviana/ui`,
  `@proyecto-viviana/kumo`). The upper three theme and compose only — never
  fork ARIA or state logic.
- S2 styling lives only in `solid-spectrum`, generated from tokens by the
  style macro ([ADR 0001](./docs/adr/0001-s2-styling-source-of-truth.md)).
  `apps/comparison` verifies parity; it never patches styling.

## Start

1. [`.claude/current/README.md`](./.claude/current/README.md) — live-docs index.
2. [`.claude/current/certification.md`](./.claude/current/certification.md)
   — the evidence bar for calling a component "ported".
3. [`apps/comparison/COMPONENT_PLAYBOOK.md`](./apps/comparison/COMPONENT_PLAYBOOK.md) — the per-component runner.

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
- Publish only the six packages in
  [`.claude/current/release-policy.md`](./.claude/current/release-policy.md).
  `packages/viviana-ui` publishes as `@proyecto-viviana/ui`.
- Mirror upstream (Adobe Stately/Aria/Spectrum S2, Cloudflare Kumo); never
  invent a size, name, or behavior an upstream answer already gives.
- Names with public reach are owner-steered before they exist; never mint
  one silently. Never add a dependency without explicit approval.
- Parity research uses the MCP servers in `.claude/current/tooling.md`.
- `.claude/settings.local.json`, `.claude/skills/`, and screenshots stay
  untracked; they are local tool state.
