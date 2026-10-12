---
id: 649
type: task
title: "Bridge the Geist register by default"
created: 2026-10-12
parent: 32
priority: high
status: open
history:
  - {
      state: open,
      at: 2026-10-12,
      note: "Owner: Viviana UI is all Geist; Adobe Clean belongs to solid-spectrum only. VisualMode's admin routes rendered Adobe Clean and Source Code Pro.",
    }
---

## Cause

`@proyecto-viviana/ui` names its faces in `--font-display`, `--font-ui` and
`--font-mono` (`viviana-tokens.css`: Geist Pixel, Geist, Geist Mono), but its
component styles read `--s2-font-family-display`, `--s2-font-family-sans` and
`--s2-font-family-code` (`packages/viviana-ui/src/style/spectrum-theme.ts`)
and fall back to `adobe-clean-spectrum-vf` and `source-code-pro` when those are
unset. Nothing the package ships sets them. `src/text/type-roles.ts` records
the behaviour: "an app that bridges nothing falls back to the Spectrum
stacks".

VisualMode set the three variables only inside its editor frame, so every
route outside it (`/admin`, `/admin/snapshots`) loaded
`adobe-clean-spectrum-vf` and `source-code-pro` and no Geist face. VisualMode
now sets them at `:root` in `src/styles/design-system.css` (809bc4764); that
rule is a consumer workaround.

## Scope

The styles `@proyecto-viviana/ui` ships set the three `--s2-font-family-*`
variables to its own face tokens wherever its tokens apply, so a consumer that
imports the package's CSS gets Geist Pixel, Geist and Geist Mono without
writing a rule. A consumer may still override the variables in a narrower
scope, as VisualMode's editor frame does with Geist Mono. `solid-spectrum`
keeps the Spectrum stacks.

Decide with the owner whether the Adobe Clean `@font-face` blocks stay in
`@proyecto-viviana/ui`'s `font-faces.css` once no style of the package can
reach them; #633 covers the entry without font faces.

## Done when

A fresh page that imports only `@proyecto-viviana/ui/components.css` and
renders a Heading, a Text and a Button computes Geist Pixel, Geist and Geist
Mono for them and loads no `adobe-clean-*` or `source-code-pro` face. The same
page with `--s2-font-family-sans` overridden on a container computes the
override inside it. VisualMode removes its `:root` rule and its admin routes
still compute the Geist faces.

## Proof
