---
kind: reference
status: current
---

# Parity gaps against the pin

Status: live reference.
Update when: a row is fixed, the pin moves, or a row is reclassified against the checkout.

Read on 2026-09-28 from the checkout at `scripts/upstream-pin.json`, commit
`f56660b234bd588751c9f35b85d6fe6e17e45ccf`. Each component row was checked
against that tree. Aligning our code with the upstream file named in the row
matches the pin.

## What the comparison is

The comparison is layer by layer, against one Adobe train. It is the pin, not
floating `main`, and not a newer tag.

| Layer      | Package                | Pinned upstream                                  | Version on that commit         |
| ---------- | ---------------------- | ------------------------------------------------ | ------------------------------ |
| State      | `solid-stately`        | `react-spectrum/packages/react-stately`          | `react-stately@3.50.0`         |
| Hooks      | `solidaria`            | `react-spectrum/packages/react-aria`             | `react-aria@3.52.0`            |
| Components | `solidaria-components` | `react-spectrum/packages/react-aria-components`  | `react-aria-components@1.21.0` |
| Styled     | `solid-spectrum`       | `react-spectrum/packages/@react-spectrum/s2/src` | `@react-spectrum/s2@1.7.0`     |

Those four tags are the same commit. `viviana-ui` is in this list only where
`scripts/layer-boundary-baseline.json` marks the file diverged from
`solid-spectrum`. Kumo, Geist, the thin v3 `@react-spectrum/*` indexes,
examples, starters, and `@spectrum-icons` were not the oracle.

The checkout matches the pin. Newer tags exist and were not the oracle:

| Tag                                                                             | Commit                                     | Relation to the pin                                                                                                                                                 |
| ------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `react-aria-components@1.21.1`, `react-aria@3.52.1`, `@react-spectrum/s2@1.7.1` | `4dd44e0f400636a87a9ad4390903e78c5ae6113c` | One publish commit later. Source delta is `Card.tsx`, the TableView edit-popover color scheme, `useTokenField.ts`, and `scrollIntoView.ts`. None of the rows below. |
| `react-stately@3.50.1`                                                          | `45c1c82f4d3011d9de5c88c4f333172295c6b8bc` | 2026-09-01 publish. Source delta from the pin is the package version field.                                                                                         |

GitHub release notes still top out at React Aria Components v1.21.0 and
Spectrum S2 v1.7.0 (2026-09-04). The `.1` tags have no release note on that
list. Freshness of the pin is `guard:upstream-freshness` and ticket #220.
This page does not move the pin.

Browser behavior was not run. Pixel diffs, hydration, and keyboard timing
are outside these rows.

## How to read a row

A component row is a source gap in this checkout. The pinned file does the
other behavior. The ticket column names a ticket that already owns the row. An
empty ticket cell means the row is not on the board. This page does not file
tickets.

Where the obvious edit would leave the pin, the row says how to match it.

## Landed

These behaviors match the pin in this checkout.

**State and hooks**

