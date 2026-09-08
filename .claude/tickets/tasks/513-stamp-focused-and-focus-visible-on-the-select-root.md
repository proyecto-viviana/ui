---
id: 513
type: task
title: "Stamp focused and focus-visible on the Select root"
created: 2026-09-08
parent: 136
status: open
history:
  - {
      state: open,
      at: 2026-09-08,
      note: "filed from #508 / Certification Gates run 34155176389 on 0d84b016 (1998 passed / 165 failed / 4 skipped / 0 waived)",
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
