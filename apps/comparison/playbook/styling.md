# Styling

S2 styling parity must come from the token/style declaration path, not
handwritten component CSS tuned from screenshots.

Style parity is source-to-computed. Locate the upstream declaration, identify
the Solid owner code, and prove the browser-observable output. A screenshot may
support that proof, but it does not replace computed style, class, geometry,
attribute, or CSS-variable assertions for branch-sensitive styling.

## Checks

- React S2 style declarations are located before writing Solid styles.
- Solid uses `packages/solid-spectrum/src/style` and generated classes.
- Component CSS is not added to the comparison app to patch component behavior,
  state, geometry, or token output.
- Size, variant, static color, density, label position, alignment, and field
  state branches match upstream style conditions.
- Icons and illustrations use vendored S2 assets or generated S2-compatible
  wrappers.
- Forced-colors branches are ported when upstream has them.
- Generated classes exist in `s2-generated.css`.
- `UNSAFE_className` and `UNSAFE_style` are passed only where the public S2 API
  supports them.
- Viewer canvas conditions such as background, width, density, direction, theme,
  and static color are represented in the comparison route when they affect
  rendering.
- Focus-ring geometry, portal placement, icon fill/stroke, avatar/image fit,
  slot visibility, spinner stroke, and badge offsets use computed or geometry
  contracts when screenshots are too coarse.
- Layout math is a first-class style contract. Explicitly assert extra or
  missing rows/columns, clipping, overflow, alignment, responsive width, text
  wrapping, popover placement, grid/table geometry, and RTL geometry whenever
  upstream layout depends on them.
- A visual bug discovered during review stays a `style-blocker` until fixed or
  classified out of scope, even when the existing pair-diff threshold passes.

## Commands

```bash
rg -n "style\\(|with \\{type: 'macro'\\}|className=|styles=" \
  apps/comparison/node_modules/@react-spectrum/s2/src/<Component>.tsx
rg -n "style\\(|with \\{type: 'macro'\\}|s2-generated|UNSAFE_" \
  packages/solid-spectrum/src/<area>
```

## Evidence

For token-sensitive details, prefer computed-style or class assertions in tests
over visual-only review.

Use this table in component notes when style branches matter:

| Style branch | Upstream declaration | Solid owner | Observable proof | Status |
| ------------ | -------------------- | ----------- | ---------------- | ------ |
|              |                      |             |                  |        |

Mark unresolved rows as `style-blocker`.
