---
id: 618
type: task
title: "Upstream test-parity floor grows by 26 coverage facts from the 09-27 sweep"
created: 2026-10-02
parent: 544
status: merged
history:
  - {
      state: open,
      at: 2026-10-02,
      note: "guard:upstream-test-parity at eb19b20f exits 1. suspects 187 to 213, coverageGaps 43 to 31, upstreamOnly 16 to 16. Each of the 26 new suspects was read against pin f56660b2. All 26 are coverage the pinned suite does not query. Bin A is empty.",
    }
  - {
      state: merged,
      at: 2026-10-02,
      note: "records accepted coverage. The floor is rewritten with --allow-growth 618. No test or source change. Slider element identity stays on #74.",
    }
---

## Scope

`scripts/upstream-test-parity-baseline.json`. Accept 26 we-only facts as
coverage the pinned suite does not query. Write paths are this ticket and
that baseline.

## Done when

`vp run guard:upstream-test-parity` exits 0, and `growthLog` names ticket
618 with these 26 suspects.

## Proof

`vp exec tsx scripts/check-upstream-test-parity.ts --write-baseline --allow-growth 618`,
then `vp run guard:upstream-test-parity`.

## Relationship

Parent #544. The previous floor move is #573. Slider thumb versus the
native range input stays #74. RangeSlider stays #76. Filename pairing
stays #579 and #597.

## Accepted coverage

The rewrite replaces the floor, so the 12 coverage gaps that are no longer
current leave the file. `growthLog.added` records only the 26 suspects.

