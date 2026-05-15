# @proyecto-viviana/solid-spectrum

Spectrum 2 styled Solid components.

This package is the styled layer of the port. It should match
`@react-spectrum/s2` behavior and visuals through S2-compatible tokens, style
declarations, and generated CSS.

## Install

```bash
npm install @proyecto-viviana/solid-spectrum solid-js
```

```tsx
import { Provider, Button } from "@proyecto-viviana/solid-spectrum";
import "@proyecto-viviana/solid-spectrum/styles.css";

export function App() {
  return (
    <Provider colorScheme="dark">
      <Button variant="accent">Save</Button>
    </Provider>
  );
}
```

## Styling Rule

Do not implement S2 parity with handwritten component CSS or screenshot-tuned
values. The controlling decision is
[`../../docs/adr/0001-s2-styling-source-of-truth.md`](../../docs/adr/0001-s2-styling-source-of-truth.md).

## Current Parity Evidence

As of the 2026-05-15 local reports:

- `69` official S2 catalogue entries are tracked in the comparison app.
- `33` entries are live on both React and Solid sides.
- `36` entries are still missing or blocked.
- root catalogue exports are present, but `80` non-root/support S2 value
  exports are still missing, mostly contexts, slots, hooks, and helpers.

Use the comparison app as the roadmap:

```bash
vp run comparison:report:gaps
vp run comparison:report:exports
vp run comparison:dev
```

The public barrel is [`src/index.ts`](src/index.ts). A root export can exist
before the component has accepted visual parity, so always check the comparison
reports before claiming completion.
