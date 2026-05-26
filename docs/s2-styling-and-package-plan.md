# S2 Styling Plan

This file is a pointer, not the full plan.

The controlling decision is
[`ADR 0001: S2 Styling Source Of Truth`](./adr/0001-s2-styling-source-of-truth.md).

## Current Rule

`solid-spectrum` styling comes from an S2-compatible tokens/theme/style
declaration system. The comparison app verifies parity; it does not implement
component styling.

The comparison app shell may dogfood `solid-spectrum` components and the S2
style macro. That does not change the component boundary: component-internal S2
surfaces must be implemented in `packages/solid-spectrum`, not in app CSS.

## Component Process

For each component, first review the React Spectrum S2 source. Decide what S2 is
actually doing: DOM structure, slots, provider/context use, overlay behavior,
state handling, style declarations, tokens, and generated CSS path.

Then implement the Solid Spectrum component that matches that contract. Use the
headless Solid component where it fits, but do not assume the work is only a
reskin. If S2 has wrapper structure, temporal behavior, DOM slots, or component
logic above the headless layer, port that into `solid-spectrum`.

Do not tune colors, spacing, radius, motion, or overlays from screenshots.

Before accepting a component, write its state plan:

- Static visual states: documented props, themes, sizes, disabled/read-only,
  validation, density, static color, and content slots.
- Interaction states: hover, focus-visible, pointer down/pressed, keyboard
  activation, drag, selected/open/expanded, overlays, dismiss behavior, and any
  delayed or animated state.
- Temporal behavior: transitions, press scale, overlay animation, pending
  delays, loading spinners, and any frame where the UI changes during the
  interaction.
- Tests: strict React-vs-Solid screenshot pairs for stable states, computed CSS
  assertions for source-of-truth tokens/classes, and Playwright interaction
  replays for every state that only appears while the user is interacting.

## Current Migration State

- The existing app-local Spectrum skin is legacy for component surfaces.
- Current catalogue route coverage is complete (`69/69` live on both stacks);
  remaining S2 work is strict evidence, validation notes, support exports, and
  release-hardening.
- Components still depending on app-local component-surface CSS are partial or
  missing/gap, not valid styled parity.
- Start each component from the headless Solid component plus copied/ported S2
  style declarations.
- Do not use the fallback skin as implementation scaffolding for new parity
  work.
