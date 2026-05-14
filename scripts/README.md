# Scripts

Root scripts are maintenance guards that are still useful outside the visual
comparison app.

## Active Guards

- `check-doc-routes.ts` verifies generated web docs routes.
- `check-rac-parity.ts` checks a narrow required export set for
  `solidaria-components` against `react-aria-components`.
- `check-rac-export-gap.ts` reports the broader headless export gap. As of the
  2026-05-12 local report, this has `0` missing RAC named exports and only
  reports Solid extras.
- `check-dnd-keyboard-parity.ts` guards keyboard DnD invariants that are hard to
  see in static screenshots.
- `check-virtualizer-keyboard-parity.ts` guards virtualizer keyboard navigation
  invariants.
- `check-changeset-required.mjs` enforces changesets for releasable packages.

## Comparison App

Visual and behavioral parity for Spectrum 2 styled components belongs in
`apps/comparison`. Add new component state coverage there first; add a root
script only when the invariant is cross-cutting and cannot be expressed well as
a comparison route or Playwright test.
