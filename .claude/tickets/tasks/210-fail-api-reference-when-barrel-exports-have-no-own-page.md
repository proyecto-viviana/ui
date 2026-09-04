---
id: 210
type: task
title: "Fail api-reference when barrel exports have no own page"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
---

## Cause

`scripts/extract-api-reference.ts:31-38, 103-128, 471-483` writes
`exports.json` "so the guard can spot undocumented ones"; nothing reads it.
`--check` only diffs generated page JSON and route files against git.
`OWN_PAGE` is the only hand list; anything else in a directory is documented
on its neighbour, so `TabSwitch` has no `/docs/components/tabswitch` and its
props are a footnote on the Switch page. Headless packages and kumo have no
extract. The green gate proves the committed tables match two styled walks,
not that the public barrel is documented.

## Work

Read `exports.json` in `--check` and fail on any value export with no own
page (or an explicit, reasoned neighbour mapping); extend the extract to the
headless barrels and kumo.

## Done when

Adding a public export without a page fails `guard:api-reference`; TabSwitch
has its own page or a recorded reason not to.

## Relationship

F-API-007. Not #9 (the TabSwitch decision).
