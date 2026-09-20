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
3. `gh run list --branch main --limit 4` — a red main is the first task.

See: [what a ported component must pass](./.claude/current/certification.md) and
[the per-component runner](./apps/comparison/COMPONENT_PLAYBOOK.md).

## Commands

| do      | run            |
| ------- | -------------- |
| install | `vp install`   |
| check   | `vp run check` |
| test    | `vp run test`  |
| build   | `vp run build` |
| lint    | `vp lint`      |

## Local rules

- A component is "ported" only with regression coverage across API, ARIA,
  keyboard/focus, forms, timing, styling, and i18n. An export, a green axe
  run, or a stable screenshot is a floor, not proof.
- Publish only [these packages](./.claude/current/release-policy.md);
  `packages/viviana-ui` publishes as `@proyecto-viviana/ui`.
- Mirror upstream (Adobe Stately/Aria/Spectrum S2, Cloudflare Kumo). Geist
  follows public docs, not `@vercel/geistcn`. Never invent a size, name, or
  behavior an upstream answer already gives.
- Names with public reach are owner-steered before they exist; never mint
  one silently. Never add a dependency without explicit approval.
- Behavior research uses the MCP servers in `.claude/current/tooling.md`.
- `.claude/settings.local.json`, `.claude/skills/`, and screenshots stay
  untracked; they are local tool state.
- One editing session per git, with the owner's 2026-09-20 exception for
  campaign #544: one extra writer in `.claude/worktrees/public-face`, owning
  only `README.md`, `CONTRIBUTING.md`, `CREDITS.md`, `packages/*/README.md`,
  and page content under `apps/web/src/**` and `apps/comparison/src/**`. The
  main writer keeps everything else, heavy builds and browser proof stay
  serialized, and the conductor alone integrates into `main`. It ends when
  #548, #549 and #550 close; the wording is in the hub
  [`AGENTS.md`](../AGENTS.md).
