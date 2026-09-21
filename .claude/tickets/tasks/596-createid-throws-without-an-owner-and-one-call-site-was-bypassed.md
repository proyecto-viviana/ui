---
id: 596
type: task
title: "createId throws without an owner, and one call site was bypassed instead of the rule being restored"
created: 2026-09-21
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-21,
      note: "opened from the 2026-09-21 round-1 audit, receipt `.agents/audit-2026-09-21/round-1-results.md`, finding `solidaria-src/createid-hydration-rationale`, verdict partly - and the partly matters, so the ticket carries the narrowed claim rather than the headline. The audit called the rationale false. The skeptic showed it is not: `createUniqueId` consumes in both branches because `createOwner` shares `owner._childCount`, so an early return really does shift later ids; only the mismatch implication is weak, since the branch is symmetric on server and client. What is real is the second half. The reorder added a hard throw - `solid-js/dist/server.js:1840-1843`, `createUniqueId cannot be used outside of a reactive context`, and `dist/solid.js:45-47` for `getNextContextId` - `4bbdeff7` wedged `test:hydrate` on it, and `ef21edf4` worked around it at one call site, `createLabels.ts:50`, rather than restoring the rule. So two rules hold in one package: every call site but one uses the unconditional form, and that one does not. A grep of 71 call sites found no other getter-scoped `createId`",
    }
---

## Scope

1. Restore the early return on `defaultId` inside `createId`, in both copies —
   `packages/solidaria/src/ssr/index.tsx:90-100` and
   `packages/solid-stately/src/ssr/index.ts` — and drop the `createLabels.ts:50`
   bypass, so one rule holds everywhere.
2. Handle `getNextContextId()` returning `undefined` under `NoHydration`, which
   today yields the colliding id `solidaria-undefined`. That is pre-existing and
   independent of the reorder; it is here because this is the ticket that opens
   the file.
3. If the early return cannot be restored — because the shifted ids break
   something the audit did not see — then write the reason next to the throw and
   delete the bypass anyway by giving `createLabels` the same treatment as
   everything else. One rule, either way.

## Done when

`vp run test:ssr` and `vp run test:hydrate` are green with a single `createId`
rule across both packages and no per-call-site exception, and a test asserts
that a `NoHydration` boundary does not produce `solidaria-undefined`.

## Proof

The two suites' counts; the grep that shows no remaining getter-scoped
`createId`; the `NoHydration` test.

## Relationship

Child of #544, stage S2-f. Residue of `4bbdeff7` and `ef21edf4`.
