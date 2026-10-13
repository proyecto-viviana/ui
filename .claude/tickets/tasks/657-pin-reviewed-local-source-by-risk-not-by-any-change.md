---
id: 657
type: task
title: "Pin reviewed local source by risk, not by any change"
created: 2026-10-12
parent: 544
status: merged
history:
  - {
      state: open,
      at: 2026-10-12,
      note: "Owner agreed after the rc.2 Certification Gates run 38333199009 failed on two refreshed local files and skipped about 25 later guards.",
    }
  - {
      state: merged,
      at: 2026-10-13,
      note: "Module surfaces are held by an import-and-export rule, with no hash; ci:release-readiness runs both guards. Owner, 2026-10-13: helpers keep the content hash.",
    }
---

## Cause

`scripts/attribution-local-reviews.json` records, for each file claimed as
original, its path, a classification and the SHA-256 of its content.
`guard:attribution-headers` fails when a recorded file changes at all
(`.claude/current/tooling.md`, "Reviewed local source"). The purpose is sound:
the packages port Apache-licensed Adobe source, derived files must keep
Adobe's notice, and a file claimed as original must not come to hold derived
code unnoticed.

The mechanism costs more than it protects:

- It fires on any edit. On 2026-10-12 it failed the rc.2 candidate for a
  getter in `packages/solidaria-components/src/Icon.tsx` and a reworded
  comment in `packages/viviana-ui/src/text/type-roles.ts`.
- 184 of the 257 records are `local-module-surface`: files that only organize
  exports and change whenever a component gains one. The record file has 30
  commits, many of them only refreshing a hash.
- Renewing a record is recomputing a hash. Nothing checks that the review the
  rule asks for took place.
- `vp run ci:release-readiness` does not run the guard, so the failure appears
  only on the hosted Certification Gates run, where it also skips every later
  guard in the job.

## Scope

1. A `local-module-surface` file is exempt by a mechanical rule instead of a
   content hash: it holds only import and export statements and comments. A
   file that holds anything else is not a module surface and fails.
2. `vp run ci:release-readiness` runs `guard:attribution-headers` and
   `guard:api-reference`, the two checks that failed only on the hosted run.
3. The `local-solid-helper` files keep the content hash as today (owner,
   2026-10-13). A check of the risk itself, that a helper shares no long
   verbatim passage with the pinned upstream source, is not built.

Exact and composite Adobe header contracts are not in scope and do not change.

## Done when

Adding an export to an index file passes the guard with no edit to
`scripts/attribution-local-reviews.json`. A module-surface file given a
function body fails it. Any change to a `local-solid-helper` file fails it, a
pasted upstream function among them. A change that would
fail the hosted attribution or API reference guard fails
`vp run ci:release-readiness` locally first.

## Proof

`scripts/report-attribution-mappings.mjs` parses each `local-module-surface`
file with the TypeScript parser already in the tree and accepts it only when
every top-level statement is an import or an export declaration. The 182
module-surface records lost their hashes; the guard refuses a hash on one.

Two files recorded as module surfaces were not: `packages/viviana-ui/src/vite.ts`
is the macro plugin, with five functions, and
`packages/solid-stately/src/selection/index.ts` declares two type aliases. Both
are now `local-solid-helper` records with the hashes they already had, so
neither file changed and both stay pinned. The counts are 182 module surfaces
and 75 helpers, where they were 184 and 73.

Run on 2026-10-13:

- An export appended to `packages/viviana-ui/src/index.ts`:
  `vp run guard:attribution-headers` exits 0, with no edit to the record file.
- `export function leaked() {…}` appended to the same file: the guard exits 1
  with `[not-module-surface] packages/viviana-ui/src/index.ts:848 holds`
  `` `export function leaked() {` ``.
- With that function in place `vp run ci:release-readiness` exits 1 at
  `guard:attribution-headers`, its eighth step.
- With a prop added to `BadgeProps` and no `vp run api:extract`,
  `vp run ci:release-readiness` exits 1 at `guard:api-reference` with three
  `DRIFT` lines.
- `vp run test:ci-guard-contracts` holds the rule in its fixture: a module
  surface that gains exports, an import and a comment passes; one given a
  function, a constant, a default export, a type alias or an expression
  statement fails with its line; one given a source marker fails; a record
  carrying a hash is refused; a helper that changes still fails.

`vp run guard:gate-coverage` now counts 13 of 45 blocking Certification Gates
steps run locally, where it counted 11.

## Relationship

Child of #544. Follows the rc.2 run recorded in #655.
