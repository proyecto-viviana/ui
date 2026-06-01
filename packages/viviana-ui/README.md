# @proyecto-viviana/viviana-ui

The viviana brand's design system.

It currently **re-exports `@proyecto-viviana/solid-spectrum`** verbatim — same
components, tokens, and style macro. This establishes the package that the
`@proyecto-viviana/social` apps (pokeforos, bord) depend on, and the point from
which viviana diverges.

Divergence is incremental:

1. Swap in a **viviana token theme** (the brand palette) so components render in
   the viviana look rather than Spectrum's.
2. **Shadow** specific components here where viviana needs different structure.

Keeping in sync with solid-spectrum (which files to check, the update plan when a
new React Spectrum release is ported) is documented in **[UPSTREAM.md](./UPSTREAM.md)**.

## Usage

```ts
import { Button, TextField } from "@proyecto-viviana/viviana-ui";
import { style } from "@proyecto-viviana/viviana-ui/style" with { type: "macro" };
```

Consumers need the `unplugin-parcel-macros` vite plugin (the style macro is
compiled at the consumer's build) and must exclude this package + solid-spectrum
from `optimizeDeps`.

## Status

Source-only (the `solid` export condition points at `src`); consumed via
`pnpm link` during bring-up. A compiled `dist` + npm publish are added once the
pokeforos integration is proven.
