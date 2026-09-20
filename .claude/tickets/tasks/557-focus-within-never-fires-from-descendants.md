---
id: 557
type: task
title: "createFocusWithin never fires from a descendant, so overlays need an invented listener"
created: 2026-09-20
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-20,
      note: "found while deciding #555 item 3. `focusWithinProps` returns `onFocus`/`onBlur`, which in Solid bind the native, non-bubbling `focus`/`blur` events; React's synthetic pair bubbles, which is what upstream useFocusWithin relies on. Measured: a real `.focus()` on a child of the element holding focusWithinProps calls neither onFocusWithin nor onBlurWithin. createOverlay papers over it with a document-level `focusin` listener that upstream does not have; removing that listener turns Popover.test.tsx 'should close modal popovers when focus moves outside' red",
    }
---

## Scope

1. Port `useFocusWithin` so focus within an element's subtree reaches it, the
   way React's bubbling synthetic `onFocus`/`onBlur` do — `onFocusIn` /
   `onFocusOut` in Solid. The blast radius is every consumer:
   `createFocusRing`, `createMenu`, `createListBox`, `createRadioGroup`,
   `createCheckboxGroup`, `createNumberField`, `createDateField`,
   `createVisuallyHidden`, `createOverlay`. Check each for a prop-name clash
   with its own `onFocusIn`/`onFocusOut`.
2. Then remove `createOverlay`'s document-level `focusin` close listener
   (added by `47746917` for the ActionMenu focus-out contract, no upstream
   counterpart) and prove the contract still holds from `onBlurWithin` alone:
   `packages/solidaria-components/test/Popover.test.tsx` and
   `apps/comparison/e2e/actionmenu-contract.spec.ts`.
3. Re-read `Color.tsx`'s note about `createFocusWithin` only flipping on the
   element itself; it is the same defect described from another component.

## Done when

`createFocusWithin` fires for descendant focus with a red-then-green test, the
invented listener is gone, and the Popover and ActionMenu contracts are green
without it.

## Proof

The red run of the descendant-focus test on the old source, the green run
after, and the two contracts above with the listener removed.

## Relationship

Child of #544. Split out of #555 item 3, which lands the rest of `useOverlay`
parity and leaves the listener in place with a comment pointing here.