- A repeated single ComboBox selection closes on the current option.
- DatePicker exposes the in-progress date and time.
- A horizontal slider in RTL measures the pointer from the right and places the thumb from that edge. A vertical slider measures from the bottom.
- Unlabeled breadcrumbs take their name from the locale catalog, and breadcrumb links follow the client router.
- An open ComboBox moves by page, and unmodified left and right arrows clear the highlight.
- ActionGroup flips left and right arrows in RTL, including a vertical group.
- `createButton` forwards focus and key handlers into the focusable props, and takes props only.
- NumberField chooses `inputMode` from the platform and the range, passes `isWheelDisabled`, keeps `name` and `form` off the formatted field, and submits the parsed value from a hidden input.
- Grid, grid list, and tree announce selection changes and the long-press hint. The announcer helpers are exported from the grid and grid-list modules.
- A tooltip trigger key closes the tooltip when close-on-press is set.
- Autocomplete blur clears the option ring, and focus restores virtual focus on the collection.
- Pressing a range endpoint resizes that end, and a touch drag waits 200ms. Hovering across cells during a drag is #423.
- A calendar cell name includes the era for a Gregorian BC date.
- An unlabeled color channel field names itself in the active locale.
- An unlabeled step list takes its name from the step list catalog.
- An unlabeled autocomplete suggestion list takes its name from the autocomplete catalog.
- An autocomplete text field keeps the platform select-all shortcut.
- An autocomplete text field keeps Shift+Home and Shift+End when nothing is virtually focused.
- A column resizer announces its width from the table catalog.
- A keyboard or virtual column resizer describes itself from the table catalog.
- A column resizer names itself from its label and the column header.
- A sorted table describes and announces its sort from the table catalog.
- A drop target describes how to drop from the drag catalog while a drag is in progress.
- A drop zone button describes how to drop from the drag catalog while a drag is in progress.
- A drop indicator names an item or the root from the drag catalog.
- A multi-month calendar names its visible range from the calendar catalog.
- A calendar announces a visible-range change when the calendar is not focused.
- A calendar announces a selected date or range from the calendar catalog.
- A calendar announces several selected dates as a list from the calendar catalog.
- A color editor's hue slider and channel fields, and the spectrum color picker's sliders, take their names from the color channel catalog.
- A toast region is named with the notifications catalog string and the visible count.
- A toast close button takes its name from the toast catalog.
- A table row expand button takes its name from the table catalog.
- A table with expandable rows exposes the treegrid role.
- A virtualized grid list counts one column.
- A text field forwards its popup and error attributes to the input.
- A slider forwards its description and details to the slider.
- A virtualized grid list item exposes its row index.
- A virtualized menu item exposes its position and set size.
- A virtualized table header and cell expose their column index.
- A virtualized table header row exposes its row index.
- A virtualized tree grid omits the header row index.
- A table column header exposes its column index.
- A list box section names its group from the heading.
- A grid cell exposes its column index, and a virtualized cell falls back to its index.
- A tab panel forwards its details attribute.
- A tab forwards its description and details.
- A loading combobox field points its description at the spinner.
- A loading picker button points its description at the spinner.
- A drop zone names its button from the label slot.
- A grid list row names itself from its description slot.
- A toast names itself from its description slot.
- An invalid calendar day names itself from its error message slot.
- A tag group names itself from its label, description, and error message slots.
- A disclosure toggles from a Button in the trigger slot, and a button inside the panel is not that trigger.
- A number field steps from a Button in the increment and decrement slots, and an unslotted button does not.
- A search field clears from a Button, and a slotted button does not.
- A date picker and a date range picker open from a Button, and a slotted button does not.
- A tag removes from a Button in the remove slot, and an unslotted button does not.
- A grid list selects from a Checkbox in the selection slot, and an unslotted checkbox does not.
- A table selects from a Checkbox in the selection slot, a header Checkbox selects every row, and an unslotted checkbox does not.
- A toggle button shows its selection indicator only while that button is selected.
- A menu item shows its selection indicator only while that item is selected.
- A grid list row shows its selection indicator only while that row is selected.
- A tree row shows its selection indicator only while that row is selected.
- A table row shows its selection indicator only while that row is selected.
- A progress bar takes its name from a child label, and an explicit aria-label keeps its own name.
- A slider takes its name from a child label, and an explicit aria-label keeps its own name.
- A checkbox group takes its name from a child label, and an explicit aria-label keeps its own name.
- A radio group takes its name from a child label, and an explicit aria-label keeps its own name.
- A static menu section takes its name from a child header, and an aria-label names it when that header is absent.
- A separator inside a menu is a div, and an explicit hr stays an hr.
- A table cell marks focus visible within its row, and a class can read that flag.
- A menu item exposes its selection mode, and omits it when selection is none.
- A date field marks its hidden autofill container so focus and aria-hidden checks skip it.
- A date field takes its name from a child label, and an explicit aria-label keeps its own name.
- A time field takes its name from a child label, and an explicit aria-label keeps its own name.
- A color slider takes its name from a child label, and an explicit aria-label keeps its own name.
- A color field takes its name from a child label, and an explicit aria-label keeps its own name.
- A calendar cell marks a date outside the visible range, and a date in another visible month stays unmarked.
- A date picker and a date range picker mark focus within the root, and the hidden autofill input stays unmarked.
- Tabs mark focus within the root.
- A toast region marks hover and focus, and a toast marks its own focus.
- The spectrum single-selection table header takes its hidden name from the table catalog.
- A drag button takes its name from the drag catalog.
- A spectrum tag group names its action row from the tag catalog.
- Progress and meter values format with the provider locale.
- A checkbox group merges each item's validity and clears it when that item becomes valid.
- A range calendar cell paints the formattable day, so a custom calendar's day field is not the visible number.
- A collapsed disclosure keeps `hidden` through the hydration walk.
- The default locale stays `en-US` and `ltr` through the hydration walk, then follows the browser language.
- A tree selection checkbox, and the spectrum list and tree checkboxes, take their name from the grid catalog.

