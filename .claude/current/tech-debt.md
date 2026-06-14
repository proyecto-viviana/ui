---
kind: reference
status: current
tasks:
  - id: pkg-build-spectrum-dts
    title: Move solid-spectrum dts to Vite Plus packaging
    state: in-progress
    roadmap: package-build-migration
    planned: { start: 2026-05-12, target: 2026-06-20 }
  - id: pkg-build-remaining
    title: Migrate remaining packages off tsup
    state: open
    depends: [pkg-build-spectrum-dts]
    roadmap: package-build-migration
  - id: support-export-audit
    title: Audit the 22 missing S2 support exports
    state: open
    roadmap: support-export-parity
---

# Tech Debt

Status: Current source of truth.
Update when: a debt is added, paid down, or its exit changes.

Known debt and temporary bridges. Each entry names its exit so it does not become
permanent.

## Package-build migration incomplete

Package builds are mid-migration to native Vite Plus packaging. Only
`@proyecto-viviana/solid-spectrum` has moved its JS/CSS build to `vp pack`/tsdown;
its declaration files still build through `tsc -p tsconfig.build.json`, and other
packages still use `tsup`.

**Exit:** every package builds through Vite Plus packaging (including dts);
`rg "tsup" package.json packages -g package.json` returns nothing, then `tsup` is
removed from the workspace.

## Lint type-checking runs separately

`typeCheck` is off in the Vite Plus lint block because the `tsgolint` path checks
files outside the `tsconfig.typecheck.json` contract (including mixed JSX test
files). Type errors are caught by a separate `vp run typecheck` after `vp check`,
not inside the lint pass.

**Exit:** the `tsgolint` path honors the `tsconfig.typecheck.json` contract;
re-enable `typeCheck` in the lint block and drop the separate step from `check`.

## axe color-contrast excluded from the blocking gate

`ci:a11y` (the blocking accessibility bar) temporarily excludes axe
`color-contrast`. `a11y:full` still runs contrast and stricter audits, but they do
not block PRs.

**Exit:** resolve the outstanding contrast findings, then remove the exclusion so
`color-contrast` blocks in `ci:a11y`.

## Visual-state coverage debt

The strict audit is green while visual-state coverage is partial: of `349`
tracked states, `113` have current React/Solid visual evidence and `56` have
strict pair-diff tests (`status.md`). No rows are _blocked_, but most are not yet
certified visually.

**Exit:** every rendering-affecting state row has a computed contract or strict
pair-diff test; screenshots remain review evidence only.

## Support-export gap

`22` of `208` React S2 value exports are missing from `solid-spectrum` (contexts,
slots, hooks, helpers, support values). Root catalogue export parity is complete;
support-export parity is not.

**Exit:** `comparison:report:exports` shows no missing S2 support exports, with
any Solid-only exports documented as local additions.
