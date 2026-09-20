# @proyecto-viviana/solid-spectrum

Adobe Spectrum 2 components for Solid. It is the styled layer that tracks
`@react-spectrum/s2`: the same component names, the same props, and styles
generated from Adobe's own tokens.

Use it when you want Spectrum in a Solid app. For the Viviana look on the same
foundation, use `@proyecto-viviana/ui`.

## Install

Requires **Solid 2**. `solid-js` and `@solidjs/web` are peer dependencies, at
`>=2.0.0-rc.9 <3`.

```bash
npm install @proyecto-viviana/solid-spectrum@rc solid-js@next @solidjs/web@next
```

The release candidate is on the `rc` tag. The `latest` tag is the Solid 1
line.

## Example

The CSS import is required. Components never inject their own styles, so
without it everything renders unstyled.

```tsx
import { Provider, Button } from "@proyecto-viviana/solid-spectrum";

import "@proyecto-viviana/solid-spectrum/components.css";

export function App() {
  return (
    <Provider colorScheme="dark">
      <Button variant="accent">Save</Button>
    </Provider>
  );
}
```

`components.css` is `font-faces.css` + `styles.css`, each also exported on its
own subpath: the font-face declarations, and the component rules the S2 style
macro generates. Keep whichever you import ahead of your other stylesheets.
`font-faces.css` opens with an `@import`, and CSS drops an `@import` that any
rule precedes, so loading it late makes the Adobe Clean fonts fall back with no
error.

## In the chain

```text
solid-stately
      ↓
solidaria
      ↓
solidaria-components
      ↓
      ├─ solid-spectrum          ← you are here
      ├─ @proyecto-viviana/ui
      ├─ kumo
      └─ geist
```

It depends on the three headless packages and on `@adobe/spectrum-tokens`. It
does not depend on any other styled package.

## Status

Published, and Spectrum 2 parity is in progress. An export is a floor, not
proof that a component matches upstream — a name can be in the barrel before
the component has accepted visual parity.
[`src/index.ts`](src/index.ts) is the source of truth for the public surface.

Styles are generated from tokens by the style macro. Handwritten component CSS
and screenshot-tuned values are not how parity is reached here; the decision is
[ADR 0001](https://github.com/proyecto-viviana/ui/blob/main/docs/adr/0001-s2-styling-source-of-truth.md).

## Evidence

```bash
vp run guard:spectrum-tokens-pin   # the pinned Adobe token version
vp run guard:style-macro-parity    # generated styles match the pinned source
vp run comparison:report:gaps
vp run comparison:report:exports
vp run comparison:dev              # the React-vs-Solid harness
```

Run the reports rather than trusting a number in this file. What "ported"
means here is [the evidence bar](https://github.com/proyecto-viviana/ui/blob/main/.claude/current/certification.md).

## Links

- Documentation: <https://ui.proyectoviviana.org/solid-spectrum>
- Repository: <https://github.com/proyecto-viviana/ui>

## License

MIT AND Apache-2.0. Our work is MIT; the port of Adobe's React Spectrum S2
keeps Apache-2.0. Both licenses and the project `NOTICE` ship in this package.
