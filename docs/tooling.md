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

Two Adobe-published MCP servers are installed globally and provide on-demand
access to React Aria and Spectrum S2 documentation during component parity work.

| Server              | Package               | What it covers                                                                  |
| ------------------- | --------------------- | ------------------------------------------------------------------------------- |
| `react-aria`        | `@react-aria/mcp`     | React Aria Components — props, ARIA roles, keyboard interactions, accessibility |
| `react-spectrum-s2` | `@react-spectrum/mcp` | Spectrum S2 — props, slots, style tokens, icons, illustrations                  |

Both are registered in `~/.claude.json` (Claude Code), `~/.codex/config.toml`
(Codex), and `~/.config/opencode/opencode.json` (OpenCode). They use
`npx -y @<pkg>@latest` and auto-resolve the newest version each session.

Matching agent skills (`react-aria`, `react-spectrum-s2`) are installed in
`~/.claude/skills/` and load reference docs and style-macro guidance
automatically when working on component parity in Claude Code.

See [`apps/comparison/COMPONENT_PLAYBOOK.md`](../apps/comparison/COMPONENT_PLAYBOOK.md)
for the specific MCP tool calls to make at each phase of a component audit.
The quick reference table is in the **MCP Quick Reference** section of that
file.

To verify the servers are connected:

```bash
claude mcp list
```

Both should show `✓ Connected`. If not, check that Node.js is available in the
shell (`node --version`).

## Future Package Build Migration

Package builds intentionally stay on the existing `tsup` + `tsc` pipeline for
now. Migrating them to a native Vite Plus package build should be a separate
change after we validate one package end to end.

That migration should compare generated `dist` files, type declarations,
declaration maps, package exports, and packed npm contents before rolling the
pattern across all packages. Do not mix that migration into comparison app or
component parity work.
