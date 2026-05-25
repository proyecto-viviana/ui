# Spectrum 2 Vendored Styling Source

Upstream package: `@react-spectrum/s2@1.3.0`

Source path:
`node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2`

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

- Parcel macro asset emission is mirrored into a local CSS asset registry.
- React CSS property types were replaced with Solid-compatible types.
- Internal import paths were rewritten for `solid-spectrum`.
- Component wrappers are ported to Solid, but style declarations should stay
  structurally copied from S2.
