---
id: 234
type: task
title: "Position overlays with visualViewport pageTop on iOS 26"
created: 2026-09-02
parent: 34
status: open
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

## Out of lane

Upstream `packages/react-aria/src/overlays/calculatePosition.ts:140-143` and
`useOverlayPosition.ts:370-383`. Solid counterparts are
`packages/solidaria/src/popover/calculatePosition.ts:174-176` (`offsetTop` /
`offsetLeft`) and `packages/solidaria/src/popover/createOverlayPosition.ts:315-328`
(visualViewport scroll only; no `addEvent(getPropagationTargets(window), 'scroll')`).
This lane's fence is `packages/solidaria/src/overlays/**`, not `popover/**`. No
source change.
