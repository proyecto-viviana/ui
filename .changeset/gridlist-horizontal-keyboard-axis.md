---
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/solidaria-components": patch
---

GridList: make the keyboard navigation axis orientation-aware

The custom GridList keyboard handler (`createGridList`) only ever navigated the
block axis (Up/Down), so in a `orientation="horizontal"` list the Left/Right
arrows did nothing. It now mirrors upstream's `ListKeyboardDelegate` for a
`stack` layout:

- **Vertical (default):** Left/Right stay no-ops (upstream strips
  `getKeyLeftOf`/`getKeyRightOf` for a vertical stack); Up/Down navigate
  prev/next.
- **Horizontal:** Left/Right become the primary axis — Right moves to the next
  item, Left to the previous — flipped under RTL (Right=prev, Left=next). Up/Down
  keep navigating the block axis too, matching upstream.

The `solidaria-components` `GridList` threads its resolved `orientation` and text
`direction` (reusing the same `getComputedStyle`/`document.dir` resolution as its
drag-and-drop delegate) into the hook. This completes the `T-18` horizontal
GridList follow-up: the windowing/layout half already shipped in
`virtualizer-horizontal-orientation.md`; this is the navigation half. The default
vertical orientation is unchanged.
