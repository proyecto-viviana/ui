---
id: 363
type: task
title: "Keep TimeField ContextualHelp on the label row"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 timefield functional pass: URL ?withContextualHelp=true field is 208×82 on React and 208×102 on Solid because the label wrapper is display:block and the 20×20 help button wraps under Start time (labelWrap 25 vs 45). S2 FieldLabel keeps Help on the label row",
    }
  - {
      state: open,
      at: 2026-09-03,
      note: "#260 datefield: same wrap. URL ?withContextualHelp=true field is 208×82 React vs 208×102 Solid. DateField.tsx renders contextualHelp in a following span data-slot=contextualHelp after HeadlessDateFieldLabel. No new id.",
    }
  - {
      state: open,
      at: 2026-09-03,
      note: "#260 checkboxgroup: same wrap. URL ?withContextualHelp=true field is 92×182 React vs 69×202 Solid because the label wrapper is display:block and the 20×20 help button wraps under Notifications (labelWrap 32 vs 52). CheckboxGroup.tsx also uses span data-slot=contextualHelp. No new id.",
    }
  - {
      state: open,
      at: 2026-09-03,
      note: "#260 slider: same wrap. URL ?withContextualHelp=true group is 208×50 React vs 208×70 Solid; output 24×18 vs 24×38. Slider.tsx also uses span data-slot=contextualHelp. No new id.",
    }
  - {
      state: open,
      at: 2026-09-03,
      note: "#260 radiogroup: same wrap. URL ?withContextualHelp=true group is 82×164 React vs 82×184 Solid because span data-slot=contextualHelp wraps under Plan. packages/solid-spectrum/src/radio/index.tsx. No new id.",
    }
  - {
      state: open,
      at: 2026-09-03,
      note: "#260 rangeslider: same wrap. URL ?withContextualHelp=true group is 396×50 React vs 396×70 Solid; output 48×18 vs 48×38. RangeSlider.tsx also uses span data-slot=contextualHelp. No new id.",
    }
---

S2 TimeField puts `contextualHelp` through `FieldLabel`, so the quiet
help button sits on the same row as the label. The field stays
208×82 (label + FieldGroup + description).

Solid Spectrum TimeField renders the label in a
`display:block` wrapper and `{props.contextualHelp}` in a following
`<span data-slot="contextualHelp">`. The 20×20 trigger wraps under
"Start time", the label wrapper is 45px instead of 25px, and the
field is 208×102.

## Evidence

`http://127.0.0.1:4341/components/timefield/?withContextualHelp=true`,
islands mounted.

|               | React                   | Solid                          |
| ------------- | ----------------------- | ------------------------------ |
| field         | 208×82                  | 208×102                        |
| label wrapper | 25px, `display:block`   | 45px, `display:block`          |
| help button   | 20×20, on the label row | 20×20, wrapped under the label |

Default (no help) is 208×82 on both.

Installed S2 `Field.tsx` FieldLabel. Solid
`packages/solid-spectrum/src/calendar/TimeField.tsx` label wrapper
around `HeadlessTimeFieldLabel` plus the extra span.

## Done when

A TimeField with `contextualHelp` keeps the help trigger on the
label row and the field at 208×82, matching S2. A comparison-route
walk fails if Solid's field is 20px taller than React solely because
Help wrapped.

## Relationship

Child of #24. Found by #260. DateField is the same wrap
(`packages/solid-spectrum/src/calendar/DateField.tsx`). Distinct from
#352 (press never opens), #353 (accessible name), #287
(`aria-haspopup`), and #70 (shared FieldLabel extraction). Do not
start #254.
