# Tooling

`vp` is the repo command layer. It uses the configured package manager from
`packageManager` (`pnpm@10.33.2`) underneath, but repo documentation and scripts
should prefer Vite Plus commands.

## Daily Commands

```bash
vp install
vp run dev
vp run comparison:dev
vp test run packages
vp run check
```

Use `vp install`, `vp add`, `vp remove`, `vp update`, `vp why`, and `vp list`
for dependency work. Use raw `pnpm` only when debugging pnpm-specific behavior;
otherwise the command should go through `vp`.

## Lint And Format

The canonical lint and format tools are the Vite Plus wrappers:

```bash
vp run lint
vp run fmt:check
vp run check
```

`vp lint` runs Oxlint. `vp fmt` runs Oxfmt. `vp check` runs format, lint, and
type checks together.

The root [`vite.config.ts`](../vite.config.ts) is the shared Vite Plus config
for `fmt`, `lint`, and `staged`. Do not add `.oxfmtrc.json` or
`.oxlintrc.json`; Vite Plus reads the Oxfmt and Oxlint settings from the
config blocks in that file.

Install the repo git hooks once per checkout:

```bash
vp config
```

The tracked hook entrypoint is [`.vite-hooks/pre-commit`](../.vite-hooks/pre-commit).
Generated hook shims under `.vite-hooks/_` stay untracked.

The daily static gate is:

```bash
vp run check
```

`lint.options.typeAware` is enabled. `typeCheck` is intentionally left off in
the Vite Plus lint block for now because the current `tsgolint` path checks
files outside our existing `tsconfig.typecheck.json` contract, including mixed
JSX test files. The root check still runs TypeScript through `vp run typecheck`
after `vp check`.

## Vite Plus Stack

Apps should use Vite Plus commands directly where they map cleanly:

- `vp dev`
- `vp build`
- `vp preview`
- `vp test`
- `vp exec <tool>`

Prefer native Vite Plus/Vite capabilities over compatibility plugins when the
project can express the same behavior directly. For example, `apps/web` uses
Vite's native `resolve.tsconfigPaths` support instead of `vite-tsconfig-paths`.

## AI Tooling for Component Parity

Tracked agent instructions live in [`AGENTS.md`](../AGENTS.md). Claude
Code-specific guidance lives in [`CLAUDE.md`](../CLAUDE.md). The `.claude/`
directory contains Claude working docs and notes; consult relevant files, but
verify status claims against current source, tests, reports, and the comparison
playbook.

When available, Adobe-published MCP servers provide on-demand access to React
Aria and Spectrum S2 documentation during component parity work.

| Server              | Package               | What it covers                                                                  |
| ------------------- | --------------------- | ------------------------------------------------------------------------------- |
| `react-aria`        | `@react-aria/mcp`     | React Aria Components — props, ARIA roles, keyboard interactions, accessibility |
| `react-spectrum-s2` | `@react-spectrum/mcp` | Spectrum S2 — props, slots, style tokens, icons, illustrations                  |

Local registration varies by agent client. If the MCP servers or matching
agent skills are unavailable, fall back to installed source, vendored docs,
relevant `.claude/` notes, and the tracked comparison playbook.

See [`apps/comparison/COMPONENT_PLAYBOOK.md`](../apps/comparison/COMPONENT_PLAYBOOK.md)
for the component audit sequence. Use
[`apps/comparison/playbook/source-index.md`](../apps/comparison/playbook/source-index.md)
and
[`apps/comparison/playbook/component-research.md`](../apps/comparison/playbook/component-research.md)
for the specific source hierarchy and MCP/documentation sources to use during a
component audit.

Claude Code users can verify MCP connectivity with:

```bash
claude mcp list
```

If they are not connected, check the local client config and that Node.js is
available in the shell (`node --version`). Do not block project work only
because an optional local MCP integration is unavailable.

## Package Build Migration

Package builds should move to native Vite Plus packaging one package at a time.
The first package is `@proyecto-viviana/solid-spectrum`, whose JS/CSS package
build now uses `vp pack`/tsdown from `packages/solid-spectrum/vite.config.ts`.
Its declaration files intentionally stay on the existing
`tsc -p tsconfig.build.json` path for the first migration checkpoint.

For each package migration, compare generated `dist` files, type declarations,
declaration maps, package exports, and packed npm contents before rolling the
pattern forward. Do not migrate all packages in one change; keep each package
as its own reversible checkpoint.

`tsup` remains in the workspace while other packages still use it. Remove it
only after `rg "tsup" package.json packages -g package.json` shows no remaining
package build scripts depend on it.
