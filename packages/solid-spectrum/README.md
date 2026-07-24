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
import "@proyecto-viviana/solid-spectrum/components.css";

export function App() {
  return (
    <Provider colorScheme="dark">
      <Button variant="accent">Save</Button>
    </Provider>
  );
}
```

Components do not inject their own styles, so that import is required — without
it everything renders unstyled. `components.css` is `font-faces.css` +
`styles.css`; import those two separately only if your app loads fonts itself.
Keep whichever you choose ahead of your other stylesheets: `font-faces.css`
opens with an `@import`, and CSS drops an `@import` that any rule precedes.

## Styling Rule

Do not implement S2 parity with handwritten component CSS or screenshot-tuned
values. The controlling decision is
[ADR 0001 — S2 styling source of truth](https://github.com/proyecto-viviana/ui/blob/main/docs/adr/0001-s2-styling-source-of-truth.md).

## Current Parity Evidence

As of the 2026-07-24 local reports:

- `78` official S2 catalogue entries are tracked in the comparison app.
- `78` entries are live on both React and Solid sides — the catalogue gap is
  closed.
- `7` non-root S2 value exports are still missing: `LabeledValueContext` and the
  six drag-and-drop names (`useDragAndDrop`, `DragPreview`,
  `DIRECTORY_DRAG_TYPE`, `isTextDropItem`, `isFileDropItem`,
  `isDirectoryDropItem`). Drag-and-drop is the one un-ported subsystem.

Those numbers are a snapshot; the reports are the authority. Re-run them rather
than trusting this section:

```bash
vp run comparison:report:gaps
vp run comparison:report:exports
vp run comparison:dev
```

The public barrel is [`src/index.ts`](src/index.ts). A root export can exist
before the component has accepted visual parity, so always check the comparison
reports before claiming completion.
