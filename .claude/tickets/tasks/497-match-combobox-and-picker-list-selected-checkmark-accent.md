---
id: 497
type: task
title: "Match ComboBox and Picker list selected-checkmark accent"
created: 2026-09-07
parent: 136
status: merged
history:
  - {
      state: open,
      at: 2026-09-07,
      note: "filed from #493 inventory of Certification Gates run 34155176389 on 0d84b016 (1998 passed / 165 failed / 4 skipped / 0 waived)",
    }
  - {
      state: in-progress,
      at: 2026-09-07,
      note: "implement overlay-list-checkmark-accent: checkmark call { isSelected, isFocused, size }; isFocused drives accent focused stop; option isFocusVisible aligned to isFocused after pointer-open",
    }
  - {
      state: merged,
      at: 2026-09-07,
      note: "ComboBox/Picker list selected checkmark and label match S2 baseColor stops. Pointer-open React keeps data-focus-visible on the focused row; Solid did not. Checkmark still takes { isSelected, isFocused, size } only (class, not icon styles, flexShrink 0). Option keeps hover/press; isFocusVisible := isFocused || isFocusVisible. No isFocused: accent on the option macro. Prove cwd /home/emoporemilio/projects/viviana-hub/ui WSL COMPARISON_CHROMIUM_ARGS=--disable-software-rasterizer: combobox D1 6 / D7 2 / D9 6 passed; combobox D3 6 failed compositor class (size-s dark 0.25493421052631576 9920/38912, same as CI retry-1, not the 0.022 color band); picker D1+D3+D7+D9 20 passed. Slice 3 icon size not taken (picker D3 exact-pair). Waivers []. git diff --check clean. Did not start #498/#499/#511.",
    }
  - {
      state: in-progress,
      at: 2026-09-07,
      note: "remainder after independent test fail: ComboBox D3 overlay-wide ~0.25 was the D3 clone frame contained by the lower ComboBox portal (CDP clipped site chrome at 0,0), not the option isFocusVisible remap. Picker overlay sits higher so the sibling probe still painted.",
    }
  - {
      state: merged,
      at: 2026-09-07,
      note: "ComboBox D3 exact-pair: D3 clone probe mounts on document.body and copies color/color-scheme. ComboBox option isFocusVisible := isFocused || isFocusVisible kept (D7 Pro ink; React pointer-open listboxItem still paints the selected-row ring). Checkmark still { isSelected, isFocused, size } only. Picker product untouched. Prove cwd /home/emoporemilio/projects/viviana-hub/ui WSL COMPARISON_CHROMIUM_ARGS=--disable-software-rasterizer: ComboBox list D1+D3+D7+D9 20 passed; Picker list D1+D3+D7+D9 20 passed. Waivers []. git diff --check clean. Did not start #498/#499/#511. No knownDivergence.",
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
