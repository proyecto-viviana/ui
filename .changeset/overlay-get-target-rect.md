---
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/solidaria-components": patch
---

Overlay positioning: add the `getTargetRect` override

Mirror `useOverlayPosition`'s `getTargetRect?: (target) => DOMRect | null`. The
callback overrides the trigger's measured bounding rect so an overlay can be
positioned relative to an arbitrary point — e.g. the mouse cursor for a context
menu or a text selection — instead of the trigger element itself.

`calculatePosition` gains a `targetRect` option threaded through
`getElementOffset`/`getPosition` into the child-offset computation; when omitted
or `null` it falls back to `target.getBoundingClientRect()` exactly as before.
`createOverlayPosition` exposes `getTargetRect` on `AriaPositionProps` and
forwards its result as `targetRect` (called against the live target node, and —
matching upstream — left out of the position-update dependency tracking). The
headless `Popover` component adds `getTargetRect` to its prop allowlist;
`createPopover` and the S2 `Popover` inherit it through their prop-spread.
