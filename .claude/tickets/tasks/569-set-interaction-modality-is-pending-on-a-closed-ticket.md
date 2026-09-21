---
id: 569
type: task
title: "setInteractionModality is pending on a merged ticket, so guard:rac-export-gap is red"
created: 2026-09-20
parent: 544
status: next
history:
  - {
      state: open,
      at: 2026-09-20,
      note: "found by the conductor's local ladder walk of 2026-09-20 evening, the second red after #567. `vp run guard:rac-export-gap` EXIT=1 in 1s: `setInteractionModality is listed as pending on #231 (status: merged) - ticket closed, export still missing`. It is step 121 of certification-gates.yml, so it is where the CI walk stops next, seventy-two steps before the api-reference red of #559. Evidence `.agents/chain-walk-2026-09-20/ladder-rac-export-gap.out.txt`",
    }
  - {
      state: next,
      at: 2026-09-20,
      note: "handed to the close-gates writer after #559 merged, and taken ahead of #570 and #571 because it is the earliest red on the ladder: step 121, where the CI walk stops next. No brief file - the ticket names the shape to follow (the four sibling re-exports at lines 1001-1011), both traps (the barrel is attribution-reviewed, and a new named export owes a changeset) and the two commands that close it. The one judgement it leaves open is where in the barrel the export belongs; read what is around it and say why",
    }
---

## Scope

`scripts/rac-export-gap-pending.json` lets a symbol be missing from
`packages/solidaria-components/src/index.ts` while a ticket owns it. The guard
ratchets the other way too: when the owning ticket closes, the excuse expires.
`#231` merged, and the export never shipped:

```json
{ "symbol": "setInteractionModality", "ticket": 231 }
```

The gate's own numbers at HEAD: 295 RAC named value exports, 35 of them sibling
re-exports from react-aria/react-stately; 442 on our side; 0 unlisted missing;
8 pending, of which 7 are `NavigationTree*` on the open #228 and 1 is
`TokenFieldValue` on the open #118. Only this one names a closed ticket.

## Work

Ship the export rather than re-pointing the excuse at a new ticket. The symbol
exists and is already public one layer down:

- defined in `packages/solidaria/src/interactions/createInteractionModality.ts`,
- exported from `packages/solidaria/src/index.ts:85`,
- and upstream RAC re-exports it, which is what puts it in the tracked set.

The components barrel already re-exports sibling symbols from solidaria — lines
1001–1011 do it four times, `SSRProvider` among them. Follow that shape, then
delete the pending entry.

Two consequences that are easy to miss, both this repository's own rules:

- `packages/solidaria-components/src/index.ts` is a **reviewed-local**
  attribution file (`local-module-surface`, `d4a4a439…`). Adding a line moves
  its hash and turns `guard:attribution-headers` red, which is exactly what
  #567 was. Re-attest in the same commit, and read the diff against the
  reviewed content before re-pinning, as #567 did.
- This adds a named export to a published package, so it owes a changeset.
  `guard:publish-drift` is the check that says so.

## Done when

`vp run guard:rac-export-gap` and `vp run guard:attribution-headers` both exit
0, the pending file no longer names #231, and a changeset describes the new
export.

## Relationship

Child of #544, and stage 2 of `.agents/CONDUCTOR-RELEASE-PATH-2026-09-20.md`.
Sibling of #559, #570 and #571, the other reds the same walk found. #228 and
#118 keep their pending entries; they are open and are not this ticket.
