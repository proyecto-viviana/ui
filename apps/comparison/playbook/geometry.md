# Geometry

Geometry parity covers dimensions, layout, anchoring, spacing, clipping, and
responsive behavior.

## Checks

- Root, trigger, input, button, popover, list, item, cell, and icon boxes match
  upstream for every supported size.
- Popovers anchor to the same element and preserve upstream min-width/width
  behavior.
- Text, icon, checkmark, invalid icon, required marker, and spinner alignment
  match upstream.
- Section headers, separators, empty states, loader rows, and virtualized rows
  have upstream heights and padding.
- Focus rings and outlines are not clipped by screenshot frames.
- Dark mode, light mode, forced colors, RTL, and mobile widths do not change
  geometry unexpectedly.

## Tests

Use DOM rect comparisons for stable geometry. Use screenshots for visual
evidence, but back them with numeric assertions when a prior bug involved
alignment, clipping, width, or row height.
