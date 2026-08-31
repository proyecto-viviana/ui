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

## Attribution audit

```bash
vp run report:attribution-mappings
vp run report:attribution-mappings --json
vp run guard:attribution-headers
vp run sync:attribution-headers
vp run generate:solid-spectrum-icons
vp run guard:generated-icons
```

The report compares the five Adobe-derived source packages with the pinned,
git-ignored `react-spectrum/packages` tree. It uses explicit source markers and
verified generated assets. It does not assume that equal filenames have the
same source. The default output is a short review summary. Use `--json` for the
complete inventory. These two report modes do not write files.

The icon generator reads the pinned installed S2 package. It cross-checks ESM
and CommonJS workflow paths, records exact inputs, and synchronizes the Solid
Spectrum and Viviana UI generated trees. The generate command writes only
changed owned files. The guard is read-only and rejects changed, missing, or
unexpected output. Release readiness runs the guard before package builds.

Reviewed exact mappings whose Adobe source has no Adobe header are recorded in
`scripts/attribution-headerless-reviews.json`. Each record fixes the local
path, the exact upstream path, and the source evidence that the local file must
keep. The header guard fails if the upstream file gains an Adobe header, the
local file gains an unsupported Adobe header, or the required evidence changes.
Add a record only after you review the exact source history and all applicable
third-party notices.

Reviewed multi-source mappings are recorded in
`scripts/attribution-composite-reviews.json`. Each record fixes the local path,
the complete upstream path set, and the required local evidence. The header
guard fails if a recorded path set, required evidence, or composite header
changes. The composite header keeps each distinct full upstream Adobe block
once and adds one exact source-path line for every input. A headerless input
gets a source-path line, not an invented Adobe block. Add a record only after
you read every listed pinned source.

Reviewed local module surfaces are recorded in
`scripts/attribution-local-reviews.json`. Each record fixes the local path and
the reviewed content hash. These files only organize exports. The exported
implementation files own their source mappings. The guard reopens review if a
recorded file changes, gains a source marker, or gains an Adobe header.

`guard:attribution-headers` checks confirmed headers for exact and reviewed
composite mappings. It also checks content contracts for reviewed local files.
`sync:attribution-headers` copies the exact
full Adobe blocks and adds the exact upstream paths. It keeps a required
`// @ts-nocheck` directive first. It does not change unreviewed ambiguous,
generated, or unmapped files. Run the guard after the sync.

Package builds copy each confirmed source header into emitted chunks.
`guard:package-artifacts` uses source maps to check every mapped JS and JSX
output. It also fails when an attributed source file has no mapped build output.
It accepts Rolldown's comment-spacing changes, but it still requires every
complete license block, year, port marker, and upstream path. Each
Adobe-derived package build also copies the source header to declaration-only
outputs. Declaration maps keep type-only source files in this check.

These commands are review aids. They do not make a legal compliance claim. They
stop when the pinned upstream tree is not available because they cannot produce
evidence-backed mappings without that tree.

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
