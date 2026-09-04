# Spectrum 2 Vendored Styling Source

Fork baseline: `@react-spectrum/s2@1.7.0` (the current pin — see
`scripts/upstream-pin.json`).

Canonical baseline path: `react-spectrum/packages/@react-spectrum/s2` at the
exact commit in `scripts/upstream-pin.json`. This directory is a Viviana-owned
fork with documented design-system additions; it is not the source of S2
styling (that boundary belongs to `solid-spectrum`).

Copied files:

- `style/index.ts`
- `style/runtime.ts`
- `style/spectrum-theme.ts`
- `style/style-macro.ts`
- `style/tokens.ts`
- `style/types.ts`
- `style/properties.json`
- `src/style-utils.ts`
- `src/page.macro.ts`

Local changes:

- Parcel macro asset emission is preserved through `unplugin-parcel-macros`.
  The previous local CSS asset registry was removed; CSS must be emitted by the
  bundler macro pass.
- Package builds use Vite Plus/Rolldown macro glue in
  `packages/solid-spectrum/vite.config.ts` because upstream S2 is packaged by
  Parcel and this package is not.
- React CSS property types were replaced with Solid-compatible types, and JSON
  token imports are normalized for Vite test/build interop.
- Internal import paths were rewritten for `solid-spectrum`.
- Component wrappers are ported to Solid, but style declarations should stay
  structurally copied from S2.
- `style-macro.ts` hardcodes the class-name `POSTFIX` to the pinned S2 version
  (`17` for 1.7.0) rather than reading it from `package.json` at runtime like
  upstream, because this module is also loaded in the dts/dom builds that omit
  Node globals. `guard:style-macro-parity` diffs the whole macro output against
  the vendored upstream oracle and fails if the postfix (or any generated CSS)
  drifts from the pin — bump `POSTFIX` in lockstep with any S2 pin bump.
