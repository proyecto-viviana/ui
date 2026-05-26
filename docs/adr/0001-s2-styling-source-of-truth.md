# ADR 0001: S2 Styling Source Of Truth

## Decision

`solid-spectrum` must implement Spectrum 2 styling from the same kind of source
Adobe uses:

```text
S2 tokens/theme/helpers
-> component style declarations
-> style macro/compiler
-> generated atomic CSS
```

Generated classes are build output. They are not the architecture.

## Rules

- Do not implement S2 component styling by hand.
- Do not tune handwritten colors, padding, radius, or state CSS to make
  screenshots pass.
- Do not add new `.comparison-spectrum-*` component-internal styling.
- The comparison app shell may use `solid-spectrum` components and the S2 style
  macro. Hand-written comparison CSS is limited to harness layout, controls,
  panels, screenshot frames, and temporary migration scaffolding.
- App CSS must not implement component-internal S2 surfaces: colors, padding,
  radius, layout slots, focus rings, animations, or visual states.
- Components that still depend on app-local fallback CSS for their S2 surface
  must be marked partial or missing/gap until the implementation lives in the
  S2-compatible style system.

This supersedes the older shorthand that the comparison shell could not use
styled components. The actual boundary is no hand-written S2 component-surface
CSS in the app.

## Context Recovery

If context is lost, read this ADR before doing styled component work. Restore the
S2-compatible style system first, then migrate components.
