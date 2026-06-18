---
"@proyecto-viviana/solidaria-components": patch
"@proyecto-viviana/solid-spectrum": patch
"@proyecto-viviana/ui": patch
---

Virtualizer: virtualize collections that scroll with the page (port of react-aria-components 1.18 window scrolling)

React Aria's `ScrollView` does not assume a virtualized collection has its own
scroll container. It computes the visible rect as the intersection of the scroll
view's content size with the browser window viewport, tracking how far the scroll
view has been pushed above the viewport by page (or ancestor) scrolling. React
Aria Components enables this by default — `CollectionRoot` hard-codes
`allowsWindowScrolling: true` — so a `ListBox`, `Table`, `Tree`, etc. rendered at
its natural height inside a normally scrolling page still only mounts the rows
that are actually on screen.

Previously our `Virtualizer` measured only its own element: the visible window
was the element's `clientHeight` and the offset was the element's `scrollTop`. A
collection that grew to its full height and scrolled with the page therefore
rendered every row, defeating virtualization.

The `Virtualizer` now mirrors upstream:

- The effective viewport height is the scroll view's height intersected with the
  window viewport (`max(0, min(elementHeight - viewportOffset, window.innerHeight))`).
- The visible-range offset is the element's own scroll position plus
  `viewportOffset` — how far the scroll view's top edge sits above the window
  viewport, derived from `getBoundingClientRect()`.
- A single document-level capturing `scroll` listener updates the local scroll
  position when the scroll view itself scrolls, and the window offset when an
  ancestor or the page scrolls, matching `ScrollView`'s capturing listener.

A new `allowsWindowScrolling` prop (default `true`) opts out: set it to `false`
to restrict virtualization to the element's own scroll container, which is the
previous behavior. An explicit `viewportSize` layout option still takes
precedence over the measured window viewport.

For a fixed-height collection that sits entirely within the viewport this is
behavior-preserving — the `window ∩ element` math reduces to the element's own
scroll — so existing collections are unaffected unless they actually scroll with
the page.

Two parts of upstream `ScrollView` are intentionally left as follow-ups and do
not affect window-scroll correctness: the `isScrolling` state (which toggles
`pointer-events: none` on the content while scrolling) and the imperative
`scrollToItem`/`scrollToRect` API.
