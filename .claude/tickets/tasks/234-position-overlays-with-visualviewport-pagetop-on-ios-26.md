---
id: 234
type: task
title: "Position overlays with visualViewport pageTop on iOS 26"
created: 2026-09-02
parent: 34
status: in-progress
history:
  - { state: open, at: 2026-09-02, note: "opened from the 2026-09 upstream train source diff" }
  - {
      state: in-progress,
      at: 2026-09-02,
      note: "source lives in packages/solidaria/src/popover/ which is outside this lane's ownership fence",
    }
  - {
      state: open,
      at: 2026-09-02,
      note: "out of lane: calculatePosition.ts:174-176 still uses offsetTop/offsetLeft; createOverlayPosition.ts lacks addEvent(getPropagationTargets(window), scroll). Both files are under packages/solidaria/src/popover/, not overlays/.",
    }
  - {
      state: in-progress,
      at: 2026-09-02,
      note: "fence corrected to popover/**; porting pageTop/pageLeft math and window-scroll listener",
    }
---

## Cause

RAC 1.21.0 fixes overlay position on iOS 26. `calculatePosition` now uses
`visualViewport.pageTop/pageLeft` minus scroll instead of `offsetTop/offsetLeft`
because WebKit misreports those during pans
(`packages/react-aria/src/overlays/calculatePosition.ts:140-143` on
`f56660b`). `useOverlayPosition` also listens for window scroll via
`addEvent(getPropagationTargets(window), 'scroll', onScroll)`
(`useOverlayPosition.ts:370-383`). Local calculatePosition still uses
`offsetTop/offsetLeft`
(`packages/solidaria/src/popover/calculatePosition.ts:174-176`). Release
note: "Fix position overlays on iOS 26".

## Work

Port the pageTop/pageLeft visual-viewport math and the window-scroll
listener. Do not invent a different offset. Real iOS/WebKit evidence is
required.

## Done when

Overlay position matches upstream under iOS 26 visual-viewport pan; a
regression test fails if `offsetTop` is read again for that path.

## Relationship

Child of #220. Adjacent to #123 (global scroll across shadow roots) and #64
(Tooltip arrow).

## Landed

`react-spectrum/packages/react-aria/src/overlays/calculatePosition.ts:140-143`
→ `packages/solidaria/src/popover/calculatePosition.ts:178-180`
→ `uses visualViewport.pageTop, not offsetTop, when computing overlay top`

`react-spectrum/packages/react-aria/src/overlays/useOverlayPosition.ts:370-383`
→ `packages/solidaria/src/popover/createOverlayPosition.ts:322-324`
→ `repositions when a scroll event fires on window during visual-viewport resize`

`react-spectrum/packages/react-aria/src/utils/shadowdom/DOMFunctions.ts:96-128`
→ `packages/solidaria/src/utils/dom.ts:177` (`getPropagationTargets`)

Red-then-green: temporarily restored `offsetTop`/`offsetLeft`; pageTop test failed (`top` stayed 0). Temporarily skipped `addEvent(getPropagationTargets(window), 'scroll')`; window-scroll test failed (measure count unchanged). Restored, green.
