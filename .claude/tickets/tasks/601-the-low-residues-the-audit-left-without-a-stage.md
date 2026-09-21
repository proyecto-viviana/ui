---
id: 601
type: task
title: "The seven low residues the 2026-09-21 audit left without a stage"
created: 2026-09-21
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-21,
      note: "opened from the 2026-09-21 round-1 audit, receipt `.agents/audit-2026-09-21/round-1-results.md`. The stages S0-S6 claim 69 of the 76 findings. These seven belong to no stage, are each small, and are each real. Filing seven tickets would bury the board; leaving them unowned would break the rule the receipt's OWNERS table exists to keep - no finding without an owner. So one sweep ticket, with the seven named, and each item closable on its own. This is a deviation from the conductor's mapping and the receipt records it as one",
    }
---

## Scope

Seven items. Each is done when its own line is done; the ticket closes when all
seven are, or when the ones that are not have a reason written here.

1. **`555-b/buttongroup-misses-attribute-changes`** — the restored children
   dependency does not cover a child that changes size in place, only one that
   is added or removed. Cover the attribute-change case.
2. **`555-b/s2-cleanups-guard-counts-files`** — the guard reports 58 bodies;
   58 is the file count and there are 81 bodies. Count bodies, or rename the
   number.
3. **`guards-a/s2-cleanups-return-only`** — the same guard fires only on a
   `return`, so falling off the end of an armed body is invisible.
4. **`solidaria-src/dom-focus-import-cycle`** — the `openLink` rewrite
   introduced a `dom.ts` ↔ `focus.ts` cycle. Break it before something
   downstream depends on the evaluation order.
5. **`components-src/popover-stale-comment`** — Popover keeps a comment
   describing the `display:contents` group the same commit deleted.
6. **`release-path/peers-wildcard-called-ratchet`** — narrow
   `pnpm-workspace.yaml:95-96`'s `solid-js: "*"` and `"@solidjs/web": "*"` to
   the pinned RC range, so an unmet peer on a published package still fails
   `check-peers`. The wildcard is not blinding today —
   `expected-unmet-peers.json` holds 17 unmet `solid-js` rows, all scoped to
   `apps/web` — but it accepts every version for every workspace, which is the
   form the guard's own docblock warns about. The doc sentence that called it
   "the ratcheting form" is corrected in the release-path correction block.
7. **`components-src/stale-pin sweep`** — no live document carries the stale
   S2 1.5.1 / RAC 1.19.0 pin; the two remaining mentions are dated history
   (#82's own note and `packages/solidaria/CHANGELOG.md`) and were checked and
   left. This line exists so the next reader does not re-check it. Close it by
   confirming once, or by correcting the `installed-comparison-deps-lag-pin`
   memory entry if it is still reachable.

## Done when

Each of the seven is either landed with its own proof or has a dated line here
saying why not.

## Proof

Per item, in the commit that closes it.

## Relationship

Child of #544. Off the RC path: nothing here gates a gate. It exists so that
"no finding without an owner" stays true without seven more board rows.