| Fact                                 | Ours                                                                                     | Upstream                                                                                                                                                                                                                                                                                                                                               |
| ------------------------------------ | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| calendar\|aria\|aria-live            | `packages/solidaria-components/test/Calendar.test.tsx:696`                               | `react-spectrum/packages/react-aria/src/calendar/useCalendarBase.ts:77` announces the selection politely. `LiveAnnouncer.tsx:124` sets `aria-live`.                                                                                                                                                                                                    |
| calendar\|aria\|aria-selected        | `packages/solidaria-components/test/Calendar.test.tsx:889,909` on the cell               | `react-spectrum/packages/react-aria/src/calendar/useCalendarCell.ts:355`                                                                                                                                                                                                                                                                               |
| colorfield\|key\|tab                 | `packages/solid-spectrum/test/ColorField.test.tsx:156`                                   | `react-spectrum/packages/react-aria/src/interactions/useFocusVisible.ts:58-61`. Tab arms focus-visible on a text input.                                                                                                                                                                                                                                |
| datefield\|aria\|aria-hidden         | `packages/solidaria-components/test/DateField.test.tsx:229`                              | `react-spectrum/packages/react-aria-components/src/HiddenDateInput.tsx:102`                                                                                                                                                                                                                                                                            |
| datepicker\|role\|form               | `packages/solidaria-components/test/DatePicker.test.tsx:1119,1145`                       | Wrapping form. `react-spectrum/packages/react-aria/src/datepicker/useDatePicker.ts:167` passes `defaultValue`. `react-spectrum/packages/react-aria/src/datepicker/useDateField.ts:177` resets it.                                                                                                                                                      |
| datepicker\|role\|presentation       | `packages/solidaria-components/test/DatePicker.test.tsx:144`                             | `react-spectrum/packages/react-aria/src/datepicker/useDateField.ts:160`                                                                                                                                                                                                                                                                                |
| daterangepicker\|aria\|aria-haspopup | `packages/solidaria-components/test/DateRangePicker.test.tsx:786`                        | `react-spectrum/packages/react-aria/src/datepicker/useDateRangePicker.ts:210`                                                                                                                                                                                                                                                                          |
| daterangepicker\|role\|form          | `packages/solidaria-components/test/DateRangePicker.test.tsx:478,509`                    | Wrapping form. `react-spectrum/packages/react-aria/src/datepicker/useDateRangePicker.ts:226,246` pass start and end `defaultValue`. `react-spectrum/packages/react-aria/src/datepicker/useDateField.ts:177` resets each field.                                                                                                                         |
| daterangepicker\|role\|presentation  | `packages/solidaria-components/test/DateRangePicker.test.tsx:533-534`                    | `react-spectrum/packages/react-aria/src/datepicker/useDateField.ts:160`                                                                                                                                                                                                                                                                                |
| dialog\|role\|link                   | `packages/solidaria-components/test/Dialog.test.tsx:948`                                 | `react-spectrum/packages/react-aria/src/link/useLink.ts:71`. `react-spectrum/packages/react-aria-components/src/Dialog.tsx:94-96` labels the dialog from the trigger id.                                                                                                                                                                               |
| gridlist\|key\|pagedown              | `packages/solidaria-components/test/GridList.test.tsx:1512`                              | `react-spectrum/packages/react-aria/src/selection/ListKeyboardDelegate.ts:329-364`. PageDown from item 1 (y 0, height 40, visible 200) stops at item 5. `react-spectrum/packages/react-aria/src/selection/useSelectableCollection.ts:424` binds it.                                                                                                    |
| gridlist\|key\|pageup                | `packages/solidaria-components/test/GridList.test.tsx:1522`                              | Same delegate. `react-spectrum/packages/react-aria/src/selection/useSelectableCollection.ts:425` binds PageUp.                                                                                                                                                                                                                                         |
| listbox\|role\|presentation          | `packages/solidaria-components/test/ListBox.test.tsx:310`                                | `react-spectrum/packages/react-aria/src/listbox/useListBoxSection.ts:55`                                                                                                                                                                                                                                                                               |
| menu\|aria\|aria-posinset            | `packages/solidaria-components/test/Menu.test.tsx:2630`                                  | `react-spectrum/packages/react-aria/src/menu/useMenuItem.ts:227-229`, only when virtualized                                                                                                                                                                                                                                                            |
| menu\|aria\|aria-setsize             | `packages/solidaria-components/test/Menu.test.tsx:2631`                                  | `react-spectrum/packages/react-aria/src/menu/useMenuItem.ts:227-230`                                                                                                                                                                                                                                                                                   |
| numberfield\|aria\|aria-controls     | `packages/solidaria-components/test/NumberField.test.tsx:282-283`                        | `react-spectrum/packages/react-aria/src/numberfield/useNumberField.ts:394,408`                                                                                                                                                                                                                                                                         |
| popover\|aria\|aria-labelledby       | `packages/solidaria-components/test/Popover.test.tsx:135`                                | `react-spectrum/packages/react-aria-components/src/Dialog.tsx:96` and `:117` forward the trigger id. `react-spectrum/packages/react-aria-components/src/Popover.tsx:343` applies it.                                                                                                                                                                   |
| rangecalendar\|aria\|aria-selected   | `packages/solidaria-components/test/RangeCalendar.test.tsx:1043`                         | `react-spectrum/packages/react-aria/src/calendar/useCalendarCell.ts:355` on the cell                                                                                                                                                                                                                                                                   |
| selectboxgroup\|key\|arrowright      | `packages/solid-spectrum/test/SelectBoxGroup.test.tsx:230`                               | `react-spectrum/packages/@react-spectrum/s2/src/SelectBoxGroup.tsx:447-448` is a horizontal grid. `react-spectrum/packages/react-aria/src/selection/ListKeyboardDelegate.ts:239-243` with `isSameColumn` at `:165-167` returns null when the cards share a column.                                                                                     |
| slider\|aria\|aria-describedby       | `packages/solidaria-components/test/Slider.test.tsx:460` on `role=slider`, off the group | `react-spectrum/packages/react-aria/src/slider/useSlider.ts:66` stores it. `react-spectrum/packages/react-aria/src/slider/useSliderThumb.ts:299` puts it on the range input, which is the accessible slider. `react-spectrum/packages/react-aria/src/label/useLabel.ts:64-68` does not copy it onto the group. The thumb-versus-input split stays #74. |
| slider\|aria\|aria-details           | `packages/solidaria-components/test/Slider.test.tsx:461`                                 | `react-spectrum/packages/react-aria/src/slider/useSlider.ts:67`. `react-spectrum/packages/react-aria/src/slider/useSliderThumb.ts:302`. Same #74 hold.                                                                                                                                                                                                 |
| table\|aria\|aria-labelledby         | `packages/solidaria-components/test/Table.test.tsx:4676,5083,5118`                       | `react-spectrum/packages/react-aria/src/table/useTableColumnResize.ts:247`. `react-spectrum/packages/react-aria/src/table/useTableSelectionCheckbox.ts:52`                                                                                                                                                                                             |
| table\|aria\|aria-live               | `packages/solidaria-components/test/Table.test.tsx:3242`                                 | `react-spectrum/packages/react-aria/src/table/useTable.ts:141` announces the sort assertively                                                                                                                                                                                                                                                          |
| table\|aria\|aria-valuetext          | `packages/solidaria-components/test/Table.test.tsx:4686`                                 | `react-spectrum/packages/react-aria/src/table/useTableColumnResize.ts:248` formats `columnSize`. `react-spectrum/packages/react-aria/intl/table/es-ES.json:5` is `"{value} píxeles"`.                                                                                                                                                                  |
| timefield\|aria\|aria-valuetext      | `packages/solid-spectrum/test/TimeField.test.tsx:148`                                    | `react-spectrum/packages/react-aria/src/datepicker/useDateSegment.ts:68` formats the hour with `hour12`. `react-spectrum/packages/react-aria/src/spinbutton/useSpinButton.ts:245` sets `aria-valuetext`.                                                                                                                                               |
| toast\|aria\|aria-details            | `packages/solidaria-components/test/Toast.test.tsx:213`                                  | `react-spectrum/packages/react-aria/src/toast/useToast.ts:76` keeps labelable props. `react-spectrum/packages/react-aria/src/utils/filterDOMProps.ts:21` includes `aria-details`.                                                                                                                                                                      |
