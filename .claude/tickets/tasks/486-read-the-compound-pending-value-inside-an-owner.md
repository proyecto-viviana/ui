---
id: 486
type: task
title: "Read the compound pending value inside an owner"
created: 2026-09-06
parent: 24
status: open
history:
  - { state: open, at: 2026-09-06, note: "VUI-007; six source lines across three files, plus an audit of the remaining reads" }
---

`isPending` is read outside a reactive owner, so a Button built from the
compound API stops tracking it.

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

## Out of scope

- The pending *delay* and authored-icon visibility contract. That is #187,
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
