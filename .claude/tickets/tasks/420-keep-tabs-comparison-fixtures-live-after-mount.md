---
id: 420
type: task
title: "Keep Tabs comparison fixtures live after mount"
created: 2026-09-03
parent: 26
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 tabs functional pass: live comparison:controls-change updates data-comparison-control-props on both stacks, but Solid Tabs stays at the mount snapshot for orientation/density/isDisabled/keyboardActivation/ariaLabel (hc unwraps tabsProps() inside keyed Show), and React live labelBehavior=hide / withIcons=true hide the text without inserting icons because renderKey omits those keys so collection children stay the first-mount labels. URL remount of the same props already matches. Distinct from #371/#377/#303 (those fixtures pass getters). Numbered 420 after Calendar #416–#418 and Disclosure #419",
    }
---

The Tabs comparison fixtures advertise live controls that do not
reach the mounted instance the way a URL remount does.

Solid keys `Show` on `renderKey` (selectionSource, defaultSelectedKey,
composition, disabledKey, labelBehavior, withIcons, shouldForceMount)
and then calls `hc(SolidSpectrumTabs, tabsProps(), …)`. `tabsProps()`
is a memo of a plain object (`aria-label`, `orientation`, `density`,
`keyboardActivation`, `isDisabled` are snapshots; only `selectedKey`
is a getter). `hc` unwraps that object once when the keyed children
run, so later `demoProps` updates paint on
`data-comparison-control-props` and leave the Tabs instance at the
mount values.

React re-renders those host props in place, so live orientation /
density / isDisabled / keyboardActivation / ariaLabel already match
S2. React `renderKey` does not include `labelBehavior` or `withIcons`,
so live hide / icons keep the first-mount text children: labels hide
and no svgs appear. Solid remounts those two keys and paints the
icon-only / icon+label collection.

URL remount of every routed prop already matches. Live `selectedKey`
and `disabledKey` already remount both stacks.

## Evidence

`http://127.0.0.1:4341/components/tabs/`, islands mounted. Other
`.s2-framework-panel` `visibility:hidden` + `inert`. Fresh default
route, then one `comparison:controls-change` merged with defaults.

| live                                                 | React                                                        | Solid                                                      |
| ---------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------- |
| `{orientation:"vertical"}`                           | tablist column 54×144                                        | props vertical, tablist **row 327×48**                     |
| `{density:"compact"}`                                | tabs 54/32/40×32, gap 24                                     | props compact, **×48**, gap **32**                         |
| `{isDisabled:true}`                                  | all `aria-disabled`, color `rgb(198, 198, 198)`, tabIndex -1 | props disabled, Overview **enabled** 41/80, tabIndex **0** |
| `{keyboardActivation:"manual"}` then Tab, ArrowRight | focus Parity, selected still overview                        | ArrowRight **selects** Parity (still automatic)            |
| `{ariaLabel:"Milestone tabs"}`                       | tablist `"Milestone tabs"`                                   | tablist **`"Project tabs"`**                               |
| `{labelBehavior:"hide"}`                             | tabs **12×48**, **0 svgs** (text hidden, no icon)            | 32×48, 1 svg (Solid remounts)                              |
| `{withIcons:true}`                                   | tabs **54/32/40**, **0 svgs**                                | 80/58/66, 1 svg (Solid remounts)                           |

`?orientation=vertical` both 54×144 column. `?density=compact` both
×32 gap 24. `?isDisabled=true` both gray-400 skip. `?keyboardActivation=manual`
ArrowRight moves without select both. `?ariaLabel=Milestone%20tabs`
both `"Milestone tabs"`. `?labelBehavior=hide` both 32×48 icons.
`?withIcons=true` both 80/58/66.

## Done when

Live orientation, density, isDisabled, keyboardActivation, ariaLabel,
labelBehavior, and withIcons on the comparison route update the
mounted Tabs the way the URL remount already does: Solid must not
snapshot `tabsProps()` inside the keyed `Show`, and React collection
children must rebuild (or remount) when hide / icons change. A walk
fails if Solid stays horizontal while the fixture JSON says vertical,
or if React hide has no svgs while Solid has them. Do not start #254.

## Relationship

Child of #26. Found by #260. Wiring is
`apps/comparison/src/components/solid/fixtures/styled/tabs.tsx`
(`hc(SolidSpectrumTabs, tabsProps(), …)` inside keyed `Show`) and
`apps/comparison/src/components/react/fixtures/styled/tabs.js`
`renderKey`. Distinct from Switch #371 / Radio #377 / TableView #303
(those fixtures already pass getters and the component ignores them).
Do not start #254.
