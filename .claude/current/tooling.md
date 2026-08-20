---
kind: reference
status: current
---

# Tooling

Status: live tooling guide.
Update when: the command layer, static gates, hooks, MCP setup, or the
package-build migration change.

`vp` (Vite Plus) is the repo command layer. It runs the pinned package manager
(`pnpm@11.22.0`) underneath, but scripts and docs use `vp`. Use raw `pnpm` only
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
`tsconfig.typecheck.json` contract). `vp run typecheck` runs `tsc` separately
after `vp check`.

Install git hooks once per checkout:

```bash
vp config
```

The tracked hook entrypoint is `.vite-hooks/pre-commit`. Generated shims under
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

## Package builds and browser preview

All six public packages now use Vite Plus packaging from `vite.config.ts`.
Declarations remain a separate `tsc -p tsconfig.build.json` step. A successful
process exit is insufficient: `vp run build` finishes with
`guard:package-artifacts`, which checks every declared manifest target.
`guard:source-artifacts` rejects generated declarations and maps in source.

The comparison app uses `astro build`, but its Playwright server uses foreground
`vp preview`. Astro 7 automatically backgrounds preview when it detects an
agent, which makes Playwright treat the server command as terminated.

## Host note

Chromium Playwright may need to run outside the sandbox on this host when the
browser reports `sandbox_host_linux.cc:41 shutdown: Operation not permitted`.
