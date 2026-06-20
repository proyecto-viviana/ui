# Ticket: `ui-export-parity`

## Goal

Make `@proyecto-viviana/ui` public exports match the usable public surface of
`@proyecto-viviana/solid-spectrum`, while keeping Viviana-native components as
additional explicit subpaths.

## Problem

The root barrel re-exports `solid-spectrum`, but the package export map and pack
entries expose only a subset of Spectrum subpaths. That makes
`@proyecto-viviana/ui` look like the social-facing package while still forcing
callers back to `@proyecto-viviana/solid-spectrum` for deep imports such as
`Calendar`, `Tabs`, `Menu`, `ListView`, `TreeView`, color components, and
`style/runtime`.

## Scope

- Add missing top-level passthrough barrels under `packages/viviana-ui/src`.
- Add matching entries to `packages/viviana-ui/vite.config.ts`.
- Add matching `exports` entries to `packages/viviana-ui/package.json`.
- Add `main`, `module`, and `types` fields if we want parity with
  `solid-spectrum` package metadata.
- Keep existing Viviana-native subpaths (`Chip`, `Conversation`, cards, layout)
  and decide separately whether orphan native components should be exported or
  deleted.

## Out Of Scope

- Changing component behavior.
- Re-theming macro tokens.
- Migrating social apps.

## Acceptance Criteria

- Every public subpath exported by `@proyecto-viviana/solid-spectrum` has a
  corresponding `@proyecto-viviana/ui/*` export unless documented as intentionally
  withheld.
- `@proyecto-viviana/ui/style/runtime` is exported if `solid-spectrum` exports it.
- A built-package smoke test imports every UI subpath and fails if the export map
  and dist files drift.
- Social apps no longer need source imports from `@proyecto-viviana/solid-spectrum`
  for component access.
