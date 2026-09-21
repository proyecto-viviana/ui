---
id: 580
type: task
title: "The solid-spectrum and viviana-ui toast modules are ninety per cent the same file, and a one-line defect had to be fixed twice"
created: 2026-09-21
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-21,
      note: "filed by the close-gates writer while fixing #578's first cause, to discharge the standing rule that two copies are either extracted or ticketed. `grep -rn '=> fn)' packages/*/src/` returned exactly two lines - `packages/solid-spectrum/src/toast/index.tsx:317` and `packages/viviana-ui/src/toast/index.tsx:320` - character for character, and the same one-character-class defect had to be repaired in both, with a regression test written twice. Not extracted in that commit because the duplication is the whole module, not the helper: the two files are 1162 and 1248 lines and differ on 118 lines after whitespace folding, and `startViewTransition` closes over each package's own `ensureToastAnimationStyles` and `globalReduceMotion`. Lifting twenty lines while a thousand stay doubled is the gesture, not the fix",
    }
---

## What is duplicated

`packages/solid-spectrum/src/toast/index.tsx` and
`packages/viviana-ui/src/toast/index.tsx`, two separately published packages:

|                  | lines | differing lines after whitespace folding |
| ---------------- | ----: | ---------------------------------------: |
| `solid-spectrum` |  1162 |                                      118 |
| `viviana-ui`     |  1248 |                                          |

About ninety per cent of the module is common: the view-transition helper, the
animation-style injection, the queue wiring, the region and container
structure, the expand and collapse model, and the `ToastQueue` convenience
surface. What genuinely differs is the styling register, which is the only
thing that is supposed to differ between the two.

## Why it is filed rather than fixed

#578's first cause was `doc.startViewTransition(() => fn)` - a callback that
returned the mutation instead of running it, so no toast rendered in any browser
with the View Transitions API. It existed in both copies, so the fix landed in
both, and the regression test that covers the browser branch had to be written
twice. That is the cost this ticket exists to remove.

It was not extracted in that commit because the helper is not the unit of
duplication. `startViewTransition` reads each package's module-local
`globalReduceMotion` and calls its own `ensureToastAnimationStyles`, so lifting
it alone means either passing both in or lifting them too - at which point the
honest boundary is the whole behavioral half of the module.

## Work

1. Decide the seam. The headless half already lives in
   `solidaria-components`; what is doubled is the _styled-sibling_ behavior that
   sits above it. Either it moves down into `solidaria-components` behind
   options, or a shared internal module is created that both styled packages
   import. Name which, and why, before moving code.
2. Move the view-transition helper, the animation-style injection, the queue
   wiring and the expand/collapse model, leaving only register styling behind.
3. Each package keeps its own tests; the shared module gets the behavior tests,
   including the `document.startViewTransition` stub from #578 so the browser
   branch stays covered once rather than twice.
4. Changeset for both published packages.

## Relationship

Child of #544. Comes out of #578's first cause. Bears on the standing rule that
a third copy is never written: the next register skin would be that third copy.
