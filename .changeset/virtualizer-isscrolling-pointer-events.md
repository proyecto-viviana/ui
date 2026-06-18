---
"@proyecto-viviana/solidaria-components": patch
---

Virtualizer: suppress content pointer events while scrolling

Ports upstream `@react-aria/virtualizer` ScrollView's `isScrolling`
optimization: while the collection is actively scrolling, the content gets
`pointer-events: none` so pointer events don't land on rows recycling under a
stationary cursor (which causes hover-state flicker and needless hit-testing).
The flag is set on the first scroll and cleared 300ms after the last one,
matching upstream's debounce — folded into a single clear/reset since our scroll
handler is already `requestAnimationFrame`-throttled.

To carry the toggle, the `Virtualizer` now renders the inner content wrapper that
upstream's ScrollView always has (`<scroll-view><content>…`), where the previous
single div conflated the two. The outer div remains the scroll container we
measure and read offsets from; the new `data-virtualizer-content` wrapper is a
layout-transparent passthrough that only carries `pointer-events`, so the scroll
container keeps receiving wheel/touch events throughout the gesture.

Upstream's other `isScrolling` use — deferring DOM reordering of reused views
until scrolling stops — does not apply: our Virtualizer renders the visible slice
in order on every pass rather than recycling absolutely-positioned views, so
there is no out-of-order DOM to defer. The relayout-driven scroll write-back is
likewise N/A; in our model the browser owns the scroll position and we read it
through a signal.
