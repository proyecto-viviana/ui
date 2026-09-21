---
id: 593
type: task
title: "FocusScope restores focus without asking which scope is active, because shouldRestoreFocus was never ported"
created: 2026-09-21
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-21,
      note: "opened from the 2026-09-21 round-1 audit, receipt `.agents/audit-2026-09-21/round-1-results.md`. Two findings: `solidaria-src/focusscope-shouldrestorefocus` (medium, confirmed) and `solidaria-src/focusin-target-retargeting` (low, confirmed). `activeScope` was ported; `shouldRestoreFocus`, its main consumer, was not. Upstream gates both restore paths on it - `FocusScope.mjs:432-439`, called at `:476` for Tab-out and `:530` for unmount - and it walks up from `activeScope`, bailing when an intervening scope carries a `nodeToRestore`. grep finds no counterpart in `packages/solidaria/src/focus/FocusScope.tsx`, and our unmount restore at `:936-1008` never reads `activeScope` at all: its condition at `:982-995` looks only at `activeElement`, `body` and `isConnected`. Upstream's Tab-out-to-`nodeToRestore` path is absent too. The failure case is unverified - no run - so the ticket names it rather than asserting it",
    }
---

## Scope

1. Port `shouldRestoreFocus` and gate the body/detached branch at
   `FocusScope.tsx:982-995` on it.
2. Port the Tab-out path that reaches `nodeToRestore` through a tree walker;
   today `nodeToRestore` never reaches one.
3. In the merged `focusin` tracker, read the target through `getEventTarget` as
   upstream does, and stop skipping an empty scope.

## Done when

A test covers the case this was found for: a parent scope with `restoreFocus`
and an active child overlay scope torn down together, where the parent
currently steals the restore. It fails before the port and passes after.

## Proof

That test, red then green, with the counts in the commit; and the three call
sites read against `react-aria` 3.52.0's `FocusScope.mjs` line by line.

## Relationship

Child of #544, stage S2-c. Adjacent to #557 — both are places where the focus
port is thinner than upstream and an overlay pays for it — but #557 is about a
listener that should not need to exist, and this is about a guard that should.
