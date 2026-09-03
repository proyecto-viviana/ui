---
id: 431
type: task
title: "Apply live Skeleton isLoading to createIcon loading styles"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 skeleton functional pass: URL ?isLoading=false drops icon loadingStyle on both (bg none, radius 0, loadingTargetCount 0). Live comparison:controls-change {isLoading:false} and the control-form switch update Text/Image (inert off, img opacity 1, AX restores img Preview) but Solid svg keeps gradient + background-size 300% + radius 4px; React drops the paint. Solid cancels the WAAPI; React leaves a 2000ms animation on bg none (not user-visible). createIconForBase stamps class={mergedClass()} once; useInertAttribute/useLoadingAnimation refs already track. Same snapshot as #186, different surface",
    }
---

Skeleton `isLoading` should restyle a `createIcon` descendant the way
S2 does. After mount, a live `comparison:controls-change` (or the
route switch) that sets `isLoading: false` leaves Solid's inline SVG
on `loadingStyle` + `skeletonIconStyles` (gradient, `background-size:
300%`, `border-radius: 4px`, `* { visibility: hidden }`) while Text
and Image already leave the loading treatment.

URL remount (`?isLoading=false`) matches both stacks: icon `bg none`,
radius `0px`, no loading targets, no WAAPI. Live Text nested
`SkeletonText` spans and Image wrapper loading paint already drop.
`inert` and the shimmer animation already track via refs
(`useInertAttribute` / `useLoadingAnimation`).

`createIconForBase` builds `<Component class={mergedClass()} />`
(`packages/solid-spectrum/src/icon/spectrum-icon.tsx`). `mergedClass`
reads `isSkeleton() ? loadingStyle` and `useSkeletonIcon`. That class
string is snapshotted on first render, so a later Skeleton context
flip does not restyle the SVG.

## Evidence

`http://127.0.0.1:4341/components/skeleton/`, islands mounted.
Default `isLoading: true`, then `comparison:controls-change`
`{isLoading:false}` (or uncheck the isLoading switch).

Live `isLoading: false`:

|                              | React                         | Solid                     |
| ---------------------------- | ----------------------------- | ------------------------- |
| fixture JSON                 | `{isLoading:false}`           | same                      |
| Text inert / nested skeleton | false / 0                     | same                      |
| img opacity / visibility     | 1 / visible                   | same                      |
| icon `inert`                 | false                         | false                     |
| icon loading paint           | **none / 0px**                | **gradient / 300% / 4px** |
| loadingTargetCount           | **0**                         | **1 (`svg`)**             |
| AX                           | img Preview + title/body/meta | same                      |

URL `?isLoading=false` rest: both icon `bg none`, radius `0px`,
loadingTargetCount 0.

React leftover WAAPI on the svg (`2000ms` ease-in-out, `background-image:
none`) and the 500ms image reveal `CSSTransition` are not the Solid
paint miss.

## Repro

1. Open `http://127.0.0.1:4341/components/skeleton/`.
2. Wait for `data-islands-mounted="true"`.
3. Uncheck isLoading (or dispatch `comparison:controls-change` with
   `{isLoading:false}`).
4. Diff `getComputedStyle` on each panel's
   `.comparison-skeleton-inline > svg`: React `background-image` none
   and `border-radius` 0; Solid still `linear-gradient` /
   `background-size: 300%` / `4px`.

## Done when

A live `isLoading` flip after mount drops Solid `createIcon`
`loadingStyle` and `skeletonIconStyles` to match S2 (no gradient,
radius 0, no `* { visibility: hidden }`) without a remount. A
comparison-route live walk fails if the svg is still a loading target
while Text/Image are not. URL remount must keep working. Do not
start #254.

## Relationship

Child of #24. Found by #260. Same `createIcon` `class={mergedClass()}`
snapshot as #186 (pending Button `IconContext.styles`); this ticket is
the Skeleton loading-class surface and needs a skeleton-route
regression. Not #339 (Card TextContext size). `inert=""` vs `"true"`
is not this. Do not start #254.
