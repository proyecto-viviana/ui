---
id: 471
type: task
title: "Fix typecheck errors that block release"
created: 2026-09-05
parent: 443
status: merged
history:
  - {
      state: open,
      at: 2026-09-05,
      note: "vp run typecheck on 15ca6d4c: ActionMenu autofocus vs autoFocus (spectrum + ui), Link tag specified twice, PopoverTrigger next implicit any, PreviewTrigger Provider context cast missing. Blocking Certification Gates.",
    }
  - {
      state: in-progress,
      at: 2026-09-05,
      note: "Git v2. Match Text.tsx tag-last, type Popover setOpen/setPoint, Provider cast like every other caller, ActionMenu autoFocus on HeadlessButton. getDataAttributes returns data-* only, not HTMLButtonElement attributes.",
    }
  - {
      state: merged,
      at: 2026-09-05,
      note: "typecheck green. Link.test.tsx and ActionMenu.test.tsx 61 passed. vp run typecheck; vp test run those two files.",
    }
---

`vp run typecheck` is a blocking Certification Gates step. HEAD failed
before package tests. None of these is a new API.

- Link: `tag` first then a mergeProps spread. Text already puts `tag`
  last so a stray `tag` cannot redirect the element.
- PopoverTrigger: `setOpen`/`setPoint` `next` parameters had no type.
- PreviewTrigger: `Provider` needs the same `Array<[Context<unknown>,
unknown]>` cast every other caller uses. Not a PreviewTrigger behavior
  slice.
- ActionMenu: `autofocus={local.autoFocus}` is not a HeadlessButton prop.
  The trigger already focuses via effect; pass `autoFocus`.

## Done when

`vp run typecheck` is green. A Link test fails if `tag` in the spread
wins. An ActionMenu test fails if `autoFocus` does not focus the trigger.

## Relationship

Child of #443. Distinct from #117 (PreviewTrigger behavior) and #470
(format). Do not restyle S2 tokens.
