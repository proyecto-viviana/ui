---
kind: reference
status: current
---

# Tooling

Status: Current source of truth.
Update when: the command layer, static gates, hooks, MCP setup, or the
package-build migration change.

`vp` (Vite Plus) is the repo command layer. It runs the pinned package manager
(`pnpm@10.33.2`) underneath, but scripts and docs use `vp`. Use raw `pnpm` only
when debugging pnpm-specific behavior.

## Daily commands

```bash
vp install
vp run dev
vp run comparison:dev
vp test run packages
vp run check
```

Dependency work goes through `vp add`, `vp remove`, `vp update`, `vp why`,
`vp list`. Do not add a dependency without explicit approval.

## Static gate

```bash
vp run check        # vp check (format + lint) && vp run typecheck
```

`vp lint` runs Oxlint (type-aware), `vp fmt` runs Oxfmt. The root
`vite.config.ts` is the shared config for `fmt`, `lint`, and `staged` — do not
add `.oxfmtrc.json` or `.oxlintrc.json`. Lint `typeCheck` is intentionally off in
the Vite Plus block (the `tsgolint` path checks files outside the
`tsconfig.typecheck.json` contract); `vp run typecheck` runs `tsc` separately
after `vp check` (`tech-debt.md`).

Install git hooks once per checkout:

```bash
vp config
```

The tracked hook entrypoint is `.vite-hooks/pre-commit`; generated shims under
`.vite-hooks/_` stay untracked.

## MCP servers for parity

When available, Adobe-published MCP servers give on-demand React Aria and S2
docs during parity work:

| Server              | Package               | Covers                                              |
| ------------------- | --------------------- | --------------------------------------------------- |
| `react-aria`        | `@react-aria/mcp`     | RAC props, ARIA roles, keyboard, accessibility      |
| `react-spectrum-s2` | `@react-spectrum/mcp` | S2 props, slots, style tokens, icons, illustrations |

If unavailable, fall back to installed source, vendored docs, `.claude/` notes,
and the comparison playbook. `apps/comparison/playbook/source-index.md` and
`component-research.md` name the source hierarchy and documentation sources to use
during an audit. Do not block work on an optional local MCP integration.

## Package-build migration

Package builds are moving to native Vite Plus packaging, one package at a time.
`@proyecto-viviana/solid-spectrum` is first: its JS/CSS build uses
`vp pack`/tsdown from `packages/solid-spectrum/vite.config.ts`, while its
declaration files stay on `tsc -p tsconfig.build.json` for the first checkpoint.
For each migration, diff generated `dist`, type declarations, declaration maps,
package exports, and packed npm contents before rolling forward; keep each
package its own reversible checkpoint (`tech-debt.md`).

## Host note

Chromium Playwright may need to run outside the sandbox on this host when the
browser reports `sandbox_host_linux.cc:41 shutdown: Operation not permitted`.
