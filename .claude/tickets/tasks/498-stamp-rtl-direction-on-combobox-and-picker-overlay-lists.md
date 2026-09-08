---
id: 498
type: task
title: "Stamp RTL direction on ComboBox and Picker overlay lists"
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
      at: 2026-09-08,
      note: "implement overlay-list-rtl-dir: stamp el.lang/el.dir from useLocale on the headless Popover surface (Tooltip/S2 callback-ref). One overlay dir owner. ComboBox/Picker wrappers do not add a second stamp.",
    }
  - {
      state: merged,
      at: 2026-09-08,
      note: "Portaled Popover keeps locale dir/lang after portal attach. Slice 1 dump: headless surface is the listbox dir ancestor (dir=rtl lang=ar-AE); slice 3 skipped. Prove cwd /home/emoporemilio/projects/viviana-hub/ui WSL COMPARISON_CHROMIUM_ARGS=--disable-software-rasterizer: vp test run packages/solidaria-components/test/Popover.test.tsx — 43 passed. ComboBox list D10 grep — 3 passed. Picker list D10 grep — matrix 2 passed; trail arrow-roving named remaining miss is #499 (React dialog Plan vs Solid option Pro). Waivers []. git diff --check clean. Did not start #499/#511.",
    }
---

Certification Gates run 34155176389 on `0d84b016`: **6** unwaived D10 titles.

The RTL driver sanity check fails on Solid only: `solid panel did not render RTL — locale=ar-AE routing is missing for "combobox"` / `"picker"`. ComboBox **field** D10 state matrix passed on the same run, so `?locale=ar-AE` reaches the page. The portaled listbox `direction` is not `rtl`.

Titles: combobox-list D10 size-m-rtl × dark|light plus virtual-activedescendant (3); picker-list D10 size-m-rtl × dark|light plus arrow-roving (3).

## Work

Match S2 Popover/list: stamp `dir` from the overlay locale, not from the (LTR) document. Lowest layer that owns overlay direction (`solidaria` / `solidaria-components` Popover), then styled wrappers if they fork it. Prove with focused D10 on combobox-list and picker-list. Do not treat this as missing fixture routing without checking the portal.

## Done when

Those 6 titles get `direction: rtl` on both panels and the D10 matrix/trail matches, or a named remaining miss. Not a waiver of #497 paint.

## Relationship

Triage class of #493. Sibling under #136 (scheme: task cannot parent a task). Distinct from #497 checkmark accent and from #503 English-vs-Arabic names. ComboBox field D10 tab-cycle English names are #503.
