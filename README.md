# Proyecto Viviana

A faithful, **certified** Solid port of Adobe's React Stately, React Aria, and
React Spectrum S2 stacks — the same real accessibility and behavior, for SolidJS.
Parity is not a step toward a product; **parity is the product**.

| Package                | npm                                      | Role                                                                             |
| ---------------------- | ---------------------------------------- | -------------------------------------------------------------------------------- |
| `solid-stately`        | `@proyecto-viviana/solid-stately`        | State primitives. Port of `@react-stately`.                                      |
| `solidaria`            | `@proyecto-viviana/solidaria`            | Accessibility hooks (ARIA, keyboard, focus, press/hover). Port of `@react-aria`. |
| `solidaria-components` | `@proyecto-viviana/solidaria-components` | Headless components. Port of `react-aria-components`.                            |
| `solid-spectrum`       | `@proyecto-viviana/solid-spectrum`       | Spectrum 2 styled components. Port of `@react-spectrum/s2`.                      |
| `viviana-ui`           | `@proyecto-viviana/ui`                   | Product design-system layer.                                                     |

## Status

This is a parity port and test bed, not production-ready — use it as such until
the release policy says otherwise. `solid-stately`, `solidaria`,
`solidaria-components`, and `solid-spectrum` are the four releasable public
packages; `@proyecto-viviana/ui` is public but not yet in the release matrix
(`.claude/current/release-policy.md`).

Export parity is not behavior parity. A component is not "ported" until it is
**certified** — API, ARIA, keyboard/focus, forms/validation, behavior/timing,
styling, visual parity, and i18n all matched and held by tests that can fail. The
bar and the gate ladder are in `.claude/current/certification.md`; the current
snapshot is `.claude/current/status.md` (refreshed from scripts, not memory).

## Start here

1. [`AGENTS.md`](AGENTS.md) — the operating rules (read first).
2. [`.claude/current/README.md`](.claude/current/README.md) — index for the deep
   docs: steering, certification, architecture, status, work queue.
3. [`apps/comparison/COMPONENT_PLAYBOOK.md`](apps/comparison/COMPONENT_PLAYBOOK.md)
   — the per-component parity runner.

## Quick start

```bash
vp install
vp run dev              # apps/web playground
vp run comparison:dev   # apps/comparison parity harness
vp run check            # format + lint + typecheck
```

## Common gates

```bash
vp run check                            # format + lint + typecheck
vp test run packages                    # package unit/integration suites
vp run a11y:check                       # axe AA + comparison a11y + smoke
vp run comparison:report:parity:strict  # strict S2 audit (expected to pass)
vp run comparison:report:gaps
vp run comparison:report:exports
vp run docs:check                       # docs frontmatter / tracking integrity
```

`comparison:report:parity:strict` is expected to pass; treat an in-scope failure
as a blocking regression. The full ladder is in `.claude/current/certification.md`.

## Dev dashboard

`/admin` (dev only, in `apps/web`) is the internal operating surface — roadmap,
task tracker, gantt, docs browser, architecture, and glossary — projecting the
`.claude/current/` frontmatter. It never ships. Run `vp run dev` and open
`http://localhost:3000/admin`.

## Repo layout

```text
packages/                Solid ports (the five-layer chain) + private test-utils
apps/web                 playground app + the dev-only /admin dashboard
apps/comparison          React-vs-Solid parity verification harness
docs/adr/                architecture decision records (ADR 0001 = S2 styling boundary)
.claude/current/         the live deep-docs surface (index: README.md)
```

## Guidelines

- Check `git status --short` before edits. Use `vp` for repo work (raw `pnpm`
  only when debugging the package manager). Never add a dependency without
  explicit approval.
- Docs-only changes need no Changeset; releasable package code usually does.
- Git history is the archive — retired docs are removed from `main`, recoverable
  from the commit that removed them.
