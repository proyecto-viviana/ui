---
id: 497
type: task
title: "Match ComboBox and Picker list selected-checkmark accent"
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

Certification Gates run [34155176389](https://github.com/proyecto-viviana/ui/actions/runs/34155176389) on `0d84b016`: **40** unwaived titles, one paint miss.

ComboBox list and Picker list fail D1, D3, D7, and D9 on the selected checkmark. D1/D9 inner label is `default · checkmarkSelected`. Light computed `border-*-color` is React `rgb(39, 77, 234)` vs Solid `rgb(59, 99, 251)`; dark is `rgb(105, 149, 254)` vs `rgb(86, 129, 255)`. D3 is gesture `default` (not pressed): mismatchRatio ~0.022–0.026, `maxChannelDelta` 173–226. D7 size-m contrast is 14.21 vs 11.13 light and 11.45 vs 9.26 dark.

This is not the #489 field-root class (those D1 cells are 0-failed). D10 on the same lists is a different miss (#498). Picker D5 arrow-roving is #499.

## Titles (40)

- combobox-list D1/D3/D9: size-s|m|l × dark|light (18)
- combobox-list D7: size-m × dark|light (2)
- picker-list D1/D3/D9: size-s|m|l × dark|light (18)
- picker-list D7: size-m × dark|light (2)

## Work

Find the selected-item checkmark / accent token in `solid-spectrum` listbox option styles (style macro, ADR 0001) and match S2. Prove with focused `vp exec` D1+D3+D7+D9 on `combobox` and `picker` list cases. Do not patch comparison CSS.

## Done when

Those 40 titles are green on a named certified run, or a dated `knownDivergence` names the remaining burn-down. No `.comparison-spectrum-*` component rule. `certified-waivers.json` stays `[]` unless this ticket owns a dated waiver.

## Relationship

Triage class of #493. Sibling under #136 because scheme v1 / `validateTicketBoard` rejects a task parent. Distinct from #498 (overlay RTL dir) and #499 (D5). Does not absorb #490.
