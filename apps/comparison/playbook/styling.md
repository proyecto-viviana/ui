# Styling

S2 styling parity must come from the token/style declaration path, not
handwritten component CSS tuned from screenshots.

## Checks

- React S2 style declarations are located before writing Solid styles.
- Solid uses `packages/solid-spectrum/src/s2-style` and generated classes.
- Component CSS is not added to the comparison app.
- Size, variant, static color, density, label position, alignment, and field
  state branches match upstream style conditions.
- Icons and illustrations use vendored S2 assets or generated S2-compatible
  wrappers.
- Forced-colors branches are ported when upstream has them.
- Generated classes exist in `s2-generated.css`.
- `UNSAFE_className` and `UNSAFE_style` are passed only where the public S2 API
  supports them.

## Commands

```bash
rg -n "style\\(|with \\{type: 'macro'\\}|className=|styles=" \
  apps/comparison/node_modules/@react-spectrum/s2/src/<Component>.tsx
rg -n "style\\(|s2-style|s2-generated|UNSAFE_" \
  packages/solid-spectrum/src/<area>
```

## Evidence

For token-sensitive details, prefer computed-style or class assertions in tests
over visual-only review.