**Components**

- A color swatch follows later color updates, and an uncontrolled picker starts at black.
- Tree item content reads the current selection, focus, hover, press, and expansion.
- Virtualizer context and the collection renderer keep the current layout. The layout type includes the layout methods, and the component calls them without a cast.
- Form fields re-read `validationErrors` through one proxy. A replaced map shows server errors again after commit or reset.
- Menu items keep a label id for element children, and a section names its group from the heading.
- A SearchField `id` and `validate` function reach the text field.
- A submenu popover is non-modal, and a keyboard-opened submenu takes focus.
- A menu inside a dialog closes with the dialog.
- A submenu item closes the menu, and closes a dialog that contains that menu. Escape closes only the submenu.
- A heading outside a dialog defaults to level 3.
- The modal dismiss control takes its name from the overlays catalog.

**Styled**

- Selected list and select options keep neutral text and an accent checkmark.
- Table, list, and tree containers keep the focus ring.
- Premium and genai buttons darken on keyboard focus. The pending spinner uses the button size: 14, 18, 20, or 24.
- ClearButton uses the S, M, L, and XL sizes and leaves the accessible name to the caller. `solid-spectrum` and `viviana-ui` both have that edit.
- The DatePicker popover time field receives `placeholderValue`, `minValue`, `maxValue`, and `hideTimeZone`.
- Provider accepts a client router and wraps nested links with it.

`scripts/layer-boundary-baseline.json` marks the viviana-ui Button, list, select, table, grid list, tree, DatePicker, and Provider diverged, so those edits are in `solid-spectrum`. ClearButton is identical in that baseline, so both copies match.

**Docs**

- `packages/solidaria/README.md` and `.claude/reference/patterns.md` call `createButton(props)`.
- `packages/solidaria-components/README.md` reads `isPressed` and `isFocusVisible` as booleans.
- `.claude/current/glasselated-port.md` matches the token palette (fuchsia for the ask, yellow for transient detail, red for fault, and the `--color-success` scale), Geist `[data-theme="geist"]`, and motion keyframes that do not gate themselves.
- `.claude/current/README.md` starts from the live-docs index and opens one ticket from that summary.
- `AGENTS.md` names `vp run test:run`.

## State — `react-stately`

| Gap                  | Ours                                                                                                                                    | Pinned source                                                                                            | Ticket |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------ |
| ComboBox value shape | `value` is `Key`, `null`, or `Iterable<Key>`, with `onSelectionChangeMultiple`. The state exposes `setSelectedKey` / `setSelectedKeys`. | `ValueType` is `Key` or `readonly Key[]`. `ValueBase` supplies `onChange`. The state exposes `setValue`. | #115   |

## Hooks — `react-aria`

| Gap                     | Ours                                                                                                 | Pinned source                                                                                                        | Ticket |
| ----------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------ |
| Slider focus target     | The thumb is a focusable `role="slider"`. The range input is `aria-hidden` with `tabIndex={-1}`.     | `useSliderThumb.ts` puts `tabIndex: 0` on the range input. The thumb props set no role.                              | #74    |
| Closed Select shortcuts | Home and End select. ArrowLeft and ArrowRight still replace the selection when the mode is multiple. | `useSelect.ts` returns false for those arrows when selection is multiple. That shortcut map has no Home or End.      | #125   |
| Tag remove description  | The row `aria-label` is `textValue` alone.                                                           | `useTag.ts` adds the `removeDescription` catalog string on the row.                                                  | #54    |
| Tag group live region   | No `aria-live`, and removing the last tag does not focus the group.                                  | `useTagGroup.ts` sets `aria-live` to `polite` while the grid is focused, and focuses the group when the size hits 0. | #54    |

