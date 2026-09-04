---
id: 186
type: task
title: "Apply IconContext styles reactively in createIcon"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
---

## Cause

`createIconForBase` builds `const svg = (<Component class={mergedClass()} />)`
where `mergedClass` reads `ctx.styles`
(`packages/solid-spectrum/src/icon/spectrum-icon.tsx:170-209`). Upstream S2
hides a pending Button's authored icon through `IconContext.styles`
(`react-spectrum/packages/@react-spectrum/s2/src/Button.tsx:477-487`). #135
recorded that the icon class can be the one computed before pending flipped,
and both Button copies (and ActionButton) work around it by moving
`visibility: { isProgressVisible: "hidden" }` onto the `centerBaseline`
wrapper. That is a wrapper patch for a non-reactive primitive; any later
S2-faithful copy of the icon styles (ToggleButton, LinkButton, a new pending
surface) rediscovers the stale SVG class.

## Work

Make `createIcon` apply context `styles` reactively so a consumer can put
pending visibility where S2 puts it. Then let Button match S2 again (wrapper
carries `order` only) and add a regression that a `createIcon` child inside
a Button flips to hidden when `isProgressVisible` becomes true.

## Done when

An authored `createIcon` child inside a pending Button hides via
`IconContext.styles` in both styled packages, with a test that fails if the
context read is snapshotted.

## Relationship

F-REVIEW-004. Structural fix under #135's wrapper move (Rule #5). Blocks
part of #187.
