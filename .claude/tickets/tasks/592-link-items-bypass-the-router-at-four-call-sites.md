---
id: 592
type: task
title: "Four collection call sites open links directly, so a consumer's RouterProvider never navigates"
created: 2026-09-21
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-21,
      note: "opened from the 2026-09-21 round-1 audit, receipt `.agents/audit-2026-09-21/round-1-results.md`, finding `555-a/openlink-router-bypass`, verdict partly. **Pre-existing, and the ticket says so first.** `git show e6384f37 -- .../selection` changed only two casts, and `createSelectableItem.ts:23-30` already documents the reason - solidaria cannot import RouterProvider. So this is a parity gap the Solid 2 work inherited, not one it introduced, and no claim in #555 is false because of it. What is true: upstream has exactly one `openLink` call site inside press handling (`usePress.mjs:320`) and routes every collection link activation through `router.open(...)` (`useSelectableItem.mjs:49,131`, `useSelectableCollection.mjs:69`). Ours calls `openLink(...)` at `createSelectableItem.ts:286,312`, `createSelectableCollection.ts:153` and `combobox/createComboBox.ts:556`. Only `Link.tsx:113`, `Table.tsx:1656,1699` and `Tree.tsx:1531` consult `useRouter()`. A consumer's `RouterProvider.navigate` is therefore never invoked for a link item; only a router with its own global click interceptor sees anything, and press-path clicks do bubble, so those routers still work",
    }
---

## Scope

1. Route the four sites through `useRouter().open(...)` as upstream does. The
   import direction is the whole difficulty and it is why this was left: solve
   it the way the layering already allows, or write down why it cannot be
   solved and narrow the changeset text to what the diff delivers.
2. Whichever way it goes, delete or correct
   `createSelectableItem.ts:23-30`. A comment that explains an absence outlives
   the absence and then misleads.

## Done when

A `RouterProvider` test asserts `navigate` is called when a link item in a
GridList and in a ComboBox is activated — or the comment and the changeset both
say plainly that solidaria's collections do not reach a client router, and the
certification record carries it as named debt.

## Proof

The test and its run, or the corrected text and the ticket note that decided it.

## Relationship

Child of #544, stage S2-b. Separate from #591 on purpose: #591 is a defect this
range introduced, this is one it inherited, and mixing them would let the older
one ride in on the newer one's proof.
