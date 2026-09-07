---
id: 486
type: task
title: "Read the compound pending value inside an owner"
created: 2026-09-06
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-09-06,
      note: "VUI-007; six source lines across three files, plus an audit of the remaining reads",
    }
  - {
      state: in-progress,
      at: 2026-09-06,
      note: "premise corrected: tracking was never lost. The compiled compound prop getter calls memo() on every read, so a read from a native handler creates an unowned computation. Reproduced at 25 warnings.",
    }
  - {
      state: merged,
      at: 2026-09-06,
      note: "memo in solidaria-components plus five styled press handlers, two more than this ticket listed. Five new package tests, each failing without the fix. vp run check, test:run 6074, test:ssr 43, test:hydrate 38.",
    }
---

`isPending` is read outside a reactive owner, so every such read leaks a
computation and warns.

Tracking was never the failure. Solid's JSX compiler turns a compound
`isPending={busy() && !confirming()}` into
`get isPending() { return _$memo(() => !!busy())() && !confirming(); }` — a
**fresh memo per read**. Read during render the memo gets the component's
owner. Read from a native press or hover handler there is no owner, so Solid
warns `computations created outside a createRoot or render will never be
disposed` and the memo is never disposed. The reproduction in
`packages/viviana-ui/test/Button.test.tsx` emitted 25 of them before the fix.
The prescribed edits below were right for the wrong stated reason.

## Work

- `packages/solidaria-components/src/Button.tsx:271` — add
  `const resolvePending = createMemo(() => !!local.isPending);` and read the
  memo. `createMemo` is already imported at `:26`; this is one line.
- `packages/viviana-ui/src/button/Button.tsx:234-238` and
  `packages/solid-spectrum/src/button/Button.tsx:251-255` — the press handlers
  each re-read the compound value to decide whether to forward. With the memo
  in place both simplify to `onPress={local.onPress}`.
- Audit the remaining styled reads of `local.isPending`. The two press
  handlers are the ones the consumer hit; they are unlikely to be the only
  untracked reads.
- Cover it: a signal flipped after mount must change the rendered pending
  state through the compound API, not only the styled one.
- Add a changeset.

Stale branch `fix/188-vui-007-pending-owner` (`17a4bb0a`) is six source lines
across three files plus about 164 lines of test. Re-apply by hand on `main`;
the hunk itself is stale, the reasoning is not.

## Audit of the remaining reads

The two press handlers were not the only ones. `ActionButton` carries the same
guard in both public packages —
`packages/viviana-ui/src/button/ActionButton.tsx:484` and
`packages/solid-spectrum/src/button/ActionButton.tsx:479` — so the fix is one
memo plus **five** styled press handlers, not three.

Removing the guard is upstream parity, not a behaviour change.
`@react-spectrum/s2/src/Button.tsx` does not guard `onPress`; RAC's Button
strips interactions while pending (`useDisableInteractions`), and this port
already refuses in `solidaria-components` `handlePress`, which is the only
caller of the styled `onPress`. The guard was dead code that happened to read
the prop from an unowned context.

Every other read is already inside an owner and stays as it is:

- `createPendingState(() => local.isPending)` — read inside its `createEffect`.
- `getS2State` / `getGradientState` — reached from the `class` render prop and
  from a JSX class binding.
- `{local.isPending ? … }` in button content, and `isPending={local.isPending}`
  forwarded to the headless button — JSX bindings.
- `local.isPendingFocusable` in `solidaria-components` — read only from the
  root-props getters the DOM binding effect evaluates.

The evidence is the zero-warning budget in the five new tests, which covers
hover, pointer press, keyboard press, and a post-mount signal change.

## Out of scope

- The pending _delay_ and authored-icon visibility contract. That is #187,
  still open under #136, and it is a different failure.
- Publishing. That is #448 under #443.

## Done when

A post-mount signal change is reflected through the compound API in a package
test in both public packages, the remaining `local.isPending` reads are
triaged, and a changeset is present.

## Relationship

Child of #24. VUI-007 in the La Frontera consumer defect ledger. Adjacent to
#187 (Button hydration evidence) and #135, which are not this defect.
Sequenced by La Frontera's
`producer-release-and-cutover-sequence-2026-09-06.md`; does not claim that
checkout.
