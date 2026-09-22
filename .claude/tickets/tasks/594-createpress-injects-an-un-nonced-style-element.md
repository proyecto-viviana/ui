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
  - {
      state: open,
      at: 2026-09-21,
      note: "widened from one site to every runtime style element in the packages, and the census is in this note rather than in a second ticket. `grep -rn 'createElement(\"style\")' packages/*/src` prints nine sites: `solid-spectrum/src/table/index.tsx:455` and `:486`, `solid-spectrum/src/toast/index.tsx:284`, `solidaria/src/interactions/createPress.ts:138`, `solidaria/src/overlays/createPreventScroll.ts:161`, `viviana-ui/src/provider/theme-transition.ts:150`, `viviana-ui/src/table/index.tsx:457` and `:488`, `viviana-ui/src/toast/index.tsx:287`. `grep -rn 'getNonce|\\.nonce' packages/*/src` puts a nonce at exactly one of them, `createPreventScroll.ts:165-167`, which #555 item 8 fixed. So the skeptic's 8 of 9 is confirmed at HEAD, and all eight also use the global `document` rather than an `ownerDocument`. Splitting them across two tickets would have left the second unwritten and unnumbered, which is what Scope item 3 asked for and what this note replaces: the sweep is item 4 here. Two facts the sweep needs, both read today rather than assumed. (1) The helper is not reachable from outside its own package: `getNonce` appears in `packages/solidaria/src/utils/getNonce.ts` and in `createPreventScroll.ts` and nowhere else, `packages/solidaria/src/index.ts` does not name it, and `packages/solidaria/src/utils/index.ts` - the barrel behind the published `./utils` subpath - does not export it either, so the four solid-spectrum and viviana-ui sites need it re-exported before they can import it, not copied. (2) `table/index.tsx` and `toast/index.tsx` are both on the `diverged` list in `scripts/layer-boundary-baseline.json`, 84 paths against 524 identical, and the two copies really do differ (51 changed lines in table, 118 in toast), so each copy is fixed in its own file and `guard:layer-boundary` stays green; this is not a byte-identical pair where one edit serves both, and #606 is the ticket that shows what happens when a fix lands on one side of such a pair. Still deferred past the RC by the soft-launch cut - nothing above changes that, only what the ticket will cover when it runs",
    }
---

## Scope

1. In `createPress.injectPressableCSS`: take the element's `ownerDocument`, add
   `const nonce = getNonce(ownerDocument); if (nonce) style.nonce = nonce;`,
   wrap the rule in `@layer` and prepend rather than append — all four as
   upstream does, not only the nonce.
2. Mirror `createPreventScroll.test.tsx` for it.
3. Re-export `getNonce` from `packages/solidaria/src/utils/index.ts`, the
   barrel behind the published `./utils` subpath. Today the helper is importable
   only from inside `solidaria`, which is why the styled packages have none.
4. Then the sweep, in this ticket: the other seven un-nonced sites, each read
   against what upstream does at that site before it is touched —
   `table/index.tsx:455` and `:486` and `toast/index.tsx:284` in
   `solid-spectrum`, their diverged twins at `table/index.tsx:457` and `:488`
   and `toast/index.tsx:287` in `viviana-ui`, and
   `viviana-ui/src/provider/theme-transition.ts:150`. Both table and toast are
   `diverged` in `scripts/layer-boundary-baseline.json`, so each copy is edited
   in its own file and neither edit may narrow that baseline. Where upstream has
   no counterpart — `theme-transition` is ours — the nonce and the
   `ownerDocument` still apply and the layer does not.
5. One guard, not seven memories: a check that fails on a
   `createElement("style")` in `packages/*/src` whose node is appended without a
   nonce, so the eighth site cannot be added later without an answer.

## Done when

Every injected rule carries the page's nonce, the ported ones sit in the layer
upstream puts them in, a test proves the nonce reaches the element for
`createPress` and for one swept site, and the guard in item 5 fails on a
deliberately un-nonced injection.

## Proof

The test run, the four properties read against `react-aria` 3.52.0's
`usePress`, the guard red on an un-nonced injection and green after, and
`guard:layer-boundary` at exit 0 across the two diverged pairs.

## Relationship

Child of #544, stage S2-d. Residue of #555 item 8, which did the twin site, and
the owner of the whole nine-site census — the sweep Scope item 3 once wanted to
hand to another number lives here, at items 3 through 5.
