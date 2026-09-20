---
id: 558
type: task
title: "focusWithoutScrolling is not upstream's polyfill, and its rewrite closed an import cycle"
created: 2026-09-20
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-20,
      note: 'found while reviewing #555 item 6 (`e6384f37`), which added `import { focusWithoutScrolling } from "./focus"` to `packages/solidaria/src/utils/dom.ts:90` while `packages/solidaria/src/utils/focus.ts:44-51` already imports seven names from `./dom`. Read against upstream to find where to cut it, and upstream''s `react-aria/src/utils/focusWithoutScrolling.ts` turns out to be a leaf module with **no runtime imports at all** - one type from `@react-types/shared`. Ours cannot be a leaf because it was written differently from upstream, and the three differences are each a behaviour difference, not a style one. The cycle is the symptom; the port is the defect',
    }
---

## Scope

Port `focusWithoutScrolling` faithfully. Upstream is
`react-aria/src/utils/focusWithoutScrolling.ts`, read out of the installed
`react-aria@3.52.0` sourcemaps; ours is inside
`packages/solidaria/src/utils/focus.ts`. Three differences, in the order they
matter:

1. **The support probe.** Upstream caches a real feature detection: it calls
   `focus()` on a throwaway `div` with a `get preventScroll()` getter and
   records whether the getter was _read_. Ours has no probe — it does
   `try { element.focus({ preventScroll: true }) } catch { …fallback… }`. A
   browser that ignores `preventScroll` without throwing never reaches our
   fallback, and ignoring-without-throwing is exactly what the browsers this
   polyfill exists for do (the upstream comment names Safari and old Edge, and
   links webkit bug 178583). So our polyfill is close to dead code on its own
   target. This is the part to fix first, and it is the part a test can pin.

2. **Which ancestors count as scrollable.** Upstream walks `parentNode` up to
   `document.scrollingElement || document.documentElement` and keeps an element
   when it is _actually_ overflowing —
   `offsetHeight < scrollHeight || offsetWidth < scrollWidth`. Ours walks
   `parentElement` and keeps an element when its computed `overflowY`/`overflowX`
   is `auto` or `scroll`. Those are different sets in both directions: a styled
   `overflow: auto` box that is not overflowing has no scroll to restore, and an
   element overflowing under a different overflow value is missed.

3. **The signature.** Ours takes a second `options?: FocusWithoutScrollingOptions`
   and spreads it over `{ preventScroll: true }`. Upstream takes the element
   only. Check every call site before removing the parameter; if a caller
   genuinely needs it, that caller is the divergence to explain, not this
   helper.

Then move the result into its own leaf module,
`packages/solidaria/src/utils/focusWithoutScrolling.ts`, as upstream has it, and
point `dom.ts` at the leaf. Note that this only works _because_ of point 2:
ours currently needs `getOwnerDocument` from `./dom`, so extracting the helper
as it stands today would move the cycle rather than break it. Upstream reaches
for the global `document`, which is what makes it a leaf.

## Done when

`focusWithoutScrolling` matches upstream's behaviour on all three points, lives
in its own module with no runtime imports from `./dom`, and
`packages/solidaria/src/utils/dom.ts` no longer participates in an import cycle.

## Proof

- A test that pins the probe: an element whose `focus()` ignores `preventScroll`
  without throwing must still have its ancestors' scroll positions restored.
  Today that test is red.
- A test that pins the ancestor set against actual overflow rather than computed
  `overflow`.
- The cycle is gone by inspection: no path from `utils/dom.ts` back to
  `utils/dom.ts`.

## Relationship

Child of #544. Caused by #555 item 6 (`e6384f37`), which is correct in itself —
upstream's `openLink` does call `focusWithoutScrolling`, so the edge belongs
there and the cycle is our module layout's fault, not the fix's. Sibling of
#557, which is the other "our port of a shared util diverged and a caller worked
around it" finding from the same review.
