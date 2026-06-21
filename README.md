# Viviana UI

Viviana UI is Proyecto Viviana's open-source UI suite and design system, built
on Solid. Its foundation is an unofficial open-source port of Adobe's React
Stately, React Aria, React Aria Components, and React Spectrum S2 through the
Solidaria and Solid Spectrum packages. It is not affiliated with Adobe.

The suite is built in layers: `solid-stately`, `solidaria`,
`solidaria-components`, and `solid-spectrum` are the port stack;
`@proyecto-viviana/ui` is the Viviana design-system package built on top of that
stack.

| Package                | npm                                      | Role                                                                 |
| ---------------------- | ---------------------------------------- | -------------------------------------------------------------------- |
| `viviana-ui`           | `@proyecto-viviana/ui`                   | Viviana design-system package and client-facing entry point.         |
| `solid-spectrum`       | `@proyecto-viviana/solid-spectrum`       | Solid port of React Spectrum S2 styled components.                   |
| `solidaria-components` | `@proyecto-viviana/solidaria-components` | Solid port of React Aria Components.                                 |
| `solidaria`            | `@proyecto-viviana/solidaria`            | Solid port of React Aria hooks: ARIA, keyboard, focus, press, hover. |
| `solid-stately`        | `@proyecto-viviana/solid-stately`        | Solid port of React Stately state primitives.                        |

## Status

Viviana UI is published and in active development. Use it with the expectation
that APIs, package boundaries, and component behavior are still being tightened.

Current package status, coverage, and known gaps live in
`.claude/current/status.md`; release rules live in
`.claude/current/release-policy.md`; the component evidence bar lives in
`.claude/current/certification.md`.

## Start here

1. [`.claude/current/status.md`](.claude/current/status.md) — current parity,
   coverage, and report output.
2. [`.claude/current/architecture.md`](.claude/current/architecture.md) — package
   boundaries and where behavior, ARIA, composition, and styling belong.
3. [`.claude/current/certification.md`](.claude/current/certification.md) — the
   evidence bar for accepting a component as ported.
4. [`apps/comparison/COMPONENT_PLAYBOOK.md`](apps/comparison/COMPONENT_PLAYBOOK.md)
   — the per-component parity workflow.

`AGENTS.md` is the operating brief for coding agents and contributors working
with them. Most readers want the docs above first.

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
as a blocking regression. The full evidence checklist is in
`.claude/current/certification.md`.

## Dev dashboard

`/admin` (dev only, in `apps/web`) is the internal operating surface — roadmap,
task tracker, gantt, docs browser, architecture, and glossary — projecting the
`.claude/current/` frontmatter. It never ships. Run `vp run dev` and open
`http://localhost:3000/admin`.

## Repo layout

```text
packages/                Viviana UI, the port stack, and private test-utils
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

## License & attribution

- Our own work is [MIT](LICENSE) — deliberately permissive.
- The port stack is an unofficial Solid port of Adobe's React Spectrum stack
  (Apache-2.0). That direct-license obligation is honored in [`NOTICE`](NOTICE) and
  [`LICENSE-APACHE-2.0`](LICENSE-APACHE-2.0); ported files keep their upstream
  headers.
- [`CREDITS.md`](CREDITS.md) credits everything sourced, referenced, or
  inspired-by — add to it in the change that introduces new such material.
