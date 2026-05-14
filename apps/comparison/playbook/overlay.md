# Overlay

Overlay parity covers portal behavior, positioning, dismissal, modality,
screen-reader hiding, scroll behavior, and focus return.

## Checks

- Portal target and provider override behavior match upstream.
- Unsafe or custom portal-container behavior is supported only where upstream
  supports it and must record styling/accessibility caveats.
- Trigger ref is the same element upstream uses for positioning.
- Placement, offset, alignment, flipping, cross-offset, and minimum width match.
- Modal vs non-modal behavior matches upstream.
- Outside click, `Escape`, selection, blur, and route changes dismiss in the
  same situations.
- Focus is restored to the correct trigger after dismissal.
- `ariaHideOutside` or equivalent screen-reader hiding is applied when upstream
  does.
- Body scroll locking is present only for modal overlays that require it.
- Overlay entry/exit attributes and animations are testable.
- Portal nodes, outside-hidden state, scroll locks, global listeners, and
  observers are cleaned up after close, route change, unmount, and nested
  overlay dismissal.

## Tests

Assert open and closed DOM, placement geometry, focus return, no unwanted page
scrolling, and screen-reader-visible region changes where applicable.
