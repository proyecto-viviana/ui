---
id: 514
type: task
title: "Drop invented data-open from the Picker chevron"
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

Certification Gates run [34155176389](https://github.com/proyecto-viviana/ui/actions/runs/34155176389) on `0d84b016`. #508 D13 step-0 miss **M10**.

Picker click-trigger step 0 `field dom`: Solid trigger `button` gains a child `svg` with `data-open: "true"`. React button `children` stay empty in the oracle (`svg` without allowlisted `data-*` is not a contract node).

S2 Picker `ChevronIcon` has **no** `data-open` (`@react-spectrum/s2/src/Picker.tsx:755-758`). Port sets `data-open={triggerProps.isOpen ? "true" : undefined}` on `ChevronIcon` (`solid-spectrum` `picker/index.tsx:967-974`). Twin: `viviana-ui` `picker/index.tsx:1014-1017`. Rule #2: local styled addition with no upstream counterpart.

Keep the chevron AX intent (no `aria-hidden` on the glyph). Do not patch comparison CSS (ADR 0001). Not `solidaria`. Not a Group/Button render-prop field.

`certified-waivers.json` stays `[]`. No new public package or export name.

## Work

Delete the invented `data-open` on the Picker chevron in `solid-spectrum` and the `viviana-ui` twin. Patch Changeset on those existing packages when this child lands (none on #508).

## Done when

M10 leaves the Picker `open-arrow-enter-reopen-scroll-escape` step-0 `dom` body. The four D13 titles may still be red until the other owners land — that is not this ticket’s green.

```
vp run comparison:build
COMPARISON_CHROMIUM_ARGS=--disable-software-rasterizer \
  vp exec --filter @proyecto-viviana/comparison -- \
  playwright test e2e/certified/combobox.certified.spec.ts --grep 'D13 journey'
COMPARISON_CHROMIUM_ARGS=--disable-software-rasterizer \
  vp exec --filter @proyecto-viviana/comparison -- \
  playwright test e2e/certified/picker.certified.spec.ts --grep 'D13 journey'
```

Do not use `vp run comparison:test:certified`. Styled Picker tests as needed.

## Relationship

Split of #508. Sibling under #136 (scheme v1: a task cannot parent a task). Points at none of #209 / #248 / #254. Distinct from #513 (Select root focus `data-*`).
