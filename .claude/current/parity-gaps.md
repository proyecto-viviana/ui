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
- A toast region is named with the notifications catalog string and the visible count.
- Progress and meter values format with the provider locale.

**Components**

- A color swatch follows later color updates, and an uncontrolled picker starts at black.
- Tree item content reads the current selection, focus, hover, press, and expansion.
- Virtualizer context and the collection renderer keep the current layout. The layout type includes the layout methods, and the component calls them without a cast.
- Form fields re-read `validationErrors` through one proxy.
- A submenu popover is non-modal, and a keyboard-opened submenu takes focus.
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

| Gap                            | Ours                                                                                                 | Pinned source                                                                                                        | Ticket |
| ------------------------------ | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------ |
| Slider focus target            | The thumb is a focusable `role="slider"`. The range input is `aria-hidden` with `tabIndex={-1}`.     | `useSliderThumb.ts` puts `tabIndex: 0` on the range input. The thumb props set no role.                              | #74    |
| Checkbox group validity        | Items never call `setInvalid`. The group state has no such method.                                   | `useCheckboxGroupItem.ts` calls `state.setInvalid`. `useCheckboxGroupState.ts` defines it.                           |        |
| Closed Select shortcuts        | Home and End select. ArrowLeft and ArrowRight still replace the selection when the mode is multiple. | `useSelect.ts` returns false for those arrows when selection is multiple. That shortcut map has no Home or End.      | #125   |
| Tag remove description         | The row `aria-label` is `textValue` alone.                                                           | `useTag.ts` adds the `removeDescription` catalog string on the row.                                                  | #54    |
| Tag group live region          | No `aria-live`, and removing the last tag does not focus the group.                                  | `useTagGroup.ts` sets `aria-live` to `polite` while the grid is focused, and focuses the group when the size hits 0. | #54    |
| Disclosure `hidden` during SSR | `hidden` drops as soon as `canUseDOM` is true, including the first client render.                    | `useDisclosure.ts` keeps `hidden` while `useIsSSR()` is true.                                                        | #188   |
| Default locale during SSR      | `getDefaultLocale` reads `navigator.language` when the client module runs.                           | `useDefaultLocale.ts` stays on `en-US` and `ltr` for the whole `useIsSSR()` window.                                  | #188   |
| Range cell day number          | The cell paints `date().day`.                                                                        | `useCalendarCell.ts` paints the `day` part from `DateFormatter.formatToParts`.                                       | #424   |

## Components — `react-aria-components`

| Gap                             | Ours                                                                                                                                                                                                                                                                                   | Pinned source                                                                                                   | Ticket |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------ |
| MenuItem name                   | Non-string children delete `aria-labelledby`, so the name includes the description and the shortcut.                                                                                                                                                                                   | `useMenuItem.ts` keeps `aria-labelledby` on the label id. `Menu.tsx` puts the label slot props on any children. |        |
| SearchField `validate` and `id` | The `createSearchField` argument includes neither. The hook already reads `validate` when it is passed. The `id` near the label is the label's id. The caller `id` never reaches the text field.                                                                                       | `useSearchField.ts` spreads props into `useTextField`.                                                          |        |
| Form server-error clear flag    | `createFormValidationState.ts` resets `isServerErrorCleared` when the context value is a different object. `Form.tsx` publishes one proxy, so a replaced `validationErrors` object updates the indexed messages and leaves the flag set after `commitValidation` or `resetValidation`. | The pin's context value is that render's `validationErrors` object. A new object resets the flag.               |        |
| Dynamic menu section            | The header is `role="heading"`. The group is labeled only from `aria-label`.                                                                                                                                                                                                           | `useMenuSection.ts` sets `role: 'presentation'` on the heading and `aria-labelledby` on `role="group"`.         |        |
| Closed submenu trigger          | `aria-expanded` is omitted while closed. Open does not focus the first item.                                                                                                                                                                                                           | `useSubmenuTrigger.ts` sets `aria-expanded` to `true` or `false`, and opens with `onSubmenuOpen('first')`.      | #51    |
| Tree keyboard drag              | `TreeItem` starts a drag without `hasDragButton` and has no drag-button slot.                                                                                                                                                                                                          | `Tree.tsx` passes `hasDragButton: true` and renders the drag slot.                                              | #84    |
| Menu inside a dialog            | `DialogTrigger` uses `createOverlayTriggerState` and does not provide `RootMenuTriggerStateContext`.                                                                                                                                                                                   | `Dialog.tsx` provides that context from `useMenuTriggerState`.                                                  | #208   |
| Static picker children          | `Select` requires `items`, so static `PickerItem` and `PickerSection` children do not become the collection.                                                                                                                                                                           | S2 `Picker.tsx` renders `children` unless `children` is a function and `items` is set.                          | #43    |

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
