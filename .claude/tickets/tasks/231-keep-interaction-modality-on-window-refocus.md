---
id: 231
type: task
title: "Keep interaction modality on window refocus"
created: 2026-09-02
parent: 34
status: open
history:
  - { state: open, at: 2026-09-02, note: "opened from the 2026-09 upstream train source diff" }
---

## Cause

RAC 1.21.0 keeps the current interaction modality when the window itself is
focused after a tab/app switch, so Safari does not paint a focus ring.
`packages/react-aria/src/interactions/useFocusVisible.ts:113-131` on
`f56660b`: if `target === ownerWindow`, set `hasBlurredWindowRecently` and
return (and that path is no longer gated on `isTrusted`). Local
`handleFocusEvent` still returns early for both window and document and then
clears the flag on the next element focus
(`packages/solidaria/src/interactions/createInteractionModality.ts:119-140`).
Release note: "Keep the interaction modality on window refocus so Safari
doesn't show a focus ring". `setInteractionModality` is already exported from
solidaria (`packages/solidaria/src/index.ts:84`); RAC also re-exports it from
the components barrel (`exports/index.ts:289`). `guard:rac-export-gap` does
not score that re-export because it counts local RAC modules only.

## Work

Port the window-target re-arm of `hasBlurredWindowRecently`. Re-export
`setInteractionModality` from solidaria-components to match the RAC barrel.

## Done when

Returning to a keyboard-focused page does not switch modality to virtual;
Safari evidence matches upstream. A test fails if window focus clears the
blur flag.

## Relationship

Child of #220. Adjacent to #111 (virtual pointer).
