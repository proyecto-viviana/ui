---
id: 649
type: task
title: "Bridge the Geist register by default"
created: 2026-10-12
parent: 32
priority: high
status: merged
history:
  - {
      state: open,
      at: 2026-10-12,
      note: "Owner: Viviana UI is all Geist; Adobe Clean belongs to solid-spectrum only. VisualMode's admin routes rendered Adobe Clean and Source Code Pro.",
    }
  - { state: in-progress, at: 2026-10-12 }
  - {
      state: merged,
      at: 2026-10-12,
      note: "Bridge lives in viviana-tokens.css at the root; browser proof passes. Verification waits on VisualMode taking the next RC and removing its :root rule.",
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

`packages/viviana-ui/src/viviana-tokens.css` binds the three variables to
`--font-display`, `--font-ui` and `--font-mono` in one `:root, :host` block.
The token layer owns the faces, every CSS entry of the package reaches it
through `theme.css`, and `solid-spectrum` never loads it, so the Spectrum
stacks there are untouched and no generated S2 rule changes (ADR 0001). The
block is not repeated under `[data-color-scheme]`: repeated there, a nested
`<Provider colorScheme>` would reset a face the consumer set on an enclosing
container.

`apps/comparison/e2e/font-register.browser.ts` loads a Vite page
(`packages/viviana-ui/test/fixtures/font-register-browser`) whose only
stylesheet is `src/components.css`, in Chromium:

```bash
vp exec --filter @proyecto-viviana/comparison -- playwright test -c e2e/font-register.playwright.config.ts
```

- Before the change both tests fail: Heading, Text and Button compute
  `adobe-clean-spectrum-vf`.
- After it both pass. Heading computes Geist Pixel, Text Geist, Button Geist
  Mono; no `adobe-clean-*` or `source-code-pro` face leaves the `unloaded`
  state, although the sheet declares them; no request goes to `typekit.net`.
- A container that sets `--s2-font-family-sans` computes its own face, also
  inside a nested `<Provider colorScheme="dark">`. With the binding moved into
  the dark scheme block that assertion fails with `Geist`.

Not yet proved: the last `Done when` clause. VisualMode removes the `:root`
rule in `src/styles/design-system.css` once it installs the RC that carries
this change, and checks its admin routes there.

## Open for the owner

Whether the Adobe Clean and Source Code Pro `@font-face` blocks stay in
`font-faces.css`. Recommendation: remove them, in the same RC. After this
change the sans, display and code stacks never reach them. Two stacks of the
package still name Adobe faces: `serif` (`adobe-clean-spectrum-srf-vf`) and
the `:lang(ar)` and `:lang(he)` stacks (`adobe-clean-arabic`,
`adobe-clean-hebrew`); with the blocks gone those fall to the system faces
already listed after them. Removal also ends every `use.typekit.net` request
from this package, which leaves `components-no-fonts.css` (#633) differing
from `components.css` by the Geist import alone. It needs one edit beside the
sheet: the `ui` `full-fonts` case in `scripts/consume-pack-smoke.mjs` asserts a
Typekit font attempt and would assert the Google Fonts import instead.

`apps/web/src/styles/glasselated.css` still sets the three variables under
`[data-glasselated]`. The rule is now redundant; the file belongs to the
public-face writer while #550 is open.
