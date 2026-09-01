---
id: 185
type: task
title: "Resolve viviana-ui SegmentedControl icons inside their context"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
---

## Cause

#183 fixed `solid-spectrum` `SegmentedControlItem` so `resolveChildren` runs
under `IconContext.Provider` (`packages/solid-spectrum/src/segmentedcontrol/index.tsx:359-394`).
`@proyecto-viviana/ui` still calls
`resolveChildren(() => local.children)` in `SegmentContent` _before_ creating
`iconContextValue` and the provider, then inserts `content()` inside it
(`packages/viviana-ui/src/segmentedcontrol/index.tsx:383-409`). That is the
early-evaluation class #183 closed. The barrel exports `SegmentedControl` /
`SegmentedControlItem`; there is no viviana-ui SegmentedControl test; the
file was already diverged so `guard:layer-boundary` reported no new fork.
The `segment-icon-context` changeset correctly lists only solid-spectrum.

## Work

Port the same nested-owner shape (see solid-spectrum `SegmentedControlItem`
and `ToggleButton`'s `ResolvedContent`) to the viviana-ui copy. Add a
viviana-ui test that mounts an authored icon child and asserts it received
the segment `IconContext` (size/styles), which fails on HEAD. Add a changeset
for `@proyecto-viviana/ui`.

## Done when

Both styled SegmentedControl copies resolve children under
`IconContext.Provider`, the viviana-ui test fails if the resolve moves back
above the provider, and #1's diverged list does not grow.

## Relationship

F-REVIEW-005. Delta on #183 (solid-spectrum only). Not #168 (children()
snapshot of mixed text). Styled-layer composition per Rule #4.
