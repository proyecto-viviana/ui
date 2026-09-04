---
id: 187
type: task
title: "Complete Button hydration evidence in both public packages"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
---

## Cause

`abafbd4d` landed `createMemo(() => local.children)` on both styled Buttons
and moved pending visibility onto the wrapper. The evidence does not yet
name the failure modes the change claims to fix:

- Pending authored-icon hide: no test mounts a `createIcon` child, waits the
  1000 ms `createPendingState` delay, and asserts the icon is hidden while
  progress is visible (`packages/solid-spectrum/test/Button.test.tsx:489-506`
  stamps `data-pending` with static text; `packages/viviana-ui/test/Button.test.tsx`
  has no pending case).
- Mixed text after hydration (VUI-006, `<Button>count: {count()}</Button>`):
  only `FineGrainedFixture` in the solid-spectrum hydrate suite has that
  shape. The new client tests are `{label()}` (single signal), which stay
  green after a revert to `resolveChildren`. `@proyecto-viviana/ui` has no
  `Button.hydrate.test.tsx` although the changeset patches it.
- Host identity: `hydrateAndFlip` compares `textContent` only; a remounted
  `<button>` would pass. The "re-binds without recreating" claim lives in
  comments.
- Icon stability: `<Button><Icon />{label()}</Button>` makes the children
  getter return a new array per update; `getSingleTextChild` sends that to
  the `{content()}` branch. An unkeyed array insert can remount the icon.
  No test authors that S2-legal composition.

## Work

Add, in both packages: a pending-icon visibility contract; a mixed-text
hydrate fixture and reader (viviana-ui twin of the solid-spectrum suite); a
host-identity assertion across `setCount`; and an icon-plus-reactive-text
case that asserts the icon element identity survives a text update. If the
last one fails, the fix is a keyed insert in the styled Button, not a test
edit.

## Done when

Each of the four failure modes has a test that fails on the pre-`abafbd4d`
Button and on a revert to `resolveChildren`, in both published packages.

## Relationship

F-REVIEW-001/002/003/006. Evidence deltas on #135 (do not reopen its
producer change). #186 is the primitive fix that lets the pending-icon test
assert S2's shape.
