---
id: 513
type: task
title: "Stamp focused and focus-visible on the Select root"
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
      note: "stamp data-focused from select state and data-focus-visible from a root createFocusRing({ within: true }) onto baseRootProps; SelectTrigger stamps stay",
    }
  - {
      state: merged,
      at: 2026-09-08,
      note: "solidaria-components Select stamps data-focused from state.isFocused and data-focus-visible from a host createFocusRing({within:true}) on baseRootProps (RAC Select.tsx:187,278-287). SelectTrigger stamps stay. Prove cwd /home/emoporemilio/projects/viviana-hub/ui WSL COMPARISON_CHROMIUM_ARGS=--disable-software-rasterizer: Select.test.tsx 86 passed; comparison:build pass; ComboBox D13 0/2 (regression); Picker D13 0/2 (titles still red). M9 left both Picker step-0 dom bodies (click wrapper data-focused+data-open; keyboard step 0 passed, fail is step 1). Remaining Picker click: #254 button data-focused/data-open, M10 svg data-open. Keyboard step 1: option aria-labelledby, option data-focus-visible, #254 button extras, M10 svg. ComboBox unchanged (M6/M5/M7/M1/M2/M4 click; M3/M4 keyboard). Waivers []. git diff --check pass. Did not start #514/#502/#511/#209/#248/#254.",
    }
---

Certification Gates run [34155176389](https://github.com/proyecto-viviana/ui/actions/runs/34155176389) on `0d84b016`. #508 D13 step-0 miss **M9**.

Picker click (open): React wrapping `div` has `data-focused` + `data-open`; Solid wrapping `div` has `data-open` only. Solid **button** carries `data-focused` + `data-open`; React **button** `data: {}`.

Picker keyboard (closed): React has an extra wrapping `div` with `data-focus-visible` + `data-focused` around the trigger + hidden `<select>`. Solid tree has that wrapper removed (flatten-hoist when the root has no allowlisted `data-*`). Overlay closed → no `data-open` on the root.

RAC Select root (`Select.tsx:278-287`) stamps `data-focused={state.isFocused}`, `data-focus-visible={isFocusVisible}` from `useFocusRing({within: true})` (`Select.tsx:187`), plus `data-open`, etc.

Port `baseRootProps` (`Select.tsx:737-750`) omit `data-focused` / `data-focus-visible`. The hook already has them (`Select.tsx:467`); they land on **`SelectTrigger`** (`Select.tsx:910-912`), not the root.

Root attrs can land without the #254 owner composition decision. Do **not** wait on #254. Do **not** rewrite `SelectTrigger` → `Button`. Picker-click extra `data-*` on the **button** stay #254. #209’s Select hole is `isInvalid` / `isSelected` on render props, not this root stamp.

`certified-waivers.json` stays `[]`. No new public package or export name.

## Work

Copy RAC Select root `data-*` onto `solidaria-components` Select `baseRootProps`. Patch Changeset on that existing package when this child lands (none on #508).

## Done when

M9 leaves both Picker D13 step-0 `dom` bodies (click wrapper `data-focused`; keyboard wrapper with `data-focus-visible` / `data-focused`). The four D13 titles may still be red until the other owners land — that is not this ticket’s green.

```
vp run comparison:build
COMPARISON_CHROMIUM_ARGS=--disable-software-rasterizer \
  vp exec --filter @proyecto-viviana/comparison -- \
  playwright test e2e/certified/combobox.certified.spec.ts --grep 'D13 journey'
COMPARISON_CHROMIUM_ARGS=--disable-software-rasterizer \
  vp exec --filter @proyecto-viviana/comparison -- \
  playwright test e2e/certified/picker.certified.spec.ts --grep 'D13 journey'
```

Do not use `vp run comparison:test:certified`. Select `solidaria-components` tests as needed.

## Relationship

Split of #508. Sibling under #136 (scheme v1: a task cannot parent a task). Points at #254; does not wait; does not start it. Not #209. Distinct from #514 (Picker chevron `data-open`).
