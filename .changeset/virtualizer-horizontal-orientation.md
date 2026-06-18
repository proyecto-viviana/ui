---
"@proyecto-viviana/solidaria-components": patch
---

Virtualizer: add a horizontal `orientation` axis for GridList + ListBox

React Aria's `ListLayout` takes an `orientation` option (default `vertical`) that
offsets items along `x`/`width` when horizontal, and RAC's ListBox/GridList expose
`data-orientation`. Ours was hardcoded vertical. This gives our virtualization an
orientation axis so collections can window horizontally.

**`VirtualizerLayouts`** — a new `Orientation` type and an `orientation` option on
`DefaultVirtualizerLayoutOptions` (default `'vertical'`). `ListLayout.getLayoutInfo`
now offsets along `x` with `width` = itemSize and `height` filling the viewport's
cross axis when horizontal (mirroring upstream's `offsetProperty` / `heightProperty`
switch); `getDropTargetFromPoint` measures the drop point along `point.x` instead of
`point.y`. `getVisibleRange` is unchanged — it is axis-agnostic. `TableLayout`
inherits and stays vertical.

**`Virtualizer`** — tracks the scroll view's `scrollLeft` and feeds the horizontal
scroll axis plus measured width into `getVisibleRange` and page navigation when the
layout is horizontal, and exposes the resolved `orientation` on its context so
consumers render their windowing spacers along the correct axis.

**`GridList`** — gains an `orientation?` prop (default `'vertical'`, mirroring RAC),
threading it into the render props, the drop-target delegate, and a `data-orientation`
attribute on the root. **`GridList` + `ListBox`** — their virtualization spacers now
reserve the windowed-out extent along `width` when the virtualizer is horizontal,
rather than always `height`.