## Components — `react-aria-components`

| Gap                    | Ours                                                                                                         | Pinned source                                                                                              | Ticket |
| ---------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- | ------ |
| Closed submenu trigger | `aria-expanded` is omitted while closed. Open does not focus the first item.                                 | `useSubmenuTrigger.ts` sets `aria-expanded` to `true` or `false`, and opens with `onSubmenuOpen('first')`. | #51    |
| Tree keyboard drag     | `TreeItem` starts a drag without `hasDragButton` and has no drag-button slot.                                | `Tree.tsx` passes `hasDragButton: true` and renders the drag slot.                                         | #84    |
| Static picker children | `Select` requires `items`, so static `PickerItem` and `PickerSection` children do not become the collection. | S2 `Picker.tsx` renders `children` unless `children` is a function and `items` is set.                     | #43    |

## Styled — `@react-spectrum/s2`

| Gap                     | Ours                                                                                                                                                                                                                                                                                           | Pinned source                                                                                                                                                         | Ticket |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Table drag chrome       | `TableView` forwards `dragAndDropHooks` and does not install a drag preview, insertion indicator, or drag-handle cell.                                                                                                                                                                         | S2 `TableView.tsx` assigns `renderDragPreview` and renders `DragHandleButton`.                                                                                        | #84    |
| ListView windowing      | Every row stays mounted. The file says the list is not virtualized.                                                                                                                                                                                                                            | S2 `ListView.tsx` wraps `GridList` in `Virtualizer` with `S2ListLayout`.                                                                                              | #66    |
| Calendar size           | Styled Calendar adds `lg` and `xl` cells at 40px and 44px.                                                                                                                                                                                                                                     | S2 `Calendar.tsx` has no `size` prop. `--cell-max-width` is 32.                                                                                                       | #207   |
| RangeSlider composition | `packages/solid-spectrum/src/slider/RangeSlider.tsx` and `packages/viviana-ui/src/slider/RangeSlider.tsx` reimplement pointer capture, arrow and Home/End keys, and `role="slider"`. The layer-boundary baseline marks the viviana-ui file diverged, so a spectrum-only edit leaves that copy. | S2 `RangeSlider.tsx` renders `SliderBase` and `SliderThumb`. Collapsing onto today's headless slider still leaves the #74 focus target until that row is aligned too. | #76    |

## Not a component gap

These rows cannot move a component off the pin. They are docs, agent setup, or CI.

| Item                    | Record                                                                                                                                                                                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Release job permissions | `.github/workflows/release.yml` grants `contents: write` and `pull-requests: write`. The steps GET workflow runs, publish with OIDC, and create local git tags.                                                                                 |
| Certification postcard  | `.claude/current/certification.md` still quotes postcard `0f1e1198` (2026-08-21, 2170 passed). `apps/comparison/src/data/certified-suite-evidence.ts` records `151006ff` (2026-09-24, 2168 passed, 0 failed, 4 skipped, 5 waived). Ticket #194. |
| Playwright skill        | The local `.claude/skills/playwright-cli/SKILL.md` calls `apps/comparison/node_modules/.bin/playwright`. `.claude/skills/` is gitignored, so that edit is not on main.                                                                          |

## Rejected

The board-order claim was rejected. The start list puts the live-docs index first, and that index opens `status.md` before the ticket board.

FileTrigger's structure differs and the claimed bug does not. `react-aria-components` `FileTrigger.tsx` merges press into the child with `PressResponder`. Our `FileTrigger.tsx` listens with `createPress` on a wrapping `<span>`. The claimed failure, a disabled child still opening the picker, is not in either file. Our handler checks FileTrigger's own `disabled`, and a native disabled button does not bubble the pointer events that span listens for. Moving the press onto the child would match `PressResponder`. It would not be repairing a bug the pin also has.
