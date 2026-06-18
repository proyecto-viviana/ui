---
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/solidaria-components": patch
---

ListBox: make the keyboard navigation axis orientation-aware

`createListBox`'s keyboard handler only navigated the block axis (Up/Down), so in
an `orientation="horizontal"` listbox the Left/Right arrows did nothing. It now
mirrors upstream's `ListKeyboardDelegate` for a `stack` layout:

- **Vertical (default):** Left/Right stay no-ops (upstream strips
  `getKeyLeftOf`/`getKeyRightOf` for a vertical stack); Up/Down navigate
  prev/next.
- **Horizontal:** Left/Right become the primary axis — Right moves to the next
  option, Left to the previous — flipped under RTL (Right=previous, Left=next).
  Up/Down keep navigating the block axis too, matching upstream. With nothing
  focused, either arrow enters at the first option (upstream's `getFirstKey()`
  fallback), and disabled options are skipped.

The Left/Right cases carry the same selection-on-focus side effects as Up/Down
(replace in single-select, shift-extend in multi-select). The
`solidaria-components` `ListBox` threads its `orientation` and the `useLocale()`
text direction into the hook — the same direction source upstream's ListBox uses.
The default vertical orientation is unchanged.
