---
id: 415
type: task
title: "Stop remounting the React ColorSwatchPicker fixture on controlled value"
created: 2026-09-03
parent: 26
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 colorswatchpicker functional pass: ?valueSource=value&value=#e11d48 click Orange selects Orange on both, but React drops DOM focus to BODY (listbox tabIndex 0, new react-aria id) while Solid keeps Orange focused (tabIndex 0, data-focused). Uncontrolled click Orange keeps focus on both. React renderKey includes demoProps.value when valueSource=value, so onChange remounts the picker. Numbered 415 to stay past ProgressCircle #410",
    }
---

The ColorSwatchPicker React fixture keys the S2 picker on the
controlled `value` string. A pointer (or keyboard) selection updates
`demoProps.value` through `onChange`, changes `renderKey`, and
remounts the listbox. S2 itself would keep DOM focus on the clicked
option; the remount drops it to `BODY` and restores the listbox as
the tabstop (`tabIndex 0`).

Solid does not remount, so the clicked option stays focused
(`tabIndex 0`, `data-focused`). Uncontrolled `defaultValue` clicks
already match (React `renderKey` does not change with the local
value). Live controlled `value` from the side panel is a remount on
purpose and already matches selection.

## Evidence

`http://127.0.0.1:4341/components/colorswatchpicker/?valueSource=value&value=%23e11d48`,
islands mounted. Other `.s2-framework-panel` `visibility:hidden` +
`inert`. Click option Orange.

|                                | React                        | Solid                     |
| ------------------------------ | ---------------------------- | ------------------------- |
| selected / marker              | Orange / `rgb(249, 115, 22)` | same                      |
| focus                          | **BODY**                     | **Orange**                |
| listbox tabIndex               | **0**                        | **-1**                    |
| Orange tabIndex / data-focused | -1 / omitted                 | 0 / true                  |
| listbox id                     | new `react-aria…-_r_12_`     | stable `solidaria-cl-169` |

Default-route (uncontrolled) click Orange: both focus Orange,
listbox tabIndex -1.

## Done when

A controlled click on the comparison route leaves React DOM focus on
the selected option like S2 / Solid, without remounting the picker.
`renderKey` must not include the live controlled value string. A walk
fails if React focus is BODY after click Orange. Uncontrolled click
and live side-panel `value` remounts can stay. Do not start #254.

## Relationship

Child of #26. Found by #260. Wiring is
`apps/comparison/src/components/react/fixtures/styled/colorswatchpicker.js`
`renderKey` (`valueSource === "value" ? demoProps.value : …`). ColorWheel
already keys controlled as the constant `"controlled"`. Distinct from
#414 (Solid defaultValue remount). Do not start #254.
