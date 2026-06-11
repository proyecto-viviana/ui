# S2 Styling and Package Plan

Date: 2026-04-30

This is the controlling direction for the styled packages and the comparison app. The target is Spectrum 2 only.

## Package Decisions

| Layer                      | Package                                  | Role                                                        |
| -------------------------- | ---------------------------------------- | ----------------------------------------------------------- |
| State                      | `@proyecto-viviana/solid-stately`        | Solid state primitives aligned with React Stately concepts. |
| Behavior                   | `@proyecto-viviana/solidaria`            | ARIA behavior hooks and interaction logic.                  |
| Headless components        | `@proyecto-viviana/solidaria-components` | Pre-wired, unstyled components with public styling hooks.   |
| Spectrum styled components | `@proyecto-viviana/solid-spectrum`       | Spectrum 2-compatible styled Solid components.              |
| Viviana design system      | `@proyecto-viviana/ui`                   | Proyecto Viviana's own product design system.               |

## S2 Styling Research

The current Spectrum 2 styling policy is macro-based, not selector-based. Adobe documents `@react-spectrum/s2/style` as a build-time `style` macro that emits atomic CSS from Spectrum 2 tokens. Component examples use imports such as:

```tsx
import { style } from "@react-spectrum/s2/style" with { type: "macro" };
```

For Spectrum components themselves, customization is deliberately constrained. The public prop is `styles`, and Adobe documents it as accepting only layout, spacing, sizing, and positioning properties. Colors, internal padding, and other component internals are not customization hooks.

The S2 CSS delivery policy also matters:

- generated CSS should be extracted into a CSS bundle;
- generated atomic CSS should be minified/deduplicated, e.g. with `lightningcss`;
- S2 component CSS and style macro CSS should be bundled together instead of split across chunks;
- global CSS resets are discouraged, and if unavoidable must be placed below S2's cascade layer.

Adobe also explicitly says the style macro is not meant to be passed through `UNSAFE_className`; overriding Spectrum internals that way is discouraged. For custom components that follow Spectrum styling, the recommended path is using the S2 `style` macro with headless React Aria Components.

## Our Styling Policy

`solidaria-components` follows the headless component contract. It owns behavior, semantic DOM, render state, state data attributes, slots, and default headless class names. It must remain usable without `solid-spectrum` or `viviana-ui`.

`solid-spectrum` follows the S2 styled component contract. It owns the component styling, token mapping, states, variants, sizes, overlay styling, and provider integration needed to match Adobe S2 screenshots and behavior. The comparison app must not carry an app-local Spectrum skin as the source of truth.

`viviana-ui` is a separate design system. It may reuse `solidaria-components` and design infrastructure, but it is not the package we compare pixel-for-pixel against Adobe S2.

## Solid Implementation Strategy

We should copy the S2 contract and output model, not Adobe's React implementation details verbatim.

1. `solid-spectrum` components expose S2-like component props and a constrained `styles` prop.
2. Component internals use package-owned styles generated from Spectrum 2 tokens.
3. The package emits extracted CSS that consumers and the comparison app import as package CSS, not harness CSS.
4. `UNSAFE_class` / `UNSAFE_style` can exist only as escape hatches. They are not how parity styling is applied or tested.
5. Pixel parity tests compare Adobe S2 components against `solid-spectrum` components in the same scenario, state, viewport, color scheme, and scale.

The first implementation can be a compiled/static package stylesheet if that is the fastest reliable route in Solid/Vite. The long-term target is a typed S2-like style system for this repo, with atomic extraction and deduplication equivalent to Adobe's documented approach.

## Comparison App Rules

- The React side imports only `@react-spectrum/s2` components for the canonical reference.
- The Solid side imports only `@proyecto-viviana/solid-spectrum` for Spectrum parity.
- `@proyecto-viviana/ui` can have its own docs, but it is not the S2 parity target.
- Harness CSS may lay out the page, grids, controls, and screenshot frame. It must not style component internals.
- Each component page should have one interactive prop controller, modeled after the S2 docs pattern.
- Each component should record supported, missing, and intentionally absent S2 API entries.
- Every reachable state needed for confidence gets a screenshot scenario. Missing states are tracked as gaps, not silently skipped.

## Migration Order

1. Keep documentation and app copy aligned to Viviana UI or Solid Spectrum.
2. Create `@proyecto-viviana/solid-spectrum` package boundaries and move S2 parity components there.
3. Keep `solidaria-components` as the behavior source of truth.
4. Make the comparison app consume `solid-spectrum` for the Solid parity side.
5. Convert component pages to S2-style interactive controls and screenshot states.
6. Build the style extraction/token pipeline needed for strict visual parity.

## Non-Goals

- Do not design against older Spectrum styling systems.
- Do not copy older CSS module selectors as the public customization API.
- Do not treat comparison-app CSS as component implementation.
- Do not use `viviana-ui` as the S2 parity package.
