---
id: 585
type: task
title: "The picker list box dropped upstream's 8px padding, and it costs 21 certified rows across five drivers"
created: 2026-09-21
parent: 544
status: merged
history:
  - {
      state: open,
      at: 2026-09-21,
      note: "graded by the conductor from shard 5 of Certification Gates run 35556441049. These 21 rows were disowned from #497 as a different defect and had no ticket of their own. They are the largest single-cause block left in the roster after #581's 44, and the cause is one missing style declaration",
    }
  - {
      state: merged,
      at: 2026-09-21,
      note: "cause corrected before the fix. The style block is not it: upstream Picker styles its list with ComboBox's `listbox` (`Picker.tsx:71`, `:515`), not `menu` (`:231`, exported, unused by Picker), and `listbox` has no padding and the same overflowY/overflowX split we have - so `pickerListBox` already matches upstream and is untouched. Adding `padding: 8` there was tried and measured: D3 and D8 went green but D1/D9/D10 moved to a new diff, React's listbox `padding: 0px` against ours `8px`. A live DOM probe then showed the real defect: React's rows sit in a 208x112 `role=presentation` content div, each in an absolute VirtualizerItem at `top/left: 8px`, width 192; ours were bare in-flow children of `role=listbox`, 208 wide, no content div. `SelectListBox` (`solidaria-components/src/Select.tsx`) never consumed the parent Virtualizer's CollectionRoot, so ListLayout's inset never reached a row. 76f0e267 wired this for ComboBox and Picker in its message but only ComboBoxListBox in its diff. Fix: the ComboBoxListBox wiring, copied - `useCollectionRoot`, rows in `VirtualizerItem` when virtualized, empty state outside the root. After `VIVIANA_GATE=1 vp run comparison:build`, `certified/picker.certified` is 60 passed / 2 failed, the 2 being `Picker trigger` D13 open-arrow-enter-reopen-scroll-escape and keyboard-only, which are #584 and red before this change too. Mutation check, rebuilt both ways, `-g 'Picker list'`: defect back, 5 passed / 21 failed - D1 6, D3 6, D8 1, D9 6, D10 2, this ticket's 21 to the row; restored, 26 passed / 0 failed. Unit guard added to Select.test.tsx as the twin of ComboBox.test.tsx's; with the defect back exactly 1 of 87 fails, the new test. Select + ComboBox + Picker suites 216 passed; `vp run typecheck` clean",
    }
  - {
      state: merged,
      at: 2026-09-21,
      note: "2026-09-21 round-1 audit, receipt `.agents/audit-2026-09-21/round-1-results.md`. Two findings named this ticket - `578-census/585-wrong-upstream-anchor`, medium, and `578-census/census-585-contradiction`, low - and both are **already settled**, by `495582e9`, which landed after the audit range closed. The audit said the ticket quoted the wrong upstream style and prescribed a fix that would add four new D1 divergences, and that the census and the ticket gave opposite causes for the same 21 rows. The merged note now carries one cause, measured: the style block already matches upstream, adding `padding: 8` was tried and moved D1/D9/D10 to a new diff, and the real defect was `SelectListBox` never consuming the parent Virtualizer's `CollectionRoot`. Recorded rather than re-opened.",
    }
---

## The defect

Twenty-one rows on `Picker list`, across every driver that looks at geometry and
every size and scheme: D1 state matrix 6, D3 pixel diff 6, D8 target size 1,
D9 forced colors 6, D10 RTL 2.

D1 reports exactly one differing property in the whole computed-style table, on
the `target` part, and the delta is a constant 16px at every size:

| size | upstream        | ours            |
| ---- | --------------- | --------------- |
| s    | `height: 88px`  | `height: 72px`  |
| m    | `height: 112px` | `height: 96px`  |
| l    | `height: 136px` | `height: 120px` |

D8 reads the other axis and finds it inverted — our option is _wider_:
`div[option]:Enterprise` is `width: 208` for us against `192` upstream, also 16.

Sixteen short vertically, sixteen wide horizontally, at every size: that is
8px of padding on all four sides, present upstream and absent here. The options
run edge to edge in our box, so they gain the 16px the box loses.

`@react-spectrum/s2@1.7.0/src/Picker.tsx:243-249` is the listbox style:

    boxSizing: 'border-box',
    maxHeight: 'inherit',
    overflow: 'auto',
    padding: 8,
    fontFamily: 'sans',
    fontSize: controlFont(),
    gridAutoRows: 'min-content'

Ours, `packages/solid-spectrum/src/picker/index.tsx:372` (`pickerListBox`), has
`boxSizing`, `maxHeight`, `overflowY`, `overflowX`, `fontFamily` and `fontSize`
— and neither `padding: 8` nor `gridAutoRows: 'min-content'`.

The Virtualizer half is already right: our `layoutOptions.padding: 8` at
`picker/index.tsx:1103` matches upstream's `Picker.tsx:462`. Only the style-macro
half was dropped, which is why the rows are geometric rather than behavioural.

## Scope

`packages/solid-spectrum/src/picker/index.tsx`, the `pickerListBox` style block
at `:372`.

1. Add `padding: 8`.
2. Add `gridAutoRows: "min-content"`, dropped in the same block.
3. Decide `overflow`: upstream is `overflow: 'auto'`, ours splits into
   `overflowY: "auto"` with `overflowX: "hidden"`. D1's property set did not
   flag it, so it is not one of the 21, but it is an unexplained divergence in
   the same seven lines. Either mirror upstream or leave a comment saying why
   the split is needed.

Non-goal: the trigger. Its two D13 rows are #584 and a different cause.

## Done when

`certified/picker` reports no `Picker list` failures on D1, D3, D8, D9 or D10,
and the list box height matches upstream at all three sizes.

## Proof

`certified/picker`, counts recorded here, plus the D1 `target` diff empty at
size-s, size-m and size-l. Mutation-prove by removing `padding: 8` again and
watching the six D1 rows return.

## Relationship

Child of #544. Disowned from #497, which keeps only the combobox checkmark
accent. Sibling of #584. One of the fourteen components in
`.agents/certified-169-census-2026-09-21.md`; the census projection of 132 → 88
does not include these 21, so closing this ticket takes the roster to 67.
