---
id: 594
type: task
title: "createPress injects an un-nonced style element, so a strict-CSP page keeps the double-tap zoom delay"
created: 2026-09-21
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-21,
      note: 'opened from the 2026-09-21 round-1 audit, receipt `.agents/audit-2026-09-21/round-1-results.md`, finding `555-b/press-style-not-nonced`, confirmed. Upstream nonces two injected styles. #555 item 8 scoped only `createPreventScroll`, so no claim on that ticket is false - this is the other one. `createPress.ts:128-143` appends `[data-solidaria-pressable]{touch-action:...}` with no nonce, on `document` rather than the element''s `ownerDocument`, un-layered and appended rather than prepended; upstream `usePress.mjs:583-599` uses `ownerDocument`, `getNonce(ownerDocument)`, `@layer` and `prepend`. On a page with a strict `style-src` the rule is dropped and every pressable keeps the 300ms double-tap delay the rule exists to remove. The helper is one import away in the same package. The skeptic also counted the blast radius: 8 of 9 `createElement("style")` sites across the packages are un-nonced',
    }
  - {
      state: open,
      at: 2026-09-21,
      note: "deferred to the release after the RC by the owner's soft-launch cut, see #544; the ticket keeps its owner and nothing here is waived or closed",
    }
---

## Scope

1. In `createPress.injectPressableCSS`: take the element's `ownerDocument`, add
   `const nonce = getNonce(ownerDocument); if (nonce) style.nonce = nonce;`,
   wrap the rule in `@layer` and prepend rather than append — all four as
   upstream does, not only the nonce.
2. Mirror `createPreventScroll.test.tsx` for it.
3. Ticket the sweep of the remaining seven sites in `table`, `toast` and
   `theme-transition` rather than fixing them here; they are unverified against
   upstream and a blind sweep would be the third copy of a guess.

## Done when

The injected rule carries the page's nonce, sits in the same layer upstream
puts it in, and a test proves the nonce reaches the element. The sweep has its
own ticket number written here.

## Proof

The test run, and the four properties read against `react-aria` 3.52.0's
`usePress`.

## Relationship

Child of #544, stage S2-d. Residue of #555 item 8, which did the twin site.
