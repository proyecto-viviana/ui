---
"@proyecto-viviana/solidaria": patch
---

`createAutocomplete`: defer first-item focus when the collection isn't mounted, and dispatch ArrowLeft/ArrowRight to the focused item before clearing

Two behaviors from `@react-aria/autocomplete` (the rc.8 build paired with the
pinned RAC 1.19.0) that the port was missing:

- **Deferred first-item focus.** When forward typing requests first-item focus
  but the collection element isn't mounted yet, the hook can't dispatch a focus
  event into a not-yet-rendered collection. It now mirrors upstream's
  `autoFocusOnMount` state: `focusFirstItem` sets a deferred flag, and
  `collectionProps.autoFocus` reads `"first"` while the flag is set (`false`
  otherwise) so the collection focuses its first item on mount. Editing/deleting
  resets the flag via `clearVirtualFocus`.
- **Arrow inline-navigation.** ArrowLeft/ArrowRight with no virtual focus just
  moves the text cursor (stop propagation, no clear). With virtual focus the key
  is dispatched to the focused item first, and the active descendant is cleared
  only afterward — and only if the item didn't cancel the event (so an item that
  consumes the arrow, e.g. an expandable row collapsing, retains virtual focus).

These are hook-level: the emitted `collectionProps.autoFocus` and the
focus/clear events are validated directly. Honoring `collectionProps.autoFocus`
and listening for the `autocomplete:focus`/`autocomplete:clearfocus` events in a
collection consumer (ListBox/Menu) remains a separate, currently-unwired bridge.
