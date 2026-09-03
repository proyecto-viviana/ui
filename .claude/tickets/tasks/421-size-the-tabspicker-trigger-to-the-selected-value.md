---
id: 421
type: task
title: "Size the TabsPicker trigger to the selected value"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 tabs functional pass: force the comparison Tabs row to 176px so horizontal Tabs collapse to TabsPicker. React trigger hugs Overview 70×48 (inner SPAN 54 + chevron 10) and Parity 48×48; Solid is always 208×48 and overflows the 176px container. Open listbox 176×112 opacity 1 and option names match. tabsPickerButton spreads fieldInput() (--defaultWidth 208, contain inline-size) and sets maxWidth: max always; S2 inputButton maxWidth is only { isQuiet: 'max' }. Numbered 421 after Calendar #416–#418 and Disclosure #419",
    }
---

S2 TabsPicker's trigger hugs the selected tab text. Solid's overflow
`TabsPicker` trigger is 208px wide — the `fieldInput` default field
width — so it overflows a 176px collapsing tablist instead of sitting
at ~70px for Overview.

Open overlay geometry already matches (listbox 176×112, opacity 1,
options Overview / Parity / Testing). AX button name `"Overview
Project tabs"` matches. Do not retune this in the comparison app
(ADR 0001); the style source is `solid-spectrum` `TabsPicker`.

S2 `TabsPicker.tsx` `inputButton` spreads `fieldInput()` the same way
and sets `maxWidth: { isQuiet: 'max' }` only. Solid
`tabsPickerButton` spreads `fieldInput()` (`--defaultWidth: 208`,
`contain: inline-size`, `containIntrinsicWidth` from that token) and
sets `maxWidth: "max"` always, so `max-content` resolves to the 208px
intrinsic width instead of the selected-value content.

## Evidence

`http://127.0.0.1:4341/components/tabs/`, islands mounted. Other
`.s2-framework-panel` `visibility:hidden` + `inert`. Force the
`.comparison-tabs-row` width to 176px until the tablist collapses to
a picker.

| | React | Solid |
|---|---|---|
| trigger closed Overview | **70×48**, width `69.9844px` | **208×48**, width `208px` |
| inner | SPAN 54 "Overview" + svg 10 | SPAN 54 + svg 10 (`aria-hidden`) |
| `maxWidth` | `max-content` | `max-content` |
| trigger after Parity | **48×48** | **208×48** |
| open listbox | 176×112, opacity 1, 3 options | same |
| AX button | `"Overview Project tabs"` + unlabeled `img` | `"Overview Project tabs"` (chevron hidden) |

Default (unforced) tablist is 327×48 on both; no picker. The 208px
is `fieldInput` `--defaultWidth`, not the visible "Overview" text.

## Done when

A collapsed TabsPicker trigger on the comparison route hugs the
selected value like S2 (~70px Overview, ~48px Parity) and stays
inside a 176px row. Open listbox 176×112 must keep matching. A walk
fails if the Solid button is 208px while React is 70px. Do not patch
S2 styling in the comparison app. Do not start #254.

## Relationship

Child of #24. Found by #260. Wiring is
`packages/solid-spectrum/src/tabs/TabsPicker.tsx` `tabsPickerButton`
(`...fieldInput()`, `maxWidth: "max"`) vs installed
`@react-spectrum/s2/src/TabsPicker.tsx` `inputButton` (`maxWidth: {
isQuiet: 'max' }`). Overlay surface composition stays on #257.
Chevron unlabeled `img` is S2 (Solid `aria-hidden` is stricter; do
not copy the worse oracle). Do not start #254.
