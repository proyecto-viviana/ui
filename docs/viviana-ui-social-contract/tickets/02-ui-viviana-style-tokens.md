# Ticket: `ui-viviana-style-tokens`

## Goal

Make `@proyecto-viviana/ui/style` the Viviana-owned style macro entry, with
Spectrum-compatible shape and Viviana-owned color/theme tokens.

## Problem

`packages/viviana-ui/src/style.ts` currently re-exports
`@proyecto-viviana/solid-spectrum/style`. That means app code importing
`@proyecto-viviana/ui/style` still compiles named tokens such as `accent`,
`neutral`, `heading`, `backgroundColor: "base"`, and focus-ring helpers through
the Spectrum token map. Viviana CSS variables are available only when components
explicitly use arbitrary values such as `[var(--color-accent)]`.

## Scope

- Add a package-local `style/` implementation for `viviana-ui`.
- Preserve the same macro API shape as `solid-spectrum/style`:
  `style`, `css`, `color`, `baseColor`, `lightDark`, `colorMix`, `size`,
  `space`, `fontRelative`, `focusRing`, `setColorScheme`, `centerPadding`,
  and the runtime helpers.
- Keep Spectrum spacing, radius, sizing, and type ramp where desired, but make
  semantic color tokens resolve through Viviana variables or Viviana token data.
- Make `theme.css` and generated macro CSS agree on `data-color-scheme`.
- Update in-package comments that still describe Viviana tokens as future work.

## Out Of Scope

- Rewriting all native component styles.
- Changing the `solid-spectrum` package token map.
- Social app visual reskin beyond proving the token path works.

## Acceptance Criteria

- `@proyecto-viviana/ui/style` no longer re-exports
  `@proyecto-viviana/solid-spectrum/style` directly.
- A macro smoke test proves `style({ backgroundColor: "accent" })` and
  `style({ color: "accent" })` compile to Viviana-owned values or variables.
- Existing arbitrary `[var(--color-*)]` native component colors keep working.
- Type exports and autocomplete remain compatible with `solid-spectrum/style`
  for supported tokens.
- Built CSS includes the rules needed by both UI-native components and app-authored
  `@proyecto-viviana/ui/style` calls.
