---
id: 214
type: task
title: "Type Tree selectTarget empty-array return without extra compiler flags"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
---

## Cause

`packages/solidaria-components/src/Tree.tsx:455-467` returns
`potentialTargets[0]` after a `length < 2` check. `length < 2` includes 0;
under default `strict`, `T[]` indexing is typed `T`, so the function is typed
`ItemDropTarget` while the runtime value is `undefined`. Round 1 used this
as the exhibit for `noUncheckedIndexedAccess`; #156 declined the flag and
did not file the targeted hole.

## Work

Add a `length === 0` branch (or admit `undefined` in the return type) and a
DnD test that drives an empty candidate list.

## Done when

The empty-list path is typed and tested without a repo-wide compiler flag.

## Relationship

F-TS-012. Not #156 (flag decision). #84 owns DnD behavior.
