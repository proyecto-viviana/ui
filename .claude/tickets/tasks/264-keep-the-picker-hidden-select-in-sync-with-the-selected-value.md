---
id: 264
type: task
title: "Keep the Picker hidden select in sync with the selected value"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 picker functional pass: trigger text and data-comparison-value update, native select[name=plan] stays on the initial key",
    }
---

After a user selects a different Picker option, the visible value and
`data-comparison-value` update, but the native HiddenSelect
`<select name="plan">` stays on the value from mount. Form submission and
autofill therefore post the stale key.

## Evidence

Comparison route `http://127.0.0.1:4341/components/picker/` (preview), both
panels default `selectedKey=pro`, `name=plan`.

Pointer: open, click `Starter`. After the overlay has unmounted:

- React: trigger `Starter`, `select.value === "starter"`, selectedIndex 1.
- Solid: trigger `Starter`, `select.value === "pro"`, selectedIndex 2,
  option `pro` still `selected`.

Keyboard: Tab, ArrowDown, End, Enter on `Enterprise`.

- React: trigger `Enterprise`, `select.value === "enterprise"`.
- Solid: trigger `Enterprise`, `select.value === "pro"`.

Same stale native value after closed-trigger ArrowRight (trigger shows
`Enterprise`, hidden select stays `pro`).

## Likely cause

`packages/solidaria-components/src/Select.tsx` HiddenSelect options:

```
const isSelected = key === state.selectedKey();
return <option value={String(key)} selected={isSelected}>
```

inside `<For each={stateProps.items}>`. The boolean is computed once per
item insert, so the native `selected` attribute never tracks later
selection changes. RAC HiddenSelect keeps the native `<select>` value in
sync with `state.selectedKey`.

## Done when

Selecting an option (pointer or keyboard) updates the named native
`<select>` to that option's id on the comparison Picker route, matching
React, and a package test fails if HiddenSelect stays on the previous key.

## Relationship

Child of #24. Found by #260. Distinct from #248's HiddenSelect markup
(`<form>` vs `<template>`, extra hidden `<input>`): this is the submitted
value, not the wrapper tag.
