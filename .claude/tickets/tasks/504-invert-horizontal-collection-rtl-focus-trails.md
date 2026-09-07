---
id: 504
type: task
title: "Invert horizontal collection RTL focus trails"
created: 2026-09-07
parent: 136
status: open
history:
  - {
      state: open,
      at: 2026-09-07,
      note: "filed from #493 inventory of Certification Gates run 34155176389 on 0d84b016 (1998 passed / 165 failed / 4 skipped / 0 waived)",
    }
---

Certification Gates run 34155176389 on `0d84b016`: **4** unwaived D10 focus-trail titles.

Not English-vs-Arabic (#503). Focus lands on a different item:

- ActionGroup `none-rtl · horizontal`: Underline vs Italic
- GridList (horizontal) `horizontal-rtl · tab-forward`: Read vs Write
- TagGroup (behavior) `single-rtl · tab-forward`: Night vs Portrait
- Toolbar `flat-h-rtl · horizontal`: Bold vs Italic (and tag button vs input)

#201 switched four mappers (submenu, calendar grid, ColorSwatchPicker, Tree) to `useLocale().direction`. These four collections are not that list.

## Work

Drive horizontal arrow/tab mapping from `useLocale().direction` on ActionGroup, horizontal GridList, TagGroup, and Toolbar, matching RAC. Prove with focused D10 on those specs.

## Done when

Those 4 trails match, or a named remaining mapper.

## Relationship

Triage class of #493. Sibling under #136. Follows #201; does not bind it. Distinct from #503.
