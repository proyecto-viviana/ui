---
id: 657
type: task
title: "Pin reviewed local source by risk, not by any change"
created: 2026-10-12
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-10-12,
      note: "Owner agreed after the rc.2 Certification Gates run 38333199009 failed on two refreshed local files and skipped about 25 later guards.",
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
3. Decide with the owner how the 73 `local-solid-helper` files are held: the
   content hash as today, or a check of the risk itself, that the file shares
   no long verbatim passage with the pinned upstream source.

Exact and composite Adobe header contracts are not in scope and do not change.

## Done when

Adding an export to an index file passes the guard with no edit to
`scripts/attribution-local-reviews.json`. Pasting a function from the pinned
upstream source into a `local-solid-helper` file fails it. A change that would
fail the hosted attribution or API reference guard fails
`vp run ci:release-readiness` locally first.

## Proof
