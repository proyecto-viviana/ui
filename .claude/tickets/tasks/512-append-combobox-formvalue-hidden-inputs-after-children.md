---
id: 512
type: task
title: "Append ComboBox formValue hidden inputs after children"
created: 2026-09-08
parent: 136
status: merged
history:
  - {
    state: open,
    at: 2026-09-08,
    note: "filed from #508 / Certification Gates run 34155176389 on 0d84b016 (1998 passed / 165 failed / 4 skipped / 0 waived)",
    }
  - {
    state: in-progress,
    at: 2026-09-08,
    note: "append formValue=key hidden input after Provider/ComboBoxChildren; last child of the root div; no aria-hidden",
    }
  - {
    state: merged,
    at: 2026-09-08,
    note: "solidaria-components ComboBox appends the formValue=key hidden input after children (RAC ComboBox.tsx:373-374). One selectedKey() input; no aria-hidden; not HiddenSelect. Prove cwd /home/emoporemilio/projects/viviana-hub/ui WSL COMPARISON_CHROMIUM_ARGS=--disable-software-rasterizer: ComboBox.test.tsx 92 passed; comparison:build pass; ComboBox D13 0/2 (titles still red); Picker D13 0/2 (regression). M8 left open-arrow-enter-reopen-scroll-escape step-0 field dom (Expected -2 / +8; no first-child vs last-child-after-span hunk). Remaining ComboBox click: M6 Dismiss aria-hidden, M5 data-placement, M7 form vs template, M1 input data-open, M2 chevron data-focused/open/pressed, M4 root data-hovered. Keyboard: M3 chevron data-focused, M4 root data-focus-visible. Picker: M10 svg data-open, M9 Select root focus data-*. Waivers []. git diff --check pass. Did not start #513/#514/#502/#511.",
    }
---

Certification Gates run [34155176389](https://github.com/proyecto-viviana/ui/actions/runs/34155176389) on `0d84b016`. #508 D13 step-0 miss **M8**.

ComboBox click-trigger step 0 `field dom`: Solid field wrapper’s first child is `<input aria-hidden="true">`. React’s matching hidden input is the **last** child (after the description `span`). Same node moved.

`solidaria-components` ComboBox renders the key hidden input **before** children (`ComboBox.tsx:698-716`). RAC is children then `{inputs}` (`ComboBox.tsx:373-374`). Fixture `name: "plan"`, `formValue: "key"`.

This is **not** HiddenSelect. HiddenSelect extra `<input>`s exist only when collection size > 300 (`createHiddenSelect.tsx:330-332`); collection size here is 3. #248 already treated HiddenSelect extra nameless input as landed. Do not add `aria-hidden` on this input to “match” — that hide-outside miss is **M6** on #248.

`certified-waivers.json` stays `[]`. No new public package or export name.

## Work

In `solidaria-components` ComboBox, append `formValue="key"` hidden inputs **after** children, matching RAC `ComboBox.tsx:373-374`. Patch Changeset on that existing package when this child lands (none on #508).

## Done when

M8 leaves the ComboBox `open-arrow-enter-reopen-scroll-escape` step-0 `dom` body. The four D13 titles may still be red until the other owners land — that is not this ticket’s green.

```
vp run comparison:build
COMPARISON_CHROMIUM_ARGS=--disable-software-rasterizer \
  vp exec --filter @proyecto-viviana/comparison -- \
  playwright test e2e/certified/combobox.certified.spec.ts --grep 'D13 journey'
COMPARISON_CHROMIUM_ARGS=--disable-software-rasterizer \
  vp exec --filter @proyecto-viviana/comparison -- \
  playwright test e2e/certified/picker.certified.spec.ts --grep 'D13 journey'
```

Do not use `vp run comparison:test:certified`. ComboBox `solidaria-components` tests as needed.

## Relationship

Split of #508. Sibling under #136 (scheme v1: a task cannot parent a task). Points at #248’s bundled extra-input row; M8 is not that ticket. Not #209. Distinct from #248 M7 (fixture `<form>` vs `<template>`).
